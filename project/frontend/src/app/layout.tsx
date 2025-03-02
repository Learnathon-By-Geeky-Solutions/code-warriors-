// file: src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import styles from "./styles/Layout.module.css";
import Header from "@/components/basic/header";
import Footer from "@/components/basic/footer";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/components/auth/AuthProvider";

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
        <ThemeProvider>
          <AuthProvider>
            <div className={styles.pageContainer}>
              <Header />
              <main className={`${styles.main} container mx-auto px-4 py-8`}>
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
