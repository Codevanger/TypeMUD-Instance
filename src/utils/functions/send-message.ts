import { TransportCode } from "../classes/transport-codes.ts";
import { Client } from "../types/client.d.ts";
import { TransportMessage } from "../types/transport-message.d.ts";
import { log } from "./log.ts";

export function sendMessage<T = null>(
  client: Client,
  code: TransportCode,
  message?: string,
  data?: T | null,
  initiatorType: "SERVER" | "CLIENT" = "SERVER",
  initiator?: Client,
): void {
  let generetatedInitiator = null;

  if (initiatorType === "CLIENT") {
    generetatedInitiator = initiator ? initiator : client;
  }

  const messagge: TransportMessage<T | null> = {
    code: code,
    initiatorType,
    initiator: generetatedInitiator,
    message: message ? message : "",
    data: data ? data : null,
  };

  client.websocket.send(JSON.stringify(messagge));
}
