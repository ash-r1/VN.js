import React from 'react';
import { Sprite } from '@inlet/react-pixi';

// import { ComponentProps } from 'react';
// type SpriteProps = ComponentProps<typeof Sprite>;

export interface Props {
  name: string;
  pose: string;
}

const Character: React.FC<Props> = ({ name, pose }) => {
  console.log(`Character: ${name}:${pose}`);
  return <Sprite image={`game/images/${name}/${name} lg ${pose}.png`} />;
};

export default Character;
