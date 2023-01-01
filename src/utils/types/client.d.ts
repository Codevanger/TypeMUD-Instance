import { WebSocketClient } from "https://deno.land/x/websocket@v0.1.4/mod.ts";
import { Character } from "../classes/database-models.ts";

export declare interface Client {
  id: number;
  connectionId: number;
	websocket: WebSocketClient;
  character: Character | null;
  auth: boolean;
}
