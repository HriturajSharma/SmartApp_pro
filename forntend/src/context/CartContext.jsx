
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getCart } from "../services/cart.service";

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

  const cartCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{ cartItems, cartCount, refreshCart }}
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
