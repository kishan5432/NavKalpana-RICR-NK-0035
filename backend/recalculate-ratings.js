const mongoose = require('mongoose');
const Rating = require('./src/models/Rating');
const User = require('./src/models/User');
require('dotenv').config();

async function recalculateRatings() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      const ratings = await Rating.find({ ratedUserId: user._id });
      
      if (ratings.length > 0) {
        const avgStars = ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;
        const roundedAvg = Math.round(avgStars * 10) / 10;
        
        await User.findByIdAndUpdate(user._id, {
          'rating.average': roundedAvg,
          'rating.count': ratings.length
        });
        
        console.log(`Updated ${user.name}: ${roundedAvg} (${ratings.length} ratings)`);
      }
    }

    console.log('✅ All ratings recalculated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

recalculateRatings();
