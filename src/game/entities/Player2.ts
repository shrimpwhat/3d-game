import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import { type InputState } from "../input/InputManager";
import { BaseEntity } from "./BaseEntity";

export class Player extends BaseEntity {
  constructor(world: RAPIER.World, scene: THREE.Scene, speed = 5) {
    super(world, scene, speed);
  }

  public updatePlayer(
    inputState: InputState,
    cameraDirection: THREE.Vector3
  ): void {
    const inputVector = this.collectInput(inputState);
    const worldMovement = this.calculateMovement(
      inputVector,
      inputState,
      cameraDirection
    );
    this.applyMovement(worldMovement);

    super.update();
  }

  private collectInput(inputState: InputState): THREE.Vector3 {
    const inputVector = new THREE.Vector3(0, 0, 0);

    if (inputState.forward) inputVector.z -= 1;
    if (inputState.back) inputVector.z += 1;
    if (inputState.left) inputVector.x -= 1;
    if (inputState.right) inputVector.x += 1;

    return inputVector;
  }

  private calculateMovement(
    inputVector: THREE.Vector3,
    inputState: InputState,
    cameraDirection?: THREE.Vector3
  ): THREE.Vector3 {
    const worldMovement = new THREE.Vector3(0, 0, 0);

    if (inputVector.length() > 0) {
      if (inputState.forward && cameraDirection) {
        this.calculateCameraRelativeMovement(
          inputVector,
          cameraDirection,
          worldMovement
        );
      } else {
        this.calculatePlayerRelativeMovement(inputVector, worldMovement);
      }
    }

    return worldMovement;
  }

  private calculateCameraRelativeMovement(
    inputVector: THREE.Vector3,
    cameraDirection: THREE.Vector3,
    worldMovement: THREE.Vector3
  ): void {
    // Get camera's forward and right vectors
    const cameraForward = cameraDirection.clone().normalize();
    cameraForward.y = 0; // Keep movement on ground plane
    cameraForward.normalize();

    const cameraRight = new THREE.Vector3()
      .crossVectors(cameraForward, new THREE.Vector3(0, 1, 0))
      .normalize();

    // Transform input to camera space
    worldMovement.addScaledVector(cameraForward, -inputVector.z);
    worldMovement.addScaledVector(cameraRight, inputVector.x);
  }

  private calculatePlayerRelativeMovement(
    inputVector: THREE.Vector3,
    worldMovement: THREE.Vector3
  ): void {
    // Get player's current rotation
    const playerRotation = this.rigidBody.rotation();
    const playerQuaternion = new THREE.Quaternion(
      playerRotation.x,
      playerRotation.y,
      playerRotation.z,
      playerRotation.w
    );

    // Get player's forward and right directions
    const playerForward = new THREE.Vector3(0, 0, -1).applyQuaternion(
      playerQuaternion
    );
    const playerRight = new THREE.Vector3(1, 0, 0).applyQuaternion(
      playerQuaternion
    );

    // Transform input to player space
    worldMovement.addScaledVector(playerForward, inputVector.z);
    worldMovement.addScaledVector(playerRight, -inputVector.x);
  }

  private applyMovement(worldMovement: THREE.Vector3): void {
    if (worldMovement.length() > 0) {
      // Normalize and apply speed
      worldMovement.normalize().multiplyScalar(this.speed);

      const currentVelocity = this.rigidBody.linvel();
      this.rigidBody.setLinvel(
        new RAPIER.Vector3(worldMovement.x, currentVelocity.y, worldMovement.z),
        true
      );
    } else {
      // No input, maintain current Y velocity but stop horizontal movement
      const currentVelocity = this.rigidBody.linvel();
      this.rigidBody.setLinvel(
        new RAPIER.Vector3(0, currentVelocity.y, 0),
        true
      );
    }
  }
}
