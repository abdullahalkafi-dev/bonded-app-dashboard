"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
} from "@/store/api/auth-api";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [forgotPassword, { isLoading: isSendingOtp }] = useForgotPasswordMutation();
  const [verifyResetOtp, { isLoading: isVerifyingOtp }] = useVerifyResetOtpMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    try {
      await forgotPassword({ email }).unwrap();
      toast.success("OTP sent to your email");
      setStep("otp");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send OTP";
      toast.error(message);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await verifyResetOtp({ email, otp }).unwrap();
      setResetToken(result.data.resetToken);
      toast.success("OTP verified");
      setStep("reset");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid OTP";
      toast.error(message);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    try {
      await resetPassword({ resetToken, newPassword }).unwrap();
      toast.success("Password reset successfully");
      router.push("/login");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reset password";
      toast.error(message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {step === "email" && "Forgot Password"}
            {step === "otp" && "Verify OTP"}
            {step === "reset" && "Reset Password"}
          </CardTitle>
          <CardDescription>
            {step === "email" && "Enter your email to receive a reset code"}
            {step === "otp" && "Enter the OTP sent to your email"}
            {step === "reset" && "Enter your new password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@bonded.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSendingOtp}>
                {isSendingOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full gap-2"
                onClick={() => router.push("/login")}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isVerifyingOtp}>
                {isVerifyingOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify OTP
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full gap-2"
                onClick={() => setStep("email")}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isResetting}>
                {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
