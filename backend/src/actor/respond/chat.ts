import { broadcastTo, ChatProfile, sendToUser } from ".";

export const broadcastChatMessage = async (
  message: string,
  connectionIds: string[],
  sender: ChatProfile & { connectionId: string }
) => {
  const result = await broadcastTo(connectionIds, {
    type: "chat",
    opposite: {
      name: sender.name,
      image: sender.image
    },
    message
  });
  const successForMe = await sendToUser(sender.connectionId, {
    type: "chat",
    opposite: undefined,
    message
  });
  if (!successForMe) {
    result[sender.connectionId] = false;
  }
  return result;
};
