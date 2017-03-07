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

  static getColorMap() : { [severity: string] : string } {
    return {
      Critical:      '#cc0000',
      Major:         '#ff3300',
      Minor:         '#ff9900',
      Warning:       '#ffcc00',
      Indeterminate: '#999000',
      Normal:        '#336600',
      Cleared:       '#999'
    }
  }

}