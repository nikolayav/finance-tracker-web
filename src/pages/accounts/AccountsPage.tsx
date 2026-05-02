import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAccounts, createAccount, deleteAccount } from "@/api/accounts";
import { AccountType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BuildingLibraryIcon,
  PlusIcon,
  TrashIcon,
  BanknotesIcon,
  CreditCardIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyStateCard } from "@/components/common/EmptyStateCard";
import { InputField } from "@/components/common/InputField";
import { SelectField } from "@/components/common/SelectField";
import { FormDialog } from "@/components/common/FormDialog";

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  [AccountType.Checking]: "Checking",
  [AccountType.Savings]: "Savings",
  [AccountType.CreditDebitCard]: "Credit/Debit Card",
  [AccountType.Cash]: "Cash",
};

const ACCOUNT_TYPE_ICONS: Record<AccountType, React.ElementType> = {
  [AccountType.Checking]: BuildingLibraryIcon,
  [AccountType.Savings]: BanknotesIcon,
  [AccountType.CreditDebitCard]: CreditCardIcon,
  [AccountType.Cash]: WalletIcon,
};

const CURRENCIES = ["EUR", "USD", "GBP", "BGN", "CHF"];

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>(AccountType.Checking);
  const [currency, setCurrency] = useState("EUR");
  const [error, setError] = useState("");

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const createMutation = useMutation({
    mutationFn: () => createAccount({ name, type, currency }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      setError("Failed to create account. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const resetForm = () => {
    setName("");
    setType(AccountType.Checking);
    setCurrency("EUR");
    setError("");
  };

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    createMutation.mutate();
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Loading accounts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts"
        subtitle="Manage your financial accounts"
        action={
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add account
          </Button>
        }
      />

      <Card className="dark:bg-gray-900 dark:border-gray-700">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total balance
          </p>
          <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-1">
            {totalBalance.toLocaleString("en-EU", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Across {accounts.length} account{accounts.length !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      {accounts.length === 0 ? (
        <EmptyStateCard
          icon={BuildingLibraryIcon}
          title="No accounts yet"
          subtitle="Add your first account to get started"
          action={
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center gap-2 dark:text-white"
            >
              <PlusIcon className="w-4 h-4" />
              Add account
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const Icon = ACCOUNT_TYPE_ICONS[account.type];
            return (
              <Card
                key={account.id}
                className="dark:bg-gray-900 dark:border-gray-700"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                        {account.name}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs mt-0.5">
                        {ACCOUNT_TYPE_LABELS[account.type]}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(account.id)}
                    disabled={deleteMutation.isPending}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {account.balance.toLocaleString("en-EU", {
                      style: "currency",
                      currency: account.currency,
                    })}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {account.currency}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <FormDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
        title="Add account"
        error={error}
        onSubmit={handleSubmit}
        submitLabel="Create account"
        submittingLabel="Creating..."
        isSubmitting={createMutation.isPending}
      >
        <InputField
          label="Account name"
          placeholder="e.g. Main Checking"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <SelectField
          label="Account type"
          value={String(type)}
          onValueChange={(val) => setType(Number(val) as AccountType)}
        >
          {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value} className="dark:text-white">
              {label}
            </SelectItem>
          ))}
        </SelectField>

        <SelectField
          label="Currency"
          value={currency}
          onValueChange={setCurrency}
        >
          {CURRENCIES.map((c) => (
            <SelectItem key={c} value={c} className="dark:text-white">
              {c}
            </SelectItem>
          ))}
        </SelectField>
      </FormDialog>
    </div>
  );
}
