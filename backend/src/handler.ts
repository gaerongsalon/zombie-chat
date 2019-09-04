import {
  globalTimeline,
  handleActorLambdaEvent
} from "@yingyeothon/actor-system-aws-lambda-support";
import { APIGatewayProxyHandler } from "aws-lambda";

import "source-map-support/register";
import { getActor, getUser, resolveUserIdFromConnectionId } from "./actor";
import { IBottomHalfLambdaEvent } from "./sys";

const topHalfTimeout = 5 * 1000;
const bottomHalfTimeout = 890 * 1000;

export const connect: APIGatewayProxyHandler = async event => {
  globalTimeline.reset(topHalfTimeout);

  const userId = event.headers["X-ID"];
  const name = event.headers["X-NAME"];
  const { connectionId } = event.requestContext;
  await getUser(userId).send({
    type: "connect",
    connectionId,
    userId,
    name
  });
  return {
    statusCode: 200,
    body: "OK"
  };
};

export const disconnect: APIGatewayProxyHandler = async event => {
  globalTimeline.reset(topHalfTimeout);

  const { connectionId } = event.requestContext;
  const userId = await resolveUserIdFromConnectionId(
    event.requestContext.connectionId
  );
  await getUser(userId).send({
    type: "disconnect",
    userId,
    connectionId
  });
  return {
    statusCode: 200,
    body: "OK"
  };
};

export const chat: APIGatewayProxyHandler = async event => {
  globalTimeline.reset(topHalfTimeout);

  const { connectionId } = event.requestContext;
  const userId = await resolveUserIdFromConnectionId(
    event.requestContext.connectionId
  );
  await getUser(userId).send({
    type: "chat",
    userId,
    connectionId,
    message: event.body
  });
  return {
    statusCode: 200,
    body: "OK"
  };
};

export const bottomHalf = handleActorLambdaEvent<IBottomHalfLambdaEvent>({
  spawn: event => getActor(event.actorType, event.actorId).delegate,
  functionTimeout: bottomHalfTimeout
});
