/*
 * Original JavaScript source:
 * https://github.com/OpenNMS/backshift/blob/master/src/Backshift.Utilities.Consolidator.js
 */

import { ConsolidatorFunction, fail } from './models';

class Minimum extends ConsolidatorFunction {
  handler(timestamps: number[], values: number[]) : [number, number] {
    let minimumTimestamp = undefined;
    let minimumValue = NaN;
    this.forEach(timestamps, values, (timestamp, value) => {
      if (isNaN(minimumValue) || value < minimumValue) {
        minimumTimestamp = timestamp;
        minimumValue = value;
      }
    });
    return [minimumTimestamp, minimumValue];
  }
}

class Maximum extends ConsolidatorFunction {
  handler(timestamps: number[], values: number[]) : [number, number] {
    var maximumTimestamp = undefined;
    var maximumValue = NaN;
    this.forEach(timestamps, values, (timestamp, value) => {
      if (isNaN(maximumValue) || value > maximumValue) {
        maximumTimestamp = timestamp;
        maximumValue = value;
      }
    });
    return [maximumTimestamp, maximumValue];
  }
}

class Average extends ConsolidatorFunction {
  handler(timestamps: number[], values: number[]) : [number, number] {
    var sum = 0.0;
    var cnt = this.forEach(timestamps, values, (timestamp, value) => {
      sum += value;
    });
    return [undefined, (sum / cnt)];
  }
}

class StandardDeviation extends ConsolidatorFunction {
  handler(timestamps: number[], values: number[]) : [number, number] {
    var sum = 0.0;
    var cnt = this.forEach(timestamps, values, (timestamp, value) => {
      sum += value;
    });
    var avg = (sum / cnt);
    var dev = 0.0;
    this.forEach(timestamps, values, (timestamp, value) => {
      dev += Math.pow((value - avg), 2.0);
    });
    return [undefined, Math.sqrt(dev / cnt)];    
  }
}

class Last extends ConsolidatorFunction {
  handler(timestamps: number[], values: number[]) : [number, number] {
    for (var i = timestamps.length - 1; i >= 0; i--) {
      if (this.valid(values[i])) {
        return [timestamps[i], values[i]];
      }
    }
    return [undefined, NaN];
  }
}

class First extends ConsolidatorFunction {
  handler(timestamps: number[], values: number[]) : [number, number] {
    for (var i = 0; i < timestamps.length; i++) {
      if (this.valid(values[i])) {
        return [timestamps[i], values[i]];
      }
    }
    return [undefined, NaN];
  }
}

class Total extends ConsolidatorFunction {
  handler(timestamps: number[], values: number[]) : [number, number] {
    var sum = 0.0;
    var cnt = 0;
    // As we don't have a fixed step size, we can't include the first sample as RRDTool does
    for (var i = 1; i < timestamps.length; i++) {
      if (this.valid(values[i])) {
        sum += values[i] * (timestamps[i] - timestamps[i - 1]) / 1000.0;
        cnt += 1;
      }
    }
    if (cnt > 0) {
      return [undefined, sum];
    } else {
      return [undefined, NaN];
    }
  }
}

class Percent extends ConsolidatorFunction {
  handler(timestamps: number[], values: number[]) : [number, number] {
    var sortedValues = Array();
    for (var i = 0; i < timestamps.length; i++) {
      sortedValues.push(values[i]);
    }
    sortedValues.sort(function (a, b) {
      if (isNaN(a))
        return -1;
      if (isNaN(b))
        return 1;

      if (a == Number.POSITIVE_INFINITY)
          return 1;
      if (a == Number.NEGATIVE_INFINITY)
          return -1;
      if (b == Number.POSITIVE_INFINITY)
        return -1;
      if (b == Number.NEGATIVE_INFINITY)
        return 1;

      if (a < b)
        return -1;
      else
        return 1;
    });
    return [undefined, sortedValues[Math.round(this.argument * (sortedValues.length - 1) / 100.0)]];
  }
}

class PercentNaN extends ConsolidatorFunction {
  handler(timestamps: number[], values: number[]) : [number, number] {
    var sortedValues = Array();
    this.forEach(timestamps, values, (timestamp, value) => {
      sortedValues.push(value);
    });
    sortedValues.sort();
    return [undefined, sortedValues[Math.round(this.argument * (sortedValues.length - 1) / 100.0)]];
  }
}

export class Consolidator {

  parse(tokens) : ConsolidatorFunction {
    // Split tokens if a single expression is passed
    if (typeof tokens === 'string') {
      tokens = tokens.split(',');
    }

    var metricName = tokens.shift();
    var functionName = tokens.pop().toLowerCase();
    if (tokens.length > 1) {
      fail(`Too many input values in RPN express. RPN: ${tokens}`);
    }
    var argument = parseFloat(tokens[0]); // The remaining token is used as parameter

    switch(functionName) {
      case 'min':
      case 'minimum': return new Minimum('minimum', metricName, argument);
      case 'max':
      case 'maximum': return new Maximum('maximum', metricName, argument);
      case 'average': return new Average('average', metricName, argument);
      case 'stdev': return new StandardDeviation('stdev', metricName, argument);
      case 'last': return new Last('last', metricName, argument);
      case 'first': return new First('first', metricName, argument);
      case 'total': return new Total('total', metricName, argument);
      case 'percent': return new Percent('percent', metricName, argument);
      case 'percentnan': return new PercentNaN('percentnan', metricName, argument);      
    }

    fail(`Unknown correlation function: ${functionName}`);
  }

}
