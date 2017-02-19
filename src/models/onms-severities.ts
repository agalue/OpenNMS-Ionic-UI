const ONMS_SEVERITIES = ['-', 'Indeterminate', 'Cleared', 'Normal', 'Warning', 'Minor', 'Major', 'Critical'];

export class OnmsSeverities {

  static getSeverities() : string[] {
    return ONMS_SEVERITIES;
  }

  static capitalize(text: string = 'Indeterminate') : string {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  static getIndex(severity: string) : number {
    return ONMS_SEVERITIES.indexOf(severity);
  }

}