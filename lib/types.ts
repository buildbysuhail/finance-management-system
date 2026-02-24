export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  date: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export type TransactionFormData = Omit<Transaction, "id">;
export type CategoryFormData = Omit<Category, "id">;
