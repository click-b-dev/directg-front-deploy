# 리포트 내역

> P2 파트너·정산 여덟 번째 단위(리포트 관리 그룹 4/4). 생성된 정산 리포트(tbl_report_config) 목록. 검색필터 + 8컬럼 목록 + 상세보기 링크 + 다운로드. **#260 리포트 생성의 이동 대상**.

## 원본
- 파일: `pc/_Admin_/partner/report_list.php` (라이브 — 사이드바 리포트 관리 그룹 "리포트 내역")
- 다운로드: `partner/report_download.php` (form POST {idx})
- 상세: `partner/report_view.php?idx=`(#262 예정)
- 데이터: `AdminPartner::getPartnerReportList()`, `getPartnerListAll('')`
- 참조: `../legacy-project/docs/PARTNER-SETTLEMENT.md`

## 화면·플로우
- 진입 URL: `/partner/report_list` — GET: `search_year`, `search_month`, `search_publisher_code`, `search_report_term`(M/T), `search_month_term`(분기 1~4).
- **기본값**(report_register와 동일): year 없으면 `date("Y")`(search_flag=false). month/month_term 둘 다 없으면 month=전월, **전월=="12" && !search_flag → year-1**. report_term 없으면 "M". T면 `search_month=search_month_term`.
  - **추가 quirk: `search_publisher_code` 있으면 `search_month=""`**(파트너 선택 시 월 필터 제거 → 해당 파트너 전체 리포트).
- breadcrumb: 홈/파트너/리포트 관리/**리포트 내역**.
- 검색필터: 리포트 주기 radio(M/T, JS 토글) + 기간 year select(**2013**~현재) + 월 radio(1~12, `#choice_month`)/분기 radio(1~4, `#choice_month_term`) + 파트너 select + "리포트 검색" submit(btn-primary).
- `{count} 개`
- 테이블(8컬럼, colgroup 20/*/6/10/10/6/8/10):
  - 파트너(publisher_name) / 리포트 제목(**"{report_year}년 {report_month}{분기\|월} 리포트 내역입니다."**) / 수량(total_sold) / 합계 KRW(total) / **Royalty Payable**({currency_converter} number_format(total*royalty,2)) / 상태(status 한글) / 상세보기(`report_view.php?idx` 링크 btn) / 리포트 다운로드(btn_report_download, form POST)
- tfoot: "{search_year}년 {search_month}월 합계" colspan2 + total_sold 합 + total_price 합 원 + 빈 th 4.
- **페이징 없음**: `$partner_member_list->links_html` 미정의 변수(복붙 잔재) → 빈값. dead. 미이관.

### 인터랙션
- 리포트 주기 radio: choice_month/choice_month_term 토글(JS).
- 검색: GET submit → 재조회.
- **상세보기**: `report_view.php?idx=` 링크(a href) → `/partner/report_view?idx=`(**report_view #262** — 현재 라우트 미존재, 링크만).
- **리포트 다운로드**(`.btn_report_download`): form POST `report_download.php` {idx} → 백엔드 .xls. **china 선례 백엔드 GET 위임**.
- 세션/권한: `$_SESSION['admin']` 가드.

### 데이터 (legacy)
- `getPartnerReportList(publisher_code, report_term, year, month, '')`:
  ```sql
  select a.idx, a.report_year, a.report_month, b.publisher_name, a.total, a.royalty,
         a.currency_converter, a.total_sold, a.report_term,
         case a.status when 'ready' then '대기' when 'notice' then '통보'
              when 'approval' then '확인' when 'transfer' then '송금완료' end as status
  from directgames.tbl_report_config a inner join tbl_partner b on a.publisher_code=b.publisher_code
  where a.report_term=:report_term and a.report_year=:report_year
        [and a.report_month=:report_month] [and a.publisher_code=:publisher_code]
  order by a.report_year desc, a.report_month desc, a.reg_date desc
  ```
  - **publisher_code 있으면 month 조건 제거**(전체 월). 4개 조합(publisher × month 유무).
  - `total`=Σrevenue_share(리포트 생성 시 저장), `total_sold`=Σgross_units_sold.
- `getPartnerListAll('')` — 파트너 select(전체).

## API 계약 (백엔드 전달)
- `GET /admin/partner/report/list` — query {publisher_code, report_term, year, month} → `{ items: [{idx, publisher_name, report_year, report_month, report_term, total, royalty, currency_converter, total_sold, status}], total_sold, total_price }`. status는 **한글 변환값**(대기/통보/확인/송금완료). publisher_code 있으면 month 무시. 정렬 report_year desc/report_month desc/reg_date desc.
- `GET /admin/partner/list-all` — (#258 정의, 재사용).
- `GET /admin/partner/report/download` — query `idx` → `.xls`(china 선례 백엔드 GET 위임).
- 상세보기 → `/partner/report_view?idx=`(#262).
- 백엔드 책임: status 한글 변환, publisher별 month 조건 분기.

## 타겟 매핑
- 라우트: `/partner/report_list` (`routes/partner/report_list.tsx`)
- screens: `screens/partner-report-list`
- entities: `entities/partner` 확장(report-list 조회; list-all 재사용)
- mock: `handlers/partner.ts` 확장(report list fixture)

## 의도적 parity 판단 (게이트 승인 대상)
- **다운로드 백엔드 GET 위임**(china 선례). legacy form POST와 방식 다르나 결과 동일.
- **상세보기 링크 → /partner/report_view**(report_view #262 미구현, 현재 404 — 다음 단위에서 해소).
- **페이징 dead 미이관**($partner_member_list 미정의).
- status 한글 변환은 **백엔드 책임**.

## Parity 체크리스트
- [ ] 기본값(전월·연도-1 quirk·M 기본·**publisher 선택 시 month 제거**)
- [ ] 검색필터(주기 토글·연 2013~·월/분기 radio·파트너)·"리포트 검색"
- [ ] 8컬럼·리포트 제목 포맷·Royalty Payable(total*royalty round2)·status 한글
- [ ] tfoot 합계
- [ ] 상세보기 링크(report_view?idx)·다운로드(백엔드 위임)
- [ ] `{n} 개`·number_format·페이징 없음
