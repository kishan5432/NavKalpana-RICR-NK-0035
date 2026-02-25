const mongoose = require('mongoose');
require('dotenv').config();

const setDefaultTransactionTypes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Set type to 'service_fee' for transactions with booking_id
    const result1 = await db.collection('transactions').updateMany(
      { type: { $exists: false }, booking_id: { $exists: true } },
      { $set: { type: 'service_fee' } }
    );
    console.log(`Updated ${result1.modifiedCount} service_fee transactions`);

    // Set type to 'premium_visibility' for transactions with ride_id
    const result2 = await db.collection('transactions').updateMany(
      { type: { $exists: false }, ride_id: { $exists: true } },
      { $set: { type: 'premium_visibility' } }
    );
    console.log(`Updated ${result2.modifiedCount} premium_visibility transactions`);

    // Set type to 'service_fee' for any remaining transactions without type
    const result3 = await db.collection('transactions').updateMany(
      { type: { $exists: false } },
      { $set: { type: 'service_fee' } }
    );
    console.log(`Updated ${result3.modifiedCount} remaining transactions`);

    console.log('Migration completed successfully');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

setDefaultTransactionTypes();
