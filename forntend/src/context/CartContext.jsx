import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCart } from "../services/cart.service";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, authLoading } = useAuth();
  const userId = user?.id;
  const [cartItems, setCartItems] = useState([]);

  const refreshCart = useCallback(async () => {
    if (!userId) {
      setCartItems([]);
      return;
    }
    try {
      const response = await getCart();
      setCartItems(response.cart?.items || []);
    } catch (error) {
      if (error.response?.status === 401) {
        setCartItems([]);
        return;
      }

      console.error("Failed to refresh cart:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (!authLoading) refreshCart();
  }, [refreshCart, authLoading]);

  const applyCartResponse = useCallback((response) => {
    setCartItems(response?.cart?.items || []);
  }, []);

  const cartCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{ cartItems, cartCount, refreshCart, applyCartResponse }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};
