import React from 'react';
import { Sprite, Texture } from 'pixi.js';
import { applyDefaultProps, PixiComponent, Stage } from '@inlet/react-pixi';

// import { ComponentProps } from 'react';
// type SpriteProps = ComponentProps<typeof Sprite>;
import Face, { CharacterSprite } from '../commands/modules/Face';
import BlinkAnimationSprite from '../layer/BlinkAnimationSprite';

interface BlinkProps {
  normal: string;
  ajar: string;
  close: string;
  isPlaying: boolean;
  ratio?: number;
  initialFrame?: number;
}

const BlinkCharacter = PixiComponent<BlinkProps, Sprite>('CharacterIntl', {
  create: (props) => {
    const { normal, ajar, close, isPlaying, ratio, initialFrame } = {
      ratio: 1.0,
      ...props,
    };
    const normalTexture = Texture.from(normal);
    const ajarTexture = Texture.from(ajar);
    const closeTexture = Texture.from(close);

    const blinkSprite = new BlinkAnimationSprite(
      normalTexture,
      ajarTexture,
      closeTexture,
      ratio
    );
    blinkSprite[isPlaying ? 'gotoAndPlay' : 'gotoAndStop'](initialFrame || 0);
    return blinkSprite;
  },
  applyProps: (instance, oldProps, newProps) => {
    const { isPlaying: oldIsPlaying, ...oldP } = oldProps;
    const { isPlaying, ...newP } = newProps;

    applyDefaultProps(instance, oldP, newP);

    // instance.alpha = alpha;
  },
});

export interface Props {
  name: string;
  size: string;
  pose: string;
}

const Character: React.FC<Props> = ({ name, size, pose }) => {
  console.log(`Character: ${name}:${size}:${pose}`);
  const base = `game/images/${name}/${name} ${size} ${pose}`;
  const normal = `${base} a.png`;
  const ajar = `${base} c.png`;
  const close = `${base} b.png`;
  return (
    <BlinkCharacter
      normal={normal}
      ajar={ajar}
      close={close}
      isPlaying={true}
    />
  );
};

export default Character;
