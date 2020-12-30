import { Graphics } from 'pixi.js';
import { applyDefaultProps, PixiComponent } from '@inlet/react-pixi';

interface Props {
  x?: number;
  y?: number;
  height: number;
  width: number;
  fill: number;
}

export default PixiComponent<Props, Graphics>('Rectangle', {
  create: () => {
    return new Graphics();
  },
  didMount: () => {
    // nothing todo
  },
  willUnmount: () => {
    // nothing todo
  },
  applyProps: (instance, oldProps, newProps) => {
    const { fill, x, y, width, height, ...props } = { x: 0, y: 0, ...newProps };
    instance.clear();
    instance.beginFill(fill);
    instance.drawRect(x, y, width, height);
    instance.endFill();
    applyDefaultProps(instance, oldProps, props);
  },
});
