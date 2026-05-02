import { Transaction, TransactionType } from "@/types";
import {
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";

interface TransactionListItemProps {
  transaction: Transaction;
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
}

export function TransactionListItem({
  transaction,
  onDelete,
  isDeleting,
}: TransactionListItemProps) {
  const isIncome = transaction.type === TransactionType.Income;
  const amountColor = isIncome
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";
  const iconBg = isIncome
    ? "bg-green-100 dark:bg-green-900"
    : "bg-red-100 dark:bg-red-900";

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconBg}`}>
          {isIncome ? (
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
            {transaction.description && `${transaction.description} · `}
            {new Date(transaction.occurredOn).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className={`text-sm font-semibold ${amountColor}`}>
            {isIncome ? "+" : "-"}
            {transaction.amount.toLocaleString("en-EU", {
              style: "currency",
              currency: transaction.currency,
            })}
          </p>
          <Badge variant="secondary" className="text-xs text-gray-900 dark:text-gray-400">
            {transaction.currency}
          </Badge>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(transaction.id)}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
