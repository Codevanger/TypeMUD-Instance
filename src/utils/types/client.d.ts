import { WebSocketClient } from "https://deno.land/x/websocket@v0.1.4/mod.ts";
import { Character, User } from "../classes/database-models.ts";

export declare interface Client {
  id: number;
  connectionId: number;
	websocket: WebSocketClient;
  user: User | null;
  character: Character | null;
  auth: boolean;
}
