# 분석 템플릿 (구현 전 필수 작성)

> 철칙 3: Request / Business Logic / Database / Session / Response를 모두 파악하기 전까지 코드를 수정하지 않는다.
> 단위마다 이 템플릿을 채운 뒤에야 설계·구현으로 넘어간다.

## 0. 프로젝트 구조 분석 (최초 1회)

진입 시 먼저 전체 구조를 파악한다.

```
config.php      # 공통 설정
common.php      # 공통 로직
db.php          # DB 연결
index.php / login.php / board.php / view.php / write.php ...
```

확인 항목:
- 진입 파일 / 공통 설정 / DB 연결 / Session 처리 / 공통 Header·Footer

## 1. 화면(Page) 분석

| 항목 | 내용 |
|------|------|
| URL | |
| Request Method | |
| GET Parameter | |
| POST Parameter | |
| Session 사용 여부 | |
| Database 조회 | |
| 출력 HTML | |

## 2. Request Flow 분석

페이지별 실행 흐름을 정리한다.

```
Browser → PHP → Request Parsing → Business Logic → Database → HTML Rendering → Browser
```

## 3. 의존성 분석

`include` / `require` / `config` / `common` / `util` / `helper`를 추적한다.
Dependency Diagram 작성 권장. 한 단위를 옮길 때 끌려오는 공통 파일을 먼저 식별한다.

## 4. Database 분석

정리: 사용 Table / JOIN / Transaction / Stored Procedure / Trigger
확인: SELECT / INSERT / UPDATE / DELETE

> SQL은 **그대로** 옮긴다. 최적화·정규화 금지(철칙 6). 스키마 변경 금지(철칙 4).

## 5. Session 분석

확인 항목: 로그인 처리 / 권한 확인 / 관리자 여부 / Session 생성 / Session 삭제

```php
$_SESSION['user']
```

> Session 구조 자체의 변경(JWT 전환 등)은 **가장 마지막**(철칙 5). 지금은 기존 동작을 그대로 재현만 한다.

## 6. 화면 Component 분석

HTML을 Component 단위로 분리한다.

```
Header / Navigation / Sidebar / Content / Footer
```

Next.js에서 각각 Component로 분리한다.

---

## 작성 예시 — `board.php`

- **페이지명**: `board.php`
- **URL**: `/board.php?id=10`
- **역할**: 게시글 상세 조회
- **Request**: GET
- **Parameter**: `id`
- **Database**:
  ```sql
  SELECT * FROM board WHERE id = ?
  ```
- **Session**: 로그인 여부 확인
- **출력**: 게시글 상세 화면
- **Next.js**: `app/board/[id]/page.tsx`
