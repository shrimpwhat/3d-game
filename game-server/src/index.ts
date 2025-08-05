import RAPIER from "@dimforge/rapier3d";
import GAME_CONFIG from "../../config.json";
import type { BaseEntity } from "./entities/BaseEntity";

export class Game {
  private world: RAPIER.World;
  private entities: Map<string, BaseEntity> = new Map();

  constructor() {
    this.world = new RAPIER.World(new RAPIER.Vector3(0.0, -9.81, 0.0));
    this.createGround();
  }

  private createGround() {
    const groundColliderSize = GAME_CONFIG.map.groundCollider;
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(
      groundColliderSize.x,
      groundColliderSize.y,
      groundColliderSize.z
    );
    const groundCollider = this.world.createCollider(groundColliderDesc);
    groundCollider.setTranslation(new RAPIER.Vector3(0, 0, 0));
  }
}
