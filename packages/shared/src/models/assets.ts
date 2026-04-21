import sequelize from "../config/sequelizeConnection";
import { DataTypes, Model, Optional } from "sequelize";
import { AssetsProps } from "../types/index";
import { enums, modelName } from "../utils/constant";
import { capitalize } from "../utils/common";

export interface AssetsCreationAttributes extends Optional<AssetsProps, "id"> {}

class Assets extends Model<AssetsProps, AssetsCreationAttributes> implements AssetsProps {
  public id!: number;
  public filename!: string;
  public storageKey!: string;
  public owner!: number | null;
  public size!: number | null;
  public mimetype!: string | null;
  public status!:
    | "pending"
    | "pending_approval"
    | "reviewed"
    | "approved"
    | "rejected"
    | "expired"
    | "archived";
  public currentVersion!: number;
  public department!: string | null;
  public usageRights!: string | null;
  public expiryDate!: Date | null;
  public collectionId!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Assets.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    storageKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    owner: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: modelName.user,
        key: "id",
      },
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mimetype: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: enums.pending,
    },
    currentVersion: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    usageRights: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    collectionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: modelName.collection,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: capitalize(modelName.assets),
    tableName: modelName.assets,
    freezeTableName: true,
    timestamps: true,
    indexes: [
      { fields: ["status"] },
      { fields: ["owner"] },
      { fields: ["department"] },
      { fields: ["collectionId"] },
      { fields: ["createdAt"] },
    ],
  },
);

export { Assets };
