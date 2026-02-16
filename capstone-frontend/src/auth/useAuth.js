import { useContext } from "react";
import { AuthContext } from "./AuthContextDef";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw Error("useAuth must be used within an AuthProvider");
  return context;
}
