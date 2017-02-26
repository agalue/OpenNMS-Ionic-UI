export abstract class RrdGraphVisitor {

  protected abstract onTitle(title);
  protected abstract onVerticalLabel(label);
  protected abstract onDEF(name, path, dsName, consolFun);
  protected abstract onCDEF(name, rpnExpression);
  protected abstract onVDEF(name, rpnExpression);
  protected abstract onLine(srcName, color, legend, width);
  protected abstract onArea(srcName, color, legend);
  protected abstract onStack(srcName, color, legend);
  protected abstract onGPrint(srcName, aggregation, value);
  protected abstract onComment(value);

  protected visit(graphDef: any) {
    var i, args, command, name, path, dsName, consolFun, rpnExpression, subParts, width, srcName,
        color, legend, aggregation, value;
    var parts = this.parseCommandLine(graphDef.command, true);
    var n = parts.length;
    for (i = 0; i < n; i++) {
      if (parts[i].indexOf("--") === 0) {
        args = /--(.*)=(.*)/.exec(parts[i]);
        if (args === null) {
          continue;
        }

        if (args[1] === "title") {
          this.onTitle(this.displayString(this.decodeString(args[2])));
        } else if (args[1] === "vertical-label") {
          this.onVerticalLabel(this.displayString(this.decodeString(args[2])));
        }
      }

      args = parts[i].match(/(\\.|[^:])+/g);
      if (args === null) {
        continue;
      }
      command = args[0];

      if (command === "DEF") {
        subParts = args[1].split("=");
        name = subParts[0];
        path = subParts[1];
        dsName = args[2];
        consolFun = args[3];
        this.onDEF(name, path, dsName, consolFun);
      } else if (command === "CDEF") {
        subParts = args[1].split("=");
        name = subParts[0];
        rpnExpression = subParts[1];
        this.onCDEF(name, rpnExpression);
      } else if (command === "VDEF") {
        subParts = args[1].split("=");
        name = subParts[0];
        rpnExpression = subParts[1];
        this.onVDEF(name, rpnExpression);
      } else if (command.match(/LINE/)) {
        width = parseInt(/LINE(\d+)/.exec(command)[0]);
        subParts = args[1].split("#");
        srcName = subParts[0];
        color = '#' + subParts[1];
        legend = this.decodeString(args[2]);
        this.onLine(srcName, color, legend, width);
      } else if (command === "AREA") {
        subParts = args[1].split("#");
        srcName = subParts[0];
        color = '#' + subParts[1];
        legend = this.decodeString(args[2]);
        this.onArea(srcName, color, legend);
      } else if (command === "STACK") {
        subParts = args[1].split("#");
        srcName = subParts[0];
        color = '#' + subParts[1];
        legend = this.decodeString(args[2]);
        this.onStack(srcName, color, legend);
      } else if (command === "GPRINT") {
        if (args.length == 3) {
          srcName = args[1];
          aggregation = undefined;
          value = this.decodeString(args[2]);
        } else {
          srcName = args[1];
          aggregation = args[2];
          value = this.decodeString(args[3]);
        }
        this.onGPrint(srcName, aggregation, value);
      } else if (command === "COMMENT") {
        value = this.decodeString(args[1]);
        this.onComment(value);
      }
    }
  }

  protected displayString(string) {
    if (string === undefined) {
      return string;
    }

    // Remove any newlines
    string = string.replace("\\n", '');
    // Remove any leading/trailing whitespace
    string = string.trim();
    return string;
  }

  // Inspired from http://krasimirtsonev.com/blog/article/Simple-command-line-parser-in-JavaScript
  private parseCommandLine(command: string, lookForQuotes: boolean) : string[] {
    var args = [];
    var readingPart = false;
    var part = '';
    var n = command.length;
    for (var i = 0; i < n; i++) {
      if (command.charAt(i) === ' ' && !readingPart) {
        args.push(part);
        part = '';
      } else {
        if (command.charAt(i) === '\"' && lookForQuotes) {
          readingPart = !readingPart;
          part += command.charAt(i);
        } else {
          part += command.charAt(i);
        }
      }
    }
    args.push(part);
    return args;
  }

  private decodeString(string) {
    if (string === undefined) {
      return string;
    }
    // Remove any quotes
    string = string.replace(/"/g, '');
    // Replace escaped colons
    string = string.replace("\\:", ':');
    return string;
  }

}
