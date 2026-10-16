# 디자인시스템 설계 — legacy 시각 언어의 코드화

> 이 프로젝트의 디자인시스템은 **새 디자인이 아니라 legacy(directg.net)의 기존 시각 언어를 코드화한 것**이다.
> 성공 기준은 동작·시각 동일성(parity)이며, 시각적 "개선"은 범위 밖이다 (AGENTS.md `## Migration`).

## 두 개의 디자인 체계 (legacy 사실)

legacy는 앱별로 서로 다른 시각 스택을 쓴다. 디자인시스템도 둘로 나눈다.

| | admin (`pc/_Admin_/`) | 스토어프론트 (`pc/`) |
|---|---|---|
| 기반 | **Hyper v3.4.0** (CoderThemes 상용 테마), Bootstrap **5.1**, `config/saas` 변형 | Bootstrap **5.3.5** (CDN) + 자체 커스텀 CSS |
| 로드 CSS | `icons.min.css` + `app.min.css` + `app-dark.min.css` (+`simplemde.min.css`) | FA 6.7.2 CDN, Splide, `templete/.../custom.css`, `page/*.css`, **`directg.css`** |
| 폰트 | Nunito(테마) + Noto Sans KR(구글폰트) | Noto Sans KR(구글폰트) |
| 아이콘 | Material Design Icons, dripicons (셀프호스팅 웹폰트) | Font Awesome 6.7.2 (CDN) |
| 상세 | [admin.md](admin.md) | [client.md](client.md) |

## 3계층 아키텍처

```
Layer 3  컴포넌트층   React 래퍼 — legacy 마크업 구조·클래스명을 캡슐화
Layer 2  토큰층       legacy SCSS 변수의 코드화 (참조 문서 + 기존 --bs-* CSS 변수 사용)
Layer 1  자산층       legacy 컴파일 CSS/폰트를 무수정 그대로 도입 — 시각 진실 원천
```

### Layer 1 — 자산층 (시각 parity의 근간)

- legacy의 **컴파일된 CSS·폰트·아이콘 파일을 그대로 복사**해 각 앱의 `public/assets/`로 도입하고 legacy와 동일한 순서로 로드한다.
- 이 파일들은 **수정 금지**다. 토큰화를 명분으로 재컴파일·정리하지 않는다 (재컴파일 결과가 1px이라도 다르면 회귀).
- 이렇게 하면 legacy 마크업 구조+클래스명을 재현하는 것만으로 시각 parity가 달성된다.

### Layer 2 — 토큰층

- 토큰의 단일 진실 원천은 legacy SCSS 변수(`pc/assets/scss/config/saas/_variables.scss` 등)다. **새 토큰 체계를 발명하지 않는다.**
- Bootstrap 5가 이미 `--bs-*` CSS 변수를 자산층 CSS에 노출하므로, 신규 작성 코드가 색·간격이 필요하면 하드코딩 대신 `var(--bs-primary)` 등을 참조한다.
- 주요 토큰 값은 [admin.md](admin.md) §토큰에 표로 코드화한다 (구현 시 값 확인용 레퍼런스).

### Layer 3 — 컴포넌트층

- 반복되는 legacy 마크업 패턴을 React 래퍼로 캡슐화한다. 래퍼는 **legacy 클래스명을 그대로 출력**한다 (자산층 CSS가 스타일링).
- 위치: 테마 클래스에 결합되므로 **앱 로컬** `apps/<app>/src/shared/ui/`(범용) 및 `widgets/`(레이아웃). `packages/ui`에 넣지 않는다.
- **선제작 금지 — rule of two**: 컴포넌트를 미리 만들지 않는다. 단위 이관 중 같은 패턴이 **두 번째** 등장할 때 래퍼로 승격한다. 인벤토리는 [admin.md](admin.md) §컴포넌트에서 관리.

## packages/ui (헤드리스)와의 관계

`packages/ui`에는 스타트킷의 헤드리스 컴포넌트(약 70종, 상태머신 기반)가 있다. 이들의 상호작용 동작(키보드/포커스/열림·닫힘)은 legacy의 Bootstrap/jQuery 위젯과 **다를 수 있으므로 admin 이관에는 기본적으로 사용하지 않는다**. 복잡한 위젯에서 도입이 유리하다고 판단되면 단위별로 parity 검증을 통과하는 조건으로만 예외 허용한다.

## 적용 로드맵 (이관 단위와 결합)

| 시점 | 작업 |
|------|------|
| M1-3 (topbar) 착수 시 | Layer 1 도입 — admin 자산 복사 + index.html 로드 배선 + body 속성(`data-layout-config`) 재현. 로그인 화면(M1-1)의 시각 parity도 이때 자동 확보 |
| M1-3~6 | Topbar/Sidebar/Footer/LoadingOverlay/Pagination 래퍼 — 인벤토리의 레이아웃·공통군 |
| M2~ | 목록/폼 이관 중 rule of two에 따라 Card/DataTable/SearchForm/FormField 등 승격 |
| client 착수 시 | [client.md](client.md) 기준으로 스토어프론트 자산층 도입 + 정밀 토큰 추출 |

## 리스크·유의사항

1. **Hyper는 상용 테마** — 기존 서비스가 보유한 라이선스 자산의 동일 제품 재구현 내 사용이지만, 신규 앱 배포 전 라이선스 조건(도메인/프로젝트 범위) 확인을 권장.
2. legacy admin은 `app.min.css`와 `app-dark.min.css`를 **동시에 로드**하고 body `data-layout-config`로 모드를 제어한다. 이 사실 그대로 재현한다 (한쪽만 로드하는 "정리" 금지).
3. jQuery 의존 위젯(apexcharts, jvectormap, smarteditor2, simplemde)은 디자인시스템 범위 밖 — 해당 화면 이관 단위에서 대체 방식을 개별 결정하고 사용자 승인 게이트를 거친다.
4. CSS 자산은 legacy가 원본이다. legacy 쪽 CSS가 갱신되면(운영 중 변경) 복사본도 갱신해야 한다 — 이관 기간 중 legacy CSS 변경 여부를 단위 착수 시 확인.
