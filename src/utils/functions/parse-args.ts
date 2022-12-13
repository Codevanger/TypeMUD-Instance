import { Arguments } from "../types/arguments.d.ts";

export function parseArgs(args: string[]): Arguments {
  const returnValue: Arguments = {};

  args.forEach((x) => {
    const keyvalue = x.split("=");

    returnValue[keyvalue[0]] = keyvalue[1];
  });

  return returnValue;
}
