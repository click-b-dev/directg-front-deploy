import type { CSSProperties } from "react";

interface ServicePrivateScreenProps {
  /** legacy `private.txt`/`private_<date>.txt` 원문 — `<pre>` inline. */
  documentHtml: string;
  /** 이전 버전 방침을 보고 있는지 (legacy `$is_old`). */
  isOld: boolean;
  /** legacy `$old_dates` (YYYYMMDD). 버전 링크 렌더용. */
  oldDates: string[];
}

/** 방침 pre 스타일 (legacy head `<style> .container pre { ... }` — pre가 유일하므로 인라인 재현). */
const PRIVATE_PRE_STYLE: CSSProperties = {
  textWrap: "auto",
  fontFamily: "'Noto Sans KR', sans-serif",
};

/**
 * 개인정보처리방침 (legacy `pc/service/private.html`).
 * 정적 SSR. aside 없음. `?date`에 따라 서버가 선택한 txt를 raw로 pre inline.
 * container에 `my-3 pb-5` 없음(legacy 예외) · `main.mb-5` · 버전 링크 상대 href 그대로.
 */
export function ServicePrivateScreen({ documentHtml, isOld, oldDates }: ServicePrivateScreenProps) {
  return (
    <div className="container">
      <main className="mb-5">
        <h3 className="page-title py-3 fw-bold">개인정보처리방침</h3>

        <div className="card shadow-none rounded-0">
          <div className="card-body text-body font-14 p-4">
            <pre
              className="text-auto font-14"
              style={PRIVATE_PRE_STYLE}
              dangerouslySetInnerHTML={{ __html: documentHtml }}
            />
            {isOld ? (
              <a href="private">현재 개인정보처리방침 보기</a>
            ) : (
              [...oldDates].reverse().map((date) => (
                <span key={date}>
                  <a href={`private?date=${date}`}>
                    이전 개인정보처리방침 보기 ({date.slice(0, 2)}년 {date.slice(2, 4)}월{" "}
                    {date.slice(4, 6)}일)
                  </a>
                  <br />
                </span>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
