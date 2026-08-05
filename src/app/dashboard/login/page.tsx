import Image from "next/image";
import Link from "next/link";

import { AdminLoginForm } from "@/components/forms/admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <Link
        href="/"
        className="absolute top-6 left-6 z-10 flex items-center sm:top-8 sm:left-8"
      >
        <Image
          src="/logo.svg"
          alt="hita"
          width={87}
          height={49}
          priority
          className="h-10 w-auto sm:h-12"
        />
      </Link>

      <div className="relative hidden lg:block">
        <Image
          src="/images/login_bg.webp"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
      </div>

      <div className="flex items-center justify-center px-6 pt-28 pb-12 sm:px-12 sm:pt-32 lg:py-12">
        <AdminLoginForm />
      </div>
    </div>
  );
}
