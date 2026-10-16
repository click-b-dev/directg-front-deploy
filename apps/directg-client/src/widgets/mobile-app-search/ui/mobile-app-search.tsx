/**
 * 모바일 앱 검색 offcanvas — legacy `mobile/inc/app_search.html`(#offcanvas-search) 재현.
 * legacy 홈은 이 offcanvas를 여는 트리거(`#btn_search`)가 마크업에 부재 → 동작하지 않는 죽은 offcanvas.
 * DOM parity를 위해 정적 마크업만 이식(트리거/동작 없음, legacy 그대로).
 */
export function MobileAppSearch() {
  return (
    <div className="offcanvas offcanvas-end" id="offcanvas-search" tabIndex={-1} role="dialog">
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">검색</h5>
        <a href="#" className="offcanvas-close" data-bs-dismiss="offcanvas">
          <ion-icon
            name="close-outline"
            role="img"
            className="md hydrated"
            aria-label="close outline"
          ></ion-icon>
        </a>
      </div>
      <div className="offcanvas-body">
        <form className="search-form">
          <div className="form-group searchbox">
            <input type="text" className="form-control" placeholder="Search..." />
            <i className="input-icon">
              <ion-icon
                name="search-outline"
                role="img"
                className="md hydrated"
                aria-label="search outline"
              ></ion-icon>
            </i>
          </div>
        </form>
      </div>
    </div>
  );
}
