import {
  roleModel,
  userModel,
  logger,
  bulkCreate,
  deleteRecord,
  databaseMsg,
  seedData,
} from "@dam/shared";

const createRole = async () => {
  const result = await bulkCreate(roleModel, seedData.roles);
  logger.info(databaseMsg.dbSeedData(result.length));
  return result;
};

const createUsers = async () => {
  const result = await bulkCreate(userModel, seedData.users);
  logger.info(databaseMsg.dbSeedData(result.length));
  return result;
};

export const seedDatabase = async () => {
  logger.info(databaseMsg.dbSeedStart);
  await deleteRecord(userModel, {}, true);
  await deleteRecord(roleModel, {}, true);
  await createRole();
  await createUsers();
  logger.info(databaseMsg.dbSeedComplete);
};
