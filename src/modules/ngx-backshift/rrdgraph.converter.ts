import { RrdGraphVisitor } from './rrdgraph.visitor';
import { RpnToJexlConverter } from './rpn2jexl.converter';
import { PrefabGraph, GraphModel } from './models';
import { Consolidator } from './consolidator';

export class RrdGraphConverter extends RrdGraphVisitor {

  private expressionRegexp = new RegExp('\\{([^}]*)}', 'g');

  private graphDef: PrefabGraph;

  private prefix: string;
  private resourceId: string;
  private convertRpnToJexl: boolean;

  private rpnConverter =  new RpnToJexlConverter();
  private consolidator = new Consolidator();

  public model = new GraphModel();

  constructor(graphDef: PrefabGraph, resourceId: string, convertRpnToJexl: boolean = true) {
    super();

    this.graphDef = graphDef;
    this.resourceId = resourceId;
    this.convertRpnToJexl = convertRpnToJexl;

    // Replace strings.properties tokens
    var propertyValue, i, j, n, m;
    for (i = 0, n = this.graphDef.propertiesValues.length; i < n; i++) {
      propertyValue = this.graphDef.propertiesValues[i];
      this.model.properties[propertyValue] = undefined;
    }

    this.visit(this.graphDef);

    for (i = 0, n = this.model.values.length; i < n; i++) {
      var metric = this.model.values[i].expression.metricName;
      if (metric === undefined) {
        continue;
      }

      var foundSeries = false;
      for (j = 0, m = this.model.series.length; j < m; j++) {
        if (metric === this.model.series[j].metric) {
          foundSeries = true;
          break;
        }
      }

      if (!foundSeries) {
        var series = {
          metric: metric,
          type: "hidden"
        };
        this.model.series.push(series);
      }
    }

    // Determine the set of metric names that are used in the series / legends
    var nonTransientMetrics = {};
    for (i = 0, n = this.model.series.length; i < n; i++) {
      nonTransientMetrics[this.model.series[i].metric] = 1;
    }

    // Mark all other sources as transient - if we don't use their values, then don't return them
    for (i = 0, n = this.model.metrics.length; i < n; i++) {
      const metric = this.model.metrics[i];
      metric.transient = !(metric.name in nonTransientMetrics);
    }
  }

  protected onTitle(title: string) {
    this.model.title = title;
  }

  protected onVerticalLabel(label: string) {
    this.model.verticalLabel = label;
  }

  protected onDEF(name: string, path: string, dsName: string, consolFun: string) {
    var columnIndex = parseInt(/\{rrd(\d+)}/.exec(path)[1]) - 1;
    var attribute = this.graphDef.columns[columnIndex];

    this.prefix = name;
    this.model.metrics.push({
      name: name,
      attribute: attribute,
      resourceId: this.resourceId,
      datasource: dsName,
      aggregation: consolFun
    });
  }

  protected onCDEF(name: string, rpnExpression: string) {
    var expression = rpnExpression;
    if(this.convertRpnToJexl) {
      expression = this.rpnConverter.convert(rpnExpression);
    }
    if (this.prefix) {
      expression = expression.replace(this.expressionRegexp, this.prefix + '.$1');
    }
    this.model.metrics.push({
      name: name,
      expression: expression
    });
  }

  protected onVDEF(name, rpnExpression) {
    this.model.values.push({
      name: name,
      expression:  this.consolidator.parse(rpnExpression),
    });
  }

  protected onLine(srcName, color, legend, width) {
    var series = {
      name: this.displayString(legend),
      metric: srcName,
      type: "line",
      color: color
    };
    this.maybeAddPrintStatementForSeries(srcName, legend);
    this.model.series.push(series);
  }

  protected onArea(srcName, color, legend) {
    var series = {
      name: this.displayString(legend),
      metric: srcName,
      type: "area",
      color: color
    };
    this.maybeAddPrintStatementForSeries(srcName, legend);
    this.model.series.push(series);
  }

  protected onStack(srcName, color, legend) {
    var series = {
      name: this.displayString(legend),
      metric: srcName,
      type: "stack",
      color: color,
      legend: legend
    };
    this.maybeAddPrintStatementForSeries(srcName, legend);
    this.model.series.push(series);
  }

  protected onGPrint(srcName, aggregation, format) {
    if (typeof aggregation === "undefined") {
      // Modern form
      this.model.printStatements.push({
        metric: srcName,
        format: format,
      });

    } else {
      // Deprecated form - create a intermediate VDEF
      var metricName = srcName + "_" + aggregation + "_" + Math.random().toString(36).substring(2);

      this.model.values.push({
        name: metricName,
        expression:  this.consolidator.parse([srcName, aggregation]),
      });

      this.model.printStatements.push({
        metric: metricName,
        format: format,
      });
    }
  }

  protected onComment(format: string) {
    this.model.printStatements.push({
      format: format
    });
  }

  private maybeAddPrintStatementForSeries(series: string, legend: string) {
    if (legend === undefined || legend === null || legend === "") {
      return;
    }
    this.model.printStatements.push({
      metric: series,
      value: NaN,
      format: "%g " + legend
    });
  }

}
