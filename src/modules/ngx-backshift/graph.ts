
import { GraphModel, TimeSpan, fail } from './models';
import { DataSource } from './datasource';

export abstract class Graph {

  model: GraphModel;
  dataSource: DataSource;
  element: string;

  title: string;
  verticalLabel: string;
  regexes = {};
  values = {};
  queryInProgress: boolean;
  lastSuccessfulQuery: number;
  timer: any;

  width: number = 400;
  height: number = 240;
  resolution: number = 0;
  start: number = 0;
  end: number = 0;
  last: number = 0;
  refreshRate: number = 0;
  beginOnRender: boolean = true;
  stream: boolean = true;
  checkInterval: number = 15 * 1000; // 15 seconds

  constructor(args: any) {
    if (args.dataSource === undefined) {
      fail('Graph needs a data source.');
    }
    this.dataSource = args.dataSource;

    if (args.element === undefined) {
      fail('Graph needs an element.');
    }

    this.element = args.element;
    this.model = args.model || {};
    if (!this.model.metrics) {
      this.model.metrics = [];
    }
    if (!this.model.series) {
      this.model.series = [];
    }
    if (!this.model.values) {
      this.model.values = [];
    }
    if (!this.model.printStatements) {
      this.model.printStatements = [];
    }
    this.title = args.title || this.model.title;
    this.verticalLabel = args.verticalLabel || this.model.verticalLabel;
    this.regexes = {};
    this.values = {};
    this.queryInProgress = false;
    this.lastSuccessfulQuery = 0;
    this.timer = null;
    this.start = args.start;
    this.end = args.end;

    this.onInit(args);
  }

  render() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.onRender();
    if (this.beginOnRender) {
      this.begin();
    }
  }

  begin() {
    this.onBegin();
    this.refresh();
    this.createTimer();
  }

  cancel() {
    this.destroyTimer();
    this.onCancel();
  }

  abstract resize(size);

  destroy() {
    this.hideStatus();
    this.destroyTimer();
    this.onDestroy();
  }

  createTimer() {
    var self = this;
    self.destroyTimer();
    self.timer = setInterval(function () {
      if (self.shouldRefresh()) {
        self.refresh();
      }
    }, self.checkInterval);
  }

  destroyTimer() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  setStart(start) {
    this.start = start;
    this.refresh();
  }

  setEnd(end) {
    this.end = end;
    this.refresh();
  }

  refresh() {
    var timeSpan = this.getTimeSpan();
    this.queryInProgress = true;
    this.onBeforeQuery();
    this.dataSource.query(timeSpan.start, timeSpan.end, this.getResolution())
      .then(results => {
        this.queryInProgress = false;
        this.lastSuccessfulQuery = Date.now();
        this.updateValues(results);
        this.updateTextFields(results);
        this.onQuerySuccess(results);
        this.onAfterQuery();
      })
      .catch(reason => {
        this.queryInProgress = false;
        this.onQueryFailed(reason);
        this.onAfterQuery();
      });
  }

  updateValues(results) {
    this.values = {};
    for (var i = 0; i < this.model.values.length; i++) {
      var value = this.model.values[i];

      this.values[value.name] = {
        metricName: value.expression.metricName,
        functionName: value.expression.functionName,
        argument: value.expression.argument,
        value: value.expression.consolidate(results),
      };
    }
  }

  updateTextFields(results) {
    var self = this;

    var title = self.title,
      verticalLabel = self.verticalLabel,
      value,
      re;

    if (self.model.properties) {
      for (var prop in self.model.properties) {
        if (!self.regexes[prop]) {
          self.regexes[prop] = new RegExp("\\{" + prop + "}", "g");
        }
        re = self.regexes[prop];

        if (results.constants && results.constants[prop]) {
          value = results.constants[prop];
        } else {
          value = "null";
        }
        if (title) { title = title.replace(re, value); }
        if (verticalLabel) { verticalLabel = verticalLabel.replace(re, value); }
      }
    }

    self.title = title;
    self.verticalLabel = verticalLabel;
  }

  shouldRefresh() {
    // Don't refresh in another query is already in progress
    if (this.queryInProgress) {
      return false;
    }

    // Don't refresh if disabled.
    if (this.refreshRate === 0) {
      return false;
    }

    return this.lastSuccessfulQuery <= Date.now() - this.refreshRate;
  }

  getTimeSpan() : TimeSpan {
    if (this.start === 0 && this.end === 0 && this.last === 0) {
      fail('Graph needs start and end, or last to be non-zero.');
    }

    var timeSpan = new TimeSpan();
    if (this.last > 0) {
      timeSpan.end = Date.now();
      timeSpan.start = timeSpan.end - this.last;
    } else {
      timeSpan.end = this.end;
      timeSpan.start = this.start;
    }
    return timeSpan;
  }

  getResolution() {
    if (this.resolution > 0) {
      return this.resolution;
    } else {
      return this.width;
    }
  }

  abstract showStatus(statusText);

  abstract hideStatus();

  abstract onInit(args);

  abstract onRender();

  abstract onBegin();

  abstract onCancel();

  abstract onBeforeQuery();

  abstract onQuerySuccess(results);

  abstract onQueryFailed(reason);

  abstract onAfterQuery();

  abstract onDestroy();

}
