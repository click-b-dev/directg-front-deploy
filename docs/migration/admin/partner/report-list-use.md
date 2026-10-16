# 리포트 내역 (상용화)

> P2 파트너·정산 열 번째 단위. **사이드바 외 직접 URL 화면**. `report_list.php`(#261)의 변형 — is_system='Y'(통계시스템 사용) 파트너 대상. 리포트 목록 쿼리는 #261과 동일, 파트너 select만 is_system 필터.

## 원본
- 파일: `pc/_Admin_/partner/report_list_use.php` (라이브 — **사이드바 미노출**, 직접 URL 접근)
- 데이터: `AdminPartner::getPartnerReportList()`(is_system **미사용**), `getPartnerListAll('Y')`
- 참조: `report_list.php`(#261 [분석/계약](report-list.md)), `../legacy-project/docs/PARTNER-SETTLEMENT.md`

## report_list(#261) 대비 차이 (diff 기준, 나머지 동일)
1. **page_title**: "리포트 내역 **(상용화)**".
2. **기본값 로직 단순화**(report_list의 quirk 제거):
   - `search_flag` 없음.
   - month 기본: `if($search_month=="")` → 전월. **연도보정 없음**(report_list는 전월12&!search_flag→year-1).
   - **publisher 있어도 month 유지**(report_list는 `if(publisher) month=""`).
3. **is_system="Y"**: `getPartnerReportList(...,'Y')`(본문 미사용, 목록 영향 없음) + `getPartnerListAll('Y')` → **파트너 select이 is_system='Y' 파트너만**.
4. **컬럼 헤더**: "리포트 다운로드" → **"다운로드"**.
5. **페이징 줄 없음**(report_list의 `$partner_member_list->links_html` dead 줄조차 제거).
6. 나머지(검색필터·8컬럼·리포트 제목·Royalty Payable·tfoot·상세보기·다운로드 버튼·status 한글)는 **report_list와 완전 동일**.

## 데이터 (legacy)
- `getPartnerReportList(publisher_code, report_term, year, month, is_system)` — **is_system 파라미터는 본문 미사용**. 쿼리는 report_list와 동일(tbl_report_config⋈tbl_partner, status 한글 case, publisher 있으면 month 조건 제외).
- `getPartnerListAll('Y')`:
  ```sql
  select publisher_code, publisher_name, report_term from tbl_partner
  where is_system=:is_system order by publisher_name asc
  ```
  (report_list는 is_system='' → 전체).

## API 계약 (백엔드 전달)
- 리포트 목록: **`GET /admin/partner/report/list` 재사용**(#261, is_system 무관 — 동일 쿼리/응답).
- 파트너 select: **`GET /admin/partner/list-all?is_system=Y`** — 기존 list-all(#258)에 `is_system` 쿼리 추가. 있으면 `where is_system=:is_system` 필터, 없으면 전체. 응답 스키마 동일(`[{publisher_code, publisher_name, report_term}]`).
- 다운로드: `GET /admin/partner/report/download?idx=` 재사용(#261).
- 상세보기: `/partner/report_view?idx=`(#262) 재사용.

## 타겟 매핑
- 라우트: `/partner/report_list_use` (`routes/partner/report_list_use.tsx`)
- screens: `screens/partner-report-list-use`
- entities: `entities/partner` — report-list 재사용, `list-all`에 is_system 파라미터 추가
- mock: `handlers/partner.ts` — list-all is_system 필터(+ fixture is_system 필드)

## 의도적 parity 판단 (게이트 승인 대상)
- **사이드바 미노출**(직접 URL) — 사이드바 배선 없음.
- **기본값 report_list와 다름**(연도보정·publisher month="" quirk 없음, 단순).
- **is_system 목록 미영향**(파트너 select만) — legacy getPartnerReportList is_system 미사용 그대로.
- 다운로드/상세보기/status 한글 등은 report_list(#261)와 동일 계약 재사용.

## Parity 체크리스트
- [ ] 제목 "리포트 내역 (상용화)"
- [ ] 검색필터(주기 토글·연 2013~·월/분기·파트너 **is_system=Y**)·기본값(전월·보정 없음·publisher 유지)
- [ ] 8컬럼·컬럼명 "다운로드"·리포트 제목·Royalty Payable·status 한글
- [ ] tfoot 합계·상세보기 링크·다운로드 위임
- [ ] 사이드바 미노출(직접 URL)
