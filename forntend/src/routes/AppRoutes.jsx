import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ProtectedRoute from "../components/common/ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";
import AddProduct from "../pages/admin/AddProduct";
import Dashboard from "../pages/admin/Dashboard";
import EditProduct from "../pages/admin/EditProduct";
import ManageBanners from "../pages/admin/ManageBanners";
import ManageCategories from "../pages/admin/ManageCategories";
import ManageOrders from "../pages/admin/ManageOrders";
import ManageProducts from "../pages/admin/ManageProducts";
import NotFound from "../pages/NotFound";
import Cart from "../pages/public/Cart";
import Checkout from "../pages/public/Checkout";
import Home from "../pages/public/Home";
import Login from "../pages/public/Login";
import ProductDetails from "../pages/public/ProductDetails";
import Products from "../pages/public/Products";
import Register from "../pages/public/Register";
import TrackOrder from "../pages/public/TrackOrder";
import MyOrders from "../pages/user/MyOrders";
import OrderDetails from "../pages/user/OrderDetails";
import Profile from "../pages/user/Profile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      // Public pages
      {
        index: true,
        element: <Home />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "products/:id",
        element: <ProductDetails />,
      },
      {
        path: "cart",
        element: (
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        ),
      },
      {
        path: "checkout",
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-orders/:id",
        element: (
          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "track-order",
        element: <TrackOrder />,
      },
      {
    path: "login",
    element: <Login />
},
      {
    path: "register",
    element: <Register />
},

      // Customer pages
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-orders",
        element: (
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/orders/:id",
        element: (
          <ProtectedRoute adminOnly>
            <OrderDetails />
          </ProtectedRoute>
        ),
      },

      // Admin pages (we'll add AdminLayout and protection later)
      {
        path: "admin",
        element: (
          <ProtectedRoute adminOnly>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/products",
        element: (
          <ProtectedRoute adminOnly>
            <ManageProducts />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/products/add",
        element: (
          <ProtectedRoute adminOnly>
            <AddProduct />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/products/edit/:id",
        element: (
          <ProtectedRoute adminOnly>
            <EditProduct />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/categories",
        element: (
          <ProtectedRoute adminOnly>
            <ManageCategories />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/banners",
        element: (
          <ProtectedRoute adminOnly>
            <ManageBanners />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/orders",
        element: (
          <ProtectedRoute adminOnly>
            <ManageOrders />
          </ProtectedRoute>
        ),
      },

      // 404 page
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
