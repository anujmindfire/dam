import sequelize from "../config/sequelizeConnection";
import { DataTypes, Model, Optional } from "sequelize";
import { ApprovalProps } from "../types/index";
import { modelName } from "../utils/constant";
import { capitalize } from "../utils/common";

export interface ApprovalCreationAttributes extends Optional<ApprovalProps, "id"> {}

class Approval extends Model<ApprovalProps, ApprovalCreationAttributes> implements ApprovalProps {
  public id!: number;
  public assetId!: number;
  public requestedBy!: string;
  public approvedBy?: string | null;
  public status!: "pending" | "approved" | "rejected";
  public reason?: string | null;
  public priority!: "low" | "normal" | "high";
  public assignedTo?: string[] | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Approval.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    assetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: modelName.assets,
        key: "id",
      },
    },
    requestedBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    approvedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM("low", "normal", "high"),
      defaultValue: "normal",
    },
    assignedTo: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: capitalize(modelName.approval),
    tableName: modelName.approval,
    freezeTableName: true,
    timestamps: true,
    indexes: [
      { fields: ["assetId"] },
      { fields: ["status"] },
      { fields: ["requestedBy"] },
      { fields: ["approvedBy"] },
    ],
  },
);

export default Approval;
