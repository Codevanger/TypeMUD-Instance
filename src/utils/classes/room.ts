import { Context } from "../types/context.d.ts";
import { IRoom } from "../types/map.d.ts";
import { Location } from "./location.ts";
import { Map } from "./map.ts";

export const VOID_ROOM: IRoom = {
  id: 1,
  name: "Нигде",
  locationId: -1, 
  description: "Вы находитесь нигде.",
}

export class Room {
  public readonly id: number;
  public readonly name: string;
  public readonly description: string;
  public readonly locationId: number;
  private _exits: Array<number> = [];

  constructor(
    room: IRoom,
    private location: Location,
    private map: Map,
    private context: Context
  ) {
    this.id = room.id;
    this.name = room.name;
    this.description = room.description;
    this.locationId = room.locationId;
  }

  public get exits(): Array<Location> {
    return this._exits.map((x) => this.map.getLocation(x));
  }
}
