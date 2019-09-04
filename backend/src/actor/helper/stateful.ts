import { Actor } from "@yingyeothon/actor-system";
import {
  globalTimeline,
  shiftToNextLambda
} from "@yingyeothon/actor-system-aws-lambda-support";
import { envars, IBottomHalfLambdaEvent, MethodLogger } from "../../sys";
import { StateManager } from "./state";
import { sys } from "./system";

export interface IActorHandlerArguments<M, S> {
  message: M;
  state: S;
}

export abstract class StatefulLambdaActor<M, S> {
  protected readonly actor: Actor<M>;
  protected readonly logger: MethodLogger;

  constructor(
    private readonly stateManager: StateManager<S>,
    actorType: string,
    actorId: string
  ) {
    this.actor = sys.spawn<M>(actorId, actor =>
      actor
        .on("act", ({ message }) => this.onMessage(message))
        .on("error", console.error)
        .on(
          "shift",
          shiftToNextLambda<IBottomHalfLambdaEvent>({
            functionName: envars.actor.bottomHalfLambda,
            buildPayload: () => ({
              actorType,
              actorId
            })
          })
        )
    );
    this.logger = new MethodLogger(actorType, actorId);
  }

  public get delegate() {
    return this.actor;
  }

  public send(item: M) {
    return this.actor.send(item, { shiftTimeout: globalTimeline.remainMillis });
  }

  public async getState() {
    return this.stateManager.getState(this.actor.name);
  }

  public async setState(newState: S) {
    return this.stateManager.setState(this.actor.name, newState);
  }

  public async deleteState() {
    return this.stateManager.deleteState(this.actor.name);
  }

  protected abstract async onMessage(message: M): Promise<void>;
}
