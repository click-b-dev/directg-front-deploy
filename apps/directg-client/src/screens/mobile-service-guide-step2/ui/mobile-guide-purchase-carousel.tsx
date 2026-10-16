"use client";

import { useSplide } from "@shared/lib/use-splide";

/**
 * legacy `#carousel-slider` 구매방법 캐러셀 (guide_step2.html).
 * 옵션 verbatim: type loop / perPage 1 / perMove 1 / arrows false (pagination 기본 true).
 * grid 옵션은 legacy Extensions=undefined로 미적용 → 1장씩 loop + pagination.
 * 슬라이드 9개(7단계, step3·step6 각 2분할), 이미지 외부 CDN, 텍스트 오타 verbatim.
 */
const OPTIONS = {
  type: "loop",
  perPage: 1,
  perMove: 1,
  arrows: false,
};

export function MobileGuidePurchaseCarousel() {
  const ref = useSplide<HTMLDivElement>(OPTIONS);

  return (
    <div className="carousel-slider splide" id="carousel-slider" ref={ref}>
      <div className="splide__track">
        <ul className="splide__list">
          <li className="splide__slide p-2">
            <div className="">
              <h3>1. 상품 선택</h3>
              <p className="fs-6 text-start">
                다이렉트 게임즈에서 원하는 상품의 이미지를 터치하여 상세 페이지로 이동합니다.
                <br /> (또는<span className="text-warning fs-6"> `장바구니 담기`</span> 버튼을
                터치하여 바로 장바구니에 담아 주문을 진행할 수 있습니다.)
              </p>
              <img
                src="https://image.directg.net/upload/ezwel/guide/pc/M_KR_Guide_DG_order_A_01.jpg"
                className="imaged w-100 square mb-2"
              />
            </div>
          </li>
          <li className="splide__slide p-2">
            <h3 className="">2. 장바구니 담기</h3>
            <p className="fs-6 text-start">
              가격, 시스템 요구사항 등의 상품 정보와 유의사항을 확인하고,{" "}
              <span className="text-warning fs-6">`장바구니 담기`</span> 버튼을 클릭하여 상품을
              장바구니에 담습니다. 장바구니에 정상적으로 담겼으면, 알림 메시지를 확인할 수 있습니다.{" "}
              <span className="text-warning fs-6">`장바구니로 이동`</span>을 터치하여 다은 단계로
              이동합니다.
            </p>
            <img
              src="https://image.directg.net/upload/ezwel/guide/pc/M_KR_Guide_DG_order_A_02.jpg"
              className="imaged w-100 square mb-2"
            />
          </li>
          <li className="splide__slide p-2">
            <h3 className="">3.주문하기</h3>
            <p className="fs-6 text-start">
              주문하실 상품목록을 확인 후, <span className="text-warning fs-6">`주문하기``</span>{" "}
              버튼을 터치하여 결제 페이지로 이동하여 주문정보를 확인 후,
            </p>
            <img
              src="https://image.directg.net/upload/ezwel/guide/pc/M_KR_Guide_DG_order_A_03a.jpg"
              className="imaged w-100 square mb-2"
            />
          </li>
          <li className="splide__slide p-2">
            <h3 className="">3.주문하기</h3>
            <p className="fs-6 text-start">
              <span className="text-warning fs-6">`결제하기`</span> 버튼을 터치하여 다음 단계로
              이동합니다. <br />
              (기입하신 이메일주소로 주문내역서가 발송됩니다. 가급적 올바른 이메일주소를 기입해
              주시기 바랍니다.)
            </p>
            <img
              src="https://image.directg.net/upload/ezwel/guide/pc/M_KR_Guide_DG_order_A_03b.jpg"
              className="imaged w-100 square mb-2"
            />
          </li>
          <li className="splide__slide p-2">
            <h3 className="">4.결제하기</h3>
            <p className="fs-6 text-start">
              상품명, 상품금액, 결제금액, 결제수단 등의 정보를 꼼꼼히 확인 후, 페이지 하단에
              결제하기 버튼을 터치해 결제를 완료합니다.
            </p>
            <img
              src="https://image.directg.net/upload/ezwel/guide/pc/M_KR_Guide_DG_order_A_04.jpg"
              className="imaged w-100 square mb-2"
            />
          </li>
          <li className="splide__slide p-2">
            <h3 className="">5.주문완료</h3>
            <p className="fs-6 text-start">
              주문이 완료되었습니다! <span className="text-warning fs-6">`주문내역 확인하기`</span>
              를 터치하여 다음 담계로 이동합니다. <br />
              (주문하신 제품 코드(키)는{" "}
              <span className="text-warning fs-6">
                `마이페이지` → `주문완료 내역` → `주문내역 상세보기`
              </span>
              를 통해서도 확인이 가능합니다.)
            </p>
            <img
              src="https://image.directg.net/upload/ezwel/guide/pc/M_KR_Guide_DG_order_A_05.jpg"
              className="imaged w-100 square mb-2"
            />
          </li>
          <li className="splide__slide p-2">
            <h3 className="">6.제품 코드(키) 활성화 및 수취확인</h3>
            <p className="fs-6 text-start">
              <span className="text-warning fs-6">`주문내역 상세보기`</span>에서{" "}
              <span className="text-warning fs-6">`수취확인` </span>버튼을 클릭하고 주의사항과
              환불정책을 확인합니다.
            </p>
            <img
              src="https://image.directg.net/upload/ezwel/guide/pc/M_KR_Guide_DG_order_A_06a.jpg?1"
              className="imaged w-100 square mb-2"
            />
          </li>
          <li className="splide__slide p-2">
            <h3 className="">6.제품 코드(키) 활성화 및 수취확인</h3>
            <p className="fs-6 text-start">
              {" "}
              내용을 충분히 숙지하신 후, <span className="text-warning fs-6">`수취확인`</span>{" "}
              버튼을 클릭하여 제품 코드를 수취합니다.{" "}
            </p>
            <img
              src="https://image.directg.net/upload/ezwel/guide/pc/M_KR_Guide_DG_order_A_06b.jpg?1"
              className="imaged w-100 square mb-2"
            />
          </li>
          <li className="splide__slide p-2">
            <h3 className="">7.제품 코드(키) 활성화 및 수취확인</h3>
            <p className="fs-6 text-start">
              활성화가 성공적으로 완료되면, <span className="text-warning fs-6">`코드확인`</span>{" "}
              버튼을 클릭해서 언제든지 제품 코드(키)를 확인할 수 있습니다. 해당 제품 코드는 스팀,
              에픽 게임즈 등 각 플랫폼에 등록하여 게임을 플레이하실 수 있습니다.
            </p>
            <img
              src="https://image.directg.net/upload/ezwel/guide/mobile/M_KR_Guide_DG_order_A_07.jpg?1"
              className="imaged w-100 square mb-2"
            />
          </li>
        </ul>
      </div>
    </div>
  );
}
