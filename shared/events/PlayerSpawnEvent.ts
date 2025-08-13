import { EventTypeMap } from "../types";
import { BaseEvent } from "./BaseEvent";

interface Data {
  id: string;
}

export class PlayerSpawnEvent extends BaseEvent<Data> {
  constructor(data: Data) {
    super(EventTypeMap.SPAWN_PLAYER, data);
  }
}
