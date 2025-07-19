import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import { type InputState } from "../input/InputManager";
import { BaseEntity } from "./BaseEntity";

export class Player2 extends BaseEntity {
  constructor(world: RAPIER.World, scene: THREE.Scene, speed = 50) {
    super(world, scene, speed);
  }

  public updatePlayer(
    inputState: InputState,
    cameraDirection: THREE.Vector3
  ): void {
    const inputVector = this.collectInput(inputState);
    this.applyVelocity(inputVector, inputState, cameraDirection);
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

  private applyVelocity(
    inputVector: THREE.Vector3,
    inputState: InputState,
    cameraDirection?: THREE.Vector3
  ): void {
    const velocity = new THREE.Vector3(0, 0, 0);

    if (inputVector.length() > 0) {
      if (inputState.forward && cameraDirection) {
        this.applyCameraDirection(inputVector, cameraDirection, velocity);
      } else {
        this.calculatePlayerRelativeVelocity(inputVector, velocity);
      }
    }

    this.rigidBody.setLinvel(
      velocity.normalize().multiply(new THREE.Vector3(10, 0, 10)),
      true
    );
  }

  private applyCameraDirection(
    inputVector: THREE.Vector3,
    cameraDirection: THREE.Vector3,
    velocity: THREE.Vector3
  ): void {
    const cameraForward = cameraDirection.clone().normalize();
    cameraForward.y = 0;
    cameraForward.normalize();

    const cameraRight = new THREE.Vector3()
      .crossVectors(cameraForward, new THREE.Vector3(0, 1, 0))
      .normalize();

    velocity.addScaledVector(cameraForward, -inputVector.z);
    velocity.addScaledVector(cameraRight, inputVector.x);
  }

  private calculatePlayerRelativeVelocity(
    inputVector: THREE.Vector3,
    velocity: THREE.Vector3
  ): void {
    const playerRotation = this.rigidBody.rotation();
    const playerQuaternion = new THREE.Quaternion(
      playerRotation.x,
      playerRotation.y,
      playerRotation.z,
      playerRotation.w
    );

    const playerForward = new THREE.Vector3(1, 0, 0).applyQuaternion(
      playerQuaternion
    );
    const playerRight = new THREE.Vector3(0, 0, 1).applyQuaternion(
      playerQuaternion
    );

    velocity.addScaledVector(playerForward, inputVector.z);
    velocity.addScaledVector(playerRight, -inputVector.x);
  }
}
