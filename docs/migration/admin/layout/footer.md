# footer + 공통 헬퍼 (M1-5)

## 원본

- `pc/_Admin_/inc/footer.php` — 하단 푸터. `admin_body_end.php` 경유 19개 페이지에서 사용.
- `pc/_Admin_/inc/admin_head.php` `<script>` — 공통 JS 헬퍼: `LoadingOverlay`, `escHtml`, `renderPaging`.
- 라이브 판별: 단일 버전. 참조: [topbar](topbar.md)/[sidebar](sidebar.md).

## 화면·플로우

### footer (`footer.php`)
```html
<footer class="footer">
  <div class="container-fluid"><div class="row">
    <div class="col-md-6"><script>document.write(new Date().getFullYear())</script> © H2 Interactive Corp All Rights Reserved.</div>
    <div class="col-md-6"><div class="text-md-end footer-links d-none d-md-block"></div></div>
  </div></div>
</footer>
```
- 좌: **현재 연도**(JS 자동) + `© H2 Interactive Corp All Rights Reserved.`
- 우: `footer-links`(비어 있음, d-none d-md-block).
- CSS: `.footer{position:absolute;bottom:0;left:260px;right:0;padding:19px 24px 20px;border-top;color:#98a6ad}`. 모바일(≤767.98px)만 `left:0;text-align:center`.
- DOM: `.wrapper` 안, content-page 뒤(main.php 724줄).

### 공통 헬퍼 (`admin_head.php`)
- `LoadingOverlay(action)`: `#_loading_overlay` fixed div(inset:0, rgba(0,0,0,.4), z-index:9999, flex 중앙) + 스피너(48px, 5px 흰 테두리 top 투명, `spin .8s linear infinite`). `show`/그 외로 표시 토글.
- `renderPaging(options)`: Bootstrap `.pagination` HTML 생성. `page/totalPages/totalElements/baseUrl/params/perBlock(10)`. 블록 계산: `start=(ceil(page/perBlock)-1)*perBlock+1`, `end=start+perBlock>totalPages ? totalPages+1 : start+perBlock`. « 이전블록 / 페이지번호(active) / » 다음블록. `#paging`에 주입, `#total`에 총건수.
- `escHtml(str)`: HTML 이스케이프 — **React가 기본 이스케이프하므로 불요**(미이식).

## 데이터 (legacy)
- 없음 — 정적 마크업 + 클라이언트 유틸. **신규 API 없음.**

## API 계약 (백엔드 전달)
- **신규 엔드포인트 없음.**

## 타겟 매핑
- footer: `widgets/footer`(`Footer`) — legacy 마크업 그대로. 연도는 `new Date().getFullYear()`. `LayoutShell` 두 레이아웃(사이드바/topnav) content-page 뒤에 배치.
- `LoadingOverlay`: `shared/ui/loading-overlay`(`<LoadingOverlay show />`) — legacy 마크업/스타일(오버레이+스피너, spin 키프레임) 재현. 명령형 전역함수 → React `show` prop.
- `Pagination`: `shared/ui/pagination`(`<Pagination page totalPages baseUrl params perBlock />`) — `renderPaging` 블록 로직 + Bootstrap `.pagination` 마크업 재현. 링크는 legacy처럼 `<a href="baseUrl?page=N&...">`. 총건수(`#total`) 표시는 소비 측 책임(컴포넌트는 페이지 nav만).
- ⚠️ `LoadingOverlay`/`Pagination`은 이 단위에서 **재사용 컴포넌트로 신설**(rule of two — 향후 목록/CRUD 단위 M2+에서 사용). 특정 페이지 배선은 해당 단위에서.

## Parity 체크리스트 (개발자 승인 완료 — ✅ 검증완료)
- [x] footer: 연도 + `© H2 Interactive Corp All Rights Reserved.`, 하단 고정(사이드바 오프셋)
- [x] footer가 사이드바/topnav 레이아웃 모두에서 표시
- [x] LoadingOverlay: 오버레이+스피너 시각/애니메이션 일치
- [x] Pagination: 블록 계산·« »·active·링크 URL이 renderPaging과 일치

## 산출물
- `widgets/footer/`, `shared/ui/loading-overlay/`, `shared/ui/pagination/`
- `LayoutShell`에 Footer 배치(양 레이아웃)
- mock: 없음
