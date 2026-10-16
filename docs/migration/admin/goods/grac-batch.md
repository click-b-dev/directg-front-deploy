# 심의정보 동기화 (grac_batch)

## 원본
- 파일: `pc/_Admin_/goods/grac/grac_batch.php` (변형/테스트 파일 없음 — 단일 라이브 버전)
- 연동 처리기: `pc/_Admin_/goods/grac/grac_ps.php` (`mode=grac_batch`)
- 도메인 클래스: `src/classes/Admin.php::getGRACEntnameList()` (L2066)
- 참조 문서: `docs/legacy-admin/20-goods-catalog.md` (심의/GRAC) — 필요 시 `../legacy-project/docs/` GRAC 규칙
- 선행 단위: #62 `grac_list`(심의정보 현황) — 기존 `entities/grac`·`handlers/grac.ts` 확장

## 화면·플로우
- 진입 URL/파라미터: `/goods/grac/grac_batch.php` (파라미터 없음)
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈 / **상품관리** / 심의정보 동기화 (※ grac_list의 "상품"과 달리 "상품관리")
  - page-title `심의정보 동기화`
  - 카드 1개(헤더 없음) + 5컬럼 테이블: 번호 / 심의업체명(entname) / 게임수(tcount, text-end) / 동기화일자(batch_date) / 비고(width 250px)
  - 번호: `$num` 오름차순(1부터, **페이지 오프셋 없음** — 페이징 미사용, links_html 주석처리)
  - 비고: **모든 행**에 `심의정보 동기화` 버튼(`data-entname`)
- 폼 필드/검증: 없음(검색·페이징 없음)
- 분기/리다이렉트: 없음(단일 목록)
- 세션/권한 의존: `lib.php` 관리자 세션 가드(공통). `sidebar_goods.php`, `topmenu['goods']=active`.
- **사이드바 미노출(숨김 메뉴)**: super-admin `sidebar_goods.php`의 심의정보 관리 그룹에서 "심의정보 동기화"·"심의정보 등록"은 **`<!-- -->` 주석처리**(현황만 노출). → **nav.ts에 추가하지 않는다**(#62가 현황만 등록한 것과 동일, legacy 이식).
- AJAX: `심의정보 동기화` → `POST grac_ps.php {mode:"grac_batch", entname}` → success 시 `location.reload()`(응답 alert 주석=미표시). 실패 시 `alert(data)`.

## 데이터 (legacy)
- 도메인 클래스·메서드: `Admin::getGRACEntnameList()`
- SQL: `select entname,tcount,batch_date from grac_entname where tcount>='9' order by tcount desc`
  - 필터 고정 `tcount>='9'`(게임수 9 이상), 정렬 `tcount desc`, **페이징 없음**
- 동기화(grac_ps mode=grac_batch): 외부 **GRAC 게임3.0 웹서비스**(`grac.or.kr/WebService/GameSearchSvc.asmx/game`, entname·startdate 2025-01-01·enddate 2026-12-31·display 1000) 호출 → `grac_entname`(tcount, batch_date=now) 갱신 → 응답 item들을 `grac_list` upsert(**platform="모바일 게임" 제외**). reg_date=now.

## API 계약 (백엔드 전달)

### `GET /admin/goods/grac/entname` — 동기화 대상 심의업체 목록
- 요청: 파라미터 없음
- 응답:
  ```json
  { "items": [ { "entname": "...", "tcount": 0, "batch_date": "2026-01-10 09:00:00" | null } ] }
  ```
- 백엔드 책임: `grac_entname where tcount>='9' order by tcount desc`. **페이징 없음.** tcount는 숫자, batch_date는 미동기화 시 null 가능.

### `POST /admin/goods/grac/batch` — 심의정보 동기화
- 요청: `{ "entname": "..." }`
- 응답: `{ "success": true }` (legacy는 응답 본문 미사용 — 성공 시 목록 재조회만)
- 백엔드 책임: **외부 GRAC 웹서비스 GameSearchSvc 호출**(entname 기준, 공백 제거한 값으로 조회) → `grac_entname` tcount·batch_date 갱신 → 반환 게임 목록을 `grac_list`에 upsert(**모바일 게임 제외**, reg_date=now, canceledddate 포맷 `%Y-%-m-%d`). 외부 API 키/엔드포인트는 백엔드 보관.
- 프론트 동작: 성공 시 `GRAC` 쿼리 invalidate(=legacy reload).

## 타겟 매핑
- 라우트: `/goods/grac/grac_batch` (legacy URL 유지, `routes/goods/grac/grac_batch.tsx`)
- entities: 기존 `entities/grac` 확장(entname 목록 타입/fetcher/query + batch mutation)
- screens: `screens/goods-grac-batch`
- mock: 기존 `handlers/grac.ts` 확장(GET entname + POST batch)
- sidebar: **추가 안 함**(legacy 주석처리 = 미노출 이식)

## Parity 체크리스트
- [ ] 화면 요소 일치 (breadcrumb "상품관리"/5컬럼/카드/비고 width 250px)
- [ ] 필드/검증 일치 (필터·페이징 없음 · 번호 오프셋 없는 오름차순)
- [ ] 분기/플로우 일치 (모든 행 동기화 버튼 · 성공 시 재조회 · alert 미표시)
- [ ] 엣지케이스 일치 (tcount>=9만 노출 · tcount desc 정렬 · batch_date null 표시 · 사이드바 미노출)
