import { WebSocketClient } from "https://deno.land/x/websocket@v0.1.4/mod.ts";

export declare interface Client {
  uuid: string | number[];
	websocket: WebSocketClient;
}
