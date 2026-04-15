import Joi from "joi";
import { RequestHandler } from "express";
import { validatedRequest } from "../middleware/index";
import { user, regex } from "../utils/constant";

export const loginValidator: RequestHandler = validatedRequest(
  Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .trim()
      .lowercase()
      .pattern(regex.email)
      .messages({
        "string.empty": "Email is required",
        "string.pattern.base": user.invalidEmail,
      }),

    password: Joi.string().required().trim().min(8).max(15).pattern(regex.password).messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password must be at most 15 characters long",
      "string.pattern.base": user.invalidPassword,
    }),
  }),
);

export const validateUserCreate: RequestHandler = validatedRequest(
  Joi.object({
    name: Joi.string().trim().pattern(regex.name).min(2).max(100).required().messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name must not exceed 100 characters",
    }),

    email: Joi.string()
      .trim()
      .lowercase()
      .pattern(regex.email)
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.empty": "Email is required",
        "string.email": "Please enter a valid email address",
      }),

    password: Joi.string().trim().pattern(regex.password).required().messages({
      "string.empty": "Password is required",
      "string.pattern.base":
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character",
    }),
  }),
);

export const validateUserUpdate: RequestHandler = validatedRequest(
  Joi.object({
    id: Joi.string().required(),
    name: Joi.string().trim().pattern(regex.name).min(2).max(100).optional(),
  }),
);

export const validateCollectionCreate: RequestHandler = validatedRequest(
  Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      "string.empty": "Collection name is required",
      "string.min": "Collection name must be at least 2 characters long",
      "string.max": "Collection name must not exceed 100 characters",
    }),
    description: Joi.string().trim().max(500).optional().allow(null, ""),
    parentId: Joi.number().integer().optional().allow(null),
  }),
);

export const validateCollectionUpdate: RequestHandler = validatedRequest(
  Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    description: Joi.string().trim().max(500).optional().allow(null, ""),
    parentId: Joi.number().integer().optional().allow(null),
  }),
);

export const validateList: RequestHandler = validatedRequest(
  Joi.object({
    searchKey: Joi.string().allow("").optional(),
    sortKey: Joi.string().optional(),
    sortOrder: Joi.string().valid("ASC", "DESC").optional(),
    page: Joi.number().integer().min(0).optional(),
    limit: Joi.number().integer().min(0).optional(),
  }),
);

export const validateAssetUpload: RequestHandler = validatedRequest(
  Joi.object({
    owner: Joi.string().required(),
    department: Joi.string().optional().allow(null, ""),
    usageRights: Joi.string().optional().allow(null, ""),
    expiryDate: Joi.date().iso().optional().allow(null),
    collectionId: Joi.number().integer().optional().allow(null),
  }),
);

export const validateVersionUpload: RequestHandler = validatedRequest(
  Joi.object({
    author: Joi.string().required(),
    note: Joi.string().optional().allow(null, ""),
    versionNumber: Joi.number().integer().min(1).required(),
  }),
);

export const validateStatusTransition: RequestHandler = validatedRequest(
  Joi.object({
    status: Joi.string().valid("pending", "reviewed", "approved", "expired", "archived").required(),
  }),
);

export const validateMetadataUpdate: RequestHandler = validatedRequest(
  Joi.object({
    tags: Joi.array().items(Joi.string()).optional(),
    department: Joi.string().optional().allow(null, ""),
    analysisResults: Joi.object().optional(),
    isDuplicate: Joi.boolean().optional(),
  }),
);

export const validateUsageTrack: RequestHandler = validatedRequest(
  Joi.object({
    assetId: Joi.string().uuid().required(),
    action: Joi.string().required(),
    userContext: Joi.object().optional(),
  }),
);
