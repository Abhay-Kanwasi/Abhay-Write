import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: ReactNode;
  }
  
  function ProtectedRoute({ children }: ProtectedRouteProps) {
    const auth = JSON.parse(localStorage.getItem("auth") || '{}');
    return auth && auth.access ? <>{children}</> : <Navigate to="/login/" />;
  }
  
  export default ProtectedRoute;