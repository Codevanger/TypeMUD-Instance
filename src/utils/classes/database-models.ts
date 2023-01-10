import {
  DataTypes,
  Model,
  Relationships,
} from "https://deno.land/x/denodb@v1.1.0/mod.ts";

export class User extends Model {
  static table = "users";
  static timestamps = true;

  static fields = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    },
  };

  static characters() {
    return this.hasMany(Character);
  }
}

export class Instance extends Model {
  static table = "instances";
  static timestamps = true;

  static fields = {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    game_name: {
      type: DataTypes.STRING,
      length: 255,
      unique: true,
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
  static timestamps = true;

  static fields = {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
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
    friends: {
      type: DataTypes.JSON,
    },
    level: {
      type: DataTypes.INTEGER,
      default: 1,
    },
    experience: {
      type: DataTypes.INTEGER,
      default: 0,
    },
    health: {
      type: DataTypes.INTEGER,
      default: 100,
    },
    stamina: {
      type: DataTypes.INTEGER,
      default: 100,
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
    money: {
      type: DataTypes.INTEGER,
      default: 0,
    }
  };

  static user() {
    return this.hasOne(User);
  }

  public getLocationId(): number {
    return Number(this.location);
  }

  public getRoomId(): number {
    return Number(this.room);
  }
}

Relationships.belongsTo(Character, User);

export const DATABASE_MODELS: typeof Model[] = [User, Character, Instance];
