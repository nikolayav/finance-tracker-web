import client from "./client";
import { AuthResponse } from "../types";

export const register = async (
  email: string,
  password: string,
  displayName: string
): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>("/api/auth/register", {
    email,
    password,
    displayName,
  });
  return data;
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>("/api/auth/login", {
    email,
    password,
  });
  return data;
};

export const logout = async (): Promise<void> => {
  return Promise.resolve();
};
