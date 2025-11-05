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

// REGISTER user
export const register = async (dto: RegisterDto): Promise<BasicResponse> => {
  try {
    const res = await axios.post("/auth/register", dto);
    toast.success(res.data.message || "Registration successful");
    return res.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to register";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// LOGIN user
export const login = async (dto: LoginDto): Promise<AuthResponse> => {
  try {
    const res = await axios.post("/auth/login", dto);
    toast.success(res.data.message || "Login successful");
    return res.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to login";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// VERIFY OTP
export const verifyOtp = async (dto: VerifyOtpDto): Promise<BasicResponse> => {
  try {
    const res = await axios.post("/auth/verify-otp", dto);
    toast.success(res.data.message || "OTP verified successfully");
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to verify OTP";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// RESEND OTP
export const resendOtp = async (dto: ResendOtpDto): Promise<BasicResponse> => {
  try {
    const res = await axios.post("/auth/resend-otp", dto);
    toast.success(res.data.message || "OTP resent successfully");
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to resend OTP";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// FORGOT Password
export const forgotPassword = async (
  dto: ForgotPasswordDto
): Promise<BasicResponse> => {
  try {
    const res = await axios.post("/auth/forgot-password", dto);
    toast.success(res.data.message || "Password reset link sent successfully");
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to send password reset link";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// RESET PASSWORD
export const resetPassword = async (
  dto: ResetPasswordDto
): Promise<BasicResponse> => {
  try {
    const res = await axios.post("/auth/reset-password", dto);
    toast.success(res.data.message || "Password reset successfully");
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to reset password";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// CHANGE PASSWORD
export const changePassword = async (
  dto: ChangePasswordDto
): Promise<BasicResponse> => {
  try {
    const res = await axios.post("/auth/change-password", dto);
    toast.success(res.data.message || "Password changed successfully");
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to change password";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
