import sequelize from "../config/sequelizeConnection";
import { DataTypes, Model, Optional } from "sequelize";
import { CollectionProps } from "../types/index";
import { modelName } from "../utils/constant";
import { capitalize } from "../utils/common";

export interface CollectionCreationAttributes extends Optional<CollectionProps, "id"> {}

class Collection
  extends Model<CollectionProps, CollectionCreationAttributes>
  implements CollectionProps
{
  public id!: number;
  public name!: string;
  public description!: string | null;
  public owner!: string;
  public parentId!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Collection.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    owner: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parentId: {
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
    modelName: capitalize(modelName.collection),
    tableName: modelName.collection,
    freezeTableName: true,
    timestamps: true,
  },
);

export default Collection;
