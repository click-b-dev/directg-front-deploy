import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";

import { getSurvey } from "@entities/survey/api/get-survey";
import { MobileSurveyScreen } from "@screens/mobile-survey";

/** legacy mobile survey.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile survey.html head: title="설문조사", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "설문조사",
  description: "",
  keywords: "",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

export default async function MobileSurveyPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const idx = firstParam(sp.idx);
  const data = await getSurvey(idx);

  // legacy login_check: 비-미리보기 + 미로그인 → 로그인 페이지 redirect
  if (data.accessError === "login") {
    redirect("/member/login");
  }

  return <MobileSurveyScreen data={data} />;
}
