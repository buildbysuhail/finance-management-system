"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  Transaction,
  Category,
  User,
  TransactionFormData,
  CategoryFormData,
} from "@/lib/types";
import {
  mockTransactions,
  mockCategories,
  mockUser,
} from "@/lib/mock-data";

interface FinanceContextType {
  user: User;
  updateUser: (data: Partial<User>) => void;
  transactions: Transaction[];
  addTransaction: (data: TransactionFormData) => void;
  updateTransaction: (id: string, data: TransactionFormData) => void;
  deleteTransaction: (id: string) => void;
  categories: Category[];
  addCategory: (data: CategoryFormData) => void;
  updateCategory: (id: string, data: CategoryFormData) => void;
  deleteCategory: (id: string) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

let nextTransactionId = 13;
let nextCategoryId = 9;

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(mockUser);
  const [transactions, setTransactions] =
    useState<Transaction[]>(mockTransactions);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback((email: string, _password: string) => {
    if (email) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...data }));
  }, []);

  const addTransaction = useCallback((data: TransactionFormData) => {
    const newTransaction: Transaction = {
      ...data,
      id: String(nextTransactionId++),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  }, []);

  const updateTransaction = useCallback(
    (id: string, data: TransactionFormData) => {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...data, id } : t))
      );
    },
    []
  );

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addCategory = useCallback((data: CategoryFormData) => {
    const newCategory: Category = {
      ...data,
      id: String(nextCategoryId++),
    };
    setCategories((prev) => [...prev, newCategory]);
  }, []);

  const updateCategory = useCallback((id: string, data: CategoryFormData) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...data, id } : c))
    );
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <FinanceContext.Provider
      value={{
        user,
        updateUser,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
