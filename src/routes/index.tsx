import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { TopNav } from "@/components/onboarding/TopNav";
import { Hero } from "@/components/onboarding/Hero";
import { HowItWorks } from "@/components/onboarding/HowItWorks";
import { Features } from "@/components/onboarding/Features";
import { SiteFooter } from "@/components/onboarding/SiteFooter";

export const Route = createFileRoute("/")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const { isConnected } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected) {
      try {
        localStorage.setItem("mv_onboarded", "true");
      } catch {}
      navigate({ to: "/dashboard" });
    }
  }, [isConnected, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <Hero />
      <section id="features"><HowItWorks /></section>
      <section id="strategies"><Features /></section>
      <SiteFooter />
    </div>
  );
}
