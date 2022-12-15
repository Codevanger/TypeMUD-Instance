import * as Colors from "https://deno.land/std@0.149.0/fmt/colors.ts";

import { LogParams, LogLevel } from "../types/log.d.ts";

let logParams: LogParams = {};

export function changeLogParams(params: LogParams): void {
  logParams = params;
}

export function log(
  level: LogLevel,
  message?: string | number
): void {
  let time = "";

  const date = new Date();
  time = `${date.toLocaleTimeString()}`;

  switch (level) {
    case "ERROR":
      console.log(`[${Colors.gray(time)}] ` + Colors.red("[ERROR]: ") + message);
      break;
    case "WARNING":
      console.log(`[${Colors.gray(time)}] ` + Colors.yellow("[WARNING]: ") + message);
      break;
    case "INFO":
      console.log(`[${Colors.gray(time)}] ` + Colors.blue("[INFO]: ") + message);
      break;
    case "SUCCESS":
      console.log(`[${Colors.gray(time)}] ` + Colors.green("[SUCCESS]: ") + message);
      break;
    case "DEBUG":
      if (logParams?.showDebugLogs)
        console.debug(`[${Colors.gray(time)}] ` + Colors.magenta("[DEBUG]: ") + message);
      break;
    case "PERFOMANCE":
      if (logParams?.showPerfomanceLogs)
        console.debug(`[${Colors.gray(time)}] ` + Colors.cyan("[PERFOMANCE]: ") + message);
      break;
    case "EMPTY":
      console.debug("");
      break;
    default:
      break;
  }
}
