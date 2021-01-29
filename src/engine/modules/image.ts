import { actions } from 'src/redux/reducers/world';

import { Row } from '../scenario';
import Module from './module';

export default class Image extends Module {
  //
  constructor() {
    super();
    //
  }
  bg(filename: string, options: {} = {}): Row {
    const path = `game/images/bg ${filename}`;
    const action = actions.putImageLayer({
      name: 'bg-image',
      on: 'bg',
      props: {
        image: path,
      },
    });
    return {
      action,
      wait: false,
    };
  }
}
