import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.tsx";
import Login from "../pages/login/Login.tsx";
import Register from "../pages/register/Register.tsx";
import Dashboard from "../pages/dashboard/Dashboard.tsx";
import VerifyAccount from "../pages/verifyAccount/VerifyAccount.tsx";
import ForgotPassword from "../pages/forgotPassword/ForgetPasswrod.tsx";
import Logging from "../components/logging/Logging.tsx";

const routes = [
  { path: "/", component: <Dashboard />, protected: true },
  { path: "/login", component: <Login />, protected: false },
  { path: "/register", component: <Register />, protected: false },
  { path: "/activate/:email", component: <VerifyAccount />, protected: false },
  { path: "/forgot-password", component: <ForgotPassword />, protected: false },
  { path: "/logging", component: <Logging />, protected: true}
];

function AppRoutes() {
  return (
    <Routes>
      {routes.map(({ path, component, protected: isProtected }) => (
        <Route
          key={path}
          path={path}
          element={isProtected ? <ProtectedRoute>{component}</ProtectedRoute> : component}
        />
      ))}
    </Routes>
  );
}

export default AppRoutes;