import { TextStyle } from 'src/engine/interfaces/TextStyle';
import { actions, LayoutOptions } from 'src/redux/reducers/message';

import { Row } from '../scenario';
import Module from './module';

export interface Options {
  layout: LayoutOptions;
  style: TextStyle;
}

export default class Message extends Module {
  //
  constructor(private image: string, private options: Options) {
    super();
    //
  }
  show(message: string, showOptions: {} = {}): Row {
    const { layout, style } = this.options;
    const image = this.image;
    const action = actions.show({
      message,
      image,
      layout,
      style,
    });
    return {
      action,
      wait: true,
    };
  }
}
