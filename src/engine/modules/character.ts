import { actions } from 'src/redux/reducers/character';

import Module from './module';
export default class Character extends Module {
  //
  constructor(private name: string) {
    super();
    //
  }
  show(pose: string, options: { size?: string; blink?: boolean } = {}) {
    const { size, blink } = { blink: true, ...options };
    return actions.show({
      name: this.name,
      size,
      pose,
      blink,
    });
  }
  // TODO: Add duration
  hide(options: {} = {}) {
    return actions.hide({
      name: this.name,
    });
  }
}
