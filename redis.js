import redis from 'redis';

export default function NewRedis() {
  let redisClient;

  (async () => {
    redisClient = redis.createClient();

    redisClient.on("error", (error) => console.error(`Error : ${error}`));

    await redisClient.connect();
  })();

  return redisClient;
}