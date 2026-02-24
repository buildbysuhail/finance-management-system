"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";
import type { Category } from "@/lib/types";
import { useFinance } from "@/context/finance-context";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { CategoryForm } from "@/components/category-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  const { categories, deleteCategory, transactions } = useFinance();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  function getTransactionCount(categoryId: string): number {
    return transactions.filter((t) => t.categoryId === categoryId).length;
  }

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setFormOpen(true);
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
    }
  }

  function handleCloseForm(open: boolean) {
    setFormOpen(open);
    if (!open) {
      setEditingCategory(null);
    }
  }

  function CategoryList({
    title,
    items,
    type,
  }: {
    title: string;
    items: Category[];
    type: "income" | "expense";
  }) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            {title}
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                type === "income"
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {items.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No {type} categories yet
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {items.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-card-foreground">
                      {cat.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getTransactionCount(cat.id)} transaction
                      {getTransactionCount(cat.id) !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(cat)}
                      aria-label={`Edit ${cat.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(cat)}
                      aria-label={`Delete ${cat.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categories"
        description="Organize your transactions into categories"
        action={
          <Button onClick={() => setFormOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        }
      />

      {categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No categories yet"
          description="Create categories to organize your transactions."
          action={
            <Button
              onClick={() => setFormOpen(true)}
              size="sm"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <CategoryList
            title="Income Categories"
            items={incomeCategories}
            type="income"
          />
          <CategoryList
            title="Expense Categories"
            items={expenseCategories}
            type="expense"
          />
        </div>
      )}

      <CategoryForm
        open={formOpen}
        onOpenChange={handleCloseForm}
        category={editingCategory}
        key={editingCategory?.id ?? "new"}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Transactions in this category will not be deleted.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
