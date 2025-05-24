import { Canvas } from "@react-three/fiber";
import { KeyboardControls, OrbitControls } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import Player from "./player";
import ControlKeysMap from "./controls";

function Game() {
  return (
    <Canvas shadows camera={{ position: [0, 5, 15], fov: 90 }}>
      <KeyboardControls map={ControlKeysMap}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
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
        <OrbitControls />
      </KeyboardControls>
    </Canvas>
  );
}

export default Game;
