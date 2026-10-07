export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role: "ORGANIZER";
}

export interface RegisterResponse {
  message: string;
  email: string;
  state: "PENDING_CREATED" | "PENDING_REUSED";
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
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "USER" | "ORGANIZER" | "ADMIN" | "SUPERADMIN";
  };
}

export interface BasicResponse {
  message: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
