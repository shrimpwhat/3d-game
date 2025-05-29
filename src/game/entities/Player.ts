import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import { type InputState } from "../input/InputManager";

export class Player {
  private mesh: THREE.Mesh;
  private rigidBody: RAPIER.RigidBody;
  private speed: number = 5;

  constructor(world: RAPIER.World, scene: THREE.Scene) {
    // Create visual representation
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xff8800 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.userData = { type: "player" };
    scene.add(this.mesh);

    // Create physics body
    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic();
    rigidBodyDesc.setTranslation(0, 0.5, 0);
    this.rigidBody = world.createRigidBody(rigidBodyDesc); // Create collider
    const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
    world.createCollider(colliderDesc, this.rigidBody);

    this.rigidBody.setEnabledRotations(false, true, false, true);
  }
  public update(
    _deltaTime: number,
    inputState: InputState,
    cameraDirection?: THREE.Vector3
  ): void {
    const inputVector = this.collectInput(inputState);
    const worldMovement = this.calculateMovement(
      inputVector,
      inputState,
      cameraDirection
    );
    this.applyMovement(worldMovement);
    this.updateMeshTransform();
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
        this.rotatePlayerToMovementDirection(worldMovement);
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

  private rotatePlayerToMovementDirection(worldMovement: THREE.Vector3): void {
    if (worldMovement.length() > 0) {
      const movementDirection = worldMovement.clone().normalize();
      const targetRotation = Math.atan2(
        movementDirection.x,
        movementDirection.z
      );
      this.rigidBody.setRotation(
        new RAPIER.Quaternion(
          0,
          Math.sin(targetRotation / 2),
          0,
          Math.cos(targetRotation / 2)
        ),
        true
      );
    }
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

  private updateMeshTransform(): void {
    // Update mesh position from physics body
    const position = this.rigidBody.translation();
    this.mesh.position.set(position.x, position.y, position.z);

    // Update mesh rotation from physics body
    const rotation = this.rigidBody.rotation();
    this.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
  }

  public getPosition(): THREE.Vector3 {
    const position = this.rigidBody.translation();
    return new THREE.Vector3(position.x, position.y, position.z);
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }
}
