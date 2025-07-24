import { Navigate } from "react-router-dom";
import { getUserDetailsInLocalStorage } from "./UserDetails";

const ScopeProtectedRoute = ({ children, scopes }) => {
  const user = getUserDetailsInLocalStorage();
  const role = user.role;
  
  if(role == "admin") {
    return children;
  }

  if(!scopes) {
    return children;
  }

  const userScopes = new String(user.scope).split(",");

  // check scopes
  const hasAccess = scopes?.some((scope)=>userScopes?.includes(scope));

  if(hasAccess) {
    return children;
  }

  return <Navigate to="/no-access" replace />;
};

export default ScopeProtectedRoute;
