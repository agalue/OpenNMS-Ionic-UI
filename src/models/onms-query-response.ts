export class OnmsQueryResponse {

  public start: number;
  public end: number;
  public step: number;
  public timestamps: number[] = [];
  public labels: string[] = [];
  public columns: { values: number[] }[] = [];
  public constranints: { key: string, value: string }[] = [];

  static import (rawResponse: Object) : OnmsQueryResponse {
    return Object.assign(new OnmsQueryResponse(), rawResponse);
  }

}