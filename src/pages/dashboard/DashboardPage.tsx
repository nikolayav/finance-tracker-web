import { useQuery } from "@tanstack/react-query";
import { getAccounts } from "@/api/accounts";
import { getTransactions } from "@/api/transactions";
import { TransactionType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  BanknotesIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { TransactionListItem } from "@/components/common/TransactionListItem";

const COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
];

export default function DashboardPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions(),
  });

  const currentMonthTransactions = transactions.filter((t) => {
    const date = new Date(t.occurredOn);
    return (
      date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear
    );
  });

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const monthlyIncome = currentMonthTransactions
    .filter((t) => t.type === TransactionType.Income)
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter((t) => t.type === TransactionType.Expense)
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = monthlyIncome - monthlyExpenses;

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      month: date.toLocaleString("default", { month: "short" }),
      year: date.getFullYear(),
      monthNum: date.getMonth() + 1,
    };
  }).reverse();

  const barChartData = last6Months.map(({ month, year, monthNum }) => {
    const monthTransactions = transactions.filter((t) => {
      const date = new Date(t.occurredOn);
      return date.getMonth() + 1 === monthNum && date.getFullYear() === year;
    });
    return {
      month,
      income: monthTransactions
        .filter((t) => t.type === TransactionType.Income)
        .reduce((sum, t) => sum + t.amount, 0),
      expenses: monthTransactions
        .filter((t) => t.type === TransactionType.Expense)
        .reduce((sum, t) => sum + t.amount, 0),
    };
  });

  const expensesByCategory = currentMonthTransactions
    .filter((t) => t.type === TransactionType.Expense)
    .reduce((acc, t) => {
      acc[t.categoryName] = (acc[t.categoryName] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieChartData = Object.entries(expensesByCategory).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const recentTransactions = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.occurredOn).getTime() - new Date(a.occurredOn).getTime()
    )
    .slice(0, 5);

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-EU", { style: "currency", currency: "EUR" });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle={`${new Date().toLocaleString("default", {
          month: "long",
          year: "numeric",
        })} overview`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BanknotesIcon}
          iconBg="bg-indigo-100 dark:bg-indigo-900"
          iconColor="text-indigo-600 dark:text-indigo-400"
          label="Total balance"
          value={formatCurrency(totalBalance)}
        />
        <StatCard
          icon={ArrowUpCircleIcon}
          iconBg="bg-green-100 dark:bg-green-900"
          iconColor="text-green-600 dark:text-green-400"
          label="Monthly income"
          value={`+${formatCurrency(monthlyIncome)}`}
          valueColor="text-green-600 dark:text-green-400"
        />
        <StatCard
          icon={ArrowDownCircleIcon}
          iconBg="bg-red-100 dark:bg-red-900"
          iconColor="text-red-600 dark:text-red-400"
          label="Monthly expenses"
          value={`-${formatCurrency(monthlyExpenses)}`}
          valueColor="text-red-600 dark:text-red-400"
        />
        <StatCard
          icon={ScaleIcon}
          iconBg={
            netBalance >= 0
              ? "bg-blue-100 dark:bg-blue-900"
              : "bg-orange-100 dark:bg-orange-900"
          }
          iconColor={
            netBalance >= 0
              ? "text-blue-600 dark:text-blue-400"
              : "text-orange-600 dark:text-orange-400"
          }
          label="Net this month"
          value={`${netBalance >= 0 ? "+" : ""}${formatCurrency(netBalance)}`}
          valueColor={
            netBalance >= 0
              ? "text-blue-600 dark:text-blue-400"
              : "text-orange-600 dark:text-orange-400"
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
              Income vs Expenses — Last 6 months
            </CardTitle>
          </CardHeader>
          <CardContent>
            {barChartData.every((d) => d.income === 0 && d.expenses === 0) ? (
              <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={barChartData}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    opacity={0.3}
                  />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "var(--tooltip-bg, #fff)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
              Expenses by category — This month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieChartData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
                No expenses this month
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieChartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value))]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ fontSize: "12px" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-gray-900 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
            Recent transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-400 dark:text-gray-500 text-sm">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <TransactionListItem
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
