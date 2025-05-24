import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useKeyboardControls } from "@react-three/drei";

function Player() {
  const ref = useRef<RapierRigidBody>(null);
  const [_, getKeys] = useKeyboardControls();

  useFrame(() => {
    const { forward, back, left, right } = getKeys();
    const velocity = { x: 0, z: 0 };

    if (forward) velocity.z -= 1;
    if (back) velocity.z += 1;
    if (left) velocity.x -= 1;
    if (right) velocity.x += 1;

    // Normalize velocity
    const length = Math.hypot(velocity.x, velocity.z);
    if (length > 0) {
      velocity.x /= length;
      velocity.z /= length;
    }

    // Apply movement
    if (ref.current) {
      ref.current.setLinvel(
        { x: velocity.x * 5, y: 0, z: velocity.z * 5 },
        true
      );
    }
  });

  return (
    <RigidBody ref={ref} colliders="cuboid" position={[0, 0.5, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </RigidBody>
  );
}

export default Player;
