import { log } from "./log.ts";

export function checkPerfomance(params: {
  time?: number;
  message?: string;
  overtimeMessage?: string;
  overtime?: number;
}): void {
  const startTime = params["time"] ? params["time"] : 0;

  const checkTime = performance.now() - startTime;

  if (params.message)
    log("PERFOMANCE", params.message.replaceAll("[[time]]", `${checkTime}ms`));

  if (params.overtime && checkTime > params.overtime) {
    if (params.overtimeMessage) {
      log(
        "WARNING",
        params.overtimeMessage.replaceAll("[[time]]", `${checkTime}ms`)
      );
    } else {
      log("WARNING", "Faced overtime");
    }
  }
}
