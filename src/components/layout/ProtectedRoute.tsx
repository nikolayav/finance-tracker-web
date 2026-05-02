import { Navigate } from "react-router-dom";
import { isAuthenticated, getToken } from "@/lib/auth";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  console.log("isAuthenticated:", isAuthenticated());
  console.log("token:", getToken());

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
