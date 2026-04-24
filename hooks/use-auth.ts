"use client";

import { useContext } from "react";
import { AuthContext } from "@/providers/auth-provider";

// This is just a re-export for convenience
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export AuthContext for direct access if needed
export { AuthContext };
