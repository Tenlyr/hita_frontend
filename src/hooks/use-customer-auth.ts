"use client";

import * as React from "react";

import { getApiErrorMessage } from "@/lib/api-error";
import { setCustomerSession } from "@/lib/auth";
import { authService } from "@/services/auth.service";

type Step = "phone" | "otp";

/** Drives the two-step customer phone login used by the auth dialog. */
export function useCustomerAuth() {
  const [step, setStep] = React.useState<Step>("phone");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  /** E.164 form returned by the API — what the verify call must send. */
  const [phoneNumber, setPhoneNumber] = React.useState("");

  const requestOtp = React.useCallback(async (rawPhone: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await authService.requestOtp(rawPhone);
      setPhoneNumber(result.phone_number);
      setStep("otp");
      return result;
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not send the code."));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const verifyOtp = React.useCallback(
    async (otp: string) => {
      setIsSubmitting(true);
      setError(null);
      try {
        const tokens = await authService.verifyOtp(phoneNumber, otp);
        setCustomerSession(tokens);
        return true;
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not verify the code."));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [phoneNumber],
  );

  const backToPhone = React.useCallback(() => {
    setStep("phone");
    setError(null);
  }, []);

  const reset = React.useCallback(() => {
    setStep("phone");
    setPhoneNumber("");
    setError(null);
    setIsSubmitting(false);
  }, []);

  return {
    step,
    phoneNumber,
    isSubmitting,
    error,
    clearError: () => setError(null),
    requestOtp,
    verifyOtp,
    backToPhone,
    reset,
  };
}
