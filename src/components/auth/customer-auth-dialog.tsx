"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { OtpInput } from "@/components/auth/otp-input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SweepButton } from "@/components/ui/sweep-button";
import { APP_CONFIG } from "@/constants/config";
import { josefinSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useAuthDialogStore } from "@/store/auth-dialog.store";

const OTP_LENGTH = 6;
const PHONE_LENGTH = 10;

type Step = "phone" | "otp";

export function CustomerAuthDialog() {
  const isOpen = useAuthDialogStore((state) => state.isOpen);
  const setOpen = useAuthDialogStore((state) => state.setOpen);

  const [step, setStep] = React.useState<Step>("phone");
  const [phone, setPhone] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = React.useState(0);

  // Resend countdown, only while the OTP step is on screen.
  React.useEffect(() => {
    if (step !== "otp" || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, secondsLeft]);

  function reset() {
    setStep("phone");
    setPhone("");
    setOtp("");
    setError(null);
    setSecondsLeft(0);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    // Clear after the close animation so the form doesn't visibly reset.
    if (!next) setTimeout(reset, 200);
  }

  function handleSendOtp(event: React.FormEvent) {
    event.preventDefault();
    if (phone.length !== PHONE_LENGTH) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setError(null);
    setStep("otp");
    setSecondsLeft(APP_CONFIG.otpExpirySeconds);
    // TODO: POST /auth/otp/request once the endpoint exists.
  }

  function handleVerify(code: string = otp) {
    if (code.length !== OTP_LENGTH) {
      setError("Enter the 6-digit code.");
      return;
    }
    setError(null);
    // TODO: POST /auth/otp/verify once the endpoint exists.
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        // Portalled into <body>, so the storefront typeface is applied here
        // explicitly rather than inherited.
        className={cn(
          josefinSans.variable,
          "rounded-none p-0 font-sans sm:max-w-md",
        )}
      >
        <div className="flex flex-col items-center gap-2 border-b border-border px-6 pt-8 pb-6 text-center">
          <Image
            src="/logo.svg"
            alt="hita"
            width={87}
            height={49}
            className="h-10 w-auto"
          />
          <DialogTitle className="mt-2 text-xl font-black text-secondary">
            {step === "phone" ? "Sign in to continue" : "Verify your number"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {step === "phone"
              ? "Save favourites and track orders with your mobile number."
              : `We sent a ${OTP_LENGTH}-digit code to +91 ${phone}.`}
          </p>
        </div>

        <div className="px-6 pt-6 pb-8">
          {step === "phone" ? (
            <form onSubmit={handleSendOtp} noValidate className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="customer-phone" className="text-secondary">
                  Mobile number
                </Label>
                <div className="flex">
                  <span className="flex h-12 items-center border border-r-0 border-input px-3 text-sm text-muted-foreground">
                    +91
                  </span>
                  <Input
                    id="customer-phone"
                    type="tel"
                    inputMode="numeric"
                    autoFocus
                    autoComplete="tel-national"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(event) => {
                      setPhone(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, PHONE_LENGTH),
                      );
                      setError(null);
                    }}
                    aria-invalid={Boolean(error)}
                    className="h-12 rounded-none text-base"
                  />
                </div>
                {error ? (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                ) : null}
              </div>

              <SweepButton
                label="Send OTP"
                type="submit"
                color="sidebar"
                variant="filled"
                className="w-full"
              />

              <p className="text-center text-xs text-muted-foreground">
                By continuing you agree to our Terms and Privacy Policy.
              </p>
            </form>
          ) : (
            <div className="space-y-5">
              <OtpInput
                value={otp}
                onChange={(next) => {
                  setOtp(next);
                  setError(null);
                }}
                onComplete={handleVerify}
                hasError={Boolean(error)}
              />

              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <SweepButton
                label="Verify & Continue"
                onClick={() => handleVerify()}
                color="sidebar"
                variant="filled"
                className="w-full"
              />

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setOtp("");
                    setError(null);
                  }}
                  className="flex cursor-pointer items-center gap-1 text-muted-foreground transition-colors hover:text-secondary"
                >
                  <ArrowLeft className="size-4" />
                  Change number
                </button>

                {secondsLeft > 0 ? (
                  <span className="text-muted-foreground tabular-nums">
                    Resend in {secondsLeft}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSecondsLeft(APP_CONFIG.otpExpirySeconds)}
                    className="cursor-pointer font-semibold text-sidebar hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
