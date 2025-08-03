import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d";

export class BaseEntity {
  protected mesh: THREE.Mesh;
  protected rigidBody: RAPIER.RigidBody;
  protected speed: number;

  constructor(world: RAPIER.World, scene: THREE.Scene, speed = 5) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xff8800 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;

    scene.add(this.mesh);

    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic();
    rigidBodyDesc.setTranslation(0, 0.5, 0); // whats it?
    this.rigidBody = world.createRigidBody(rigidBodyDesc);
    const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
    world.createCollider(colliderDesc, this.rigidBody);

    this.rigidBody.setEnabledRotations(false, true, false, true);

    this.speed = speed;
  }

  protected update(): void {
    // this.rotateToMovementDirection();
    this.updateMeshTransform();
  }

  private rotateToMovementDirection(): void {
    const { x, y, z } = this.rigidBody.linvel();
    const currentLinvel = new THREE.Vector3(x, y, z);

    if (currentLinvel.length() > 0) {
      const movementDirection = currentLinvel.clone().normalize(); // ask if needed

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

  private updateMeshTransform(): void {
    const position = this.rigidBody.translation();
    this.mesh.position.set(position.x, position.y, position.z);

    const rotation = this.rigidBody.rotation();
    this.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
  }

  public setHorizontalVelocity(vx: number, vz: number): void {
    const { y } = this.rigidBody.linvel();
    this.rigidBody.setLinvel(
      new RAPIER.Vector3(vx * this.speed, y, vz * this.speed),
      true
    );
  }

  public getPosition(): THREE.Vector3 {
    const position = this.rigidBody.translation();
    return new THREE.Vector3(position.x, position.y, position.z);
  }
}
