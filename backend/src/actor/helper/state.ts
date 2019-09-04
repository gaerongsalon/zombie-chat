import { IRepository } from "@yingyeothon/repository";
import { repo } from "../../sys";

interface IStateCache<V> {
  [key: string]: V;
}

export class StateManager<V> {
  public readonly repository: IRepository;
  public readonly cache: IStateCache<V> = {};

  constructor(prefix: string) {
    this.repository = repo.withPrefix(prefix);
  }

  public async getState(stateId: string) {
    // Step 1. Read a state from the cache.
    const stateInCache = this.cache[stateId];
    if (stateInCache !== undefined) {
      return stateInCache;
    }

    // Step 2. Read a state from the repository.
    const stateFromRepository = await this.repository.get<V>(stateId);
    if (stateFromRepository !== undefined) {
      this.cache[stateId] = stateFromRepository;
      return stateFromRepository;
    }

    // Step 3. No state from here.
    return undefined;
  }

  public async setState(stateId: string, newState: V) {
    if (newState === undefined) {
      return this.deleteState(stateId);
    }

    this.cache[stateId] = newState;
    return this.repository.set(stateId, newState);
  }

  public async deleteState(stateId: string) {
    delete this.cache[stateId];
    return this.repository.delete(stateId);
  }
}
