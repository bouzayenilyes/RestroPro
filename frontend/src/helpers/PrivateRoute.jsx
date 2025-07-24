import { Navigate } from "react-router-dom";
import { isRestroUserAuthenticated } from "./AuthStatus";

const PrivateRoute = ({ children }) => {
  const restroAuthenticated = isRestroUserAuthenticated();

  if (!restroAuthenticated) return <Navigate to="/" replace />;
  return children;
};

export default PrivateRoute;
