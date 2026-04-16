import sequelize from "../config/sequelizeConnection";
import { DataTypes, Model, Optional } from "sequelize";
import { AssetVersionProps } from "../types/index";
import { modelName } from "../utils/constant";
import { capitalize } from "../utils/common";

export interface AssetVersionCreationAttributes extends Optional<AssetVersionProps, "id"> {}

class AssetVersion
  extends Model<AssetVersionProps, AssetVersionCreationAttributes>
  implements AssetVersionProps
{
  public id!: number;
  public assetId!: number;
  public versionNumber!: number;
  public storageKey!: string;
  public size!: number;
  public note!: string | null;
  public author!: string;
  public readonly createdAt!: Date;
}

AssetVersion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    assetId: {
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
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: capitalize(modelName.assetVersion),
    tableName: modelName.assetVersion,
    freezeTableName: true,
    timestamps: true,
    indexes: [
      {
        fields: ["assetId"],
      },
    ],
  },
);

export default AssetVersion;
