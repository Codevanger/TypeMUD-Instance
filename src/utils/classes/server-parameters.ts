import { changeLogParams, log } from "../functions/log.ts";
import { Arguments } from "../types/arguments.d.ts";
import { Params } from "../types/params.d.ts";

export class ServerParameters implements Params {
  private _port = 5000;
  private _refreshRate = 1000;
  private _showPerfomanceLogs = false;
  private _showDebugLogs = false;

  public get port(): number {
    return this._port;
  }

  public get refreshRate(): number {
    return this._refreshRate;
  }

  public get showPerfomanceLogs(): boolean {
    return this._showPerfomanceLogs;
  }

  public get showDebugLogs(): boolean {
    return this._showDebugLogs;
  }

  constructor(args: Arguments) {
    this.processArguments(args);

    changeLogParams(this);
  }

  private processArguments(args: Arguments): void {
    const refreshRate = 1000 / Number(args["tickrate"]);
    if (refreshRate) this._refreshRate = refreshRate;
    else log("INFO", `Refresh Rate not defined - using default`);

    log("INFO", `Refresh Rate is ${this.refreshRate}ms`);

    const port = Number(args["port"]);
    if (port) this._port = port;
    else log("INFO", `Port not defined - using default`);

    log("INFO", `Port is ${this.port}`);

    const showDebug = Boolean(args["showDebug"]);
    if (showDebug) {
      this._showDebugLogs = showDebug;

      log("INFO", `Will show [DEBUG] logs now`);
    }

    const showPerfomance = Boolean(args["showPerfomance"]);
    if (showPerfomance) {
      this._showPerfomanceLogs = showPerfomance;

      log("INFO", `Will show [PERFOMANCE] logs now`);
    }
  }
}
