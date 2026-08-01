import { createBrowserRouter } from "react-router-dom"

import MainLayout from "../components/layout/MainLayout"
import RequireAdmin from "../components/auth/RequireAdmin"
import RequireAuth from "../components/auth/RequireAuth"
import RequireContentManager from "../components/auth/RequireContentManager"
import Home from "../pages/Home"
import Login from "../pages/Login"
import UsersAdminPage from "../pages/admin/UsersAdminPage"
import TiersAdminPage from "../pages/admin/TiersAdminPage"
import PostsPage from "../pages/posts/PostsPage"
import NewPostPage from "../pages/posts/NewPostPage"
import EditPostPage from "../pages/posts/EditPostPage"
import ProfilePage from "../pages/profile/ProfilePage"
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
              {
                path: "tiers",
                element: <TiersAdminPage />,
              },
            ],
          },
          {
            element: <RequireContentManager />,
            children: [
              {
                path: "posts",
                element: <PostsPage />,
              },
              {
                path: "posts/new",
                element: <NewPostPage />,
              },
              {
                path: "posts/:id/edit",
                element: <EditPostPage />,
              },
              {
                path: "profile",
                element: <ProfilePage />,
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
