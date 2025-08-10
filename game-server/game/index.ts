import RAPIER from "@dimforge/rapier3d-compat";
import GAME_CONFIG from "../../config.json";
import type { BaseEntity } from "./entities/BaseEntity";
import { Player } from "./entities/Player";
import type {
  BaseEvent,
  PlayerMoveEvent,
  SpawnPlayerEvent,
} from "../../shared/types";

export default class Game {
  private world: RAPIER.World;
  private entities: BaseEntity[] = [];
  private idToIndex: Map<string, number> = new Map();
  private players: Player[] = [];

  private publish: (data: BaseEvent[]) => void;

  constructor(publish: Game["publish"]) {
    this.publish = publish;
    this.world = new RAPIER.World(new RAPIER.Vector3(0.0, -9.81, 0.0));
    this.createGround();

    setInterval(this.gameLoop.bind(this), 16);
    // setInterval(() => publish(this.entities), 100);
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

  private publishUpdates() {}

  spawnPlayer({ id }: SpawnPlayerEvent["data"]) {
    const player = new Player(id, this.world);
    this.players.push(player);
    const index = this.entities.push(player) - 1;
    this.idToIndex.set(id, index);
  }

  movePlayer({ id, velocity, rotation }: PlayerMoveEvent["data"]) {
    const player = this.players.find((player) => player.id === id);
    if (!player) return;

    player.setLinvel(velocity);
    player.setRotation(rotation);
  }
}
