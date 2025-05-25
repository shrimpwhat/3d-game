import { Canvas } from "@react-three/fiber";
import { Grid, KeyboardControls } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { useState } from "react";
import { Vector3 } from "three";
import Player from "./player";
import ControlKeysMap from "./controls";
import { PlayerContext } from "./context/playerContext";
import Camera from "./camera";

function Game() {
  const [playerPosition, setPlayerPosition] = useState(new Vector3(0, 0.5, 0));

  return (
    <PlayerContext.Provider value={{ playerPosition, setPlayerPosition }}>
      <Canvas shadows>
        <KeyboardControls map={ControlKeysMap}>
          <Camera />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} castShadow />
          <Physics>
            <Player />

            <RigidBody type="fixed" colliders="cuboid">
              <mesh
                receiveShadow
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0, 0]}
              >
                <planeGeometry args={[2000, 2000]} />
                <meshStandardMaterial color="grey" />
              </mesh>
            </RigidBody>
          </Physics>
          <Grid
            position={[0, 0.1, 0]}
            args={[200, 200]}
            cellSize={1}
            sectionSize={10}
            sectionThickness={1.5}
            sectionColor="#9d4b4b"
          />
        </KeyboardControls>
      </Canvas>
    </PlayerContext.Provider>
  );
}

export default Game;
