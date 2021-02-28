import React from 'react';
import { Container, Sprite, Text } from '@inlet/react-pixi';

import { TextStyle } from 'src/engine/interfaces/TextStyle';

import Padding from '../interfaces/Padding';

interface MessageProps {
  image: string;
  message: string;
  x?: number;
  y?: number;
  width: number;
  height: number;
  padding?: Partial<Padding>;
  style?: TextStyle;
}

const Image: React.FC<MessageProps> = (props) => {
  const { image, message, x, y, width, height, padding, style } = {
    x: 0,
    y: 0,
    ...props,
  };
  const padLeft = padding?.left ?? 0;
  const padTop = padding?.top ?? 0;
  // const padRight = padding?.right ?? 0;
  // const padBottom = padding?.bottom ?? 0;

  // TODO: Auto line-break/page-break with padding
  return (
    <Container x={x} y={y}>
      <Sprite image={image} />
      <Text
        text={message}
        x={padLeft}
        y={padTop}
        style={style}
        // width={width - padLeft - padRight}
        // height={height - padTop - padBottom}
      />
    </Container>
  );
};

export default Image;
