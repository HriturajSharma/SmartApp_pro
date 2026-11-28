import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
    addToCart as addToServerCart,
    getCart,
    removeCartItem as removeServerCartItem,
    updateCartItem as updateServerCartItem,
} from "../services/cart.service";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const loginRequiredError = () => {
    const error = new Error("Please log in before adding items to your cart.");
    error.code = "LOGIN_REQUIRED";
    return error;
};

export const CartProvider = ({ children }) => {
    const { user, authLoading } = useAuth();
    const userId = user?._id || user?.id || null;
    const ownerId = userId ? String(userId) : null;
    const [storedCart, setStoredCart] = useState({ ownerId: null, items: [] });
    const [syncedUserId, setSyncedUserId] = useState(undefined);
    const cartItems = storedCart.ownerId === ownerId ? storedCart.items : [];
    const cartReady = !authLoading && (!userId || syncedUserId === ownerId);

    const refreshCart = useCallback(async () => {
        if (authLoading || !userId) return;

        try {
            const response = await getCart();
            setStoredCart({ ownerId, items: response.cart?.items || [] });
        } catch (error) {
            if (error.response?.status === 401) {
                setStoredCart({ ownerId, items: [] });
                return;
            }
            console.error("Failed to refresh cart:", error);
        }
    }, [authLoading, ownerId, userId]);

    useEffect(() => {
        if (authLoading) return undefined;

        let active = true;
        if (!userId) {
            // Remove data saved by the earlier guest-cart behavior.
            localStorage.removeItem("guestCart");
            return () => {
                active = false;
            };
        }

        getCart()
            .then((response) => {
                if (active) setStoredCart({ ownerId, items: response.cart?.items || [] });
            })
            .catch((error) => {
                if (error.response?.status !== 401) {
                    console.error("Failed to load cart:", error);
                }
                if (active) setStoredCart({ ownerId, items: [] });
            })
            .finally(() => {
                if (active) setSyncedUserId(ownerId);
            });

        return () => {
            active = false;
        };
    }, [authLoading, ownerId, userId]);

    const applyCartResponse = useCallback((response) => {
        setStoredCart({ ownerId, items: response?.cart?.items || [] });
    }, [ownerId]);

    const addItem = useCallback(async (product, quantity = 1) => {
        if (!userId || authLoading) throw loginRequiredError();
        const productId = typeof product === "object" ? product?._id || product?.id : product;
        if (!productId) throw new Error("A product is required to add to cart.");

        const response = await addToServerCart(productId, quantity);
        setStoredCart({ ownerId, items: response.cart?.items || [] });
        return response;
    }, [authLoading, ownerId, userId]);

    const setItemQuantity = useCallback(async (productId, quantity) => {
        if (!userId || authLoading) throw loginRequiredError();
        const response = quantity < 1
            ? await removeServerCartItem(productId)
            : await updateServerCartItem(productId, quantity);
        setStoredCart({ ownerId, items: response.cart?.items || [] });
        return response;
    }, [authLoading, ownerId, userId]);

    const removeItem = useCallback(async (productId) => {
        return setItemQuantity(productId, 0);
    }, [setItemQuantity]);

    const cartCount = cartItems.reduce(
        (total, item) => total + (item.quantity || 0),
        0
    );

    return (
        <CartContext.Provider
            value={{ cartItems, cartCount, cartReady, refreshCart, applyCartResponse, addItem, setItemQuantity, removeItem }}
        >
            {children}
        </CartContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart must be used inside CartProvider");
    }

    return context;
};