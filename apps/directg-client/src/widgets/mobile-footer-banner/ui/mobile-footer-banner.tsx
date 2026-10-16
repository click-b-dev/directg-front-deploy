/** footer_banner 노출 구간 (legacy inc/footer_banner.html: 2026-06-12 00:00 ~ 2026-07-12 23:00). */
const isFooterBannerOpen = (now: Date) =>
  now >= new Date("2026-06-12T00:00:00") && now < new Date("2026-07-12T23:00:00");

/**
 * 모바일 기획 고정배너2 (legacy index.php `inc/footer_banner.html` #event_banner).
 * 기간게이트일 때만 노출(현재 만료). PC `footer-banner-section`과 img 다름(모바일 전용).
 * legacy index.php L294 `div.section` 래퍼 포함.
 */
export function MobileFooterBanner() {
  if (!isFooterBannerOpen(new Date())) return null;

  return (
    <div className="section">
      <div className="mb-2" id="event_banner">
        <div className="wide-block px-0">
          <a href="/board/notice_view?idx=374">
            <img
              src="https://image.directg.net/M89JgzGzbm"
              className="img-fluid"
              alt="네이버페이 결제이벤트 최대 3,000원 혜택,기간 :2026-06-12 ~ 2026-07-12"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
