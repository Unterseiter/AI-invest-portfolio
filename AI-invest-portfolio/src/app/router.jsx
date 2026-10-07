import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";

const Portfolio = lazy(() => import("@/pages/Portfolio"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Settings = lazy(() => import("@/pages/Settings"));

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/auth", element: <Auth /> },
    ],
  },
  {
    path: "/app",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="portfolio" replace /> },
          { path: "portfolio", element: <Portfolio /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
