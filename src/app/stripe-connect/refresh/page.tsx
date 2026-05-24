"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, isAuthenticated } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from "lucide-react";

interface OnboardingResponse {
  success: boolean;
  message: string;
  data: {
    accountId: string;
    onboardingUrl: string;
    expiresAt: string;
  };
}

export default function StripeConnectRefreshPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "redirecting" | "error">("loading");
  const [message, setMessage] = useState("Refreshing your Stripe Connect onboarding link...");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const refreshLink = async () => {
      try {
        setStatus("loading");
        setMessage("Generating a new onboarding link...");

        const res = await apiClient<OnboardingResponse>("/stripe-connect/me", {
          method: "POST",
        });

        setStatus("redirecting");
        setMessage("Redirecting to Stripe...");

        window.location.href = res.data.onboardingUrl;
      } catch (err) {
        setStatus("error");
        setMessage(
          err instanceof Error
            ? err.message
            : "Failed to generate a new onboarding link. Please try again."
        );
      }
    };

    refreshLink();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {(status === "loading" || status === "redirecting") && (
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            )}
            {status === "error" && <XCircle className="h-12 w-12 text-destructive" />}
          </div>
          <CardTitle className="text-xl">
            {status === "loading" && "Refreshing Link..."}
            {status === "redirecting" && "Redirecting..."}
            {status === "error" && "Something Went Wrong"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">{message}</p>
          {status === "error" && (
            <div className="flex flex-col gap-2">
              <Button onClick={() => window.location.reload()}>Try Again</Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
