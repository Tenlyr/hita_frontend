export interface AuthUser {
  id: number;
  name: string;
  email: string | null;
  phone_number: string;
  is_staff: boolean;
}

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RefreshedAccessToken {
  access: string;
}
