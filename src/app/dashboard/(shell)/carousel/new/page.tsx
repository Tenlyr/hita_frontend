"use client";

import Link from "next/link";

import { SlideForm } from "@/components/carousel/slide-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { RequiredMark } from "@/components/ui/required-mark";
import { APP_ROUTES } from "@/constants/routes";

export default function NewSlidePage() {
  return (
    <div className="w-full space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={APP_ROUTES.APP.DASHBOARD} />}>
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={APP_ROUTES.APP.CAROUSEL} />}>
              Carousel
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New slide</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header>
        <h1 className="text-2xl font-black text-secondary sm:text-3xl">
          Add Slide
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Build a hero slide. Fields marked <RequiredMark /> are required.
        </p>
      </header>

      <SlideForm />
    </div>
  );
}
