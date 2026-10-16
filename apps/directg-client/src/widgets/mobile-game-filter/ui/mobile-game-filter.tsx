"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** 필터 그룹 표시 여부 (legacy `$aside[...]` 조건). false면 블록 숨김. */
export interface MobileGameFilterAside {
  /** 상품유형 블록 (product_type != accessories/holomodels). */
  productType?: boolean;
  /** 프로모션 체크박스 (aside.promotion != "false"). */
  promotion?: boolean;
  platform?: boolean;
  korean?: boolean;
  genre?: boolean;
  cost?: boolean;
}

interface FilterItem {
  name: string;
  value: string;
  label: string;
}

const GAME_TYPES: FilterItem[] = [
  { name: "game_type_basic", value: "basic", label: "기본게임" },
  { name: "game_type_edition", value: "edition", label: "에디션" },
  { name: "game_type_dlc", value: "dlc", label: "DLC" },
  { name: "game_type_music", value: "music", label: "사운드트랙" },
  { name: "game_type_bundle", value: "bundle", label: "번들" },
];

const PLATFORMS: FilterItem[] = [
  { name: "platform_1", value: "1", label: "Steam" },
  { name: "platform_34", value: "34", label: "Epic Games" },
  { name: "platform_35", value: "35", label: "Rockstar Games" },
];

const KOREAN: FilterItem[] = [
  { name: "interface_korean", value: "Y", label: "자막 한국어지원" },
  { name: "spoken_korean", value: "Y", label: "음성 한국어지원" },
  { name: "exclusive_korean", value: "Y", label: "독점 한국어지원" },
];

/** legacy game_filter 장르 순서(1~7, 10, 8, 9) verbatim. */
const GENRES: FilterItem[] = [
  { name: "genre_code_1", value: "G0001", label: "액션" },
  { name: "genre_code_2", value: "G0002", label: "어드벤처" },
  { name: "genre_code_3", value: "G0003", label: "RPG" },
  { name: "genre_code_4", value: "G0004", label: "전략" },
  { name: "genre_code_5", value: "G0005", label: "시뮬레이션" },
  { name: "genre_code_6", value: "G0006", label: "스포츠" },
  { name: "genre_code_7", value: "G0007", label: "캐주얼" },
  { name: "genre_code_10", value: "G0010", label: "레이싱" },
  { name: "genre_code_8", value: "G0008", label: "인디" },
  { name: "genre_code_9", value: "G0009", label: "앞서 해보기" },
];

/** search_label 칩 라벨 매핑 (legacy game_filter.html switch, default=value). */
const GENRE_LABELS: Record<string, string> = {
  G0001: "액션",
  G0002: "어드벤처",
  G0003: "RPG",
  G0004: "전략",
  G0005: "시뮬레이션",
  G0006: "스포츠",
  G0007: "캐주얼",
  G0010: "레이싱",
  G0008: "인디",
  G0009: "앞서 해보기",
};

const SORTS: FilterItem[] = [
  { name: "sort_1", value: "release", label: "출시일순" },
  { name: "sort_2", value: "name", label: "가나다순" },
  { name: "sort_3", value: "name_en", label: "ABC순" },
  { name: "sort_4", value: "pricedown", label: "낮은가격순" },
  { name: "sort_5", value: "priceup", label: "높은가격순" },
  { name: "sort_6", value: "discount", label: "높은할인율순" },
];

const nf = (value: number) => value.toLocaleString("ko-KR");

interface Chip {
  /** 대응 체크박스 id(= data-label-key), 예: genre_code_1. */
  key: string;
  /** 장르 코드값(G000X). */
  value: string;
}

interface MobileGameFilterProps {
  aside: MobileGameFilterAside;
  /** 총 결과 수(총 N개). */
  total: number;
  /** 뷰전환 링크 베이스 경로(예: `/promotion/promotion_ing`). */
  viewBasePath: string;
  /** 현재 뷰. */
  pageType: "thumb" | "list";
}

/**
 * 모바일 오프캔버스 필터 (legacy `mobile/inc/game_filter.html` + `footer_common.html` 필터 JS).
 * GET 폼 → router.push(1페이지 재조회). 옵션검색/정렬 offcanvas(Bootstrap), search_label 칩(×)·fade·reset.
 * 체크박스/라디오는 URL 반영(uncontrolled defaultChecked) + reset/칩은 imperative uncheck(legacy 동일).
 */
export function MobileGameFilter({ aside, total, viewBasePath, pageType }: MobileGameFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isChecked = (name: string, value: string) => searchParams.get(name) === value;
  const isSort = (value: string) => searchParams.get("sort") === value;

  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") ?? "");

  // 적용된 장르 필터 칩 (legacy $search_label[5]).
  const initialChips: Chip[] = GENRES.reduce<Chip[]>((acc, g) => {
    const v = searchParams.get(g.name);
    if (v) acc.push({ key: g.name, value: v });
    return acc;
  }, []);
  const [chips, setChips] = useState<Chip[]>(initialChips);

  const searchLabelRef = useRef<HTMLDivElement>(null);
  const searchOptionRef = useRef<HTMLDivElement>(null);
  const sortOptionRef = useRef<HTMLDivElement>(null);

  // legacy updateFade: search_label 가로 스크롤 위치별 mask 페이드.
  const updateFade = () => {
    const el = searchLabelRef.current;
    if (!el) return;
    const atStart = el.scrollLeft <= 5;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;
    let mask = "none";
    if (atStart && atEnd) mask = "none";
    else if (atStart) mask = "linear-gradient(to right, black calc(80%), transparent 95%)";
    else if (atEnd) mask = "linear-gradient(to left, black calc(80%), transparent 95%)";
    else mask = "linear-gradient(to right, transparent, black 10%, black 90%, transparent)";
    el.style.maskImage = mask;
    el.style.webkitMaskImage = mask;
  };

  useEffect(() => {
    updateFade();
    const el = searchLabelRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateFade);
    return () => el.removeEventListener("scroll", updateFade);
  }, [chips.length]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // legacy: 체크된 값만 수집(빈값 제외). page 미포함 → 1페이지.
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of fd.entries()) {
      const v = String(value);
      if (v) params.set(key, v);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // legacy option_reset: #search_option 체크/라디오 uncheck + number 비움 + 칩 제거(제출 안 함).
  const handleOptionReset = () => {
    const root = searchOptionRef.current;
    if (root) {
      root
        .querySelectorAll<HTMLInputElement>('input[type="checkbox"], input[type="radio"]')
        .forEach((i) => {
          i.checked = false;
        });
    }
    setMinPrice("");
    setMaxPrice("");
    setChips([]);
  };

  // legacy sort_reset: #sort_option 라디오 uncheck(제출 안 함).
  const handleSortReset = () => {
    const root = sortOptionRef.current;
    if (root) {
      root
        .querySelectorAll<HTMLInputElement>('input[type="checkbox"], input[type="radio"]')
        .forEach((i) => {
          i.checked = false;
        });
    }
  };

  // legacy .search-label img: #{key} uncheck + 칩 제거(제출 안 함).
  const removeChip = (key: string) => {
    const input = searchOptionRef.current?.querySelector<HTMLInputElement>(`#${key}`);
    if (input) input.checked = false;
    setChips((prev) => prev.filter((c) => c.key !== key));
  };

  const currentQs = searchParams.toString();

  const renderCheck = (item: FilterItem) => (
    <span key={item.name}>
      <input
        type="checkbox"
        className="btn-check"
        id={item.name}
        name={item.name}
        value={item.value}
        defaultChecked={isChecked(item.name, item.value)}
      />
      <label className="btn rounded-5 my-1" htmlFor={item.name}>
        {item.label}
      </label>
    </span>
  );

  return (
    <div className="section full">
      <form
        method="get"
        onSubmit={handleSubmit}
        className="d-flex flex-column mb-0 overflow-hidden"
        style={{ flex: 1 }}
      >
        <div className="wide-block pt-1 pb-1 px-2 d-flex justify-content-between" id="search_top">
          <div
            className="d-flex align-items-center font-12 overflow-auto flex-nowrap"
            id="search_label"
            ref={searchLabelRef}
          >
            {chips.map((chip) => (
              <span key={chip.key} className="search-label rounded-2 ms-1 flex-shrink-0">
                {" "}
                {GENRE_LABELS[chip.value] ?? chip.value}{" "}
                <img
                  src="/mobile-assets/images/icon/cancel.svg"
                  className="fs-1"
                  data-label-key={chip.key}
                  alt="삭제"
                  onClick={() => removeChip(chip.key)}
                />
              </span>
            ))}
          </div>

          <div className="d-flex align-items-center font-12 text-nowrap ms-1">
            <button
              type="button"
              className="btn btn-outline-clight text-dark option_btn fs-6"
              data-bs-toggle="offcanvas"
              data-bs-target="#search_option"
              aria-controls="search_option"
            >
              옵션 검색{" "}
              <img
                src="/mobile-assets/images/icon/gear.svg"
                style={{ marginLeft: "0.25rem" }}
                alt=""
              />
            </button>
          </div>

          <div
            className="offcanvas offcanvas-bottom"
            tabIndex={-1}
            id="search_option"
            aria-labelledby="offcanvasSearchLabel"
            data-bs-backdrop="true"
            ref={searchOptionRef}
          >
            <div className="offcanvas-header justify-content-center">
              <h5 className="offcanvas-title fw-500" id="offcanvasSearchLabel">
                옵션 검색
              </h5>
              <button
                type="button"
                className="btn-close position-absolute end-0 me-2"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <input type="hidden" name="idx" defaultValue={searchParams.get("idx") ?? ""} />
            <input type="hidden" name="q" defaultValue={searchParams.get("q") ?? ""} />
            <div className="offcanvas-body pt-2">
              <div className="mb-30">
                <div className="text-secondary fs-13">검색필터</div>
                <div className="">
                  {renderCheck({ name: "is_preorder", value: "Y", label: "예약구매" })}
                  {renderCheck({ name: "is_bonus", value: "Y", label: "특전" })}
                  {aside.promotion !== false &&
                    renderCheck({ name: "is_promotion", value: "Y", label: "프로모션" })}
                  {renderCheck({ name: "is_soldout", value: "Y", label: "품절상품 제외" })}
                </div>
              </div>

              {aside.productType !== false && (
                <div className="mb-30">
                  <div className="text-secondary fs-13 fw-500">상품유형</div>
                  <div className="">{GAME_TYPES.map(renderCheck)}</div>
                </div>
              )}

              {aside.platform !== false && (
                <div className="mb-30">
                  <div className="text-secondary fs-13 fw-500">플랫폼</div>
                  <div className="">
                    <input
                      type="hidden"
                      id="platform"
                      name="platform"
                      defaultValue={searchParams.get("platform") ?? ""}
                    />
                    {PLATFORMS.map(renderCheck)}
                  </div>
                </div>
              )}

              {aside.korean !== false && (
                <div className="mb-30">
                  <div className="text-secondary fs-13 fw-500">한국어지원</div>
                  <div className="">{KOREAN.map(renderCheck)}</div>
                </div>
              )}

              {aside.genre !== false && (
                <div className="mb-30">
                  <div className="text-secondary fs-13 fw-500">장르</div>
                  <div className="">
                    <input
                      type="hidden"
                      id="genre_code"
                      name="genre_code"
                      defaultValue={searchParams.get("genre_code") ?? ""}
                    />
                    {GENRES.map(renderCheck)}
                  </div>
                </div>
              )}

              {aside.cost !== false && (
                <div className="mb-3">
                  <div className="text-secondary fs-13 fw-500">가격</div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="position-relative">
                      <input
                        type="number"
                        className="form-control pe-5"
                        name="min_price"
                        id="min_price"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                      />
                      <span className="price_addon">원</span>
                    </div>
                    <span className="px-1 text-white">-</span>
                    <div className="position-relative">
                      <input
                        type="number"
                        className="form-control pe-5"
                        name="max_price"
                        id="max_price"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                      <span className="price_addon">원</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="offcanvas-tail d-flex pb-2 border-top border-light">
              <div className="me-1">
                <button
                  type="button"
                  className="btn btn-reset flex-column text-dark btn-outline-clight"
                  id="option_reset"
                  name="option_reset"
                  onClick={handleOptionReset}
                >
                  <img src="/mobile-assets/images/icon/rotate.svg" alt="" />
                  <span className="fs-6 text-nowrap">초기화</span>
                </button>
              </div>
              <div className="ms-1 w-100">
                <button type="submit" className="btn btn-cprimary form-control fs-4 border-0">
                  검색
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="wide-block pe-0">
          <div className="d-flex justify-content-between align-items-center font-12">
            <div className="d-flex justify-content-between">
              <span className="fs-6">총: {nf(total)} 개</span>
            </div>
            <div className="d-flex">
              <div
                className="d-flex align-self-center me-1"
                data-bs-toggle="offcanvas"
                data-bs-target="#sort_option"
                aria-controls="sort_option"
              >
                <span className="fs-6 pe-none">정렬</span>
                <img
                  src="/mobile-assets/images/icon/sort_icon.svg"
                  className="ms-1 pe-none"
                  style={{ width: "1rem" }}
                  alt=""
                />
              </div>
              <div
                className={`d-flex p-075r border-start border-light ${pageType === "list" ? "bg-clight" : ""}`}
              >
                <a href={`${viewBasePath}_list?${currentQs}`}>
                  <img
                    src="/mobile-assets/images/icon/list.svg"
                    className={pageType === "list" ? "svg-on" : "opacity-50"}
                    style={{ width: "1rem" }}
                    alt="목록형"
                  />
                </a>
              </div>
              <div
                className={`d-flex p-075r border-start border-light ${pageType === "thumb" ? "bg-clight" : ""}`}
              >
                <a href={`${viewBasePath}_thumb?${currentQs}`}>
                  <img
                    src="/mobile-assets/images/icon/thumb.svg"
                    className={pageType === "thumb" ? "svg-on" : "opacity-50"}
                    style={{ width: "1rem" }}
                    alt="썸네일형"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div
          className="offcanvas offcanvas-bottom"
          tabIndex={-1}
          id="sort_option"
          aria-labelledby="offcanvasSortLabel"
          ref={sortOptionRef}
        >
          <div className="offcanvas-header justify-content-center">
            <h5 className="offcanvas-title" id="offcanvasSortLabel">
              정렬
            </h5>
            <button
              type="button"
              className="btn-close position-absolute end-0 me-2"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body pt-2 position-relative">
            <span className="text-white">검색필터</span>
            <div className="mt-2">
              {SORTS.map((s) => (
                <div className="form-check" key={s.name}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sort"
                    id={s.name}
                    value={s.value}
                    defaultChecked={isSort(s.value)}
                  />
                  <label className="form-check-label w-100 bg-clight rounded-3" htmlFor={s.name}>
                    {s.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="offcanvas-tail d-flex pb-2 border-top border-light">
            <div className="me-1">
              <button
                type="button"
                className="btn btn-reset flex-column text-dark btn-outline-clight"
                id="sort_reset"
                name="sort_reset"
                onClick={handleSortReset}
              >
                <img src="/mobile-assets/images/icon/rotate.svg" alt="" />
                <span className="fs-6 text-nowrap">초기화</span>
              </button>
            </div>
            <div className="ms-1 w-100">
              <button type="submit" className="btn btn-cprimary form-control fs-4 border-0">
                검색
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
