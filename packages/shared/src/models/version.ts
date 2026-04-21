import sequelize from "../config/sequelizeConnection";
import { DataTypes, Model, Optional } from "sequelize";
import { VersionProps } from "../types/index";
import { modelName } from "../utils/constant";
import { capitalize } from "../utils/common";

export interface VersionCreationAttributes extends Optional<VersionProps, "id"> {}

class Version extends Model<VersionProps, VersionCreationAttributes> implements VersionProps {
  public id!: number;
  public assetsId!: number;
  public versionNumber!: number;
  public storageKey!: string;
  public size!: number;
  public note!: string | null;
  public author!: number;
  public readonly createdAt!: Date;
}

Version.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    assetsId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    versionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    storageKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    author: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: capitalize(modelName.version),
    tableName: modelName.version,
    freezeTableName: true,
    timestamps: true,
    indexes: [
      {
        fields: ["assetsId"],
      },
    ],
  },
);

export { Version };
