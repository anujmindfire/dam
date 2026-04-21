import sequelize from "../config/sequelizeConnection";
import { DataTypes, Model, Optional } from "sequelize";
import { UsageLogProps } from "../types/index";
import { modelName } from "../utils/constant";
import { capitalize } from "../utils/common";

export interface UsageLogCreationAttributes extends Optional<UsageLogProps, "id" | "loggedAt"> {}

class UsageLog extends Model<UsageLogProps, UsageLogCreationAttributes> implements UsageLogProps {
  public id!: number;
  public assetsId!: string;
  public action!: string;
  public context!: any;

  public readonly loggedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UsageLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    assetsId: {
      type: DataTypes.INTEGER,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    context: {
      type: DataTypes.JSONB,
    },
    loggedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: capitalize(modelName.usage),
    tableName: modelName.usage,
    freezeTableName: true,
    timestamps: true,
    indexes: [{ fields: ["assetsId"] }, { fields: ["action"] }, { fields: ["loggedAt"] }],
  },
);

export { UsageLog };
