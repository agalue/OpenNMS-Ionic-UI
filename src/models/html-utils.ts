export class HtmlUtils {

  static removeLinks(html: string) : string {
    let re = /\<a[^>]+\>([^<]+)\<\/a\>/gi;
    return html.replace(re, "$1");
  }

}