import React from 'react';
import { Container, Stage } from '@inlet/react-pixi';

import { Provider } from 'react-redux';

import { BaseStore } from '../redux';
import BaseEngine from './BaseEngine';
import World from './components/World';
import { EngineProvider } from './provider';

interface Props {
  // TOOD: Config here?
  width: number;
  height: number;
  components?: Record<string, React.ComponentType<any>>;
}

// TODO: 外から渡したパラメータを元にstoreをextend出来ること
//       もしくはProviderで包むのはゲーム側の責務にする(事もできる)ようにすること？ 単にpropsでStore渡して、その型を型推論するようにしてもいいかもしれない。
export const Game: React.FC<Props> = (props) => {
  return (
    <Container name="game">
      <World {...props} />
    </Container>
  );
};

interface GameProps extends Props {
  store: BaseStore;
  engine: BaseEngine;
}

const GameLayer: React.FC<GameProps> = (props) => {
  const { store, width, height, engine, ...others } = props;
  return (
    <Stage
      width={width}
      height={height}
      options={{ antialias: true, autoDensity: true }}
    >
      <EngineProvider value={engine}>
        <Provider store={store}>
          <Game width={width} height={height} {...others} />
        </Provider>
      </EngineProvider>
    </Stage>
  );
};

export default GameLayer;
