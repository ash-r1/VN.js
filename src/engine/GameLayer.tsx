import React from 'react';
import { Container, Sprite, Text } from '@inlet/react-pixi';

import { Provider } from 'react-redux';

import { actions } from './redux/reducers/counter';
import store, { useAppDispatch, useAppSelector } from './redux/store';

// TODO: 外から渡したパラメータを元にstoreをextend出来ること
//       もしくはProviderで包むのはゲーム側の責務にする(事もできる)ようにすること？ 単にpropsでStore渡して、その型を型推論するようにしてもいいかもしれない。
const bunny = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/693612/IaUrttj.png';
const Game: React.FC = () => {
  const dispatch = useAppDispatch();
  const counter = useAppSelector((state) => state.counter);

  return (
    <Container>
      <Text
        text={`Hello World ${counter}`}
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
        y={539}
        anchor={[0.5, 0.5]}
        interactive={true}
        scale={1.0 * counter + 1.0}
        image={bunny}
        pointerdown={() => {
          console.log('click');
          dispatch(actions.increment());
        }}
      />
    </Container>
  );
};

const GameLayer: React.FC = () => {
  return (
    <Provider store={store}>
      <Game />
    </Provider>
  );
};

export default GameLayer;
