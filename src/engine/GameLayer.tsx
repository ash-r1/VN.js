import React, { useEffect } from 'react';
import { Container, Stage, useApp } from '@inlet/react-pixi';

import { Provider } from 'react-redux';
import { put } from 'redux-saga/effects';

import { useScenarios } from 'src/hooks/useScenarios';

import { BaseStore } from '../redux';
import { useBaseDispatch } from '../redux/index';
import { actions } from '../redux/reducers/world';
import World from './components/World';
import { Scenarios, ScenariosProvider } from './scenario/provider';

interface Props {
  // TOOD: Config here?
  width: number;
  height: number;
}

// TODO: 外から渡したパラメータを元にstoreをextend出来ること
//       もしくはProviderで包むのはゲーム側の責務にする(事もできる)ようにすること？ 単にpropsでStore渡して、その型を型推論するようにしてもいいかもしれない。
export const Game: React.FC<Props> = (props) => {
  const pixi = useApp();
  const scenarios = useScenarios();
  const dispatch = useBaseDispatch();

  useEffect(() => {
    //
    dispatch(actions.run({ pixi, scenarios, path: 'debug' }));
  }, []);

  return (
    <Container>
      <World {...props} />
    </Container>
  );
};

interface GameProps extends Props {
  store: BaseStore;
  scenarios: Scenarios;
}

const GameLayer: React.FC<GameProps> = (props) => {
  const { store, width, height, scenarios, ...others } = props;
  return (
    <Stage
      width={width}
      height={height}
      options={{ antialias: true, autoDensity: true }}
    >
      <ScenariosProvider value={scenarios}>
        <Provider store={store}>
          <Game width={width} height={height} {...others} />
        </Provider>
      </ScenariosProvider>
    </Stage>
  );
};

export default GameLayer;
