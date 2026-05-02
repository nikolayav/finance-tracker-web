import client from "./client";
import { Budget, CreateBudgetRequest } from "@/types";

export const getBudgets = async (
  month?: number,
  year?: number
): Promise<Budget[]> => {
  const { data } = await client.get<Budget[]>("/api/budgets", {
    params: { month, year },
  });
  return data;
};

export const createBudget = async (
  request: CreateBudgetRequest
): Promise<Budget> => {
  const { data } = await client.post<Budget>("/api/budgets", request);
  return data;
};

export const deleteBudget = async (id: number): Promise<void> => {
  await client.delete(`/api/budgets/${id}`);
};
