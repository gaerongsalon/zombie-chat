export class MethodLogger {
  private readonly prefixes: any[];
  constructor(...prefixes: any[]) {
    this.prefixes = prefixes;
  }
  public write(...args: any[]) {
    return console.log(...this.prefixes, ...args);
  }
  public with(...prefixes: any[]) {
    return new MethodLogger(...this.prefixes, ...prefixes);
  }
}
