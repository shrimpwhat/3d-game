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
    this.rigidBody = world.createRigidBody(rigidBodyDesc);

    // Create collider
    const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
    world.createCollider(colliderDesc, this.rigidBody);

    // Lock rotation on X and Z axes (prevent tipping over)
    this.rigidBody.lockRotations(true, true);
  }

  public update(_deltaTime: number, inputState: InputState): void {
    // Calculate movement velocity
    const velocity = { x: 0, z: 0 };

    if (inputState.forward) velocity.z -= 1;
    if (inputState.back) velocity.z += 1;
    if (inputState.left) velocity.x -= 1;
    if (inputState.right) velocity.x += 1;

    // Normalize velocity
    const length = Math.hypot(velocity.x, velocity.z);
    if (length > 0) {
      velocity.x = (velocity.x / length) * this.speed;
      velocity.z = (velocity.z / length) * this.speed;
    }

    // Apply movement
    const currentVelocity = this.rigidBody.linvel();
    this.rigidBody.setLinvel(
      new RAPIER.Vector3(velocity.x, currentVelocity.y, velocity.z),
      true
    );

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
