import { MobileSubHeader } from "@widgets/mobile-sub-header";

/**
 * 모바일 마이페이지 - 제공컨텐츠 (legacy `mobile/mypage/mypage_supply_content.html`).
 * 데이터 없이 "PC에서 확인" 안내만 표시하는 stub(세션 가드는 라우트에서). PC 화면과 달리 목록 없음.
 * legacy 표기 그대로: 제목은 "제공컨텐츠", 안내 메시지는 "제공콘텐츠..."(컨/콘 혼용 보존).
 */
export function MobileMypageSupplyContentScreen() {
  return (
    <>
      <MobileSubHeader pageTitle="제공컨텐츠" />
      <div id="appCapsuleSub">
        <div className="section full">
          <div>
            <div className="section-title mt-2">제공컨텐츠</div>
            <div className="section">
              <h3>제공콘텐츠는 PC 환경에서 확인해 주시기 바랍니다.</h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
