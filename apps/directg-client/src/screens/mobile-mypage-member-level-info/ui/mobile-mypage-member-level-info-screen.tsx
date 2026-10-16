import { MobileSubHeader } from "@widgets/mobile-sub-header";

/**
 * 모바일 마이페이지 - 회원등급 안내 (legacy `mobile/mypage/member_level_info.html`).
 * 완전 정적 등급표(일반/정회원/VIP) + 안내문. 세션 가드는 라우트에서. `<h3></h2>` 빈 heading quirk는 빈 h3로 재현.
 */
export function MobileMypageMemberLevelInfoScreen() {
  return (
    <>
      <MobileSubHeader pageTitle="회원등급 안내" />
      <div id="appCapsuleSub">
        <div className="section full pt-2">
          <div className="section-title">※ 다이렉트 게임즈 회원 등급별 혜택 안내</div>
          <div className="col-12">
            <h3></h3>
            <table className="table table-bordered table-light table-centered text-center align-middle my-3">
              <thead className="align-middle table-dark">
                <tr>
                  <th>회원 등급</th>
                  <th>등급 기준</th>
                  <th>포인트 혜택</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>일반</td>
                  <td className="text-start">
                    등급 산정일 기준 최근 6개월간 순수 구매 총액이 5천원 미만
                  </td>
                  <td>0%</td>
                </tr>
                <tr>
                  <td>정회원</td>
                  <td className="text-start">
                    등급 산정일 기준 최근 6개월간 순수 구매 총액이 5천원 이상 20만원 미만 회원
                  </td>
                  <td>1%</td>
                </tr>
                <tr>
                  <td>VIP</td>
                  <td className="text-start">
                    등급 산정일 기준 최근 6개월간 순수 구매 총액이 20만원 이상
                  </td>
                  <td>3%</td>
                </tr>
              </tbody>
            </table>
            <p> - 등급 심사일: 매 월 영업일 기준 첫째날</p>
            <p> - 등급 산정일: 매 월 말일 기준 최근 6개월</p>
            <p>
              {" "}
              - 순수 구매 총액은 제품키 활성화가 완료된 주문의 결제 금액에서 포인트로 결제한 금액은
              제외됩니다.
            </p>
            <p>
              ※ 회원 등급 기준 및 혜택은 당사의 사정에 의해 사전 예고 없이 변경될 수 있으며, 부당한
              방법으로 획득한 고객 등급은 사후 심사를 통해 조정될 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
