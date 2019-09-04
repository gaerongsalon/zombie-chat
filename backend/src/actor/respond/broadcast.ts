import { ResponseMessage, sendToUser } from ".";

export const broadcastTo = async (
  connectionIds: string[],
  message: ResponseMessage
): Promise<{ [connectionId: string]: boolean }> => {
  const successes = await Promise.all(
    connectionIds.map(connectionId => sendToUser(connectionId, message))
  );
  const result: { [connectionId: string]: boolean } = {};
  for (let index = 0; index < connectionIds.length; ++index) {
    result[connectionIds[index]] = successes[index];
  }
  return result;
};
