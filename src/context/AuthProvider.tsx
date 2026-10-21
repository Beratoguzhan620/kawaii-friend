import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

import { auth } from "../services";
import type { AuthUser } from "../services/types";

type AuthState = { user: AuthUser | null; ready: boolean };

const AuthContext = createContext<AuthState>({ user: null, ready: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, ready: false });

  useEffect(() => auth.onChange((user) => setState({ user, ready: true })), []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
