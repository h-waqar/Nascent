import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AnimationWrapper } from "@/components/ui/AnimationWrapper";
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
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,0&display=swap"
          />
        </head>
        <body className="min-h-full flex flex-col selection:bg-black selection:text-white">
          <AnimationWrapper>{children}</AnimationWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
