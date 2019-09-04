export type ChatProfile = {
  image: string;
  name: string;
};

export type ResponseChatMessage = {
  type: "chat";
  opposite?: {
    image: string;
    name: string;
  };
  message: string;
};

export type ResponseMessage = ResponseChatMessage;
