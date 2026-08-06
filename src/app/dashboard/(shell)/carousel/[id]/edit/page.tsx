"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { SlideForm } from "@/components/carousel/slide-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { APP_ROUTES } from "@/constants/routes";
import { useCarouselSlide } from "@/hooks/use-carousel-slide";

export default function EditSlidePage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { slide, isLoading, error } = useCarouselSlide(
    Number.isNaN(id) ? null : id,
  );

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
            <BreadcrumbPage>
              {isLoading ? "Loading…" : (slide?.title ?? "Slide not found")}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header>
        <h1 className="text-2xl font-black text-secondary sm:text-3xl">
          Edit Slide
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Changes go live as soon as you save.
        </p>
      </header>

      {error ? (
        <p
          role="alert"
          className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-40 animate-pulse bg-muted" />
          <div className="h-64 animate-pulse bg-muted" />
        </div>
      ) : slide ? (
        // key: remount with fresh state if the slide id changes.
        <SlideForm key={slide.id} slide={slide} />
      ) : null}
    </div>
  );
}
