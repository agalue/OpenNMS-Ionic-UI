/*
 * Original JavaScript source:
 * https://github.com/OpenNMS/backshift/blob/master/src/Backshift.Graph.C3.js
 */

import { Graph } from './graph';
import * as D3 from 'd3';
import * as C3 from 'c3';

export class GraphC3 extends Graph {

  interactive = false; // whether to do fancier chart navigation with mouse input events
  step = false; // treats points a segments (similar to rrdgraph)
  zoom = false; // whether to allow zooming
  clipboardPrimed = false;

  chart: C3.ChartAPI;
  columns = [];
  groups = [];
  colorMap = {};
  typeMap = {};
  nameMap = {};

  yMin: number = 0;
  yMax: number = 0;

  onBegin() {}
  onCancel() {}

  onDestroy() {
    // If we have a chart, destroy it
    if (this.chart !== null) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  onRender() {
    this.updatePlot();
  }

  resize(size) {
    // Store the width/height for any subsequent renders
    this.width = size.width;
    this.height = size.height;
    // If we have a chart, resize it
    if (this.chart !== null) {
      this.chart.resize(size);
    }
  }

  private shouldStack(k: number) : boolean {
    // If there's stack following the area, set the area to stack
    if (this.model.series[k].type === 'area') {
      var n = this.model.series.length;
      for (var i = k; i < n; i++) {
        if (this.model.series[i].type === 'stack') {
          return true;
        }
      }
    }
    return this.model.series[k].type === 'stack';
  }

  private getDisplayName(name) {
    if (name === undefined || name === null) {
      return null;
    } else {
      return name;
    }
  }

  private getType(type, shouldStack) {
    var derivedType;
    if (shouldStack === true) {
      derivedType = 'area';
    } else {
      derivedType = type;
    }

    if (this.step) {
      if (derivedType === 'line') {
        derivedType = 'step';
      }
      else if (derivedType === 'area') {
        derivedType = 'area-step';
      }
    }
    return derivedType;
  }

  onBeforeQuery() {
    this.showStatus('Loading...');
  }

  onAfterQuery() {}

  onQuerySuccess(results) {
    if (!results || !results.columns) {
      return;
    }
    var timestamps = results.columns[0];
    var series, values, i, j, numSeries, numValues, X, Y, columnName, shouldStack;
    numSeries = this.model.series.length;
    numValues = timestamps.length;

    // Reset the array of columns
    this.columns = [];
    this.yMin = 0;
    this.yMax = 0;

    // Build the timestamp column
    X = ['timestamp'];
    for (i = 0; i < numValues; i++) {
      X.push(timestamps[i]);
    }
    this.columns[0] = X;

    // Build a single group for the stacked elements
    var group = [];
    this.groups = [group];

    // Build the columns for the series
    for (i = 0; i < numSeries; i++) {
      columnName = `data${i}`;
      series = this.model.series[i];

      if (series.metric && results && results.columns) {
        values = results.columns[results.columnNameToIndex[series.metric]];
      }
      Y = [columnName];

      for (j = 0; j < numValues; j++) {
        if (this.getDisplayName(series.name)) {
          if (values[j] > this.yMax) this.yMax = values[j];
          if (values[j] < this.yMin) this.yMin = values[j];
        }
        Y.push(values[j]);
      }
      this.columns[i + 1] = Y;

      this.colorMap[columnName] = series.color;
      this.nameMap[columnName] = this.getDisplayName(series.name);

      // Determine if this series should be stacked
      shouldStack = this.shouldStack(i);

      // If so, then add it to the group
      if (shouldStack) {
        group.push(columnName);
      }

      this.typeMap[columnName] = this.getType(series.type, shouldStack);
    }

    this.hideStatus();
    this.updatePlot();
  }

  onQueryFailed(reason: string) {
    this.showStatus('Query failed.');
  }

  showStatus(statusText: string) {
    const svg = D3.select(this.element).select('svg');
    if (svg) {
      const boundingRect = (<Element>svg.node()).getBoundingClientRect();
      svg.select('#chart-status-text').remove();
      if (statusText) {
        svg.append('text')
          .attr('id', 'chart-status-text')
          .attr('x', boundingRect.width / 2)
          .attr('y', boundingRect.height / 2.5)
          .attr('text-anchor', 'middle')
          .style('font-size', '2.5em')
          .text(statusText);
      }
    }
  }

  hideStatus() {
    const svg = D3.select(this.element).select('svg');
    if (svg) {
      svg.select('#chart-status-text').remove();
    }
  }

  private updatePlot() {
    let plotConfig: C3.ChartConfiguration = {
      bindto: this.element,
      interaction: {
        enabled: this.interactive
      },
      data: {
        x: 'timestamp',
        columns: this.columns,
        types: this.typeMap,
        names: this.nameMap,
        colors: this.colorMap,
        groups: this.groups,
        order: null // stack order by data definition
      },
      size: {
        width: this.width,
        height: this.height
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '',
            count: 0
          }
        },
        y: {
          min: this.yMin,
          max: this.yMax,
          label: {
            text: this.verticalLabel,
            position: 'outer-middle'
          },
          tick: {
            format: D3.format('.2s')
          }
        }
      },
      transition: {
        duration: 0
      },
      point: {
        show: false
      },
      zoom: {
        enabled: this.zoom
      },
      tooltip: {
        format: {
          title: function (d) { return d; },
          value: function (value, ratio, id) {
            return D3.format('.4s')(value);
          }
        }
      }
    };

    if (this.columns && this.columns.length > 0) {
      plotConfig.axis.x.tick.count = 30;

      var timestamps = this.columns[0];
      if (timestamps && timestamps.length >= 2) {
        // timestamp,value,...
        var oldest = timestamps[1];
        var newest = timestamps[timestamps.length - 1];
        var difference = newest - oldest;

        if (difference < 90000000) {
          // less than about a day - 14:01
          plotConfig.axis.x.tick.format = '%H:%M';
          plotConfig.axis.x.tick.count = 24;
        } else if (difference < 1209600000) {
          // less than 2 weeks - Tue Jul 28
          plotConfig.axis.x.tick.format = '%a %b %d';
          plotConfig.axis.x.tick.count = 14;
        } else if (difference < 7776000000) {
          // less than 90 days - Jul 28
          plotConfig.axis.x.tick.format = '%b %d';
          plotConfig.axis.x.tick.count = 30;
        } else {
          // more than 3 months - Jul 2015
          plotConfig.axis.x.tick.format = '%b %Y';
          plotConfig.axis.x.tick.count = 12;
        }
      }
    } else {
      delete plotConfig.axis.x.tick.count;
    }

    this.chart = C3.generate(plotConfig);
  }

}
