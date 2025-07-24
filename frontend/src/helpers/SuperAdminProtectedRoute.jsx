import { Navigate } from "react-router-dom";
import { getUserDetailsInLocalStorage } from "./UserDetails";

const SuperAdminProtectedRoute = ({ children }) => {
  const user = getUserDetailsInLocalStorage();
  const role = user.role;
  
  if(role == "superadmin") {
    return children;
  }

  return <Navigate to="/no-access" replace />;
};

export default SuperAdminProtectedRoute;
