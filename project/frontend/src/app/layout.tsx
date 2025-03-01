// file: src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import styles from "./styles/Layout.module.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MetaHive",
  description: "A dummy project with dark and light mode",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className={styles.pageContainer}>
          <main className={`${styles.main} container mx-auto px-4 py-8`}>
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
