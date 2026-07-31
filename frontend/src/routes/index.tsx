import { createBrowserRouter } from "react-router-dom"

import MainLayout from "../components/layout/MainLayout"
import RequireAdmin from "../components/auth/RequireAdmin"
import RequireAuth from "../components/auth/RequireAuth"
import Home from "../pages/Home"
import Login from "../pages/Login"
import UsersAdminPage from "../pages/admin/UsersAdminPage"
import NotFound from "../pages/NotFound"

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <RequireAdmin />,
            children: [
              {
                path: "users",
                element: <UsersAdminPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
])

export default router
