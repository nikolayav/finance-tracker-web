import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBudgets, createBudget, deleteBudget } from "@/api/budgets";
import { getTransactions } from "@/api/transactions";
import { TransactionType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  CalculatorIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
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
const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export default function BudgetsPage() {
  const queryClient = useQueryClient();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterMonth, setFilterMonth] = useState(String(currentMonth));
  const [filterYear, setFilterYear] = useState(String(currentYear));

  const [categoryName, setCategoryName] = useState("");
  const [limitAmount, setLimitAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [month, setMonth] = useState(String(currentMonth));
  const [year, setYear] = useState(String(currentYear));
  const [error, setError] = useState("");

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["budgets", filterMonth, filterYear],
    queryFn: () => getBudgets(Number(filterMonth), Number(filterYear)),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createBudget({
        categoryName,
        limitAmount: Number(limitAmount),
        currency,
        month: Number(month),
        year: Number(year),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      setError("Failed to create budget. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });

  const resetForm = () => {
    setCategoryName("");
    setLimitAmount("");
    setCurrency("EUR");
    setMonth(String(currentMonth));
    setYear(String(currentYear));
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    createMutation.mutate();
  };

  const getSpentAmount = (category: string) => {
    return transactions
      .filter(
        (t) =>
          t.type === TransactionType.Expense &&
          t.categoryName === category &&
          new Date(t.occurredOn).getMonth() + 1 === Number(filterMonth) &&
          new Date(t.occurredOn).getFullYear() === Number(filterYear)
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Loading budgets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Budgets
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Set and track your spending limits
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 dark:text-white"
        >
          <PlusIcon className="w-4 h-4" />
          Add budget
        </Button>
      </div>

      <Card className="dark:bg-gray-900 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Month</Label>
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Year</Label>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {budgets.length === 0 ? (
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CalculatorIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No budgets for this period
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Create a budget to track your spending
            </p>
            <Button
              className="mt-4 flex items-center gap-2 dark:text-white"
              onClick={() => setIsDialogOpen(true)}
            >
              <PlusIcon className="w-4 h-4" />
              Add budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const spent = getSpentAmount(budget.categoryName);
            const percentage = Math.min(
              (spent / budget.limitAmount) * 100,
              100
            );
            const isOverBudget = spent > budget.limitAmount;

            return (
              <Card
                key={budget.id}
                className="dark:bg-gray-900 dark:border-gray-700"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    {isOverBudget ? (
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                    ) : (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    )}
                    <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                      {budget.categoryName}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {budget.currency}
                    </Badge>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(budget.id)}
                    disabled={deleteMutation.isPending}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      Spent:{" "}
                      <span
                        className={`font-medium ${
                          isOverBudget
                            ? "text-red-500"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {spent.toLocaleString("en-EU", {
                          style: "currency",
                          currency: budget.currency,
                        })}
                      </span>
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      Limit:{" "}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {budget.limitAmount.toLocaleString("en-EU", {
                          style: "currency",
                          currency: budget.currency,
                        })}
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isOverBudget
                          ? "bg-red-500"
                          : percentage > 75
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                    {percentage.toFixed(0)}% used
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
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
            <DialogTitle className="dark:text-white">Add budget</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-md">
                {error}
              </p>
            )}

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Limit amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Month</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m.value} value={String(m.value)}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Year</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                {createMutation.isPending ? "Creating..." : "Add budget"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
