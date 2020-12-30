import React from 'react';
import { ComponentProps } from 'react';
import { Sprite } from '@inlet/react-pixi';

type SpriteProps = ComponentProps<typeof Sprite>;

export interface Props
  // TODO: add useful props
  extends Pick<SpriteProps, 'width' | 'height' | 'position' | 'scale'> {
  image: string;
}

const Image: React.FC<Props> = (props) => {
  console.log(props.scale);
  return <Sprite {...props} />;
};

export default Image;
