import sequelize from "../config/sequelizeConnection";
import { DataTypes, Model, Optional } from "sequelize";
import { modelName } from "../utils/constant";

export interface ApprovalProps {
  id: number;
  assetId: number;
  requestedBy: string;
  approvedBy?: string | null;
  status: "pending" | "approved" | "rejected";
  reason?: string | null;
  priority: "low" | "normal" | "high";
  assignedTo?: string[] | null;
  createdAt?: Date;
  updatedAt?: Date;
}

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
        model: modelName.asset,
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
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: modelName.approval,
    timestamps: true,
  }
);

export default Approval;
