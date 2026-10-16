/** 네이버페이 즉시할인 이벤트배너 노출 구간 (legacy index.php L664: 2025-08-27 16:00 ~ 2025-09-01 00:00). */
const isNaverpayBannerOpen = (now: Date) =>
  now >= new Date("2025-08-27T16:00:00") && now < new Date("2025-09-01T00:00:00");

/**
 * 모바일 네이버페이 즉시할인 이벤트배너 (legacy index.php `#event_banner`, L664~675).
 * 기간게이트일 때만 노출(현재 만료). PC 2-3 `event-banner-section`과 별개(모바일 전용 마크업·img).
 */
export function MobileNaverpayBanner() {
  if (!isNaverpayBannerOpen(new Date())) return null;

  return (
    <div className="section mb-2">
      <div className="section-title py-2 px-0">
        <h2 className="mb-0">다이렉트 게임즈 X 네이버페이 즉시할인 이벤트</h2>
      </div>
      <div className="event_banner" id="event_banner">
        <a href="/board/notice_view?idx=30">
          <img
            src="https://image.directg.net/v82AtcoPy4"
            className="w-100"
            alt="다이렉트 게임즈 X 네이버페이 즉시할인 이벤트"
          />
        </a>
      </div>
    </div>
  );
}
