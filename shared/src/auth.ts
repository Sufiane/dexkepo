export type UserPublic = {
  id: string;
  pseudo: string;
  email: string;
  createdAt?: string;
};

export type AuthResponse = {
  accessToken: string;
  user: UserPublic;
};

export type RegisterRequest = {
  pseudo: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};
