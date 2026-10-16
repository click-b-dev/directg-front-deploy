# 제공컨텐츠 관리 - 회원별 제공컨텐츠 조회

## 원본

- 파일: `pc/_Admin_/goods/supply_content_member.php` (라이브)
- 형제: `supply_content.php`(#57), `supply_content_download.php`(후속)
- 엔티티: 기존 `supply-content` 확장.

## 화면·플로우

- 진입 URL/파라미터: `/goods/supply_content_member`
  - `search_key`(=`search_m_id`), `search_value`(회원 아이디) — **페이지네이션 없음**
- 성격: **회원 아이디로 해당 회원에게 제공된 컨텐츠 + 한글패치 인증정보(비밀번호) 조회.**

- 화면 요소 (legacy 기준):
  - page_title `회원별 제공컨텐츠 조회` / breadcrumb: 홈 > 상품 > 제공컨텐츠 관리 > 회원별 제공컨텐츠 조회
  - 검색 카드(`회원검색`): search_key select(회원아이디=`search_m_id`; 회원고유번호는 주석처리) + search_value text + submit `회원 조회`
  - 목록 카드(`제공컨텐츠 현황`), 테이블(colgroup 3/5/20/*/5/5), 6컬럼:
    - 번호(1부터 오름차순) / 제공컨텐츠 유형(P→한글패치/else 컨텐츠) / 제공 컨텐츠명 / 제공 컨텐츠 URL / **암호화 여부(raw `is_encode` Y·N)** / 암호화 방식(`encode_type`)
    - `is_encode=='Y'`면 각 컨텐츠 행 아래 **한글패치 인증정보 행**:
      - th `한글패치 인증정보` colspan=2 / td colspan=4: `아이디: {search_value}` · `비밀번호: {patch_password}`(span) · `비밀번호 복사` 버튼(clipboard)
  - 검색어 없으면 목록 비어있음(legacy: `$supply_content_list_all` 미설정 → 빈 반복).

### 특이/차이

- `supply_content.php`(#57)는 암호화 여부를 "암호화 있음/없음"으로, 본 화면은 **raw `Y`/`N`** 표기.
- 비밀번호 = `patchEncDataAdmin(m_id, prefix_text, encode_type)` — 컨텐츠 idx별 `$patch_auth` 맵(prefix_text/encode_type)으로 base64/md5 인코딩. **백엔드 계산**(프론트 표시만).
- 데이터 = `sp_supply_goods_chk4(m_no)` + `sp_supply_content_chk(m_id)` 결과 merge → supply_content 기준 DESC 정렬·중복 제거.

## 데이터 (legacy)

- m_id → m_no 조회(tbl_member). m_no>0이면 `sp_supply_goods_chk4(m_no)`, 항상 `sp_supply_content_chk(m_id)` 호출 후 merge/uniq.
- 컬럼: `idx, supply_content_type, supply_content, supply_content_url, is_encode, encode_type`.
- 인증정보: `$patch_auth[idx] = {encode_type, prefix_text}` → `patchEncDataAdmin`.

## API 계약 (백엔드 전달)

### `GET /admin/goods/supply-contents/member`

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `search_key` | string | `search_m_id`(회원아이디) |
| `search_value` | string | 회원 아이디 |

백엔드 책임:
- m_id로 회원 조회 → SP 2종 merge/dedup(supply_content 기준).
- `is_encode='Y'` 항목은 `patch_password`(patchEncDataAdmin 결과) 포함.
- 회원 미존재/미검색 시 `items: []`.

응답 `200`:
```jsonc
{
  "member_id": "tester01",
  "items": [{
    "idx": 1,
    "supply_content_type": "P",
    "supply_content": "PREY 한글패치",
    "supply_content_url": "https://.../prey_kor.zip",
    "is_encode": "Y",
    "encode_type": "md5",
    "patch_password": "5f4dcc3b5aa765d61d8327deb882cf99"  // is_encode=Y일 때만(백엔드 계산)
  }]
}
```

## 타겟 매핑

- 라우트: `routes/goods/supply_content_member.tsx` → `/goods/supply_content_member`
- screens: `screens/goods-supply-content-member`
- entities: `supply-content` 확장 — `SupplyContentMemberSearch`/`SupplyContentMemberItem`/`SupplyContentMemberResponse`, `fetchSupplyContentMember`, `useSupplyContentMember`(search_value 있을 때만 enabled)
- shared: 클립보드 복사(navigator.clipboard로 legacy ClipboardJS 대체 — 동작 동일)
- mock: `supply-content.ts` — `SUPPLY_CONTENT_MEMBER`(회원별) + `GET /admin/goods/supply-contents/member`

## Parity 체크리스트

- [ ] 화면 요소 일치 (page_title/회원검색/6컬럼/인증정보 행)
- [ ] 필드/검증 일치 (search_m_id, 암호화여부 raw Y/N, 인증정보 아이디/비밀번호/복사)
- [ ] 분기/플로우 일치 (is_encode=Y만 인증정보 행, 검색 전 빈 목록)
- [ ] 엣지케이스 일치 (회원 미존재 빈 목록, 비밀번호 복사)
