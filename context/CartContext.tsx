"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface AddToCartInput {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity?: number;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  setIsOpen: (value: boolean) => void;
  addToCart: (item: AddToCartInput) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
}

const CART_STORAGE_KEY = "afflatte-cart";

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as CartItem[];
      if (Array.isArray(parsed)) {
        setItems(parsed.filter((item) => item.quantity > 0));
      }
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      items,
      isOpen,
      totalItems,
      totalPrice,
      setIsOpen,
      addToCart: (item) => {
        setItems((currentItems) => {
          const quantity = item.quantity ?? 1;
          const existingItem = currentItems.find(
            (currentItem) => currentItem.id === item.id
          );

          if (existingItem) {
            return currentItems.map((currentItem) =>
              currentItem.id === item.id
                ? {
                    ...currentItem,
                    quantity: currentItem.quantity + quantity,
                  }
                : currentItem
            );
          }

          return [...currentItems, { ...item, quantity }];
        });
        setIsOpen(true);
      },
      updateQuantity: (id, quantity) => {
        setItems((currentItems) => {
          if (quantity <= 0) {
            return currentItems.filter((item) => item.id !== id);
          }

          return currentItems.map((item) =>
            item.id === id ? { ...item, quantity } : item
          );
        });
      },
      removeFromCart: (id) => {
        setItems((currentItems) =>
          currentItems.filter((item) => item.id !== id)
        );
      },
      clearCart: () => {
        setItems([]);
      },
    };
  }, [isOpen, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}