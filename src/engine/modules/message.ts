import { actions } from 'src/redux/reducers/message';

import { Row } from '../scenario';
import Module from './module';

export interface Options {
  width: number;
  height: number;
  x?: number;
  y?: number;
  paddingLeft?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
}

export default class Message extends Module {
  //
  constructor(private image: string, private options: Options) {
    super();
    //
  }
  show(message: string, showOptions: {} = {}): Row {
    const {
      width,
      height,
      x,
      y,
      paddingLeft,
      paddingTop,
      paddingRight,
      paddingBottom,
    } = this.options;
    const image = this.image;
    const action = actions.show({
      message,
      image,
      x,
      y,
      width,
      height,
      paddingLeft,
      paddingTop,
      paddingRight,
      paddingBottom,
    });
    return {
      action,
      wait: true,
    };
  }
}
