import { applyDefaultProps, PixiComponent } from '@inlet/react-pixi';

import CharacterSprite from '../display/ChracterSprite';

interface CharacterProps {
  name: string;
  size: string;
  pose: string;
  blink: boolean;
  alpha?: number;
}

const Character = PixiComponent<CharacterProps, CharacterSprite>('Character', {
  create: (props) => {
    const { name, size, pose, blink } = props;
    const sprite = new CharacterSprite(name, size, pose, blink);
    sprite.name = name;
    return sprite;
  },
  applyProps: (instance, oldProps, newProps) => {
    const { ...oldP } = oldProps;
    const { ...newP } = newProps;

    applyDefaultProps(instance, oldP, newP);
  },
});

export default Character;
