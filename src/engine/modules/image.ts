import { actions } from 'src/redux/reducers/world';

import Module from './module';

export default class Image extends Module {
  //
  constructor() {
    super();
    //
  }
  bg(filename: string) {
    const path = `game/images/bg ${filename}`;
    return actions.addImageLayer({
      name: 'bg-image',
      on: 'bg',
      props: {
        image: path,
      },
    });
  }
}
