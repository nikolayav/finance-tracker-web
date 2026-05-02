export enum AccountType {
  Checking = 0,
  Savings = 1,
  CreditDebitCard = 2,
  Cash = 3,
}

export enum TransactionType {
  Income = 0,
  Expense = 1,
}

export interface AuthResponse {
  accessToken: string;
  email: string;
  displayName: string;
}

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
}

export interface Transaction {
  id: number;
  accountId: number;
  amount: number;
  currency: string;
  type: TransactionType;
  categoryName: string;
  description?: string;
  occurredOn: string;
  createdAt: string;
}

export interface Budget {
  id: number;
  categoryName: string;
  limitAmount: number;
  currency: string;
  month: number;
  year: number;
}

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
  currency: string;
}

export interface CreateTransactionRequest {
  accountId: number;
  amount: number;
  currency: string;
  type: TransactionType;
  categoryName: string;
  description?: string;
  occurredOn: string;
}

export interface CreateBudgetRequest {
  categoryName: string;
  limitAmount: number;
  currency: string;
  month: number;
  year: number;
}
