import sequelize from "../config/sequelizeConnection";
import { DataTypes, Model, Optional } from "sequelize";
import { MetadataProps } from "../types/index";
import { modelName } from "../utils/constant";
import { capitalize } from "../utils/common";

export interface MetadataCreationAttributes extends Optional<
  MetadataProps,
  "tags" | "isDuplicate" | "analysisResults"
> {}

class Metadata extends Model<MetadataProps, MetadataCreationAttributes> implements MetadataProps {
  public id!: number;
  public assetsId!: string;
  public tags!: string[];
  public department!: string | null;
  public analysisResults?: any;
  public isDuplicate!: boolean;
  public hash!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Metadata.init(
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
    tags: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    analysisResults: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    isDuplicate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    hash: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: capitalize(modelName.metadata),
    tableName: modelName.metadata,
    freezeTableName: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["assetsId"],
      },
      {
        fields: ["hash"],
      },
    ],
  },
);

export { Metadata };
