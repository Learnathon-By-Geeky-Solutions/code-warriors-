// src/components/basic/MyComponent.tsx
import { useAuth } from "@/components/auth/AuthProvider";

export default function MyComponent() {
  const { isAuthenticated, user, token, error } = useAuth();

  if (error) {
    return <div>Error: {error}</div>;
  }

  return isAuthenticated ? (
    <div>
      <p>Welcome, {user?.preferred_username}</p>
      <p>Your token: {token}</p>
    </div>
  ) : (
    <div>Please log in</div>
  );
}
