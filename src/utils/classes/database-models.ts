import {
  DataTypes,
  Model,
  Relationships,
} from "https://deno.land/x/denodb@v1.2.0/mod.ts";

export class User extends Model {
  static table = "users";

  static fields = {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      as: "userId",
    },
    username: {
      type: DataTypes.STRING,
      length: 255,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      length: 255,
    },
    role: {
      type: DataTypes.INTEGER,
      default: 0,
    },
    key: {
      type: DataTypes.STRING,
      length: 255,
      unique: true,
      default: '00000-00000-00000'
    },
  };

  static characters() {
    return this.hasMany(Character);
  }
}

export class Instance extends Model {
  static table = "instances";

  static fields = {
    instanceId: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
      as: "instanceId",
    },
    gameName: {
      type: DataTypes.STRING,
      length: 255,
      unique: true,
      as: "gameName",
    },
    url: {
      type: DataTypes.STRING,
      length: 255,
      unique: true,
    },
    port: {
      type: DataTypes.INTEGER,
    },
  };
}

export class Character extends Model {
  static table = "characters";

  static fields = {
    characterId: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
      as: "characterId",
    },
    name: {
      type: DataTypes.STRING,
      length: 255,
      unique: true,
    },
    location: {
      type: DataTypes.INTEGER,
      default: 0,
    },
    room: {
      type: DataTypes.INTEGER,
      default: 0,
    },
    level: {
      type: DataTypes.INTEGER,
      default: 1,
    },
    experience: {
      type: DataTypes.INTEGER,
      default: 0,
    },
    freeStats: {
      type: DataTypes.INTEGER,
      default: 3,
      as: 'freeStats'
    },
    health: {
      type: DataTypes.INTEGER,
      default: 100,
    },
    stamina: {
      type: DataTypes.INTEGER,
      default: 100,
    },
    mana: {
      type: DataTypes.INTEGER,
      default: 100,
    },
    inFight: {
      type: DataTypes.BOOLEAN,
      default: false,
    },
    stats: {
      type: DataTypes.JSON,
      default: {
        str: 1, // Strength
        dex: 1, // Dexterity
        vit: 1, // Vitality
        end: 1, // Endurance
        int: 1, // Intelligence
        wis: 1, // Wisdom
      },
    },
    skills: {
      type: DataTypes.JSON,
      default: [],
    },
    inventory: {
      type: DataTypes.JSON,
      default: [],
    },
    money: {
      type: DataTypes.INTEGER,
      default: 0,
    },
  };

  public static user() {
    return this.hasOne(User);
  }

  public static friends(): Promise<Character[]> {
    return this.hasMany(Character) as Promise<Character[]>;
  }

  public getLocationId(): number {
    return Number(this.location);
  }

  public getRoomId(): number {
    return Number(this.room);
  }

  public getParsedStats(): { [key: string]: number } {
    return JSON.parse(this.stats as string);
  }

  public getStat(stat: string): number {
    return this.getParsedStats()[stat];
  }

  public getMaxHealth(): number {
    return Math.floor(
      100 + this.getStat("vit") * 10 + Math.max(this.getStat("end") * 0.5)
    );
  }

  public getHealthRegen(): number {
    return Math.floor(this.getStat("vit") * 2);
  }

  public getMaxStamina(): number {
    return Math.floor(
      100 + this.getStat("end") * 10 + Math.max(this.getStat("vit") * 0.5)
    );
  }

  public getStaminaRegen(): number {
    return Math.floor(this.getStat("end") * 2);
  }

  public getMaxMana(): number {
    return Math.floor(
      100 + this.getStat("int") * 10 + Math.max(this.getStat("wis") * 0.5)
    );
  }

  public getManaRegen(): number {
    return Math.floor(this.getStat("int") * 2);
  }
}

Relationships.belongsTo(Character, User);

export const DATABASE_MODELS: typeof Model[] = [User, Character, Instance];
