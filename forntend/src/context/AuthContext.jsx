import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState
} from "react";

import {
    getCurrentUser,
    loginUser,
    logoutUser,
    registerUser
} from "../services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem("user");
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    });
    const [authLoading, setAuthLoading] = useState(true);

    const updateUser = useCallback((nextUser) => {
        setUser(nextUser);
        if (nextUser) {
            localStorage.setItem("user", JSON.stringify(nextUser));
        } else {
            localStorage.removeItem("user");
        }
    }, []);

    // Check existing login session
    const checkAuth = useCallback(async () => {
        try {
            const response = await getCurrentUser();
            updateUser(response.user || null);
        } catch (error) {
            updateUser(null);

            if (error.response?.status !== 401) {
                console.error("Authentication check failed:", error);
            }
        } finally {
            setAuthLoading(false);
        }
    }, [updateUser]);

    // Login
    const login = async (credentials) => {
        const response = await loginUser(credentials);
        updateUser(response.user || null);
        return response;
    };

    // Register
    const register = async (userData) => {
        const response = await registerUser(userData);
        updateUser(response.user || null);
        return response;
    };

    // Logout
    const logout = async () => {
        try {
            await logoutUser();
        } finally {
            updateUser(null);
        }
    };

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const isAuthenticated = Boolean(user);
    const isAdmin = user?.role === "admin";

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                login,
                register,
                logout,
                checkAuth,
                authLoading,
                isAuthenticated,
                isAdmin
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
};
