import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { SlideDraft, SlideImageDrafts } from "@/types/admin.carousel.types";
import type { CarouselSlide, CarouselSlideList } from "@/types/carousel.types";

/** Draft -> the JSON half of the multipart body. */
function toPayload(draft: SlideDraft) {
  return JSON.stringify({
    title: draft.title.trim(),
    overlay_opacity: draft.overlay_opacity,
    image_focus: draft.image_focus,
    // `localPreview` and `src_url` are render-only; the server owns `src`.
    blocks: draft.blocks.map(({ localPreview, src_url, ...block }) => {
      void localPreview;
      void src_url;
      return block;
    }),
    is_active: draft.is_active,
  });
}

/**
 * Images travel as their own multipart parts — a File cannot be nested inside
 * JSON — and `cleared` names the ones to blank out server-side.
 */
function toFormData(
  draft: SlideDraft,
  images: SlideImageDrafts,
  blockFiles: Record<string, File> = {},
): FormData {
  const form = new FormData();
  form.append("payload", toPayload(draft));

  // Image layers: one part per block, named after it, since the count is not
  // known in advance and a File cannot live inside the blocks JSON.
  for (const [blockId, file] of Object.entries(blockFiles)) {
    form.append(`block_image_${blockId}`, file);
  }

  const cleared: string[] = [];
  for (const [breakpoint, image] of Object.entries(images)) {
    const field = `image_${breakpoint}`;
    if (image.file) {
      form.append(field, image.file);
    } else if (image.cleared) {
      cleared.push(field);
    }
  }
  if (cleared.length > 0) form.append("cleared", cleared.join(","));

  return form;
}

export const carouselService = {
  /** GET /carousel — active slides for the storefront hero. */
  async listPublic(): Promise<CarouselSlideList> {
    const { data } = await api.get<ApiResponse<CarouselSlideList>>("/carousel");
    return data.data;
  },

  /** GET /admin/carousel — every slide, drafts included. */
  async list(): Promise<CarouselSlideList> {
    const { data } =
      await api.get<ApiResponse<CarouselSlideList>>("/admin/carousel");
    return data.data;
  },

  async get(id: number): Promise<CarouselSlide> {
    const { data } = await api.get<ApiResponse<CarouselSlide>>(
      `/admin/carousel/${id}`,
    );
    return data.data;
  },

  async create(
    draft: SlideDraft,
    images: SlideImageDrafts,
    blockFiles?: Record<string, File>,
  ): Promise<CarouselSlide> {
    const { data } = await api.post<ApiResponse<CarouselSlide>>(
      "/admin/carousel",
      toFormData(draft, images, blockFiles),
      // Let the browser set the multipart boundary; a hand-written header
      // omits it and the server parses nothing.
      { headers: { "Content-Type": undefined } },
    );
    return data.data;
  },

  async update(
    id: number,
    draft: SlideDraft,
    images: SlideImageDrafts,
    blockFiles?: Record<string, File>,
  ): Promise<CarouselSlide> {
    const { data } = await api.put<ApiResponse<CarouselSlide>>(
      `/admin/carousel/${id}`,
      toFormData(draft, images, blockFiles),
      { headers: { "Content-Type": undefined } },
    );
    return data.data;
  },

  async reorder(ids: number[]): Promise<CarouselSlideList> {
    const { data } = await api.post<ApiResponse<CarouselSlideList>>(
      "/admin/carousel/reorder",
      { ids },
    );
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/admin/carousel/${id}`);
  },
};
