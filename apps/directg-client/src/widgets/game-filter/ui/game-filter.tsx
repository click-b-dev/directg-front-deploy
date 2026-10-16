"use client";

import { useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** 필터 그룹 표시 여부 (legacy `$aside[...]` 조건). promotion_ing_thumb: promotion 숨김, 나머지 표시. */
export interface GameFilterAside {
  /** 상품유형 섹션 (product_type != accessories/holomodels). */
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

/** 가격 프리셋 (legacy promotion_ing_thumb $price_arr). msg는 span.won 마크업 재현. */
const PRICE_PRESETS = [
  { key: "1", min: 0, max: 5000, msg: <span className="won"> 5,000 미만</span> },
  {
    key: "2",
    min: 5000,
    max: 10000,
    msg: (
      <>
        <span className="won"> 5,000 이상</span> ~ <span className="won"> 10,000 미만</span>
      </>
    ),
  },
  {
    key: "3",
    min: 10000,
    max: 20000,
    msg: (
      <>
        <span className="won"> 10,000 이상</span> ~ <span className="won"> 20,000 미만</span>
      </>
    ),
  },
  {
    key: "4",
    min: 20000,
    max: 30000,
    msg: (
      <>
        <span className="won"> 20,000 이상</span> ~ <span className="won"> 30,000 미만</span>
      </>
    ),
  },
  {
    key: "5",
    min: 30000,
    max: 50000,
    msg: (
      <>
        <span className="won"> 30,000 이상</span> ~ <span className="won"> 50,000 미만</span>
      </>
    ),
  },
];

/**
 * 상품 필터 (legacy `inc/game_filter.html` + `goodsFilter()`). GET 파라미터 기반.
 * 검색 → 체크된 값만 searchParams 조립 → router.push(SSR 재조회). 정렬(sort)은 유지. 가격 프리셋/리셋 client.
 */
export function GameFilter({ aside }: { aside: GameFilterAside }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isChecked = (name: string, value: string) => searchParams.get(name) === value;
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") ?? "");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // legacy goodsFilter: 체크된 값만 수집(빈값 제외). page는 미포함 → 1페이지.
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of fd.entries()) {
      const v = String(value);
      if (v) {
        params.set(key, v);
      }
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    // legacy btn_reset: UI만 초기화(제출 안 함).
    setMinPrice("");
    setMaxPrice("");
  };

  const applyPreset = (min: number, max: number) => {
    setMinPrice(String(min));
    setMaxPrice(String(max));
  };

  const showTypeBlock = aside.productType !== false;

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
      <label className="btn btn-outline-secondary fs-5 rounded-5 my-2" htmlFor={item.name}>
        {item.label}
      </label>
    </span>
  );

  return (
    <div id="topbar" className="rounded-0 mb-3">
      <div className="d-flex flex-column flex-shrink-0 bg-table-dark border">
        <form method="get" onSubmit={handleSubmit}>
          {/* 유지용 hidden (legacy: category_code/q/idx/sort). category_code는 game_category/goods_category 컨텍스트 보존. */}
          <input
            type="hidden"
            id="category_code"
            name="category_code"
            defaultValue={searchParams.get("category_code") ?? ""}
          />
          <input type="hidden" name="q" defaultValue={searchParams.get("q") ?? ""} />
          <input type="hidden" name="idx" defaultValue={searchParams.get("idx") ?? ""} />
          <input type="hidden" name="sort" defaultValue={searchParams.get("sort") ?? ""} />

          <div className="d-flex ps-3">
            <div className="col-1 fw-bold fs-5 align-content-center">검색필터</div>
            <div className="col-11 fs-5 align-content-center filter d-flex justify-content-between">
              <div>
                {renderCheck({ name: "is_preorder", value: "Y", label: "예약구매" })}
                {renderCheck({ name: "is_bonus", value: "Y", label: "특전" })}
                {aside.promotion !== false &&
                  renderCheck({ name: "is_promotion", value: "Y", label: "프로모션" })}
                {renderCheck({ name: "is_soldout", value: "Y", label: "품절상품 제외" })}
              </div>
              <div className="me-4 d-flex align-items-center">
                <div className="me-4">
                  <button className="btn btn-lg btn-primary" type="submit" id="btn_filter">
                    검 색
                  </button>
                  <button
                    className="btn btn-lg btn-light"
                    type="button"
                    id="btn_reset"
                    onClick={handleReset}
                  >
                    <img src="/assets/images/icon/rotate.svg" />
                  </button>
                </div>
                <div
                  className="d-flex flex-column justify-content-center"
                  id="btn_filter_close"
                  data-bs-toggle="collapse"
                  role="button"
                  aria-expanded="true"
                  aria-controls="filter_body"
                >
                  <img
                    className="chevron chevron-top"
                    src="/assets/images/icon/bytesize_chevron-top.svg"
                  />
                  <img
                    className="chevron chevron-top"
                    src="/assets/images/icon/bytesize_chevron-top.svg"
                  />
                  <img
                    className="chevron chevron-down"
                    src="/assets/images/icon/bytesize_chevron-down.svg"
                  />
                </div>
              </div>
            </div>
          </div>

          <div id="filter_body" className="collapse show">
            {showTypeBlock && (
              <>
                <hr className="my-0 mx-3" />
                <div className="d-flex ps-3">
                  <div className="col-1 fw-bold fs-5 align-content-center">상품유형</div>
                  <div className="col-11 fs-5 align-content-center filter">
                    {GAME_TYPES.map(renderCheck)}
                  </div>
                </div>
              </>
            )}

            {aside.platform !== false && (
              <>
                <hr className="my-0 mx-3" />
                <div className="d-flex ps-3">
                  <div className="col-1 fw-bold fs-5 align-content-center">플랫폼</div>
                  <div className="col-11 fs-5 align-content-center filter">
                    <input
                      type="hidden"
                      id="platform"
                      name="platform"
                      defaultValue={searchParams.get("platform") ?? ""}
                    />
                    {PLATFORMS.map(renderCheck)}
                  </div>
                </div>
              </>
            )}

            {aside.korean !== false && (
              <>
                <hr className="my-0 mx-3" />
                <div className="d-flex ps-3">
                  <div className="col-1 fw-bold fs-5 align-content-center">한국어지원</div>
                  <div className="col-11 fs-5 align-content-center filter">
                    {KOREAN.map(renderCheck)}
                  </div>
                </div>
              </>
            )}

            {aside.genre !== false && (
              <>
                <hr className="my-0 mx-3" />
                <div className="d-flex ps-3">
                  <div className="col-1 fw-bold fs-5 align-content-center">장르</div>
                  <div className="col-11 fs-5 align-content-center filter">
                    <input
                      type="hidden"
                      id="genre_code"
                      name="genre_code"
                      defaultValue={searchParams.get("genre_code") ?? ""}
                    />
                    {GENRES.map(renderCheck)}
                  </div>
                </div>
              </>
            )}

            {aside.cost !== false && (
              <>
                <hr className="my-0 mx-3" />
                <div className="d-flex ps-3">
                  <div className="col-1 fw-bold fs-5 align-content-center">가격</div>
                  <div className="col-11 fs-5 align-content-center filter">
                    {PRICE_PRESETS.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        className="btn btn-outline-secondary fs-5 rounded-5 my-2"
                        id={`search_price_${p.key}`}
                        name="search_price"
                        value={p.key}
                        data-minprice={p.min}
                        data-maxprice={p.max}
                        onClick={() => applyPreset(p.min, p.max)}
                      >
                        {p.msg}
                      </button>
                    ))}
                    <div className="row my-3">
                      <div className="col-3">
                        <input
                          type="number"
                          className="form-control"
                          name="min_price"
                          id="min_price"
                          value={minPrice}
                          placeholder="직접입력"
                          autoComplete="off"
                          onChange={(e) => setMinPrice(e.target.value)}
                        />
                      </div>
                      ~
                      <div className="col-3">
                        <input
                          type="number"
                          className="form-control"
                          name="max_price"
                          id="max_price"
                          value={maxPrice}
                          placeholder="직접입력"
                          autoComplete="off"
                          onChange={(e) => setMaxPrice(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
