const { createClient } = require('redis');

const isSecure = process.env.REDIS_URL.startsWith('rediss://');

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    // Enable TLS for secure connections (Upstash requires this)
    tls: isSecure,
    // Keep connection alive
    keepAlive: 5000,
    // Reconnect if connection drops
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis max reconnection attempts reached');
        return new Error('Redis max reconnection attempts reached');
      }
      return retries * 500;
    }
  }
});

client.on('error', (err) => {
  // Suppress Upstash NOPERM errors — these are expected on free tier
  if (err.message && err.message.includes('NOPERM')) return;
  console.error('Redis error:', err.message);
});
client.on('reconnecting', () => console.log('Redis reconnecting...'));
client.on('ready', () => console.log('Redis ready'));

const connectRedis = async () => {
  await client.connect();
  console.log('Redis connected');
};

module.exports = { client, connectRedis };