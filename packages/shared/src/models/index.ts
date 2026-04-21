import { Assets } from "./assets";
import { Collection } from "./collection";
import { Metadata } from "./metadata";
import { Approval } from "./approval";
import { ApprovalComment } from "./approvalComment";
import { Job } from "./job";
import { Version } from "./version";
import { Role } from "./role";
import { User } from "./user";
import { UsageLog } from "./usage";

// Collection self-associations (Hierarchy)
Collection.hasMany(Collection, {
  as: "subCollections",
  foreignKey: "parentId",
});

Collection.belongsTo(Collection, {
  as: "parentCollection",
  foreignKey: "parentId",
});

// Asset and Collection associations
Collection.hasMany(Assets, {
  as: "assets",
  foreignKey: "collectionId",
});

Assets.belongsTo(Collection, {
  as: "collection",
  foreignKey: "collectionId",
});

// Asset and Metadata associations
Assets.hasOne(Metadata, {
  as: "metadata",
  foreignKey: "assetsId",
});

Metadata.belongsTo(Assets, {
  as: "assets",
  foreignKey: "assetsId",
});

// Asset and Version associations
Assets.hasMany(Version, {
  as: "versions",
  foreignKey: "assetsId",
});

Version.belongsTo(Assets, {
  as: "assets",
  foreignKey: "assetsId",
});

// Asset and Approval associations
Assets.hasMany(Approval, {
  as: "approvals",
  foreignKey: "assetsId",
});

Approval.belongsTo(Assets, {
  as: "assets",
  foreignKey: "assetsId",
});

// Approval and ApprovalComment associations
Approval.hasMany(ApprovalComment, {
  as: "comments",
  foreignKey: "approvalId",
});

ApprovalComment.belongsTo(Approval, {
  as: "approval",
  foreignKey: "approvalId",
});

// Asset and User associations
Assets.belongsTo(User, {
  as: "uploader",
  foreignKey: "owner",
});

User.hasMany(Assets, {
  as: "assets",
  foreignKey: "owner",
});

// UsageLog and Asset associations
UsageLog.belongsTo(Assets, {
  as: "assets",
  foreignKey: "assetsId",
});

Assets.hasMany(UsageLog, {
  as: "usageLogs",
  foreignKey: "assetsId",
});

export {
  Assets as assetsModel,
  Assets,
  Collection as collectionModel,
  Collection,
  Metadata as metadataModel,
  Metadata,
  Version as versionModel,
  Version,
  Approval as approvalModel,
  Approval,
  ApprovalComment as approvalCommentModel,
  ApprovalComment,
  Job as jobModel,
  Job,
  Role as roleModel,
  Role,
  User as userModel,
  User,
  UsageLog as usageModel,
  UsageLog,
};
