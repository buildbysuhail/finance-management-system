"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, ArrowLeftRight } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { useFinance } from "@/context/finance-context";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TransactionForm } from "@/components/transaction-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function TransactionsPage() {
  const { transactions, categories, deleteTransaction } = useFinance();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );

  const filteredTransactions = useMemo(() => {
    const filtered =
      filterType === "all"
        ? transactions
        : transactions.filter((t) => t.type === filterType);

    return [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions, filterType]);

  function getCategoryName(categoryId: string): string {
    return categories.find((c) => c.id === categoryId)?.name ?? "Unknown";
  }

  function handleEdit(transaction: Transaction) {
    setEditingTransaction(transaction);
    setFormOpen(true);
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      deleteTransaction(deleteTarget.id);
      setDeleteTarget(null);
    }
  }

  function handleCloseForm(open: boolean) {
    setFormOpen(open);
    if (!open) {
      setEditingTransaction(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transactions"
        description="Manage your income and expenses"
        action={
          <Button onClick={() => setFormOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <Select
          value={filterType}
          onValueChange={(v) =>
            setFilterType(v as "all" | "income" | "expense")
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filteredTransactions.length} transaction
          {filteredTransactions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No transactions found"
          description="Start tracking your finances by adding your first transaction."
          action={
            <Button onClick={() => setFormOpen(true)} size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col divide-y divide-border">
              {filteredTransactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-card-foreground">
                      {t.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          t.type === "income"
                            ? "bg-success/10 text-success hover:bg-success/10"
                            : "bg-destructive/10 text-destructive hover:bg-destructive/10"
                        )}
                      >
                        {t.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getCategoryName(t.categoryId)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(t.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {t.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
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
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(t)}
                        aria-label={`Edit ${t.title}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(t)}
                        aria-label={`Delete ${t.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <TransactionForm
        open={formOpen}
        onOpenChange={handleCloseForm}
        transaction={editingTransaction}
        key={editingTransaction?.id ?? "new"}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Transaction"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
