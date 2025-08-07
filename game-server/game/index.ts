import RAPIER from "@dimforge/rapier3d-compat";
import GAME_CONFIG from "../../config.json";
import type { BaseEntity } from "./entities/BaseEntity";

export default class Game {
  private world: RAPIER.World;
  private entities: Map<string, BaseEntity> = new Map();

  constructor(publish: (data: unknown) => void) {
    this.world = new RAPIER.World(new RAPIER.Vector3(0.0, -9.81, 0.0));
    this.createGround();

    setInterval(this.gameLoop.bind(this), 6.94);
    setInterval(() => publish(this.entities), 50);
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

  private gameLoop() {
    this.world.step();
    for (const entity of this.entities.values()) {
      entity.update();
    }
  }

  spawnPlayer() {}
}
