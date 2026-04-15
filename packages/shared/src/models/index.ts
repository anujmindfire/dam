import Asset from "./asset";
import Collection from "./collection";
import Metadata from "./metadata";
import AssetVersion from "./version";
import Approval from "./approval";
import ApprovalComment from "./approvalComment";

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
Collection.hasMany(Asset, {
  as: "assets",
  foreignKey: "collectionId",
});

Asset.belongsTo(Collection, {
  as: "collection",
  foreignKey: "collectionId",
});

// Asset and Metadata associations
Asset.hasOne(Metadata, {
  as: "metadata",
  foreignKey: "assetId",
});

Metadata.belongsTo(Asset, {
  as: "asset",
  foreignKey: "assetId",
});

// Asset and Version associations
Asset.hasMany(AssetVersion, {
  as: "versions",
  foreignKey: "assetId",
});

AssetVersion.belongsTo(Asset, {
  as: "asset",
  foreignKey: "assetId",
});

// Asset and Approval associations
Asset.hasMany(Approval, {
  as: "approvals",
  foreignKey: "assetId",
});

Approval.belongsTo(Asset, {
  as: "asset",
  foreignKey: "assetId",
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

export { Asset, Collection, Metadata, AssetVersion, Approval, ApprovalComment };
