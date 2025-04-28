// src/app/signup/page.tsx
"use client";
import { useEffect } from "react";
import { keycloak } from "@/services/keycloak";

export default function SignupPage() {
  useEffect(() => {
    keycloak.register();
  }, []);

  return <div>Redirecting to signup...</div>;
}
