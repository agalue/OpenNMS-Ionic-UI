export class OnmsApiFilter {

  constructor(
    public key: string,
    public value: string
  ) {}

  encode() {
    const v = this.value == 'null' ? this.value : `%25${this.value}%25`;
    return `${this.key}=${v}`;
  }

  static encodeFilters(filters: OnmsApiFilter[]) : string {
    return filters.filter(f => f.value).map(f => f.encode()).join('&');
  }

}