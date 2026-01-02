export interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  role: string;
  status: string;
  eventsCount: number;
  totalSpent: number;
  lastLogin: string | null;
  joinedDate: string | null;
  avatar: string;
  isVerified?: boolean;
}
