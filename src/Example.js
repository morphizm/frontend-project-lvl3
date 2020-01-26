export default class Example {
  constructor(element) {
    this.element = element;
  }

  init() {
    this.element.append('hello, world!');
    console.log('ehu!');
  }
}
