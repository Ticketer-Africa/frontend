import axios from "@/services/axios";
import { toast } from "sonner";
import {
  LoginDto,
  RegisterDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ResendOtpDto,
  AuthResponse,
  BasicResponse,
  ChangePasswordDto,
} from "@/types/auth.type";
import { buildEndpoint } from "../api-config";

const API_VERSION = "v1";
// REGISTER user
export const register = async (dto: RegisterDto): Promise<BasicResponse> => {
  try {
    const res = await axios.post(
      buildEndpoint(API_VERSION, "auth/register"),
      dto
    );
    toast.success("Registration successful", {
      description: res.data.message || "Check your email for a verification code.",
    });
    return res.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to register";
    toast.error("Registration failed", { description: errorMessage });
    throw new Error(errorMessage);
  }
};

// LOGIN user
export const login = async (dto: LoginDto): Promise<AuthResponse> => {
  try {
    const res = await axios.post(buildEndpoint(API_VERSION, "auth/login"), dto);
    toast.success("Login successful", {
      description: res.data.message || "Welcome back.",
    });
    return res.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to login";
    toast.error("Login failed", { description: errorMessage });
    throw new Error(errorMessage);
  }
};

// VERIFY OTP
export const verifyOtp = async (dto: VerifyOtpDto): Promise<BasicResponse> => {
  try {
    const res = await axios.post(
      buildEndpoint(API_VERSION, "auth/verify-otp"),
      dto
    );
    toast.success("OTP verified", {
      description: res.data.message || "Your code has been confirmed successfully.",
    });
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to verify OTP";
    toast.error("Verification failed", { description: errorMessage });
    throw new Error(errorMessage);
  }
};

// RESEND OTP
export const resendOtp = async (dto: ResendOtpDto): Promise<BasicResponse> => {
  try {
    const res = await axios.post(
      buildEndpoint(API_VERSION, "auth/resend-otp"),
      dto
    );
    toast.success("OTP resent", {
      description: res.data.message || "A new code has been sent to your email.",
    });
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to resend OTP";
    toast.error("Resend failed", { description: errorMessage });
    throw new Error(errorMessage);
  }
};

// FORGOT Password
export const forgotPassword = async (
  dto: ForgotPasswordDto
): Promise<BasicResponse> => {
  try {
    const res = await axios.post(
      buildEndpoint(API_VERSION, "auth/forgot-password"),
      dto
    );
    toast.success("Reset link sent", {
      description: res.data.message || "Check your email for a password reset link.",
    });
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to send password reset link";
    toast.error("Reset link failed", { description: errorMessage });
    throw new Error(errorMessage);
  }
};

// RESET PASSWORD
export const resetPassword = async (
  dto: ResetPasswordDto
): Promise<BasicResponse> => {
  try {
    const res = await axios.post(
      buildEndpoint(API_VERSION, "auth/reset-password"),
      dto
    );
    toast.success("Password reset", {
      description: res.data.message || "You can now log in with your new password.",
    });
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to reset password";
    toast.error("Reset failed", { description: errorMessage });
    throw new Error(errorMessage);
  }
};

// CHANGE PASSWORD
export const changePassword = async (
  dto: ChangePasswordDto
): Promise<BasicResponse> => {
  try {
    const res = await axios.post(
      buildEndpoint(API_VERSION, "auth/change-password"),
      dto
    );
    toast.success("Password changed", {
      description: res.data.message || "Your password has been updated.",
    });
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to change password";
    toast.error("Password change failed", { description: errorMessage });
    throw new Error(errorMessage);
  }
};
