// file: src/app/page.tsx

"use client";

import Link from "next/link";
import styles from "./styles/Home.module.css";
import { colors } from "@/components/theme/colors";
import { useTheme } from "next-themes";
import { Globe2, Users, Gamepad2, Boxes } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const { theme } = useTheme();

  const features = [
    {
      icon: <Globe2 size={24} />,
      title: "Virtual Workspace",
      description:
        "Immersive 3D environment that makes remote work feel natural and engaging.",
    },
    {
      icon: <Users size={24} />,
      title: "Social Integration",
      description:
        "Seamless collaboration tools that foster genuine connections between team members.",
    },
    {
      icon: <Gamepad2 size={24} />,
      title: "Gamified Experience",
      description:
        "Engaging game design principles that make work more enjoyable and productive.",
    },
    {
      icon: <Boxes size={24} />,
      title: "Productivity Tools",
      description:
        "Integrated suite of tools designed for maximum efficiency and collaboration.",
    },
  ];

  return <div>Hello World</div>;
}
