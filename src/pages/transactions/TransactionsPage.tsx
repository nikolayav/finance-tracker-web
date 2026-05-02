import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
} from "@/api/transactions";
import { getAccounts } from "@/api/accounts";
import { TransactionType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  PlusIcon,
  TrashIcon,
  ArrowsRightLeftIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

const CATEGORIES = [
  "Salary",
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Utilities",
  "Other",
];
const CURRENCIES = ["EUR", "USD", "GBP", "BGN", "CHF"];

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [type, setType] = useState<TransactionType>(TransactionType.Expense);
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [occurredOn, setOccurredOn] = useState("");
  const [error, setError] = useState("");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", filterFrom, filterTo, filterCategory],
    queryFn: () =>
      getTransactions(
        filterFrom || undefined,
        filterTo || undefined,
        filterCategory || undefined
      ),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createTransaction({
        accountId: Number(accountId),
        amount: Number(amount),
        currency,
        type,
        categoryName,
        description: description || undefined,
        occurredOn: new Date(occurredOn).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      setError("Failed to create transaction. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const resetForm = () => {
    setAccountId("");
    setAmount("");
    setCurrency("EUR");
    setType(TransactionType.Expense);
    setCategoryName("");
    setDescription("");
    setOccurredOn("");
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    createMutation.mutate();
  };

  const totalIncome = transactions
    .filter((t) => t.type === TransactionType.Income)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === TransactionType.Expense)
    .reduce((sum, t) => sum + t.amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">
          Loading transactions...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your income and expenses
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 dark:text-white"
        >
          <PlusIcon className="w-4 h-4" />
          Add transaction
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <ArrowUpCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total income
              </p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                +
                {totalIncome.toLocaleString("en-EU", {
                  style: "currency",
                  currency: "EUR",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <ArrowDownCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total expenses
              </p>
              <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
                -
                {totalExpenses.toLocaleString("en-EU", {
                  style: "currency",
                  currency: "EUR",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-gray-900 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filters
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">From</Label>
              <Input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">To</Label>
              <Input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Category</Label>
              <Select
                value={filterCategory}
                onValueChange={(val) =>
                  setFilterCategory(val === "all" ? "" : val)
                }
              >
                <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {transactions.length === 0 ? (
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ArrowsRightLeftIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No transactions found
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Add your first transaction to get started
            </p>
            <Button
              className="mt-4 flex items-center gap-2 dark:text-white"
              onClick={() => setIsDialogOpen(true)}
            >
              <PlusIcon className="w-4 h-4" />
              Add transaction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === TransactionType.Income
                          ? "bg-green-100 dark:bg-green-900"
                          : "bg-red-100 dark:bg-red-900"
                      }`}
                    >
                      {transaction.type === TransactionType.Income ? (
                        <ArrowUpCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowDownCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.categoryName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.description &&
                          `${transaction.description} · `}
                        {new Date(transaction.occurredOn).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          transaction.type === TransactionType.Income
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {transaction.type === TransactionType.Income
                          ? "+"
                          : "-"}
                        {transaction.amount.toLocaleString("en-EU", {
                          style: "currency",
                          currency: transaction.currency,
                        })}
                      </p>
                      <Badge
                        variant="secondary"
                        className="text-xs text-gray-900 dark:text-gray-400"
                      >
                        {transaction.currency}
                      </Badge>
                    </div>
                    <button
                      onClick={() => deleteMutation.mutate(transaction.id)}
                      disabled={deleteMutation.isPending}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              Add transaction
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-md">
                {error}
              </p>
            )}

            <div className="space-y-2">
              <Label className="dark:text-gray-300">Account</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.name} ({a.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="dark:text-gray-300">Type</Label>
              <Select
                value={String(type)}
                onValueChange={(val) => setType(Number(val) as TransactionType)}
              >
                <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(TransactionType.Income)}>
                    Income
                  </SelectItem>
                  <SelectItem value={String(TransactionType.Expense)}>
                    Expense
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="dark:text-gray-300">Category</Label>
              <Select value={categoryName} onValueChange={setCategoryName}>
                <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="dark:text-gray-300">
                Description (optional)
              </Label>
              <Input
                placeholder="Add a note..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="dark:text-gray-300">Date</Label>
              <Input
                type="date"
                value={occurredOn}
                onChange={(e) => setOccurredOn(e.target.value)}
                required
                className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="dark:border-gray-600 dark:text-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex items-center gap-2 dark:text-white"
              >
                <PlusIcon className="w-4 h-4" />
                {createMutation.isPending ? "Creating..." : "Add transaction"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
