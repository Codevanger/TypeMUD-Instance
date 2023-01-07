import { TransportCode } from "../classes/transport-codes.ts";
import { Client } from "../types/client.d.ts";
import { TransportMessage } from "../types/transport-message.d.ts";
import { log } from "./log.ts";

export function sendMessage<T = null>(options: {
  client: Client;
  code: TransportCode;
  data?: T | null;
  initiatorType?: "SERVER" | "CLIENT";
  initiator?: Client;
}): void {
  let generetatedInitiator = null;

  if (options.initiatorType === "CLIENT") {
    generetatedInitiator = options.initiator
      ? options.initiator
      : options.client;
  }

  const messagge: TransportMessage<T | null> = {
    code: options.code,
    initiatorType: options.initiatorType ? options.initiatorType : "SERVER",
    initiator: generetatedInitiator,
    data: options.data ? options.data : null,
  };

  options.client.websocket.send(JSON.stringify(messagge));
}
