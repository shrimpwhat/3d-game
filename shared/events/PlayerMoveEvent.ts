import { EventTypeMap, type Vector3, type Vector4 } from "../types";
import { BaseEvent } from "./BaseEvent";

interface Data {
  id: string;
  velocity: Vector3;
  rotation: Vector4;
}

export class PlayerMoveEvent extends BaseEvent<Data> {
  constructor(data: Data) {
    super(EventTypeMap.PLAYER_MOVE, data);
  }
}
