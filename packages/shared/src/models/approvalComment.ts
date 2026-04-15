import sequelize from "../config/sequelizeConnection";
import { DataTypes, Model, Optional } from "sequelize";
import { modelName } from "../utils/constant";

export interface ApprovalCommentProps {
  id: number;
  approvalId: number;
  userId: string;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApprovalCommentCreationAttributes extends Optional<ApprovalCommentProps, "id"> {}

class ApprovalComment extends Model<ApprovalCommentProps, ApprovalCommentCreationAttributes> implements ApprovalCommentProps {
  public id!: number;
  public approvalId!: number;
  public userId!: string;
  public message!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ApprovalComment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    approvalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: modelName.approval,
        key: "id",
      },
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    tableName: modelName.approvalComment,
    timestamps: true,
  }
);

export default ApprovalComment;
