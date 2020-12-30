import React from 'react';
import { Container, Stage } from '@inlet/react-pixi';

import { Provider } from 'react-redux';

import { BaseStore } from '../redux';
import World from './components/World';

interface Props {
  // TOOD: Config here?
  width: number;
  height: number;
}

// TODO: 外から渡したパラメータを元にstoreをextend出来ること
//       もしくはProviderで包むのはゲーム側の責務にする(事もできる)ようにすること？ 単にpropsでStore渡して、その型を型推論するようにしてもいいかもしれない。
export const Game: React.FC<Props> = ({ width, height }) => {
  return (
    <Container>
      <World width={width} height={height} />
    </Container>
  );
};

interface GameProps extends Props {
  store: BaseStore;
}

const GameLayer: React.FC<GameProps> = (props) => {
  const { store, width, height, ...others } = props;
  return (
    <Stage
      width={width}
      height={height}
      options={{ antialias: true, autoDensity: true }}
    >
      <Provider store={store}>
        <Game width={width} height={height} {...others} />
      </Provider>
    </Stage>
  );
};

export default GameLayer;
