import {
  collectionModel,
  assetsModel,
  create,
  findAll,
  findOne,
  findOneAndUpdate,
  deleteRecord,
  statusCode,
  CustomError,
  commonMsg,
  collectionMsg,
  RequestWithUser,
  Op,
} from "@dam/shared";

/**
 * Creates a new collection or folder in the database.
 * This service handles extracting the collection details from the request body
 * and associating it with the authenticated user as the owner.
 * @param {Request} req - The Express request object containing name, description, and optional parentId.
 * @returns {Promise<any | CustomError>} A promise resolving to the created collection or a CustomError on failure.
 */

export const createCollection = async (req: RequestWithUser) => {
  try {
    const { name, description, parentId } = req.body;

    const owner = req.user?.id;

    const newCollection = await create(collectionModel, {
      name,
      description,
      owner,
      parentId: parentId || null,
    });

    if (!newCollection) {
      return new CustomError(commonMsg.somethingWentWrong, statusCode.badRequest);
    }

    return newCollection;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Lists collections for the authenticated user.
 * Supports filtering by parentId to navigate the collection hierarchy.
 * Includes primary sub-collections in the result.
 * @param {Request} req - The Express request object with optional parentId query parameter.
 * @returns {Promise<any | CustomError>} A promise resolving to the list of collections or a CustomError.
 */

export const listCollection = async (req: RequestWithUser) => {
  try {
    const { parentId: rawParentId, page = "1", limit = "10", searchKey = "" } = req.query;

    const parentId = rawParentId === undefined || rawParentId === "null" ? null : rawParentId;
    const owner = req.user?.id;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const queryOptions = {
      where: {
        owner: owner,
        ...(parentId !== undefined ? { parentId } : {}),
        ...(searchKey ? { name: { [Op.iLike]: `%${searchKey}%` } } : {}),
      },
      include: [{ model: collectionModel, as: "subCollections" }],
      limit: parseInt(limit as string),
      offset,
      order: [["name", "ASC"]] as any,
    };

    const collections = await findAll(collectionModel, queryOptions);
    return collections;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Retrieves a detailed collection record by its ID.
 * Includes nested assets and sub-collections for a complete view of the group.
 * Ensures the record belongs to the authenticated user.
 * @param {Request} req - The Express request object containing the collection ID in params.
 * @returns {Promise<any | CustomError>} A promise resolving to the detailed collection or a CustomError.
 */

export const getCollectionById = async (req: RequestWithUser) => {
  try {
    const { id } = req.params;

    const owner = req.user?.id;

    const collection = await findOne(
      collectionModel,
      { id, owner: owner },
      {
        include: [
          { model: collectionModel, as: "subCollections" },
          { model: assetsModel, as: "assets" },
        ],
        raw: false,
      },
    );

    if (!collection) {
      return new CustomError(collectionMsg.notFound, statusCode.notFound);
    }

    return collection;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Updates an existing collection's properties.
 * Validates ownership before applying updates to name, description, or parentId.
 * @param {Request} req - The Express request object with ID in params and update data in body.
 * @returns {Promise<any | CustomError>} A promise resolving to the updated collection or a CustomError.
 */

export const updateCollection = async (req: RequestWithUser) => {
  try {
    const { id } = req.params;

    const { name, description, parentId } = req.body;

    const owner = req.user?.id;

    const updatedCollection = await findOneAndUpdate(
      collectionModel,
      { id: Number(id), owner: owner },
      { name, description, parentId },
      undefined,
      true,
    );

    if (!updatedCollection) {
      return new CustomError(collectionMsg.notFound, statusCode.notFound);
    }

    return updatedCollection;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Deletes a collection from the system recursively.
 * Deletes the collection and all its sub-collections.
 * Assets within these collections are unlinked (collectionId set to null) but not deleted.
 * @param {Request} req - The Express request object containing the collection ID in params.
 * @returns {Promise<boolean | CustomError>} A promise resolving to true on success or a CustomError.
 */

export const deleteCollection = async (req: RequestWithUser) => {
  try {
    const { id } = req.params;
    const owner = req.user?.id;

    if (!owner) {
      return new CustomError(commonMsg.unAuthorized, statusCode.unAuthorize);
    }

    await performRecursiveDelete(Number(id), owner);

    return true;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Helper function to perform recursive deletion of collections and unlinking of assets.
 */
async function performRecursiveDelete(id: number, owner: number) {
  // 1. Find all sub-collections
  const subCollections = await findAll(collectionModel, {
    where: { parentId: id, owner: owner },
  });

  // 2. Recursively delete sub-collections
  if (subCollections.result && subCollections.result.length > 0) {
    for (const sub of subCollections.result) {
      await performRecursiveDelete(sub.id, owner);
    }
  }

  // 3. Unlink assets in this collection (set collectionId to null)
  // Note: Using direct model update for efficiency
  await assetsModel.update({ collectionId: null }, { where: { collectionId: id } });

  // 4. Delete the collection record itself
  await deleteRecord(collectionModel, { id, owner });
}

/**
 * Associates an asset with a specific collection.
 * Updates the asset record's collectionId column to link it to the group.
 * @param {Request} req - The Express request object with collection ID in params and assetsId in body.
 * @returns {Promise<any | CustomError>} A promise resolving to the updated asset or a CustomError.
 */

export const addAssetToCollection = async (req: RequestWithUser) => {
  try {
    const { id } = req.params;

    const { assetsId } = req.body;

    const updatedAsset = await findOneAndUpdate(
      assetsModel,
      { id: Number(assetsId) },
      { collectionId: Number(id) },
      undefined,
      true,
    );

    if (!updatedAsset) {
      return new CustomError(collectionMsg.assetNotFound, statusCode.notFound);
    }

    return updatedAsset;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};
