export default class ElementCreator {
  elementIsReady: Boolean;

  appendNewElement(parent: Element = document.body, type = 'div', classList?: string) {
    this.elementIsReady = false;
    const element = document.createElement(type);
    if (classList) {
      element.classList.add(classList);
    }
    parent.append(element);
    this.elementIsReady = true;
    return element;
  }
}
