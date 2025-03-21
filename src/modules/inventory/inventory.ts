import { GameModule } from "../../utils/classes/module.ts";
import { Context } from "../../utils/types/context.d.ts";

export class GameInventory extends GameModule {
  public override commandsToAdd = {
    INVENTORY: this.getInventory,
    ADDITEM: this.addItem,
    DROPITEM: this.dropItem,
    GIMEITEM: this.giveItem,
  };

  constructor(protected override context: Context) {
    super(context);

    this.canLoad();
    this.initItems();
  }

  public override canLoad(): boolean {
    if (this.loadedModulesNames.find((x) => x === "GameInventory")) {
      throw new Error("Can't load GameInventory module twice!");
    }

    super.canLoad();

    return true;
  }

  private initItems() {
    throw new Error("Method not implemented.");
  }

  public getInventory() {
    throw new Error("Method not implemented.");
  }

  public addItem() {}

  public dropItem() {}

  public giveItem() {}
}
