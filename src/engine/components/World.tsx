import React from 'react';
import { Container, useApp } from '@inlet/react-pixi';

import { useBaseDispatch, useBaseSelector } from '../../redux/index';
import { actions } from '../../redux/reducers/world';
import Image from './Image';
import Rectangle from './Rectangle';

export interface Props {
  width: number;
  height: number;
  // TODO: bg, fg, acc
  // layerGroups: string[];
}

const World: React.FC<Props> = ({ width, height }) => {
  const dispatch = useBaseDispatch();
  const layers = useBaseSelector((s) => s.world.layers);
  const scale = useBaseSelector((s) => s.world.scale);
  const pixi = useApp();

  // React.Context 適当に作って useEngine() みたいなことして clickで engine.run する
  // そして engine.run の中ではredux側を上手いこと使って、....

  const handleClick = async () => {
    // Improbe resource loading like previous implementation
    console.log(`click!, ${scale.x}`);
    // Here's the problematic.
    //
    const { loader } = pixi;
    if (layers.length > 0) {
      dispatch(actions.debug());
    } else {
      const path = 'game/images/bg garden-road-1-rev1.png';
      // const path =
      //   'https://i.picsum.photos/id/933/1200/1200.jpg?hmac=gKkxi6Sok4NBCn14G01G0_OnV2imWiSPVFy8VwFt6O8';
      if (!loader.resources[path]) {
        loader.add(path);
        await new Promise((resolve) => {
          console.log('loading resolved!');
          loader.load(resolve);
        });
      }
      dispatch(actions.addImageLayer({ key: `1`, props: { image: path } }));
    }
  };

  return (
    <Container interactive={true} pointerdown={handleClick}>
      {/* BaseLayer */}
      <Rectangle x={0} y={0} width={width} height={height} fill={0x000000} />
      {layers.map(({ type, key, props }) => {
        switch (type) {
          case 'Image':
            return <Image key={key} {...props} scale={scale} />;
          default:
            throw `Component type ${type} is not supported`;
        }
      })}
    </Container>
  );
};

export default World;
