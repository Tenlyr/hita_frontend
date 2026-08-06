/** Session primitives shared by both the admin and customer sign-in flows. */

export interface AuthUser {
  id: number;
  name: string;
  email: string | null;
  phone_number: string;
  is_staff: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RefreshedAccessToken {
  access: string;
}
