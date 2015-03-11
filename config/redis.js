var redis = require('redis');
var url = require('url');

function connectToRedis() {

  var redisClient;

  if (process.env.REDISTOGO_URL) {

    var rtg   = url.parse(process.env.REDISTOGO_URL);
    redisClient = require("redis").createClient(rtg.port, rtg.hostname);
    redisClient.auth(rtg.auth.split(":")[1]);
  } else {
    redisClient = redis.createClient();
  }

  return redisClient;
}

module.exports = {

  configureRedisPublisher: function () {
    /**
     * Our redis client which publishes to channels for updates
     */
    return connectToRedis();
  }
};
