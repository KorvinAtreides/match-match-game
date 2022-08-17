export default class Timer {
  x: number;

  y: number;

  value: number;

  context: CanvasRenderingContext2D;

  reverse: boolean;

  stopped: boolean;

  constructor(context: CanvasRenderingContext2D, x: number, y: number, timeValue: number) {
    this.x = x;
    this.y = y;
    this.value = timeValue;
    this.context = context;
    this.reverse = true;
    this.stopped = false;
  }

  tick() {   
    if (!this.value) {
      this.reverse = false;
    }
    let updateValue = this.reverse ? -1 : 1;
    updateValue = this.stopped ? 0 : updateValue;
    this.value += updateValue;
    this.render();
  }

  render() {
    const time = new Date(this.value * 1000);
    const [context] = [this.context];
    context.font = 'bold 50px serif';
    context.fillStyle = '#000';
    context.fillText(
      `${time.getUTCMinutes() < 10 ? '0' : ''}${time.getUTCMinutes()}:${
        time.getSeconds() < 10 ? '0' : ''
      }${time.getUTCSeconds()}`,
      this.x,
      this.y,
    );
  }
}
