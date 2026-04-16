import sequelize from "../config/sequelizeConnection";
import { DataTypes, Model, Optional } from "sequelize";
import { ApprovalCommentProps } from "../types/index";
import { modelName } from "../utils/constant";
import { capitalize } from "../utils/common";

export interface ApprovalCommentCreationAttributes extends Optional<ApprovalCommentProps, "id"> {}

class ApprovalComment
  extends Model<ApprovalCommentProps, ApprovalCommentCreationAttributes>
  implements ApprovalCommentProps
{
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
  },
  {
    sequelize,
    modelName: capitalize(modelName.approvalComment),
    tableName: modelName.approvalComment,
    freezeTableName: true,
    timestamps: true,
    indexes: [
      {
        fields: ["approvalId"],
      },
    ],
  },
);

export default ApprovalComment;
