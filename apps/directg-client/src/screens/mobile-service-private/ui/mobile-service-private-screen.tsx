import { MobileSimpleSubHeader } from "@widgets/mobile-simple-sub-header";

/**
 * 모바일 개인정보처리방침 (legacy `mobile/service/private.html`).
 * appHeaderSub 최소 헤더 + `#appCapsuleSub` 본문의 `<pre>`에 private.txt raw HTML inline.
 * agreement 화면과 동형 — page_title·txt만 다름. PC와 달리 `?date` 버전 스위치 없음.
 */
export function MobileServicePrivateScreen({ privateHtml }: { privateHtml: string }) {
  return (
    <>
      <MobileSimpleSubHeader pageTitle="개인정보처리방침" />
      <div id="appCapsuleSub" className="full-height">
        <div className="section full mt-2">
          <div className="wide-block pt-2">
            <pre className="p-1" dangerouslySetInnerHTML={{ __html: privateHtml }} />
          </div>
        </div>
      </div>
    </>
  );
}
