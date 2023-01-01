export declare interface Map {
    name: string;
    description: string;
    bootstrap: Location
}

export declare interface Location {
    id: number;
    name: string;
    description: string;
    exits: Array<Location>;
}