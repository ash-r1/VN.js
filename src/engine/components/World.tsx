import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { Container, PixiRef, useApp } from '@inlet/react-pixi';

import { useEngine } from '../../hooks/useEngine';
import { useBaseDispatch, useBaseSelector } from '../../redux/index';
import { actions, LayerName } from '../../redux/reducers/world';
import Character from './Character';
import Image from './Image';
import Message from './Message';
import Rectangle from './Rectangle';

type Components = Record<string, React.ComponentType<any>>;

const defaultComponents: Components = {
  Image,
  Character,
  Message,
};

export interface Props {
  width: number;
  height: number;
  components?: Components;
}

const World: React.FC<Props> = ({ width, height, components }) => {
  const pixiApp = useApp();
  const engine = useEngine();
  const dispatch = useBaseDispatch();
  const running = useBaseSelector((s) => s.world.running);
  const layers = useBaseSelector((s) => s.world.layers);
  const scale = useBaseSelector((s) => s.world.scale);
  const containerRef = useRef<PixiRef<typeof Container>>(null);
  const componentsWithDefaults: Components = {
    ...defaultComponents,
    ...components,
  };

  useEffect(() => {
    engine.app = pixiApp;
    engine.worldContainer = containerRef.current ?? undefined;
    if (!running) {
      dispatch(actions.run({ path: 'first' }));
    }
  }, [pixiApp, containerRef.current, running]);

  // React.Context 適当に作って useEngine() みたいなことして clickで engine.run する
  // そして engine.run の中ではredux側を上手いこと使って、....

  const handleClick = async () => {
    dispatch(actions.next());
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
          {layers[layerName].map(({ type, name, props }) => {
            if (componentsWithDefaults[type]) {
              console.log(`type=${type}, name=${name}`);
              return React.createElement(componentsWithDefaults[type], {
                key: name,
                name,
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
