import client from "./client";
import { Transaction, CreateTransactionRequest } from "@/types";

export const getTransactions = async (
  from?: string,
  to?: string,
  category?: string
): Promise<Transaction[]> => {
  const { data } = await client.get<Transaction[]>("/api/transactions", {
    params: { from, to, category },
  });
  return data;
};

export const createTransaction = async (
  request: CreateTransactionRequest
): Promise<Transaction> => {
  const { data } = await client.post<Transaction>("/api/transactions", request);
  return data;
};

export const deleteTransaction = async (id: number): Promise<void> => {
  await client.delete(`/api/transactions/${id}`);
};
