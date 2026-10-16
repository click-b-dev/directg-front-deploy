"use client";

import { useSplide } from "@shared/lib/use-splide";

/**
 * legacy `#main_best` 혜택 캐러셀 (service.html splide3).
 * 옵션 verbatim: type loop / perPage 1 / pagination·arrows / rewind / gap 1.5em / padding{left:50,right:50}
 * / classes.pagination 커스텀. legacy는 `.mount(splide3.Extensions)`이나 Extensions=undefined → 확장 없이 마운트.
 */
const MAIN_BEST_OPTIONS = {
  type: "loop",
  perPage: 1,
  perMove: 1,
  pagination: true,
  arrows: true,
  rewind: true,
  rewindByDrag: true,
  gap: "1.5em",
  padding: { left: 50, right: 50 },
  classes: {
    pagination: "splide__pagination position-relative mb-2",
  },
};

export function MobileServiceBenefitCarousel() {
  const ref = useSplide<HTMLDivElement>(MAIN_BEST_OPTIONS);

  return (
    <div className="carousel-multiple splide" id="main_best" ref={ref}>
      <div className="splide__track">
        <div className="splide__list text-center">
          <div className="splide__slide section_item">
            <h4>정식 라이센스 계약</h4>
            <img src="/mobile-assets/images/service/02-00_license.png" />
            <p>
              다이렉트 게임즈는 모든 상품이 개발사 및 퍼블리셔와의 정식 계약을 통해 판매 중인 공식
              판매처입니다.{" "}
            </p>
            <a href="/game/game_list" className="btn_link">
              모든 게임 보러가기
            </a>
          </div>
          <div className="splide__slide section_item">
            <h4>프로모션과 이벤트</h4>
            <img src="/mobile-assets/images/service/02-01_promotion.png" />
            <p>
              상시 할인, 정기 주말 특가, 수많은 퍼블리셔가 참여하는 대규모 프로모션과 랜덤 박스,
              리워드 등 다양한 이벤트가 준비되어 있습니다.
            </p>
            <a href="/promotion/promotion_ing" className="btn_link">
              진행 중인 프로모션 확인하기
            </a>
          </div>
          <div className="splide__slide section_item">
            <h4>편리한 로그인</h4>
            <img src="/mobile-assets/images/service/02-02_login.png" />
            <p>
              이메일 주소 인증만으로 쉽고 빠른 회원가입과 네이버, 카카오 계정 간편 로그인 지원으로
              편의를 더합니다.
            </p>
            <a href="/member/join_step1" className="btn_link">
              다이렉트 게임즈 회원가입
            </a>
          </div>
          <div className="splide__slide section_item">
            <h4>원활한 소통</h4>
            <img src="/mobile-assets/images/service/02-03_communication.png" />
            <p>
              고객센터 및 공식 소셜미디어 운영으로 회원분들의 문의와 요청에 적극적인 대응을
              약속합니다.
            </p>
          </div>
          <div className="splide__slide section_item">
            <h4>실시간 코드 발송</h4>
            <img src="/mobile-assets/images/service/02-04_realtime.png" />
            <p>
              이메일, 문자를 기다릴 필요가 없습니다. PC 및 모바일에서 언제든지 구매한 제품 코드
              확인이 가능합니다.
            </p>
          </div>
          <div className="splide__slide section_item">
            <h4>다양한 결제 수단</h4>
            <img src="/mobile-assets/images/service/02-05_payment.png" />
            <p>
              신용카드, 휴대폰결제, 계좌이체와 같은 기본결제는 물론 네이버페이, 페이코 등의
              간편결제까지 선택의 폭이 넓습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
