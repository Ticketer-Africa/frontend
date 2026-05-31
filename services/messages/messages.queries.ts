import { useMutation } from "@tanstack/react-query";
import * as messagesAPI from "@/services/messages/messages";
import { SendMessagePayload } from "@/services/messages/messages";

export const useSendMessage = (eventId: string) => {
  return useMutation<void, Error, SendMessagePayload>({
    mutationFn: (payload) => messagesAPI.sendMessage(eventId, payload),
  });
};
