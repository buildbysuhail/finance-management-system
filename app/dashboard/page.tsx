"use client";

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowLeftRight,
} from "lucide-react";
import { useFinance } from "@/context/finance-context";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardPage() {
  const { transactions, categories } = useFinance();

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;
  const transactionCount = transactions.length;

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  function getCategoryName(categoryId: string): string {
    return categories.find((c) => c.id === categoryId)?.name ?? "Unknown";
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard"
        description="Your financial overview at a glance"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Income"
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
          iconClassName="bg-success/10"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpense)}
          icon={TrendingDown}
          iconClassName="bg-destructive/10"
        />
        <StatCard
          title="Net Balance"
          value={formatCurrency(netBalance)}
          icon={Wallet}
          trend={netBalance >= 0 ? "Positive balance" : "Negative balance"}
          trendUp={netBalance >= 0}
        />
        <StatCard
          title="Transactions"
          value={String(transactionCount)}
          icon={ArrowLeftRight}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col divide-y divide-border">
            {recentTransactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-card-foreground">
                    {t.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {getCategoryName(t.categoryId)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(t.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={t.type === "income" ? "default" : "secondary"}
                    className={cn(
                      "text-xs capitalize",
                      t.type === "income"
                        ? "bg-success/10 text-success hover:bg-success/10"
                        : "bg-destructive/10 text-destructive hover:bg-destructive/10"
                    )}
                  >
                    {t.type}
                  </Badge>
                  <p
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      t.type === "income"
                        ? "text-success"
                        : "text-destructive"
                    )}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
