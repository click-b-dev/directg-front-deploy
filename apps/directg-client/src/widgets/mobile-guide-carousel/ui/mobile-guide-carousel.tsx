"use client";

import type { ReactNode } from "react";

import { useSplide } from "@shared/lib/use-splide";

/** 이용가이드 캐러셀 슬라이드 1개 — legacy `li.splide__slide.p-2`(이미지 선택 + h3 + p.fs-6). */
export interface MobileGuideSlide {
  /** 슬라이드 이미지 URL(외부 CDN). 없으면 이미지 미출력(예: Steam step1). */
  img?: string;
  /** 이미지 alt/title(legacy는 두 속성 동일 값). */
  alt?: string;
  /** 이미지 클래스. 기본 `imaged w-100 square mb-2`(step5는 mb-4). */
  imgClassName?: string;
  heading: string;
  body: string;
}

/**
 * 모바일 이용가이드 캐러셀 — legacy `#carousel-slider.splide`(플랫폼 가이드 step 공통).
 * Splide 옵션 verbatim: type loop / perPage 1 / arrows false (grid gap은 perPage1이라 시각 무영향).
 * 슬라이드는 데이터 주도(img/alt/heading/body) — legacy 마크업(img→h3→p) 순서 유지.
 */
const OPTIONS = {
  type: "loop",
  perPage: 1,
  perMove: 1,
  arrows: false,
};

export function MobileGuideCarousel({ slides }: { slides: MobileGuideSlide[] }) {
  const ref = useSplide<HTMLDivElement>(OPTIONS);

  return (
    <div className="carousel-slider splide" id="carousel-slider" ref={ref}>
      <div className="splide__track">
        <ul className="splide__list">
          {slides.map((slide, index) => (
            <li className="splide__slide p-2" key={index}>
              {slide.img ? (
                <img
                  src={slide.img}
                  alt={slide.alt}
                  title={slide.alt}
                  className={slide.imgClassName ?? "imaged w-100 square mb-2"}
                />
              ) : null}
              <h3>{slide.heading}</h3>
              <p className="fs-6">{slide.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * 캐러셀 shell — 슬라이드에 인라인 마크업(링크/span/br/h2·h3 혼용)이 있어 데이터 주도로 표현 불가한 경우,
 * `li.splide__slide` JSX를 children으로 직접 주입한다(Epic/Rockstar 가이드). Splide 옵션은 위와 동일.
 * `ulClassName`으로 legacy `ul.splide__list`의 추가 클래스(예: `text-start`)를 지정한다.
 */
export function MobileGuideCarouselShell({
  children,
  ulClassName,
}: {
  children: ReactNode;
  ulClassName?: string;
}) {
  const ref = useSplide<HTMLDivElement>(OPTIONS);

  return (
    <div className="carousel-slider splide" id="carousel-slider" ref={ref}>
      <div className="splide__track">
        <ul className={`splide__list${ulClassName ? ` ${ulClassName}` : ""}`}>{children}</ul>
      </div>
    </div>
  );
}
