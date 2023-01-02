import { DataModule } from "../../utils/classes/module.ts";
import { Context } from "../../utils/types/context.d.ts";
import { Database, SQLite3Connector } from "https://deno.land/x/denodb@v1.1.0/mod.ts";
import { log } from "../../utils/functions/log.ts";
import { DATABASE_MODELS } from "../../utils/classes/database-models.ts";

/**
 * Module for database connection
 */
export class GameDatabase extends DataModule {
  public priority = -1;

  private DB!: Database;

  constructor(protected context: Context) {
    super(context);

    this.canLoad();
    this.initDB();
  }

  public canLoad(): boolean {
    if (this.loadedModulesNames.find((x) => x === "Database")) {
      throw new Error("Can't load Database module twice!");
    }

    super.canLoad();

    return true;
  }

  public sync(): void {
    log("DEBUG", "Syncing database...");

    this.DB.link(DATABASE_MODELS);
  }

  private initDB(): void {
    try {
      const connector = new SQLite3Connector({
        filepath: "../db/server.sqlite",
      });

      this.DB = new Database(connector);
    } catch (e) {
      log("ERROR", "Failed to connect to database!");
      log("DEBUG", e.message);
    } finally {
      log("SUCCESS", "Database connected!");
    }
  }
}
