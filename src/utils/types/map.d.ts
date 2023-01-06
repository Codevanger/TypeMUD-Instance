export declare interface IMap {
  name: string;
  description: string;
  bootstrap: number;
}


export declare interface ILocation {
  id: number;
  name: string;
  description: string;
  exits: Array<number>;
}

export declare interface ILocationWebsocketFriendly extends ILocation {
  expandedExits: Array<ILocation>;
}