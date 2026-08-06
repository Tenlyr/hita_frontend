"use client";

import * as React from "react";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    // TODO: POST to a subscribe endpoint once one exists.
    toast.success("Thanks for subscribing.");
    setEmail("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full border border-white/25 focus-within:border-primary"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Enter your email address"
        className="h-14 min-w-0 flex-1 bg-transparent px-5 text-base text-white outline-none placeholder:text-white/50"
      />
      <button
        type="submit"
        className="h-14 shrink-0 cursor-pointer bg-primary px-6 text-base font-semibold text-white transition-colors hover:bg-primary/85 sm:px-8"
      >
        Subscribe
      </button>
    </form>
  );
}
