import { apiClient } from "@shared/api/client";
import type { MainBanner } from "../model/types";

/** 메인 배너 목록. `GET /api/main/banners` (백엔드 부재 시 MSW mock). */
export async function getMainBanners(): Promise<MainBanner[]> {
  const { banners } = await apiClient.get<{ banners: MainBanner[] }>("main/banners");
  return banners;
}
