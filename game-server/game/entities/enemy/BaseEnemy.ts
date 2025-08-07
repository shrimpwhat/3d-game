import RAPIER from "@dimforge/rapier3d-compat";
import { BaseEntity } from "../BaseEntity";
import type { Player } from "../Player";
import * as THREE from "three";

export class BaseEnemy extends BaseEntity {
  protected players: Player[];

  constructor(id: string, world: RAPIER.World, players: Player[]) {
    super(id, world);

    this.players = players;
  }

  override update() {
    const nearestPlayer = this.getNearestPlayer();

    if (nearestPlayer) {
      const { direction } = nearestPlayer;
      this.setLinvel(direction);
      this.rotateToMovementDirection();
    } else {
      this.setLinvel({ x: 0, y: 0, z: 0 });
    }

    super.update();
  }

  private getNearestPlayer() {
    let nearestPlayer: Player | null = null,
      minDistanceVector: THREE.Vector3 | null = null,
      minDistance = Infinity;

    const { x, y, z } = this.getPosition();
    const selfPosition = new THREE.Vector3(x, y, z);

    for (const player of this.players) {
      const { x, y, z } = player.getPosition();
      const playerPoistion = new THREE.Vector3(x, y, z);

      const distanceVector = playerPoistion.sub(selfPosition);
      const distance = distanceVector.length();
      if (distance < minDistance) {
        minDistance = distance;
        nearestPlayer = player;
        minDistanceVector = distanceVector;
      }
    }

    if (nearestPlayer && minDistanceVector)
      return {
        entity: nearestPlayer,
        direction: minDistanceVector.normalize(),
      };
  }
}
