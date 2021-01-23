import React, { useEffect } from 'react';
import { Container, Stage, useApp } from '@inlet/react-pixi';

import { Provider } from 'react-redux';
import { put } from 'redux-saga/effects';

import Context from 'src/engine/context';
import { useScenarios } from 'src/hooks/useScenarios';

import { BaseStore } from '../redux';
import { useBaseDispatch } from '../redux/index';
import { actions } from '../redux/reducers/world';
import World from './components/World';
import { VNContextProvider } from './context/provider';
import { Scenarios, ScenariosProvider } from './scenario/provider';

interface Props {
  // TOOD: Config here?
  width: number;
  height: number;
  components?: Record<string, React.ComponentType<any>>;
}

// TODO: 外から渡したパラメータを元にstoreをextend出来ること
//       もしくはProviderで包むのはゲーム側の責務にする(事もできる)ようにすること？ 単にpropsでStore渡して、その型を型推論するようにしてもいいかもしれない。
export const Game: React.FC<Props> = (props) => {
  const scenarios = useScenarios();
  const dispatch = useBaseDispatch();

  useEffect(() => {
    //
    dispatch(actions.run({ scenarios, path: 'debug' }));
  }, []);

  return (
    <Container name="game">
      <World {...props} />
    </Container>
  );
};

interface GameProps extends Props {
  store: BaseStore;
  scenarios: Scenarios;
  vnContext: Context;
}

const GameLayer: React.FC<GameProps> = (props) => {
  const { store, width, height, scenarios, vnContext, ...others } = props;
  return (
    <Stage
      width={width}
      height={height}
      options={{ antialias: true, autoDensity: true }}
    >
      <ScenariosProvider value={scenarios}>
        <VNContextProvider value={vnContext}>
          <Provider store={store}>
            <Game width={width} height={height} {...others} />
          </Provider>
        </VNContextProvider>
      </ScenariosProvider>
    </Stage>
  );
};

export default GameLayer;
