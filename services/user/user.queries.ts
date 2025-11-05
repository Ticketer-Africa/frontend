import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser, becomeOrganizer } from "./user";
import type {
  UpdateUserDto,
  BecomeOrganizerResponse,
  User,
} from "@/types/user.type";

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => updateUser(formData),
    onSuccess: (data) => {
      localStorage.setItem("ticketer-user", JSON.stringify(data.user));
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
};

export const useBecomeOrganizer = () => {
  const queryClient = useQueryClient();

  return useMutation<BecomeOrganizerResponse, unknown, string>({
    mutationFn: (email: string) => becomeOrganizer(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
};
