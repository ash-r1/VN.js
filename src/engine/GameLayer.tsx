import React, { useState } from 'react';
import { Container, Sprite, Text } from '@inlet/react-pixi';

import { Provider } from 'react-redux';

import { BaseStore, useBaseDispatch, useBaseSelector } from '../redux';
import { BaseState } from '../redux/index';
import { actions } from '../redux/reducers/counter';

interface Props {
  label: string;
}

// TODO: 外から渡したパラメータを元にstoreをextend出来ること
//       もしくはProviderで包むのはゲーム側の責務にする(事もできる)ようにすること？ 単にpropsでStore渡して、その型を型推論するようにしてもいいかもしれない。
const bunny = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/693612/IaUrttj.png';
const Game: React.FC<Props> = ({ label }) => {
  const dispatch = useBaseDispatch();
  const [scale, setScale] = useState(1.0);
  const counter = useBaseSelector((state) => state.counter);

  return (
    <Container>
      <Text
        text={`${label} ${counter} - ${scale}`}
        x={200}
        y={200}
        style={{ fill: 'red' }}
        click={() => {
          console.log('clicked');
          dispatch(actions.increment());
        }}
      />
      <Sprite
        x={960}
        y={530}
        anchor={[0.5, 0.5]}
        interactive={true}
        scale={scale}
        image={bunny}
        pointerdown={() => {
          console.log('click');
          dispatch(actions.increment());
          setScale(scale * 1.1);
        }}
      />
    </Container>
  );
};

interface GameProps extends Props {
  store: BaseStore;
}

const GameLayer: React.FC<GameProps> = (props) => {
  const { store, ...others } = props;
  return (
    <Provider store={store}>
      <Game {...others} />
    </Provider>
  );
};

export default GameLayer;
