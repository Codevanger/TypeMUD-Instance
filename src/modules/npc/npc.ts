import { GameModule } from "../../utils/classes/module.ts";
import { Context } from "../../utils/types/context.d.ts";

export class GameNpc extends GameModule {
    public commandsToAdd = {
        TALK: this.talk
    }

    constructor(protected context: Context) {
        super(context);

        this.canLoad();
        this.initNpcs();
    }

    public canLoad(): boolean {
        if (this.loadedModulesNames.find((x) => x === "Npc")) {
            throw new Error("Can't load Npc module twice");
        }

        super.canLoad();

        return true;
    }

    private initNpcs() {
        throw new Error("Method not implemented.");
    }

    private talk() {
        throw new Error("Method not implemented.");
    }
}