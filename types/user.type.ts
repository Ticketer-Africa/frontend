export interface User {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
  role: "USER" | "ORGANIZER";
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserDto {
  name?: string;
  password?: string;
}

export interface BecomeOrganizerResponse {
  message: string;
}
