"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { keycloak } from "@/services/keycloak";
import { motion } from "framer-motion";
import { User, Key } from "lucide-react";
import FaceTrackingStats from "@/components/tracking/FaceTrackingStats";
import TrackingControls from "@/components/tracking/TrackingControls";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardChildProps {
  children: React.ReactNode;
}

function Card({ children, className = "" }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gray-800 shadow-lg rounded-lg overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

function CardHeader({ children }: CardChildProps) {
  return (
    <div className="bg-gray-700 p-6 border-b border-gray-600">{children}</div>
  );
}

function CardTitle({ children }: CardChildProps) {
  return (
    <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
      {children}
    </h2>
  );
}

function CardContent({ children }: CardChildProps) {
  return <div className="p-6">{children}</div>;
}

export default function ProfilePage() {
  const { isAuthenticated, user } = useAuth();
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const officeId = "5a9afb0a-af63-4413-bb95-25b981957c00";

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    const keycloakToken = keycloak.token;
    setToken(keycloakToken || "");
    setLoading(false);
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-10"
        >
          User Profile
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>
                <User size={24} /> User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Username</label>
                  <p className="text-lg font-medium">
                    {user?.preferred_username}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-lg font-medium">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Name</label>
                  <p className="text-lg font-medium">{user?.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">ID</label>
                  <p className="text-lg font-medium">{user?.sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Key size={24} /> Access Token
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 p-4 rounded-md">
                <pre className="whitespace-pre-wrap break-all text-sm text-gray-300 max-h-60 overflow-y-auto">
                  {token}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TrackingControls />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-4">
            User Tracking Dashboard
          </h1>
          <FaceTrackingStats officeId={officeId} />
        </div>
      </div>
    </div>
  );
}
