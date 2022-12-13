import * as Colors from "https://deno.land/std@0.149.0/fmt/colors.ts";

import { LogParams, LogLevel } from "../types/log.d.ts";

let logParams: LogParams = {};

export function changeLogParams(params: LogParams): void {
  logParams = params;
}

export function log(
  level: LogLevel,
  message?: string | number,
  showTime?: boolean
): void {
  let time = "";
  if (showTime) {
    const date = new Date();
    time = `${date.toLocaleTimeString()} | `;
  }

  switch (level) {
    case "ERROR":
      console.log(Colors.red("[ERROR]: " + time) + message);
      break;
    case "WARNING":
      console.log(Colors.yellow("[WARN]: " + time) + message);
      break;
    case "INFO":
      console.log(Colors.blue("[INFO]: " + time) + message);
      break;
    case "DEBUG":
      if (logParams?.showDebugLogs)
        console.debug(Colors.magenta("[DEBUG]: " + time) + message);
      break;
    case "PERFOMANCE":
      if (logParams?.showPerfomanceLogs)
        console.debug(Colors.brightYellow("[PERFOMANCE]: " + time) + message);
      break;
    case "EMPTY":
      console.debug("");
      break;
    default:
      break;
  }
}
