import { TransportCode } from "../classes/transport-codes.ts";
import { Client } from "./client.d.ts";

export declare interface TransportMessage<T = null> {
  code: TransportCode;
  message: string;
  initiator: Client;
  data: T;
}
