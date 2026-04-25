import {authContext} from "../auth.context.jsx";
import {useContext} from "react";
import { Navigate } from "react-router";
export const Protected = ({ children }) => {
  const { user, loading } = useContext(authContext);

  if (loading) {    
    return (
      <main>
        <h1>Loading.......</h1>
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate to={"/login"} replace={true} />
    );
  }

  return children;
};