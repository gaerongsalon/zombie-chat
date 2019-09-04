import { RedisRepository } from "@yingyeothon/repository-redis";
import { redis } from ".";

export const repo = new RedisRepository({
  redis
});
