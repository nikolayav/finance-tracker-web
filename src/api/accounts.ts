import client from "./client";
import { Account, CreateAccountRequest } from "@/types";

export const getAccounts = async (): Promise<Account[]> => {
  const { data } = await client.get<Account[]>("/api/accounts");
  return data;
};

export const createAccount = async (
  request: CreateAccountRequest
): Promise<Account> => {
  const { data } = await client.post<Account>("/api/accounts", request);
  return data;
};

export const deleteAccount = async (id: number): Promise<void> => {
  await client.delete(`/api/accounts/${id}`);
};
