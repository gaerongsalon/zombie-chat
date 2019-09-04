import { ActorSystem } from "@yingyeothon/actor-system";
import { RedisLock, RedisQueue } from "@yingyeothon/actor-system-redis-support";
import { redis } from "../../sys";

export const sys = new ActorSystem({
  lock: new RedisLock({ redis }),
  queue: new RedisQueue({ redis })
});
