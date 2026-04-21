import sequelize from "../config/sequelizeConnection";
import { DataTypes, Model, Optional } from "sequelize";
import { JobProps } from "../types/index";
import { modelName } from "../utils/constant";
import { capitalize } from "../utils/common";

export interface JobCreationAttributes extends Optional<JobProps, "id" | "progress" | "status"> {}

export class Job extends Model<JobProps, JobCreationAttributes> implements JobProps {
  public id!: string;
  public type!: string;
  public target!: string;
  public status!: "queued" | "processing" | "completed" | "failed";
  public progress!: number;
  public message?: string;
  public startedAt?: Date;
  public completedAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Job.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    target: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("queued", "processing", "completed", "failed"),
      defaultValue: "queued",
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: capitalize(modelName.jobs),
    tableName: modelName.jobs,
    freezeTableName: true,
    timestamps: true,
  },
);
