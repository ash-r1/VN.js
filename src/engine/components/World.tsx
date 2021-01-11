import React from 'react';
import * as PIXI from 'pixi.js';
import { Container, useApp } from '@inlet/react-pixi';

import { Scenarios } from 'src/engine/scenario/provider';
import { useScenarios } from 'src/hooks/useScenarios';

import { useBaseDispatch, useBaseSelector } from '../../redux/index';
import { actions, LayerName } from '../../redux/reducers/world';
import Character from './Character';
import Image from './Image';
import Rectangle from './Rectangle';

type Components = Record<string, React.ComponentType<any>>;

const defaultComponents: Components = {
  Image,
  Character,
};

export interface Props {
  width: number;
  height: number;
  components?: Components;
}

const World: React.FC<Props> = ({ width, height, components }) => {
  const pixi = useApp();
  const scenarios = useScenarios();
  const dispatch = useBaseDispatch();
  const layers = useBaseSelector((s) => s.world.layers);
  const scale = useBaseSelector((s) => s.world.scale);
  const componentsWithDefaults: Components = {
    ...defaultComponents,
    ...components,
  };

  // React.Context 適当に作って useEngine() みたいなことして clickで engine.run する
  // そして engine.run の中ではredux側を上手いこと使って、....

  const handleClick = async () => {
    // Improbe resource loading like previous implementation
    console.log(`click!, ${scale.x}`);
    // Here's the problematic.
    //
    dispatch(actions.next({ pixi, scenarios }));
  };

  console.log(layers);

  return (
    <Container
      name="world"
      interactive={true}
      pointerdown={handleClick}
      ref={containerRef}
    >
      {/* BaseLayer */}
      <Rectangle x={0} y={0} width={width} height={height} fill={0x000000} />
      {/* User Layers */}
      {(['bg', 'fg', 'msg', 'acc'] as LayerName[]).map((layerName) => (
        <Container name={layerName} key={layerName}>
          {layers[layerName].map(({ type, key, props }) => {
            if (componentsWithDefaults[type]) {
              return React.createElement(componentsWithDefaults[type], {
                key,
                ...props,
              });
            } else {
              throw `Component type ${type} is not supported`;
            }
          })}
        </Container>
      ))}
    </Container>
  );
};

export default World;
