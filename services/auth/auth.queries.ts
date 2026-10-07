import { useMutation } from "@tanstack/react-query";
import {
  login,
  register,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  changePassword,
} from "./auth";
import {
  RegisterDto,
  LoginDto,
  AuthResponse,
  VerifyOtpDto,
  ResendOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from "@/types/auth.type";
import Axios from "@/services/axios";
import { buildEndpoint } from "@/services/api-config";

export const useRegister = () =>
  useMutation({
    mutationFn: (dto: RegisterDto) => register(dto),
  });
export const useLogin = () =>
  useMutation({
    mutationFn: async (dto: LoginDto): Promise<AuthResponse> => {
      const data = await login(dto);
      // The session is the source of truth for role-based navigation. In
      // particular, an organizer's current role may differ from the login
      // response used by older API deployments.
      const session = await Axios.get<{ user: AuthResponse["user"] }>(
        buildEndpoint("v1", "auth/me"),
      );
      const user = session.data.user;
      localStorage.setItem("ticketer-user", JSON.stringify(user));

      return { ...data, user };
    },
  });

export const useVerifyOtp = () =>
  useMutation({
    mutationFn: (dto: VerifyOtpDto) => verifyOtp(dto),
  });

export const useResendOtp = () =>
  useMutation({
    mutationFn: (dto: ResendOtpDto) => resendOtp(dto),
  });

export const useForgotPassword = () =>
  useMutation({
    mutationFn: (dto: ForgotPasswordDto) => forgotPassword(dto),
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: (dto: ResetPasswordDto) => resetPassword(dto),
  });

export const useChangePassword = () =>
  useMutation({
    mutationFn: (dto: ChangePasswordDto) => changePassword(dto),
  });
