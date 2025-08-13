import { EventTypeMap, type Entity } from "../types";
import { BaseEvent } from "./BaseEvent";

interface Data {
  entities: Entity[];
}

export class SnapshotEvent extends BaseEvent<Data> {
  constructor(data: Data) {
    super(EventTypeMap.SNAPSHOT_EVENT, data);
  }
}
