import { APIGatewayProxyHandler } from "aws-lambda";
import * as AWS from "aws-sdk";
import install from "./apigatewaymanagementapi";

import "source-map-support/register";

install(AWS);

const connectionTableName = process.env.CONNECTION_TABLE_NAME;
const ddb = new AWS.DynamoDB();

export const connect: APIGatewayProxyHandler = async event => {
  try {
    await ddb
      .putItem({
        TableName: connectionTableName,
        Item: {
          connectionId: { S: event.requestContext.connectionId }
        }
      })
      .promise();
    return {
      statusCode: 200,
      body: "OK"
    };
  } catch (error) {
    console.error(`Cannot update connection table`, error);
    return {
      statusCode: 500,
      body: "Failed to connect"
    };
  }
};

const deleteConnection = (connectionId: string) =>
  ddb
    .deleteItem({
      TableName: connectionTableName,
      Key: {
        connectionId: { S: connectionId }
      }
    })
    .promise();

export const disconnect: APIGatewayProxyHandler = async event => {
  try {
    await deleteConnection(event.requestContext.connectionId);
    return {
      statusCode: 200,
      body: "OK"
    };
  } catch (error) {
    console.error(`Cannot update connection table`, error);
    return {
      statusCode: 500,
      body: "Failed to disconnect"
    };
  }
};

export const broadcast: APIGatewayProxyHandler = async event => {
  const dbResult = await ddb
    .scan({
      TableName: connectionTableName,
      ProjectionExpression: "connectionId"
    })
    .promise();
  console.log(`result`, dbResult);
  if (!dbResult.Items) {
    console.log(`There is no items`);
    return { statusCode: 200, body: "OK" };
  }

  const apimgmt = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: event.requestContext.domainName + "/" + event.requestContext.stage
  });

  const data = event.body;
  const promises = dbResult.Items.map(async ({ connectionId }) => {
    console.log(`item`, connectionId);
    if (!connectionId) {
      console.log(`item is invalid`);
      return;
    }
    if (!connectionId.S) {
      return;
    }
    try {
      console.log(`Send a data into a connection`, connectionId, data);
      await apimgmt
        .postToConnection({
          ConnectionId: connectionId.S,
          Data: data
        })
        .promise();
    } catch (postError) {
      console.error(
        `Error while post a data via a connection`,
        connectionId,
        postError
      );
      try {
        await deleteConnection(connectionId.S);
      } catch (deleteError) {
        console.error(
          `Error while deleting a connection`,
          connectionId,
          deleteError
        );
      }
    }
  });
  try {
    await Promise.all(promises);
  } catch (promiseError) {
    console.log(`Error while broadcasting`, promiseError);
    return { statusCode: 500, body: promiseError.stack };
  }
  return {
    statusCode: 200,
    body: "OK"
  };
};
