import {
  DataTypes,
  Model,
  Relationships,
} from "https://deno.land/x/denodb/mod.ts";

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
    }
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
  };

  static user() {
    return this.hasOne(User);
  }
}

Relationships.belongsTo(Character, User);

export const DATABASE_MODELS = [User, Character, Instance];
