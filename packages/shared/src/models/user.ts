import sequelize from "../config/sequelizeConnection";
import { Role } from "./role";
import { DataTypes, Model, Optional } from "sequelize";
import { UserProps } from "../types/index";
import { userMsg, modelName, regex } from "../utils/constant";
import { capitalize } from "../utils/common";

export interface UserCreationAttributes extends Optional<UserProps, "id"> {}

class User extends Model<UserProps, UserCreationAttributes> implements UserProps {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string | null;
  public roleId!: number;
  public tokenVersion!: number;
  public refreshToken!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value: string) {
        this.setDataValue("email", value.trim().toLowerCase());
      },
      validate: {
        isEmail: {
          msg: userMsg.invalidEmail,
        },
        notEmpty: {
          msg: userMsg.emailRequired,
        },
        isValidFormat(value: string) {
          if (!regex.email.test(value)) {
            throw new Error(userMsg.invalidEmail);
          }
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: modelName.role,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    tokenVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: capitalize(modelName.user),
    tableName: modelName.user,
    freezeTableName: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["email"],
      },
      {
        fields: ["roleId"],
      },
    ],
  },
);

User.belongsTo(Role, { foreignKey: "roleId", as: modelName.role });

export { User };
