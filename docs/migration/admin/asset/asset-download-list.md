# Asset 다운로드(반품출고) (Asset 서버 관리 API)

## 원본
- 파일: `pc/_Admin_/goods/asset/asset_download_list.php` + `asset_ps.php`(asset_download_register/asset_download_finish/asset_download_list) + `asset_download.php`(zip 프록시)
- 참조: [asset-list](asset-list.md)(#160)
- 도메인: `Asset::runDownloadReserveRegister/runDownloadReserveFinish`, `AdminAsset::getAssetDownloadList/setAssetDownloadRegister/setAssetDownloadFinish`

## 화면·플로우
- 진입 URL: `/goods/asset/asset_download_list` — GET `asset_id`(등록폼 프리필), `page`, `owner`(목록 검색·페이징 유지)
- breadcrumb: 홈 / 재고 / Asset 관리 / **Asset 다운로드(반품출고)**, page title 동일
- 안내 `alert alert-warning`: 반품출고(RETURN)로 키 묶어 다운로드·삭제 시 Asset에서 삭제.
- **등록 폼**("다운로드(반품출고) 등록", POST asset_ps.php mode=asset_download_register):
  - `*Asset ID`(number, required, GET asset_id 프리필) / `*소유자(owner)`(text, required, **legacy는 세션 admin_id 로컬파트 프리필 — 세션 의존이라 타겟은 빈값**) / `*수량 (≤1000)`(number 1~1000 required) / `*PIN (zip 암호)`(text required)
  - `*다운로드 제한횟수`(number min1, 기본 5) / `*만료일(등록일+N일)`(number min1, 기본 7) / 제출 "다운로드 등록"
  - 처리: 검증(admin·asset·owner·qty 1~1000·pin·limit·expday) → `runDownloadReserveRegister(asset_id,"RETURN",owner,qty,pin,limit,expday)` → `res->po` 있으면 `setAssetDownloadRegister` 후 `msg("다운로드 등록 완료 ({count}개, PO: {po})","asset_download_list.php")`(성공→목록 이동) / 실패 `msg("다운로드 등록 실패: {message}",-1)`
- **목록 검색**: 소유자(owner) input + 검색 버튼(Enter도)·searchFrm(onsubmit false). owner는 URL 유지(페이징 full reload).
- 카운트: `총 <strong id="total">{n}</strong> 개`
- **목록 테이블**(table-responsive, `table-dark` thead, 12컬럼):
  - 번호(no) / PO(po, eng) / Asset ID(asset_id) / Asset 이름(asset_name, eng, w-100) / 소유자(owner) / 수량(qty, text-end) / PIN(pin, eng) / 남은횟수(downloadLimit, **≤0이면 text-danger fw-bold**) / 다운로드일시(download_date or "미다운로드") / 만료일시(expired_dt) / 등록일시(reg_date) / 관리
  - `is_finish=='Y'`이면 **행 text-muted**, 관리=`삭제 완료` badge + finish_date
  - else 관리: 남은횟수>0이면 **다운로드**(btn-outline-info, →asset_download.php?po=) / else `다운로드 소진` badge(bg-warning) + 항상 **삭제**(btn-outline-danger, finish)
  - 빈 목록: `<td colspan="12" ...>등록된 다운로드 건이 없습니다.</td>`
- 페이징: renderPaging(→`shared/ui/Pagination`, baseUrl `asset_download_list.php`+{owner}, size=30) — URL
- 액션:
  - **다운로드**: `location.href=asset_download.php?po=`(zip 프록시·미이관→링크만)
  - **삭제(finish)**: confirm → mode=asset_download_finish{po} → `res.id` 있으면 `alert("삭제 완료 (삭제 키: {count}개)")`+reload, else `alert(res.message or 실패)`

## 데이터 (legacy)
- `getAssetDownloadList($owner_q,$page,$size)`: `tbl_asset_download_log a LEFT JOIN dgkrshop.tbl_asset b(asset_id)` owner LIKE·`no desc`·30/page. 컬럼: no,po,asset_id,asset_name,download_type,owner,qty,pin,downloadLimit,downloadExpiredDay,is_finish,finish_date,download_date,reg_date,expired_dt(=reg_date+downloadExpiredDay). 반환 `{content,totalElements,totalPages}`.
- register: `runDownloadReserveRegister`(qty≤1000)→po·count. finish: `runDownloadReserveFinish(po)`→id·count.

## API 계약 (백엔드 전달)
- `GET /admin/goods/asset/downloads` — 다운로드(반품출고) 목록
  - 쿼리: `page`, `owner`
  - 응답: `{ "content": [{ no, po, asset_id, asset_name, owner, qty, pin, downloadLimit, download_date, expired_dt, reg_date, is_finish, finish_date }], "totalElements": 0, "totalPages": 0 }`
  - 백엔드: owner LIKE·no desc·30/page·expired_dt 계산·tbl_asset 조인 이름. 관리자 세션.
- `POST /admin/goods/asset/downloads` — 등록. body `{ asset_id, owner, qty, pin, download_limit, download_expired_day }`(download_type RETURN 고정) → 성공 `{ po, count }` / 실패 `{ message }`. 백엔드: qty 1~1000 검증·재고 확인·관리자 세션.
- `POST /admin/goods/asset/downloads/finish` — 키 삭제(finish). body `{ po }` → 성공 `{ id, count }` / 실패 `{ message }`. 관리자 세션.
- 에러: legacy `msg()`/PDOException.

## 타겟 매핑
- 라우트: `routes/goods/asset/asset_download_list.tsx`(search: page/owner/asset_id)
- screens: `screens/asset-download-list` / entities: `entities/asset` 확장(download list/register/finish)
- mock: `shared/mocks/handlers/asset.ts` 확장(downloads GET/POST, downloads/finish POST)
- 재사용: `shared/ui/Pagination`. 등록 성공은 window.location(legacy msg→location.href)·다운로드/finish 링크·번호 등 eng/num span 유지
- **경계**: owner 프리필(세션 admin_id)은 미재현(빈값)·다운로드 zip 프록시(`asset_download.php`)는 미이관 링크

## Parity 체크리스트
- [ ] 등록 폼 6필드(required·min/max·기본 5/7)·성공 alert+목록 이동/실패 alert
- [ ] 목록 검색(owner)·12컬럼·남은횟수 강조·미다운로드·finish 행 text-muted
- [ ] 다운로드(소진 시 badge)·삭제(confirm→count alert→reload)·빈목록 colspan=12
- [ ] Pagination(30/page·URL)·owner 프리필 미재현(경계)
