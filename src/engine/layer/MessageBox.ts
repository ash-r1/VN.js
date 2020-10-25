import * as PIXI from 'pixi.js';

export default class MessageBox extends PIXI.Container {
  private frame: PIXI.Sprite;
  private nameText: PIXI.Text;
  private text: PIXI.Text;
  constructor(frameTexture: PIXI.Texture) {
    super();
    const frame = new PIXI.Sprite(frameTexture);

    const nameText = new PIXI.Text('', {
      fontFamily: 'Noto Serif JP',
      fill: '#1e1e1e',
      align: 'left',
      fontSize: 36,
      fontWeight: 500,
      lineHeight: 50,
    });
    nameText.x = 460;
    nameText.y = 54;

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
    this.addChild(nameText);
    this.addChild(text);

    this.frame = frame;
    this.nameText = nameText;
    this.text = text;
  }

  async animateText(text: string) {
    // show text with interval
    this.text.text = text;
  }

  changeNameText(name: string) {
    this.nameText.text = name;
  }

  clearText() {
    this.text.text = '';
  }

  // TODO: Containerにすべきかも？
}
