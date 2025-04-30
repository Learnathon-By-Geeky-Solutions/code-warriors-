// file: src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/basic/theme-provider";
import Header from "@/components/basic/header";
import Footer from "@/components/basic/footer";
import styles from "./styles/Layout.module.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ClientProvider from "../components/DiscordClientProvider";
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
        <ThemeProvider>
          <AuthProvider>
            <ClientProvider>
              <div className={styles.pageContainer}>
                <Header />
                <main className={`${styles.main} container mx-auto px-4 py-8`}>
                  {children}
                </main>
                <Footer />
              </div>
            </ClientProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
