// file:  src/components/auth/LogoutButton.tsx
import { useCallback } from "react";
import { keycloak } from "@/services/auth/keycloak";
import Cookies from "js-cookie";

export const LogoutButton = () => {
  const handleLogout = useCallback(() => {
    try {
      Cookies.remove("token");
      keycloak.logout();
    } catch (error) {
      console.error("Failed to logout", error);
    }
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
