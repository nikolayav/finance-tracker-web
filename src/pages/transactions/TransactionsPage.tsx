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
import { Card, CardContent } from "@/components/ui/card";
import { SelectItem } from "@/components/ui/select";
import {
  PlusIcon,
  ArrowsRightLeftIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { EmptyStateCard } from "@/components/common/EmptyStateCard";
import { InputField } from "@/components/common/InputField";
import { SelectField } from "@/components/common/SelectField";
import { FormDialog } from "@/components/common/FormDialog";
import { TransactionListItem } from "@/components/common/TransactionListItem";

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

  const handleSubmit = (e: { preventDefault(): void }) => {
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

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-EU", { style: "currency", currency: "EUR" });

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
      <PageHeader
        title="Transactions"
        subtitle="Track your income and expenses"
        action={
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 dark:text-white"
          >
            <PlusIcon className="w-4 h-4" />
            Add transaction
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          icon={ArrowUpCircleIcon}
          iconBg="bg-green-100 dark:bg-green-900"
          iconColor="text-green-600 dark:text-green-400"
          label="Total income"
          value={`+${formatCurrency(totalIncome)}`}
          valueColor="text-green-600 dark:text-green-400"
        />
        <StatCard
          icon={ArrowDownCircleIcon}
          iconBg="bg-red-100 dark:bg-red-900"
          iconColor="text-red-600 dark:text-red-400"
          label="Total expenses"
          value={`-${formatCurrency(totalExpenses)}`}
          valueColor="text-red-600 dark:text-red-400"
        />
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
            <InputField
              label="From"
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
            />
            <InputField
              label="To"
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
            />
            <SelectField
              label="Category"
              value={filterCategory || "all"}
              onValueChange={(val) => setFilterCategory(val === "all" ? "" : val)}
              placeholder="All categories"
            >
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectField>
          </div>
        </CardContent>
      </Card>

      {transactions.length === 0 ? (
        <EmptyStateCard
          icon={ArrowsRightLeftIcon}
          title="No transactions found"
          subtitle="Add your first transaction to get started"
          action={
            <Button
              className="flex items-center gap-2 dark:text-white"
              onClick={() => setIsDialogOpen(true)}
            >
              <PlusIcon className="w-4 h-4" />
              Add transaction
            </Button>
          }
        />
      ) : (
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <TransactionListItem
                  key={transaction.id}
                  transaction={transaction}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <FormDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
        title="Add transaction"
        error={error}
        onSubmit={handleSubmit}
        submitLabel="Add transaction"
        submittingLabel="Creating..."
        isSubmitting={createMutation.isPending}
      >
        <SelectField
          label="Account"
          value={accountId}
          onValueChange={setAccountId}
          placeholder="Select account"
        >
          {accounts.map((a) => (
            <SelectItem key={a.id} value={String(a.id)}>
              {a.name} ({a.currency})
            </SelectItem>
          ))}
        </SelectField>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Amount"
            type="number"
            placeholder="0.00"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <SelectField
            label="Currency"
            value={currency}
            onValueChange={setCurrency}
          >
            {CURRENCIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectField>
        </div>

        <SelectField
          label="Type"
          value={String(type)}
          onValueChange={(val) => setType(Number(val) as TransactionType)}
        >
          <SelectItem value={String(TransactionType.Income)}>Income</SelectItem>
          <SelectItem value={String(TransactionType.Expense)}>Expense</SelectItem>
        </SelectField>

        <SelectField
          label="Category"
          value={categoryName}
          onValueChange={setCategoryName}
          placeholder="Select category"
        >
          {CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectField>

        <InputField
          label="Description (optional)"
          placeholder="Add a note..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <InputField
          label="Date"
          type="date"
          value={occurredOn}
          onChange={(e) => setOccurredOn(e.target.value)}
          required
        />
      </FormDialog>
    </div>
  );
}
