import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import type { AssetCodeOption, AssetListItem } from "@entities/asset";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

const PER_PAGE = 30;

const PUBLISHER: AssetCodeOption[] = [
  { code_id: "PUBL001", name: "Bandai Namco" },
  { code_id: "PUBL002", name: "Capcom" },
  { code_id: "PUBL003", name: "Nintendo" },
];
const PRODUCT_TYPE: AssetCodeOption[] = [
  { code_id: "PDTP001", name: "DLC" },
  { code_id: "PDTP002", name: "Game" },
];
const ASSET_TYPE: AssetCodeOption[] = [
  { code_id: "ASTP001", name: "Key" },
  { code_id: "ASTP002", name: "Keyless" },
];
const PLATFORM: AssetCodeOption[] = [
  { code_id: "PLFM001", name: "Steam" },
  { code_id: "PLFM002", name: "Switch" },
];

// legacy runAssetList content(실시간 API) + is_registered.
const ASSETS: AssetListItem[] = [
  {
    id: "A5001",
    title: "Zelda TOTK Standard",
    productType: "Game",
    assetType: "Key",
    platform: "Switch",
    publisher: "Nintendo",
    is_registered: true,
    regDt: "2026-07-20 10:00:00",
  },
  {
    id: "A5100",
    title: "Street Fighter 6 DLC Pack",
    productType: "DLC",
    assetType: "Keyless",
    platform: "Steam",
    publisher: "Capcom",
    is_registered: false,
    regDt: "2026-07-25 09:05:00",
  },
];

// legacy runReserveList content + settle_no/m_no 매핑(링크용).
const RESERVES = [
  {
    id: "RSV-0001",
    assetId: "A5001",
    title: "Zelda TOTK Standard",
    po: "DG20260727-0001",
    owner: "M/tester1",
    reserveDt: "2026-07-27 10:30:00",
    cancelled: false,
    cancelDt: "",
    canceller: "",
    settle_no: "STL-0001",
    m_no: "1001",
  },
  {
    id: "RSV-0002",
    assetId: "A5100",
    title: "Street Fighter 6 DLC Pack",
    po: "DG20260726-0009",
    owner: "M/tester2",
    reserveDt: "2026-07-26 18:00:00",
    cancelled: true,
    cancelDt: "2026-07-26 19:10:00",
    canceller: "admin",
    settle_no: "",
    m_no: "",
  },
];

// legacy getAssetDownloadList content(반품출고 로그). 정상/소진/삭제완료 혼합.
const DOWNLOADS = [
  {
    no: "3",
    po: "RETURN-0003",
    asset_id: "A5001",
    asset_name: "Zelda TOTK Standard",
    owner: "admin1",
    qty: "50",
    pin: "pin-3",
    downloadLimit: "5",
    download_date: "",
    expired_dt: "2026-08-03 10:00:00",
    reg_date: "2026-07-27 10:00:00",
    is_finish: "N",
    finish_date: "",
  },
  {
    no: "2",
    po: "RETURN-0002",
    asset_id: "A5100",
    asset_name: "Street Fighter 6 DLC Pack",
    owner: "admin2",
    qty: "30",
    pin: "pin-2",
    downloadLimit: "0",
    download_date: "2026-07-26 12:00:00",
    expired_dt: "2026-08-02 09:00:00",
    reg_date: "2026-07-26 09:00:00",
    is_finish: "N",
    finish_date: "",
  },
  {
    no: "1",
    po: "RETURN-0001",
    asset_id: "A5200",
    asset_name: "Elden Ring Deluxe",
    owner: "admin1",
    qty: "20",
    pin: "pin-1",
    downloadLimit: "3",
    download_date: "2026-07-25 15:00:00",
    expired_dt: "2026-08-01 14:00:00",
    reg_date: "2026-07-25 14:00:00",
    is_finish: "Y",
    finish_date: "2026-07-25 16:00:00",
  },
];

// legacy runAssetItemListFilter content(키). 미예약/예약(취소 가능)/활성 혼합.
const ASSET_ITEMS = [
  {
    id: "IT-0003",
    title: "Zelda TOTK Standard",
    regDt: "2026-07-27 10:00:00",
    owner: "",
    po: "",
    reserved: false,
    reserveDt: "",
    reserveId: "",
    activated: false,
    activatedDt: "",
    key: "ZELDA-XXXX-0003",
  },
  {
    id: "IT-0002",
    title: "Zelda TOTK Standard",
    regDt: "2026-07-26 12:00:00",
    owner: "M/tester2",
    po: "DG20260726-0002",
    reserved: true,
    reserveDt: "2026-07-26 13:00:00",
    reserveId: "RSV-2002",
    activated: false,
    activatedDt: "",
    key: "ZELDA-XXXX-0002",
  },
  {
    id: "IT-0001",
    title: "Zelda TOTK Standard",
    regDt: "2026-07-25 09:00:00",
    owner: "M/tester1",
    po: "DG20260725-0001",
    reserved: true,
    reserveDt: "2026-07-25 10:00:00",
    reserveId: "RSV-2001",
    activated: true,
    activatedDt: "2026-07-25 11:00:00",
    key: "ZELDA-XXXX-0001",
  },
];

export const assetHandlers = [
  // Asset 수정 진입 프리필(실시간 API 상세 + code_id 역매핑). 미존재 시 found=false.
  http.get(api("/admin/goods/asset/detail"), ({ request }) => {
    const url = new URL(request.url);
    const assetId = url.searchParams.get("asset_id") ?? "";
    const found = ASSETS.find((a) => a.id === assetId);
    if (!found) {
      return HttpResponse.json({
        asset_id: assetId,
        asset_name: "",
        productTypeCd: "",
        assetTypeCd: "",
        platformCd: "",
        publisherCd: "",
        found: false,
      });
    }
    const codeId = (opts: AssetCodeOption[], name: string) =>
      opts.find((o) => o.name === name)?.code_id ?? "";
    return HttpResponse.json({
      asset_id: found.id,
      asset_name: found.title,
      productTypeCd: codeId(PRODUCT_TYPE, found.productType),
      assetTypeCd: codeId(ASSET_TYPE, found.assetType),
      platformCd: codeId(PLATFORM, found.platform),
      publisherCd: codeId(PUBLISHER, found.publisher),
      found: true,
    });
  }),
  // Asset Item(키) 현황 + 컨텍스트 헤더(size 100).
  http.get(api("/admin/goods/asset/items"), ({ request }) => {
    const url = new URL(request.url);
    const assetId = url.searchParams.get("asset_id") ?? "";
    const asset = ASSETS.find((a) => a.id === assetId);
    return HttpResponse.json({
      asset_id: assetId,
      asset_name: asset?.title ?? "",
      platform: asset?.platform ?? "",
      publisher: asset?.publisher ?? "",
      content: ASSET_ITEMS,
      totalElements: ASSET_ITEMS.length,
      totalPages: 1,
    });
  }),
  // 예약(키 할당) 취소: mock은 성공 응답.
  http.post(api("/admin/goods/asset/reserve-cancel"), () => HttpResponse.json({ id: "1" })),
  // Asset 수정: mock은 성공 응답.
  http.post(api("/admin/goods/asset/modify"), async ({ request }) => {
    const body = (await request.json()) as { asset_id?: string; asset_name?: string };
    if (!body.asset_name) {
      return HttpResponse.json({ message: "이름 누락" });
    }
    return HttpResponse.json({ id: body.asset_id });
  }),
  // delete/keys/inventory: mock은 정적 — 성공 응답만(실제 Asset API 변경은 백엔드).
  http.post(api("/admin/goods/asset/delete"), () => HttpResponse.json({ message: "삭제 완료" })),
  http.post(api("/admin/goods/asset/keys"), async ({ request }) => {
    const body = (await request.json()) as { asset_item?: string };
    const count = (body.asset_item ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean).length;
    return HttpResponse.json({ count });
  }),
  http.post(api("/admin/goods/asset/inventory"), () => HttpResponse.json({ success: true })),
  // Asset 예약현황: owner M/ 보정·po→settle_no/m_no 매핑은 백엔드. mock은 필터 요약만.
  http.get(api("/admin/goods/asset/reserves"), ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const ordno = url.searchParams.get("ordno") ?? "";
    const owner = url.searchParams.get("owner") ?? "";
    const cancelled = url.searchParams.get("cancelled") ?? "all";

    let filtered = RESERVES;
    if (ordno) filtered = filtered.filter((r) => r.po === ordno);
    if (owner) filtered = filtered.filter((r) => r.owner.includes(owner));
    if (cancelled === "0") filtered = filtered.filter((r) => !r.cancelled);
    if (cancelled === "1") filtered = filtered.filter((r) => r.cancelled);

    const totalElements = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / PER_PAGE));
    const content = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    return HttpResponse.json({ content, totalElements, totalPages });
  }),
  // Asset 다운로드(반품출고) 목록.
  http.get(api("/admin/goods/asset/downloads"), ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const owner = url.searchParams.get("owner") ?? "";
    const filtered = owner ? DOWNLOADS.filter((d) => d.owner.includes(owner)) : DOWNLOADS;
    const totalElements = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / PER_PAGE));
    const content = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    return HttpResponse.json({ content, totalElements, totalPages });
  }),
  // 등록: mock은 성공 응답(신규 po). 실제 등록·재고검증은 백엔드.
  http.post(api("/admin/goods/asset/downloads"), async ({ request }) => {
    const body = (await request.json()) as { qty?: string };
    return HttpResponse.json({ po: "RETURN-9999", count: Number(body.qty) || 0 });
  }),
  // finish: mock은 성공 응답.
  http.post(api("/admin/goods/asset/downloads/finish"), () =>
    HttpResponse.json({ id: "1", count: 10 }),
  ),
];
