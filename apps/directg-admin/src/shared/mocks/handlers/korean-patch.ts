import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// legacy korean_patch.php / korean_patch_auth.php — getKoreanPatchList. prefix_text=암호화 key.
// idx/encode_type는 legacy $patch_auth 맵과 정합(auth 드롭다운 data 속성용).
const KOREAN_PATCH_LIST = [
  { idx: 14, goods_nm: "PREY 한글패치", prefix_text: "PREY-H2-PROJECT:", encode_type: "md5" },
  {
    idx: 13,
    goods_nm: "PREY DLC1 한글패치",
    prefix_text: "PREY-DLC1-H2-PROJECT:",
    encode_type: "md5",
  },
  {
    idx: 15,
    goods_nm: "PREY 디럭스 한글패치",
    prefix_text: "PREY-DELUXE-H2-PROJECT:",
    encode_type: "md5",
  },
  { idx: 1, goods_nm: "DO2 한글패치", prefix_text: "DO2_H2->", encode_type: "base64" },
  {
    idx: 3,
    goods_nm: "DO2 DLC1 한글패치",
    prefix_text: "DO2_DLC_1-H2-PROJECT:",
    encode_type: "md5",
  },
  {
    idx: 9,
    goods_nm: "Wolfenstein 2 한글패치",
    prefix_text: "Wolfen2-H2-PROJECT:",
    encode_type: "md5",
  },
];

// legacy patchEncDataAdmin 대체 mock — base64는 실제 인코딩, 그 외(md5 등)는 결정적 pseudo-hash(32 hex).
const mockPatchPassword = (mId: string, prefix: string, encodeType: string) => {
  const raw = `${prefix}${mId}`;
  if (encodeType === "base64") {
    return btoa(unescape(encodeURIComponent(raw)));
  }
  let h = 2166136261 >>> 0;
  for (let i = 0; i < raw.length; i += 1) {
    h = Math.imul(h ^ raw.charCodeAt(i), 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, "0").repeat(4).slice(0, 32);
};

export const koreanPatchHandlers = [
  // legacy korean_patch.php — 한글패치 현황 목록.
  http.get(api("/admin/goods/korean-patches"), () =>
    HttpResponse.json({ items: KOREAN_PATCH_LIST }),
  ),

  // legacy korean_patch_auth.php — 인증 비밀번호 계산.
  http.get(api("/admin/goods/korean-patches/auth"), ({ request }) => {
    const url = new URL(request.url);
    const mId = url.searchParams.get("search_m_id") ?? "";
    const prefix = url.searchParams.get("prefix_text") ?? "";
    const encodeType = url.searchParams.get("encode_type") ?? "";
    return HttpResponse.json({ password: mockPatchPassword(mId, prefix, encodeType) });
  }),
];
