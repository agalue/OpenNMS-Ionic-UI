import { Graph } from './graph';

/**
 * Current issues:
 *   - Can't tell the difference between 0 and NaN without mouseover - use regions to identify these?
 *
 * Features to add:
 *   - Improved X-axis legend - the format should depend on the time-span
 *   - Add support for retrieving min/max and average values
 *   - Identify outages with regions: http://c3js.org/samples/region_timeseries.html
 *   - Identify events with grid lines: http://c3js.org/samples/grid_x_lines.html
 *
 * Notes:
 *   - Opacity for the area can be set with:
 *     .c3-area {
 *          stroke-width: 0;
 *          opacity: 1.0;
 *      }
 *
 */

// FIXME This is temporal
declare var d3:any;
declare var c3:any;

export class GraphC3 extends Graph {

  width: number;
  height: number;
  title: string;
  verticalLabel: string;
  interactive = true; // whether to do fancier chart navigation with mouse input events
  step = false; // treats points a segments (similar to rrdgraph)
  zoom = true; // whether to allow zooming
  clipboardPrimed = false;

  chart: any; // C3 object from c3.generate();
  columns = [];
  groups = [];
  colorMap = {};
  typeMap = {};
  nameMap = {};

  onInit() {}

  resize(size) {
    // Store the width/height for any subsequent renders
    this.width = size.width;
    this.height = size.height;
    // If we have a chart, resize it
    if (this.chart !== null) {
      this.chart.resize(size);
    }
  }

  onBegin() {}
  onCancel() {}

  onDestroy() {
    // If we have a chart, destroy it
    if (this.chart !== null) {
      this.chart = this.chart.destroy();
    }
  }

  onRender() {
    this.updatePlot();
  }

  private shouldStack(k) {
    // If there's stack following the area, set the area to stack
    if (this.model.series[k].type === "area") {
      var n = this.model.series.length;
      for (var i = k; i < n; i++) {
        if (this.model.series[i].type === "stack") {
          return 1;
        }
      }
    }
    return this.model.series[k].type === "stack";
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
      derivedType = "area";
    } else {
      derivedType = type;
    }

    if (this.step) {
      if (derivedType === "line") {
        derivedType = "step";
      }
      else if (derivedType === "area") {
        derivedType = "area-step";
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
      columnName = "data" + i;
      series = this.model.series[i];
      values = results.columns[results.columnNameToIndex[series.metric]];

      Y = [columnName];

      for (j = 0; j < numValues; j++) {
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

  onQueryFailed(reason) {
    this.showStatus('Query failed.');
  }

  showStatus(statusText) {
    console.log(statusText);
    var svg = d3.select(this.element).select('svg');
    if (svg) {
      var boundingRect = svg.node().getBoundingClientRect();
      svg.select('#chart-status-text').remove();
      if (statusText) {
        svg.append('text')
          .attr("id", "chart-status-text")
          .attr('x', boundingRect.width / 2)
          .attr('y', boundingRect.height / 2.5)
          .attr('text-anchor', 'middle')
          .style('font-size', '2.5em')
          .text(statusText);
      }
    }
  }

  hideStatus() {
    var svg = d3.select(this.element).select('svg');
    if (svg) {
      svg.select("#chart-status-text").remove();
    }
  }

  private updatePlot() {
    var self = this;

    var plotConfig = {
      bindto: d3.select(this.element),
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
          label: self.verticalLabel,
          tick: {
            format: d3.format(".2s")
          }
        }
      },
      grid: {
        x: {
          show: true
        },
        y: {
          show: true
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
      title: {
        text: this.title
      },
      tooltip: {
        format: {
          title: function (d) { return d; },
          value: function (value, ratio, id) {
            return d3.format(".4s")(value);
          }
        }
      }
    };

    if (self.columns && self.columns.length > 0) {
      plotConfig.axis.x.tick.count = 30;

      var timestamps = self.columns[0];
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

    self.chart = c3.generate(plotConfig);
  }

}
