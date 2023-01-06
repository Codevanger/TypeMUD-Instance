import { TransportCode } from "../classes/transport-codes.ts";
import { Client } from "../types/client.d.ts";
import { TransportMessage } from "../types/transport-message.d.ts";
import { log } from "./log.ts";

export function sendMessage<T = null>(
  client: Client,
  code: TransportCode,
  message?: string,
  data?: T | null
): void {
  const messagge: TransportMessage<T | null> = {
    code: code,
    initiator: client,
    message: message ? message : "",
    data: data ? data : null,
  };

  log("DEBUG", `Sending message to ${client.id}...`);
  client.websocket.send(JSON.stringify(messagge));
}
