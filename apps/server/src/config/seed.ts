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
  await deleteRecord(roleModel, {}, true);
  const result = await bulkCreate(roleModel, seedData.roles);
  logger.info(databaseMsg.dbSeedData(result.length));
  return result;
};

const createUsers = async () => {
  await deleteRecord(userModel, {}, true);
  const result = await bulkCreate(userModel, seedData.users);
  logger.info(databaseMsg.dbSeedData(result.length));
  return result;
};

export const seedDatabase = async () => {
  logger.info(databaseMsg.dbSeedStart);
  await createRole();
  await createUsers();
  logger.info(databaseMsg.dbSeedComplete);
};
