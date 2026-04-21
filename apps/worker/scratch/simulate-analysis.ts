import { analyzeAsset } from "../src/services/analysis";
import { connectDB, assetsModel, findOne } from "@dam/shared";

async function run() {
  await connectDB();
  const assetId = 2; // From our previous diagnostic
  const asset = await findOne(assetsModel, { id: assetId });

  if (!asset) {
    console.error("Asset not found");
    return;
  }

  console.log(`Starting simulation for asset: ${asset.filename} (${asset.id})`);
  console.log(`Storage Key: ${asset.storageKey}`);
  console.log(`Mimetype: ${asset.mimetype}`);

  try {
    const result = await analyzeAsset(asset.id.toString(), asset.storageKey, asset.mimetype);
    console.log("Analysis Result Success:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Analysis Failed with Error:", err);
  }
}

run().catch(console.error);
