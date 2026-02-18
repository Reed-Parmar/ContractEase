import { createBrowserRouter } from "react-router";
import UserLogin from "./pages/user-login";
import ClientLogin from "./pages/client-login";
import UserDashboard from "./pages/user-dashboard";
import ClientDashboard from "./pages/client-dashboard";
import CreateContract from "./pages/create-contract";
import SignContract from "./pages/sign-contract";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: UserLogin,
  },
  {
    path: "/user-login",
    Component: UserLogin,
  },
  {
    path: "/client-login",
    Component: ClientLogin,
  },
  {
    path: "/user-dashboard",
    Component: UserDashboard,
  },
  {
    path: "/client-dashboard",
    Component: ClientDashboard,
  },
  {
    path: "/create-contract",
    Component: CreateContract,
  },
  {
    path: "/sign-contract/:id",
    Component: SignContract,
  },
]);
