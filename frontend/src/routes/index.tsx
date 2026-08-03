import { createBrowserRouter } from "react-router-dom"

import MainLayout from "../components/layout/MainLayout"
import RequireAdmin from "../components/auth/RequireAdmin"
import RequireAuth from "../components/auth/RequireAuth"
import RequireContentManager from "../components/auth/RequireContentManager"
import RequireSuperAdmin from "../components/auth/RequireSuperAdmin"
import Home from "../pages/Home"
import DashboardPage from "../pages/DashboardPage"
import Login from "../pages/Login"
import RegisterPage from "../pages/RegisterPage"
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "../pages/auth/ResetPasswordPage"
import UsersAdminPage from "../pages/admin/UsersAdminPage"
import TiersAdminPage from "../pages/admin/TiersAdminPage"
import PostsPage from "../pages/posts/PostsPage"
import NewPostPage from "../pages/posts/NewPostPage"
import EditPostPage from "../pages/posts/EditPostPage"
import ProfilePage from "../pages/profile/ProfilePage"
import AccountSecurityPage from "../pages/profile/AccountSecurityPage"
import MessagesPage from "../pages/messages/MessagesPage"
import ArtistProfileEditPage from "../pages/artist/ArtistProfileEditPage"
import ArtistAssignmentPage from "../pages/artist/ArtistAssignmentPage"
import NotFound from "../pages/NotFound"

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
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
            path: "profile",
            element: <ProfilePage />,
          },
          {
            path: "profile/security",
            element: <AccountSecurityPage />,
          },
          {
            path: "messages",
            element: <MessagesPage />,
          },
          {
            element: <RequireAdmin />,
            children: [
              {
                path: "dashboard",
                element: <DashboardPage />,
              },
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
                path: "artist-profile/edit",
                element: <ArtistProfileEditPage />,
              },
            ],
          },
          {
            element: <RequireSuperAdmin />,
            children: [
              {
                path: "system/artist",
                element: <ArtistAssignmentPage />,
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
