# 자료실 다운로드현황

## 원본
- 파일: `pc/_Admin_/board/dataroom_download.php` + `AdminBoard::getDataroomDownloadList()`
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§자료실 다운로드현황)

## 화면·플로우
- 진입 URL/파라미터: `/board/dataroom_download?page&search_title_name`
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈/게시판/자료실 관리/**자료실 다운로드현황**, h4 동일, `<title>`=**공지사항 목록**(quirk, 복붙)
  - 검색필터 카드: 제목 text(`search_title_name`, placeholder 제목검색) + `다운로드현황 검색` 버튼
  - 총건수 `{n} 개`
  - 테이블(4컬럼, **table-bordered 없음**): 회원번호(m_no) / ID(m_id) / 파일명(file_name) / 다운로드 수(`number_format(download_count)`)
  - 페이지네이션 `links_html`(30/page)
- 세션/권한: `$_SESSION['admin']`(공통).

### legacy quirk (그대로 이식)
- **제목 필터 비기능**: `search_title_name` 입력은 있으나 `$where`에 추가되지 않고(필터 미적용), value에 쓰는 `$search_title_name` 변수도 미정의(항상 빈값). → 입력은 렌더하되 필터는 무효(mock 미적용), value 항상 빈값 재현.
- `<title>`=공지사항 목록(breadcrumb/h4는 자료실 다운로드현황).
- 하단 btn_delete 스크립트(notice_ps 호출)는 대응 요소 없는 dead → 미이식.
- 테이블에 table-bordered 클래스 없음(다른 목록과 상이).

## 데이터 (legacy)
- `AdminBoard::getDataroomDownloadList`: `SELECT a.*..., b.m_no, b.m_id, b.download_count FROM tbl_dataroom_log b LEFT JOIN tbl_dataroom a ON a.idx=b.parent_idx WHERE 1=1 ORDER BY b.idx desc` (30/page)

## API 계약 (백엔드 전달)
- `GET /admin/board/dataroom-downloads` — 자료실 다운로드현황
  - 요청(query): `page`(기본 1), `search_title_name`(legacy 미적용 — 백엔드도 미적용 유지 또는 파일명 필터 여부 결정 대상)
  - 응답:
    ```jsonc
    {
      "items": [ { "m_no": 0, "m_id": "", "file_name": "", "download_count": 0 } ],
      "pagination": { "current_page": 1, "results_per_page": 30, "total_results": 0, "total_pages": 1 }
    }
    ```
  - 정렬: `b.idx desc`(로그 최신순). 30/page.
  - (경로: `datarooms/:idx`(#122 상세)와 충돌 회피 위해 `dataroom-downloads` 별도 리소스)

## 타겟 매핑
- 라우트: `/board/dataroom_download` (`routes/board/dataroom_download.tsx`, validateSearch `{page, search_title_name}`)
- 스크린: `screens/dataroom-download`
- entities: `entities/dataroom` 확장(download list)
- mock: `handlers/dataroom.ts` 확장(download list)

## Parity 체크리스트
- [ ] 4컬럼(회원번호/ID/파일명/다운로드수) 일치
- [ ] 제목 필터 비기능·value 빈값 quirk
- [ ] title=공지사항 목록 quirk
- [ ] b.idx desc, 30/page
- [ ] btn_delete dead 미이식
