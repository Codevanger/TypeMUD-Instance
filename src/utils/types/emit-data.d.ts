import { Arguments } from "./arguments.d.ts";
import { Client } from "./client.d.ts";

export declare interface EmitData {
  command?: string;
  commandArgs?: Arguments;
  client?: Client;
  additionalData?: AdditionalData;
}

export declare type AdditionalData = {
  [name: string]: string;
};
