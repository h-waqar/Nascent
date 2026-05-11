import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="w-full">
      <h1
        className="font-bold uppercase mb-8"
        style={{
          fontSize: "28px",
          lineHeight: "1.2",
          letterSpacing: "-0.02em",
          color: "#000000",
        }}
      >
        Sign in
      </h1>
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#000000",
            colorBackground: "#FFFFFF",
            colorText: "#000000",
            colorTextSecondary: "#000000",
            colorInputBackground: "#FFFFFF",
            colorInputText: "#000000",
            borderRadius: "0px",
            fontFamily: "var(--font-inter)",
          },
          elements: {
            rootBox: "w-full",
            card: "bg-white shadow-none border-0 p-0 rounded-none",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            socialButtonsBlockButton:
              "border border-black rounded-none bg-white text-black hover:bg-black hover:text-white",
            formFieldInput:
              "border border-black rounded-none bg-white text-black focus:outline focus:outline-2 focus:outline-black focus:outline-offset-2",
            formButtonPrimary:
              "bg-black text-white border border-black rounded-none hover:bg-white hover:text-black uppercase tracking-wider",
            footerActionLink: "text-black underline hover:no-underline",
            footer: "hidden",
            dividerLine: "bg-black",
            dividerText: "text-black uppercase tracking-wider",
          },
          layout: {
            socialButtonsPlacement: "top",
            socialButtonsVariant: "blockButton",
            unsafe_disableDevelopmentModeWarnings: true,
          },
        }}
      />
    </div>
  );
}
