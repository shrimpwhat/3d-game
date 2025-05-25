import { useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { usePlayer } from "./context/playerContext";

function ThirdPersonCamera() {
  const { camera } = useThree();
  const { playerPosition } = usePlayer();
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);

  const sensitivity = 0.002;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setYaw((yaw) => yaw - e.movementX * sensitivity);
      setPitch((pitch) =>
        Math.max(
          -Math.PI / 3,
          Math.min(Math.PI / 3, pitch - e.movementY * sensitivity)
        )
      );
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  });
  useFrame(() => {
    const radius = 5;

    // Calculate camera position using spherical coordinates
    const offset = new Vector3(
      radius * Math.sin(yaw) * Math.cos(pitch),
      radius * Math.sin(pitch) + 2,
      radius * Math.cos(yaw) * Math.cos(pitch)
    );

    const targetCameraPosition = playerPosition.clone().add(offset);

    // Smoothly interpolate the camera position
    camera.position.lerp(targetCameraPosition, 0.1);

    // Always look at the player - this is much more reliable than quaternion math
    camera.lookAt(playerPosition);
  });

  return null;
}

export default ThirdPersonCamera;
