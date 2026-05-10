import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nascent | Minimalist Scent Studio",
  description: "A high-end fragrance brand with a New Editorial aesthetic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
        variables: {
          colorPrimary: "#000000",
          colorText: "#000000",
          borderRadius: "0px",
        },
        elements: {
          card: "border border-black shadow-none",
          navbar: "hidden",
          footer: "hidden",
          formButtonPrimary: "bg-black hover:bg-black/90 rounded-none uppercase text-[11px] tracking-widest",
          formFieldInput: "border-black rounded-none focus:ring-0",
          dividerLine: "bg-black",
          dividerText: "text-black uppercase text-[10px]",
          socialButtonsBlockButton: "border border-black rounded-none",
          socialButtonsBlockButtonText: "text-black font-semibold",
          footerActionText: "text-black",
          footerActionLink: "text-black hover:underline font-bold",
        }
      }}
    >
      <html
        lang="en"
        className={`${inter.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col selection:bg-black selection:text-white">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
