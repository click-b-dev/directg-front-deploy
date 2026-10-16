import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";

import { getSurvey } from "@entities/survey/api/get-survey";
import { SurveyScreen } from "@screens/survey";

/** legacy `pc/event/survey.html` head. title="설문조사", description 빈값, author=H2interactive. */
export const metadata: Metadata = {
  title: "설문조사",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy survey.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

export default async function SurveyPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const idx = firstParam(sp.idx);

  const data = await getSurvey(idx);

  // legacy login_check: 비-미리보기 + 미로그인 → 로그인 페이지 redirect
  if (data.accessError === "login") {
    redirect("/member/login");
  }

  return <SurveyScreen data={data} />;
}
