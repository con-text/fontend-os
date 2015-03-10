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

  configureRedisSubscriber: function(io) {

    /**
     * Our redis client which subscribes to channels for updates
     */
    var redisClient = connectToRedis();

    /**
     * subscribe to redis channel when client in ready
     */
    redisClient.on('ready', function() {
      redisClient.subscribe('notif');
    });

    /**
     * wait for messages from redis channel, on message
     * send updates on the rooms named after channels.
     *
     * This sends updates to users.
     */
    redisClient.on("message", function(channel, message){
      console.log("Message from Redis", channel, message);

      var notification = JSON.parse(message);
      io.emit('notification', notification);
    });

    return redisClient;
  },

  configureRedisPublisher: function () {
    /**
     * Our redis client which publishes to channels for updates
     */
    return connectToRedis();
  }
};
