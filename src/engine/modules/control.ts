import { actions } from 'src/redux/reducers/world';

import { Jump } from '../scenario';
import Module from './module';

export default class Control extends Module {
  jump(options: { scenario?: string } = {}): Jump {
    const { scenario } = options;
    return {
      type: 'jump',
      scenario,
    };
  }
}
