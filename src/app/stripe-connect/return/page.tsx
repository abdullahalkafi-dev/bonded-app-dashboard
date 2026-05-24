"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, isAuthenticated } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface StatusResponse {
  success: boolean;
  message: string;
  data: {
    connected: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    accountId: string | null;
    creatorVerificationStatus: string;
    payoutEligible: boolean;
  };
}

export default function StripeConnectReturnPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "error">("loading");
  const [message, setMessage] = useState("Verifying your Stripe Connect account...");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await apiClient<StatusResponse>("/stripe-connect/me/status");

        if (res.data.connected) {
          setStatus("success");
          setMessage("Your Stripe Connect account is fully set up! You can now receive payouts.");
        } else if (res.data.detailsSubmitted) {
          setStatus("pending");
          setMessage("Your account details have been submitted. Stripe is reviewing your information. This usually takes a few minutes.");
        } else {
          setStatus("pending");
          setMessage("Your Stripe Connect onboarding is not yet complete. Please complete the setup to receive payouts.");
        }
      } catch {
        setStatus("error");
        setMessage("Failed to verify your Stripe Connect status. Please try again.");
      }
    };

    checkStatus();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === "loading" && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
            {status === "success" && <CheckCircle2 className="h-12 w-12 text-green-500" />}
            {status === "pending" && <Loader2 className="h-12 w-12 text-yellow-500" />}
            {status === "error" && <XCircle className="h-12 w-12 text-destructive" />}
          </div>
          <CardTitle className="text-xl">
            {status === "loading" && "Verifying Account..."}
            {status === "success" && "Account Connected!"}
            {status === "pending" && "Account Under Review"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="flex flex-col gap-2">
            {status === "success" && (
              <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
            )}
            {status === "pending" && (
              <>
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Go to Dashboard
                </Button>
              </>
            )}
            {status === "error" && (
              <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
