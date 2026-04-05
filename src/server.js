const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const app = require('./app');

const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const validateEnv = require('./config/env');

const PORT = process.env.PORT || 6000;

const start = async () => {
    validateEnv();    
/* This code snippet is connecting to a MongoDB database using Mongoose. */
    await connectDB();
    await connectRedis();
//    if (process.env.REDIS_URL) {
//        await connectRedis();
//    } else {
//        console.log("Redis disabled");
//    }
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

start();
