import { Text } from '@inlet/react-pixi';
import React from 'react';

const GameLayer: React.FC = () => {
  return <Text text="Hello World" x={200} y={200} style={{ fill: 'red' }} />;
};
export default GameLayer;
