import { Params } from "./params.d.ts";

export declare type LogLevel =
  | "DEBUG"
  | "INFO"
  | "WARNING"
  | "ERROR"
  | "PERFOMANCE"
  | "EMPTY";
  
export declare type LogParams = Partial<Params>;