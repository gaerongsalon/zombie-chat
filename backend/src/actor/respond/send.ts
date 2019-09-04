import { ApiGatewayManagementApi } from "aws-sdk";
import { ResponseMessage } from ".";
import { envars } from "../../sys";

const apimgmt = new ApiGatewayManagementApi({
  apiVersion: "2018-11-29",
  endpoint: envars.apiGatewayEndpoint
});

export const sendToUser = async (
  connectionId: string,
  message: ResponseMessage
) => {
  try {
    await apimgmt
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(message)
      })
      .promise();
    return true;
  } catch (error) {
    console.error(`sendToUser`, connectionId, message, error);
    return false;
  }
};
