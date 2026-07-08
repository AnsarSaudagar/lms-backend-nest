import 'dotenv/config';
import mongoose from 'mongoose';

// One-off data repair: some UserProject/Payment/UserProjectProgress docs have
// `user`/`project` stored as plain strings instead of ObjectId, breaking
// equality comparisons in aggregations and casted queries against them.
const TARGETS: { collection: string; fields: string[] }[] = [
  { collection: 'userprojects', fields: ['user', 'project', 'payment'] },
  { collection: 'payments', fields: ['user', 'project'] },
  { collection: 'userprojectprogresses', fields: ['user', 'project'] },
];

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not set');
  }

  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Failed to acquire db handle');
  }

  for (const { collection, fields } of TARGETS) {
    const set: Record<string, any> = {};
    for (const field of fields) {
      set[field] = {
        $convert: { input: `$${field}`, to: 'objectId', onError: `$${field}`, onNull: null },
      };
    }

    const result = await db.collection(collection).updateMany({}, [{ $set: set }]);
    console.log(`${collection}: matched ${result.matchedCount}, modified ${result.modifiedCount}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Failed to fix ObjectId refs:', err);
  process.exit(1);
});
