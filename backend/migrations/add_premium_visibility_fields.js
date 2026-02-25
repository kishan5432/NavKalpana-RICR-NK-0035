const mongoose = require('mongoose');
require('dotenv').config();

const addPremiumVisibilityFields = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const result = await db.collection('rides').updateMany(
      {},
      {
        $set: {
          is_premium_visible: false,
          premium_visible_until: null
        }
      }
    );

    console.log(`Migration completed: ${result.modifiedCount} rides updated`);
    await mongoose.connection.close();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

addPremiumVisibilityFields();
