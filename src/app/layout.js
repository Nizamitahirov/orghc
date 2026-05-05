// src/app/layout.js - Updated with i18n support
import "./globals.css";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { Poppins } from "next/font/google";
import { AuthProvider } from '@/auth/AuthContext';
import { ReduxProvider } from '@/components/providers/ReduxProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToastProvider } from '../components/common/Toast';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

export const metadata = {
  title: "My Almet",
  description: "Human Resource Information System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <ReduxProvider>
          <QueryProvider>
            <LanguageProvider>
              <AuthProvider>
                <ThemeProvider>
                  <ToastProvider>
                    <ErrorBoundary>
                      {children}
                    </ErrorBoundary>
                  </ToastProvider>
                </ThemeProvider>
              </AuthProvider>
            </LanguageProvider>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
