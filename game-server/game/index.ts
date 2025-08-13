import RAPIER from "@dimforge/rapier3d-compat";
import GAME_CONFIG from "../../config.json";
import type { BaseEntity } from "./entities/BaseEntity";
import { Player } from "./entities/Player";
import {
  type GameEvent,
  PlayerMoveEvent,
  PlayerSpawnEvent,
  SnapshotEvent,
} from "../../shared/events";
import type { Entity } from "../../shared/types";

export default class Game {
  private world: RAPIER.World;
  private entities: BaseEntity[] = [];
  private idToIndex: Map<string, number> = new Map();
  private players: Player[] = [];

  private eventsQueue: GameEvent[] = [];
  private publish: (events: GameEvent[]) => void;

  constructor(publish: Game["publish"]) {
    this.publish = publish;
    this.world = new RAPIER.World(new RAPIER.Vector3(0.0, -9.81, 0.0));
    this.createGround();

    setInterval(this.gameLoop.bind(this), 16);
    setInterval(this.publishEvents.bind(this), 100);
    setInterval(this.publishSnapshot.bind(this), 500);
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

  private publishEvents() {
    this.publish(this.eventsQueue);
    this.eventsQueue.length = 0;
  }

  private publishSnapshot() {
    const payload: Entity[] = this.entities.map((entity) => ({
      id: entity.id,
      position: entity.getPosition(),
      velocity: entity.getVelocity(),
      rotation: entity.getRotation(),
    }));

    this.publish([new SnapshotEvent({ entities: payload })]);
  }

  spawnPlayer({ id }: PlayerSpawnEvent["data"]) {
    const player = new Player(id, this.world);
    this.players.push(player);
    const index = this.entities.push(player) - 1;
    this.idToIndex.set(id, index);

    this.eventsQueue.push(new PlayerSpawnEvent({ id }));
  }

  movePlayer({ id, velocity, rotation }: PlayerMoveEvent["data"]) {
    const player = this.players.find((player) => player.id === id);
    if (!player) return;

    player.setLinvel(velocity);
    player.setRotation(rotation);

    this.eventsQueue.push(new PlayerMoveEvent({ id, velocity, rotation }));
  }
}
