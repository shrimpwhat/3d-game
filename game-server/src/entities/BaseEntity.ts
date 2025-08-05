import RAPIER from "@dimforge/rapier3d";
import * as THREE from "three";
import GAME_CONFIG from "../../../config.json";

export class BaseEntity {
  protected rigidBody: RAPIER.RigidBody;
  protected speed: number;
  protected hp: number;
  protected id: string;

  constructor(
    id: string,
    world: RAPIER.World,
    speed = GAME_CONFIG.entities.base.speed,
    hp = GAME_CONFIG.entities.base.hp,
    position = new RAPIER.Vector3(0, 0.5, 0)
  ) {
    this.speed = speed;
    this.hp = hp;
    this.id = id;

    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic();
    rigidBodyDesc.setTranslation(position.x, position.y, position.z);

    this.rigidBody = world.createRigidBody(rigidBodyDesc);
    this.rigidBody;
    const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
    world.createCollider(colliderDesc, this.rigidBody);

    this.rigidBody.setEnabledRotations(false, true, false, true);
  }

  protected update(): void {}

  private rotateToMovementDirection(): void {
    const { x, y, z } = this.rigidBody.linvel();
    const linvel = new THREE.Vector3(x, y, z);

    if (linvel.length() > 0) {
      const movementDirection = linvel.normalize();

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

  getPosition() {
    return this.rigidBody.translation();
  }
}
