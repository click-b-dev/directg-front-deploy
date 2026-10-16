# 이벤트 게시판 작성 (event_board_register)

## 원본
- 파일: `pc/_Admin_/event/event_board_register.php` (라이브, 등록/수정 겸용) + `event_board_ps.php`(mode=register/modify)
- idx>0면 `tbl_event` 프리필 + mode=modify. 사이드바 "이벤트 게시판 작성"은 idx 없이 진입(register).

## 화면·플로우
- 진입 URL: `/event/event_board_register?mode&idx`
- breadcrumb: 홈 / 게시판 / 이벤트 게시판 관리 / (active) 이벤트 게시판 등록 · h4 `이벤트 게시판 등록`(modify여도 동일)
- col-9 폼 / col-3 빈 영역
- 필드:
  - 이벤트 구분 radio(순서 1 예약구매 / 2 네이버페이 즉시할인 / 3 토스 즉시할인 / 4 네이버페이 포인트 쿠폰 / 6 DGKR 포인트 / 5 당첨자발표 / 9 기타)
  - 이벤트 기간: start_date ~ end_date (text, `Y-m-d H:i`, 마스크 없음)
  - 이벤트 제목: subject text
  - 이벤트 내용: SimpleMDE → `MarkdownEditor`(easymde), contents(마크다운 소스)
  - 이벤트 유의사항: SimpleMDE → `MarkdownEditor`, event_notes
  - 이벤트 배너 URL: text required
  - 이벤트 링크 URL: event_link_target select(_self 현재창/_blank 새창) + event_link_url text required
  - 이벤트 노출 여부: is_view radio Y/N
  - 프로모션 노출 여부: show_promotion radio Y/N
  - 저장 버튼 → 저장 후 `event_board_list`(page 1)
- register 기본값: 아무것도 체크 안 됨(legacy 동일).
- **legacy quirk**: register.php는 idx>0(modify) 프리필 시 gubun/is_view/event_link_target만 복원하고 **show_promotion은 프리필하지 않음**(modify.php와 달리 `$checked['show_promotion']` 미설정). 그대로 이식(show_promotion 라디오는 프리필 안 함). 정식 수정 화면은 event_board_modify(Unit 3).

## API 계약 (백엔드 전달)
### `GET /admin/event/board/{idx}` — 폼 프리필
- 응답 `200`: `{ idx, event_gubun, subject, contents(마크다운 소스), event_notes, start_date(unix), end_date(unix), event_banner, event_link_target, event_link_url, is_view, show_promotion }`
- 백엔드 책임: `contents`/`event_notes`는 htmlspecialchars_decode된 소스 제공.

### `POST /admin/event/board` — 등록 (mode=register)
- 요청: `{ gubun, subject, contents, event_notes, start_date("Y-m-d H:i"), end_date, event_banner, event_link_target, event_link_url, is_view, show_promotion }`
- 백엔드 책임: contents/event_notes를 `<`/`>`/`&` → 엔티티 치환 후 저장, start/end_date는 strtotime(unix), reg_date=now(), admin_id 서버 결정.

### `PUT /admin/event/board/{idx}` — 수정 (mode=modify)
- 요청: 등록과 동일 스키마.

- 응답 공통 `200`: `{ success: boolean }` → 성공 시 목록 invalidate + `event_board_list` 이동.

## 타겟 매핑
- 라우트: `routes/event/event_board_register.tsx` / screens: `event-board-register` / entities: `event` 확장(detail/create/update) / mock: `handlers/event` 확장 / `shared/ui/MarkdownEditor`

## Parity 체크리스트
- [ ] gubun 7개(순서·9 기타) · 기간 text · 제목 · 내용/유의사항 MDE · 배너/링크(target+url) · 노출/프로모션 radio
- [ ] register 기본 미체크 · idx>0 프리필(show_promotion 미프리필 quirk) · 저장→목록 이동
