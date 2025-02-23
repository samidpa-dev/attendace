const redis = require('redis');
const client = redis.createClient({
    host: 'localhost', 
    port: 6379,
    retry_strategy: (options) => {
      if (options.error && options.error.code === 'ECONNREFUSED') {
          console.error('The Redis server refused the connection.');
          return new Error('The Redis server refused the connection.');
      }
      if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('Retry time exhausted');
      }
      if (options.attempt > 10) {
          return undefined;
      }
      return Math.min(options.attempt * 100, 3000);
  }
});

// Handle events properly
client.on('connect', () => console.log('Redis Connected...'));
client.on('ready', () => console.log('Redis Connection Ready...'));
client.on('reconnecting', () => console.log('Redis Reconnecting...'));
client.on('error', (err) => console.log('Redis Error:', err));
client.on('end', () => console.log('Redis Client Closed!'));

// **Fix: Ensure Redis is Ready Before Running Commands**
function ensureRedisReady(callback) {
    if (!client.connected) {
        console.log('Redis client is not connected yet. Waiting...');
        client.once('connect', () => callback());
    } else {
        callback();
    }
}

function clockIn(userId) {
    ensureRedisReady(() => {
        const clockInData = {
            time: new Date().toISOString(),
            status: 'clocked in'
        };
        client.set(`clock:${userId}`, JSON.stringify(clockInData), 'EX', 3600);
        console.log(`User ${userId} clocked in.`);
        
        //set for reminder next day clockin
        const nextDay = new Date() + 24 * 60 * 60 * 1000;
        client.set(`reminder:${userId}`, nextDay, 'EX', 3600);
    
    });
}

function clockOut(userId) {
    ensureRedisReady(() => {
        const clockOutData = {
            time: new Date().toISOString(),
            status: 'clocked out'
        };
        client.set(`clock:${userId}`, JSON.stringify(clockOutData), 'EX', 3600);
        console.log(`User ${userId} clocked out.`);
    });
}

function getClockData(userId, callback) {
    ensureRedisReady(() => {
        client.get(`clock:${userId}`, (err, data) => {
            if (err) {
                console.log('Redis get error:', err);
                callback(null);
            } else {
                callback(data ? JSON.parse(data) : null);
            }
        });
    });
}

module.exports = {
  clockIn,
  clockOut,
  getClockData
};