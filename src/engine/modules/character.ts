import { actions } from 'src/redux/reducers/character';

import { Row } from '../scenario';
import Module from './module';
export default class Character extends Module {
  //
  constructor(private name: string) {
    super();
    //
  }
  show(pose: string, options: { size?: string; blink?: boolean } = {}): Row {
    const { size, blink } = { blink: true, ...options };
    const action = actions.show({
      name: this.name,
      size,
      pose,
      blink,
    });
    return {
      action,
      wait: true,
    };
  }
  // TODO: Add duration
  hide(options: {} = {}) {
    return {
      action: actions.hide({
        name: this.name,
      }),
    };
  }
}
