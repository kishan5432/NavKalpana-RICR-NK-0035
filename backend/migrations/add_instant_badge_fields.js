const mongoose = require('mongoose');
require('dotenv').config();

const addInstantBadgeFields = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const result = await db.collection('users').updateMany(
      {},
      {
        $set: {
          instant_badge_active: false,
          instant_badge_until: null
        }
      }
    );

    console.log(`Migration completed: ${result.modifiedCount} users updated`);
    await mongoose.connection.close();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

addInstantBadgeFields();
