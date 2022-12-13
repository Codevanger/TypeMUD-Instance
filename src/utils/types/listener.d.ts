import { EmitData } from "./emit-data.d.ts";

export declare type Listener = (
  listeners: Listeners,
  data: EmitData | null
) => void;

export declare type Listeners = Array<Listener>;
