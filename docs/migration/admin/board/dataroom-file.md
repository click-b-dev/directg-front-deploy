# 자료실 파일현황

## 원본
- 파일: `pc/_Admin_/board/dataroom_file.php` + `AdminBoard::getDataroomList()`
- 참조 문서: `docs/legacy-admin/30-member-board.md`(§자료실 파일현황), `BOARD-CONTENT.md`

## 화면·플로우
- 진입 URL/파라미터: `/board/dataroom_file?page`
- 화면 요소 (legacy 기준):
  - breadcrumb: 홈/게시판/자료실 관리/**자료실 파일현황**, h4 동일($page_title)
  - **검색필터 카드**: 헤더 `검색필터` + **빈 card-body**(필터 없음) — 그대로 이식
  - 상단: 총건수 `{n} 개`(float-start) + `자료실 파일 등록` 버튼(float-end → dataroom_register, #122 미이관)
  - 테이블(9컬럼): 번호(1-based `num+(page-1)*30`) / 파일유형(`file_type=="P"?한글패치:컨텐츠`) / 제공 파일명(file_name) / 암호화 여부(is_encode raw) / 암호화 방식(encode_type raw) / 제공조건(`is_free=="Y"?무료:유료`) / 배포일자(deploy_date) / 다운로드 수(total_download) / 비고(상세 dataroom_view / 수정 dataroom_register?mode=modify / 다운로드 file_url target=_blank)
  - 페이지네이션 `links_html`(30/page) → `ServerPagination`
- 폼필드/검증: 없음.
- 분기/링크: 상세(#123 미이관)·수정(#122 미이관)·다운로드(file_url, target=_blank).
- 세션/권한: `$_SESSION['admin']`(공통).

### legacy quirk (그대로 이식)
- **하단 btn_delete 스크립트 dead**: `$(".btn_delete")` → `notice_ps.php` mode=delete AJAX가 있으나 테이블에 `.btn_delete` 요소가 없음(삭제 버튼 미렌더). notice_ps 호출 잔재 → 미이식.
- 검색필터 카드는 빈 body(필터 미구현)지만 마크업 유지.
- 번호는 idx가 아닌 1-based 페이지 순번.

## 데이터 (legacy)
- `AdminBoard::getDataroomList`: `SELECT a.idx,a.file_type,a.file_name,a.file_url,a.thumbnail,a.contents,a.is_encode,a.encode_type,a.deploy_date,a.is_free,a.patch_no, IFNULL(SUM(b.download_count),0) AS total_download FROM tbl_dataroom a LEFT JOIN tbl_dataroom_log b ON a.idx=b.parent_idx WHERE 1=1 GROUP BY a.idx ORDER BY deploy_date desc` (30/page)

## API 계약 (백엔드 전달)
- `GET /admin/board/datarooms` — 자료실 파일현황
  - 요청(query): `page`(기본 1)
  - 응답:
    ```jsonc
    {
      "items": [
        { "idx": 0, "file_type": "P|C", "file_name": "", "is_encode": "Y|N",
          "encode_type": "", "is_free": "Y|N", "deploy_date": "", "total_download": 0, "file_url": "" }
      ],
      "pagination": { "current_page": 1, "results_per_page": 30, "total_results": 0, "total_pages": 1 }
    }
    ```
  - 정렬: `deploy_date desc`. 30/page. total_download = tbl_dataroom_log 합계(백엔드).

## 타겟 매핑
- 라우트: `/board/dataroom_file` (`routes/board/dataroom_file.tsx`, validateSearch `{page}`)
- 스크린: `screens/dataroom-file`
- entities: 신규 `entities/dataroom` (list)
- mock: 신규 `shared/mocks/handlers/dataroom.ts`, `handlers.ts` 등록

## Parity 체크리스트
- [ ] 빈 검색필터 카드·총건수·등록 버튼
- [ ] 9컬럼(파일유형 P/컨텐츠·제공조건 무료/유료·raw 암호화) 일치
- [ ] 번호 1-based, deploy_date desc, 30/page
- [ ] 상세/수정/다운로드 링크(미이관·file_url)
- [ ] btn_delete dead 미이식
