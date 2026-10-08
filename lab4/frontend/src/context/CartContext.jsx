import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CART_KEY = "zb_cart";
const CartContext = createContext(null);

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((service, quantity) => {
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) return;
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.service_id === service.id);
      if (idx === -1) {
        return [
          ...prev,
          {
            service_id: service.id,
            slug: service.slug,
            title: service.title,
            unit: service.unit,
            unit_price: service.price_per_unit,
            min_quantity: service.min_quantity,
            quantity: qty,
          },
        ];
      }
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: Number((next[idx].quantity + qty).toFixed(2)) };
      return next;
    });
  }, []);

  const updateQuantity = useCallback((serviceId, quantity) => {
    const qty = Number(quantity);
    setItems((prev) =>
      prev.map((i) =>
        i.service_id === serviceId ? { ...i, quantity: Number.isFinite(qty) ? qty : i.quantity } : i
      )
    );
  }, []);

  const removeItem = useCallback((serviceId) => {
    setItems((prev) => prev.filter((i) => i.service_id !== serviceId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0),
    [items]
  );
  const count = items.length;

  const value = useMemo(
    () => ({ items, addItem, updateQuantity, removeItem, clear, total, count }),
    [items, addItem, updateQuantity, removeItem, clear, total, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart должен использоваться внутри CartProvider");
  return ctx;
}
