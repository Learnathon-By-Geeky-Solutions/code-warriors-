// src/components/auth/LoginButton.tsx
import { useCallback } from "react";
import { keycloak } from "@/services/keycloak";
import { colors } from "@/components/colors";
import { useTheme } from "next-themes";

export const LoginButton = () => {
  const { theme } = useTheme();
  const handleLogin = useCallback(() => {
    keycloak.login();
  }, []);

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2"
      style={{
        color:
          theme === "dark"
            ? colors.text.light.primary
            : colors.text.dark.primary,
        backgroundImage: `linear-gradient(to right, ${
          colors.primary[theme === "dark" ? "dark" : "light"]
        }, ${colors.secondary[theme === "dark" ? "dark" : "light"]})`,
      }}
    >
      Sign In
    </button>
  );
};
