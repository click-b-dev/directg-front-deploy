# 회원 상세 — 리뷰 내역 탭 (회원_회원내역_상세_리뷰내역)

- Figma: 디자인 `30164:12141`(표 `30164:12258`), 기획 `AD-Member-Detail-04`
- 구현: `screens/member-detail/ui/reviews-panel.tsx`, 데이터 `src/renewal/entities/member-review`, mock `src/renewal/mocks/member-review.ts`
- mock 등록: `src/shared/mocks/handlers.ts`에 한 줄(`memberReviewHandlers`)을 추가했다(리뉴얼 격리 원칙의 예외).

## 신규 API 계약 (legacy에 없음 — 백엔드 전달용)

`GET /admin/member/reviews?m_no=&page=`

```json
{
  "items": [{
    "review_id": "RV000004", "reg_date": "2026-08-01 14:00:00",
    "category": "게임", "product_name": "마블 스파이더맨 2",
    "content": "텍스트 리뷰 본문(없으면 빈 문자열)",
    "tags": ["추천해요", "디테일이 좋아요", "그래픽이 좋아요"],
    "like_cnt": 10, "report_cnt": 0, "status_label": "정상"
  }],
  "pagination": { "current_page": 1, "total_results": 3, "total_pages": 1 }
}
```

## 기획 반영
- 텍스트 리뷰 2줄 노출(말줄임), 줄바꿈 무시, 데이터가 없으면 노출하지 않음
- 평가 항목 최대 2개 + 나머지 `+N`
- 공감/신고 수 1건 이상이면 셀 배경·굵은 글씨로 강조(공감=파랑, 신고=빨강), 0이면 흐리게

## 확인 필요
1. **리뷰 상세 화면**(`AD-Review-Detail-01`)이 없어 "리뷰 보기"는 이동하지 않는다.
2. **상태 값** — "정상" 외 상태(블라인드 등)가 있는지, 표시 문구를 서버가 주는지.
3. **페이지 크기** — 20개 고정(드롭다운 비활성).
4. mock은 어느 회원이든 같은 3건을 돌려준다.
