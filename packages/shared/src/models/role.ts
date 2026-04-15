import sequelize from "../config/sequelizeConnection";
import { DataTypes, Model, Optional } from "sequelize";
import { RoleProps } from "../types/index";
import { modelName } from "../utils/constant";
import { capitalize } from "../utils/common";

export interface RoleCreationAttributes extends Optional<RoleProps, "id"> {}

class Role extends Model<RoleProps, RoleCreationAttributes> implements RoleProps {
  public id!: number;
  public name!: string;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: capitalize(modelName.role),
    tableName: modelName.role,
    freezeTableName: true,
    timestamps: true,
  },
);

export default Role;
