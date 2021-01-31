import { Jump, Label } from '../scenario';
import Module from './module';

export default class Control extends Module {
  jump(options: { scenario?: string; label?: string } = {}): Jump {
    const { scenario, label } = options;
    if (scenario === undefined && label === undefined) {
      throw 'You must specify scenario or label.';
    }
    return {
      type: 'jump',
      scenario,
      label,
    };
  }
  label(name: string): Label {
    return {
      type: 'label',
      name,
    };
  }
}
