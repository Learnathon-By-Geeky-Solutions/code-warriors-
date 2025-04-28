// src/components/auth/LogoutButton.tsx
import { useCallback } from "react";
import { keycloak } from "@/services/keycloak";
import Cookies from "js-cookie";

export const LogoutButton = () => {
  const handleLogout = useCallback(() => {
    Cookies.remove("token");
    keycloak.logout();
  }, []);

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Sign Out
    </button>
  );
};
