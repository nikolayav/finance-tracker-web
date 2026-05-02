import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAccounts, createAccount, deleteAccount } from "@/api/accounts";
import { AccountType } from "@/types";
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
  BuildingLibraryIcon,
  PlusIcon,
  TrashIcon,
  BanknotesIcon,
  CreditCardIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";

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

  const handleSubmit = (e: React.FormEvent) => {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Accounts
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your financial accounts
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add account
        </Button>
      </div>

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
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BuildingLibraryIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No accounts yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Add your first account to get started
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center gap-2 dark:text-white"
            >
              <PlusIcon className="w-4 h-4" />
              Add account
            </Button>
          </CardContent>
        </Card>
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

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Add account</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-md">
                {error}
              </p>
            )}

            <div className="space-y-2">
              <Label className="dark:text-gray-300">Account name</Label>
              <Input
                placeholder="e.g. Main Checking"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="dark:text-gray-300">Account type</Label>
              <Select
                value={String(type)}
                onValueChange={(val) => setType(Number(val) as AccountType)}
              >
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                  {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="dark:text-white"
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="dark:text-gray-300">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c} className="dark:text-white">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {createMutation.isPending ? "Creating..." : "Create account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
