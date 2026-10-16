import { MobileSimpleSubHeader } from "@widgets/mobile-simple-sub-header";

/**
 * 모바일 이용약관 (legacy `mobile/service/agreement.html`).
 * appHeaderSub 최소 헤더 + `#appCapsuleSub` 본문의 `<pre>`에 agreement.txt raw HTML inline.
 * PC와 달리 `?date` 버전 스위치 없음 — 항상 현행 약관.
 * txt는 신뢰된 자체 자산이라 `dangerouslySetInnerHTML`로 inline (PC join_step2/service-agreement 선례 동일).
 */
export function MobileServiceAgreementScreen({ agreementHtml }: { agreementHtml: string }) {
  return (
    <>
      <MobileSimpleSubHeader pageTitle="이용약관" />
      <div id="appCapsuleSub" className="full-height">
        <div className="section full mt-2">
          <div className="wide-block pt-2">
            <pre className="p-1" dangerouslySetInnerHTML={{ __html: agreementHtml }} />
          </div>
        </div>
      </div>
    </>
  );
}
