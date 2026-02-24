"use client";

import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { useFinance } from "@/context/finance-context";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PIE_COLORS = ["hsl(145, 60%, 40%)", "hsl(0, 70%, 55%)"];
const BAR_COLORS = [
  "hsl(220, 60%, 50%)",
  "hsl(145, 60%, 40%)",
  "hsl(35, 80%, 55%)",
  "hsl(340, 60%, 50%)",
  "hsl(190, 60%, 45%)",
  "hsl(270, 50%, 55%)",
  "hsl(15, 70%, 50%)",
  "hsl(170, 50%, 45%)",
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getMonthOptions(): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = [
    { value: "all", label: "All Months" },
  ];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
    months.push({ value, label });
  }
  return months;
}

export default function ReportsPage() {
  const { transactions, categories } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState("all");

  const monthOptions = useMemo(() => getMonthOptions(), []);

  const filteredTransactions = useMemo(() => {
    if (selectedMonth === "all") return transactions;
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const pieData = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    if (income === 0 && expense === 0) return [];

    return [
      { name: "Income", value: income },
      { name: "Expenses", value: expense },
    ];
  }, [filteredTransactions]);

  const barData = useMemo(() => {
    const categoryMap = new Map<string, number>();

    filteredTransactions.forEach((t) => {
      const category = categories.find((c) => c.id === t.categoryId);
      const name = category?.name ?? "Unknown";
      categoryMap.set(name, (categoryMap.get(name) ?? 0) + t.amount);
    });

    return Array.from(categoryMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categories]);

  const hasData = filteredTransactions.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports"
        description="Visualize your financial data"
      />

      <div className="flex items-center gap-3">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filteredTransactions.length} transaction
          {filteredTransactions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title="No data for this period"
          description="There are no transactions to display for the selected period."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Income vs Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No data available
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, value }) =>
                        `${name}: ${formatCurrency(value)}`
                      }
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--card))",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Amount by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {barData.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No data available
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={barData}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      angle={-30}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--card))",
                      }}
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {barData.map((_, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={BAR_COLORS[index % BAR_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1 rounded-lg bg-success/10 p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Income
                  </p>
                  <p className="text-xl font-bold text-success">
                    {formatCurrency(
                      pieData.find((d) => d.name === "Income")?.value ?? 0
                    )}
                  </p>
                </div>
                <div className="flex flex-col gap-1 rounded-lg bg-destructive/10 p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Expenses
                  </p>
                  <p className="text-xl font-bold text-destructive">
                    {formatCurrency(
                      pieData.find((d) => d.name === "Expenses")?.value ?? 0
                    )}
                  </p>
                </div>
                <div className="flex flex-col gap-1 rounded-lg bg-primary/10 p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Net Savings
                  </p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(
                      (pieData.find((d) => d.name === "Income")?.value ?? 0) -
                        (pieData.find((d) => d.name === "Expenses")?.value ?? 0)
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
