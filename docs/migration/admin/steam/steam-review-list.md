# Steam API - 스팀 평가 현황 (읽기 뷰 / 동기화 후속)

## 원본

- 파일: `pc/_Admin_/steam/steam_review_list.php` (라이브)
- 엔티티: 기존 `steam` 확장. **읽기 뷰만** (리뷰 동기화 버튼 후속).

## 화면·플로우 (읽기 뷰)

- 진입 URL/파라미터: `/steam/steam_review_list`
  - `page`, `search_appid`, `search_name`, `search_year` (title_id/app_type dead)

- 화면 요소 (legacy 기준):
  - page_title `스팀 평가 현황` / breadcrumb: 홈 > 상품 > 스팀 동기화 > 스팀 평가 현황
  - 검색필터 카드: 스팀 출시연도 select(`::선택::` + 2005~현재연도) / 스팀 APPID text / 스팀 상품명 text / submit `스팀 Apps 검색`
  - 카운트: `{total} 개`
  - 목록 테이블(`table-centered nowrap table-sm table-bordered`, thead `table-dark font-13`, tbody `font-12`), 10컬럼:
    - 번호(60) = `(page-1)*50 + num`
    - 스팀APPID(80) / 스팀유형(80)
    - 스팀 상품명: `name`(font-13) + `genre` 콤마분리 뱃지(font-11)
    - 퍼블리셔(220) / 출시일(100): release_date
    - review_score(120): `{review_score}`<br>`({review_score_desc})`
    - 긍정 평가수(130, end): `{total_positive}`<br>`({round(total_positive*100/total_reviews,2)}%)`
    - 부정평가수(130, end): `{total_negative}`<br>`({round(...)}%)`
    - 동기화(130): `{batch_date}` + **[후속] 리뷰 동기화 버튼(uil-refresh)**
  - 페이지네이션(50/page)

### 필터/정렬 (legacy)

- base WHERE: `app_type='game'`.
- `search_year`=`date_format(release_date,'%Y')` 등호, `search_appid`=steam_appid 등호, `search_name`=name LIKE.
- orderby: `coming_soon desc, coming_soon_date desc, release_date desc`.

## 데이터 (legacy)

- `Admin::getSteamReviewList($page, $add_where, $orderby, $param)` — **50/page**.
- 컬럼: steam_appid, app_type, name, genre, publisher, release_date, review_score, review_score_desc, total_positive, total_negative, total_reviews, batch_date.

## API 계약 (백엔드 전달)

### `GET /admin/steam/reviews` (읽기 뷰)

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `page` | number | 1-base, 50개/page |
| `search_appid` | string | steam_appid 등호 |
| `search_name` | string | name LIKE %val% |
| `search_year` | string | release_date 연도 등호 |

백엔드 책임: base(game), orderby, 리뷰 요약(review_score/positive/negative/total) 포함.

응답 항목(`SteamReviewListItem`): steam_appid, app_type, name, genre, publisher, release_date, review_score, review_score_desc, total_positive, total_negative, total_reviews, batch_date.

### [후속 단위] 리뷰 동기화
- `get_steam_review.php {purchase_type:all, appids, language:all}`.

## 타겟 매핑

- 라우트: `routes/steam/steam_review_list.tsx` → `/steam/steam_review_list`
- screens: `screens/steam-review-list`
- entities: `steam` 확장 — `SteamReviewSearch`/`SteamReviewListItem`/`SteamReviewListResponse`, `fetchSteamReviewList`, `useSteamReviewList`
- shared: `shared/ui/ServerPagination`
- mock: `steam.ts` — `STEAM_REVIEW_LIST` + `GET /admin/steam/reviews`

## Parity 체크리스트 (읽기 뷰)

- [ ] 화면 요소 일치 (검색 3종/연도 select/10컬럼/장르 뱃지)
- [ ] 필드/포맷 일치 (review_score, 긍정/부정 % 계산, batch_date)
- [ ] 분기/플로우 일치 (번호 오름차순, 정렬, 연도 필터)
- [ ] 후속 표시 (리뷰 동기화 버튼 제외)
