import React from 'react';
import * as PIXI from 'pixi.js';
import { Container, useApp } from '@inlet/react-pixi';

import { Scenarios } from 'src/engine/scenario/provider';
import { useScenarios } from 'src/hooks/useScenarios';

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
  const pixi = useApp();
  const scenarios = useScenarios();
  const dispatch = useBaseDispatch();
  const layers = useBaseSelector((s) => s.world.layers);
  const scale = useBaseSelector((s) => s.world.scale);

  // React.Context 適当に作って useEngine() みたいなことして clickで engine.run する
  // そして engine.run の中ではredux側を上手いこと使って、....

  const handleClick = async () => {
    // Improbe resource loading like previous implementation
    console.log(`click!, ${scale.x}`);
    // Here's the problematic.
    //
    dispatch(actions.next({ pixi, scenarios }));
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
