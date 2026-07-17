import { User } from "./user.type";

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface ResendOtpDto {
  email: string;
  context: "register" | "forgot-password";
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email?: string;
  otp?: string;
  resetToken?: string;
  newPassword: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface BasicResponse {
  message: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
