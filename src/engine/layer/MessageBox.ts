import * as PIXI from 'pixi.js';

export default class MessageBox extends PIXI.Container {
  private frame: PIXI.Sprite;
  private text: PIXI.Text;
  constructor(frameTexture: PIXI.Texture) {
    super();
    const frame = new PIXI.Sprite(frameTexture);

    const text = new PIXI.Text('', {
      fontFamily: 'Noto Serif JP',
      fill: '#1e1e1e',
      align: 'left',
      fontSize: 30,
      lineHeight: 50,
    });
    text.x = 460;
    text.y = 108;

    this.addChild(frame);
    this.addChild(text);

    this.frame = frame;
    this.text = text;
  }

  async animateText(text: string) {
    // show text with interval
    this.text.text = text;
  }

  clearText() {
    this.text.text = '';
  }

  // TODO: Containerにすべきかも？
}
