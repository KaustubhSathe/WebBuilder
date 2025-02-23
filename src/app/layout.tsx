import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientLayout>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#2c2c2c",
                color: "#fff",
                border: "1px solid #3c3c3c",
              },
              loading: {
                iconTheme: {
                  primary: "#3B82F6",
                  secondary: "#2c2c2c",
                },
              },
            }}
          />
        </ClientLayout>
      </body>
    </html>
  );
}
