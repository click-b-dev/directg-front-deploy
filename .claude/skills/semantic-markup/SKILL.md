---
name: semantic-markup
version: 1.0.0
description: |
  신규 컴포넌트/페이지에 시맨틱 HTML, aria, structured data를 적용하는 가이드 및 체크리스트.
  si-frontend-dev(구현 시 참조)와 seo-reviewer(리뷰 체크리스트로 참조) 공유 스킬.
  "시맨틱 마크업", "aria", "structured data", "semantic-markup" 호출 시 실행.
  기존 코드 수정 없이 신규 컴포넌트/페이지에만 적용한다.
---

# semantic-markup 스킬

## 패턴 선언

- 패턴: 신규 구현 대상 파악 → 시맨틱 구조 설계 → 체크리스트 검증
- 입력: 신규 컴포넌트 또는 페이지 구현 요청, 또는 완성된 코드의 리뷰 요청
- 출력: 시맨틱 마크업 적용 가이드 또는 체크리스트 기반 리뷰 결과

## 기존 코드 참조 기준

이 스킬이 참조하는 기존 패턴이다. 수정하지 않는다.

- `src/pages/_document.tsx` 또는 `_document.js`: `<html lang="ko">` 설정 확인
- 기존 페이지의 `<script type="application/ld+json">` 패턴: structured data 적용 방식 참조

## 워크플로우

### Step 1. 사용 맥락 파악

- si-frontend-dev가 구현 전 참조 시: 아래 가이드 섹션을 적용 기준으로 제시
- seo-reviewer가 리뷰 체크리스트로 참조 시: 아래 체크리스트 섹션을 기준으로 pass/fail 판정

### Step 2. 시맨틱 구조 가이드 (구현 전 참조 시 적용)

heading 계층 규칙:
- 페이지당 `<h1>` 1개. 페이지의 주제를 담는다
- `<h2>` ~ `<h6>`는 콘텐츠 계층을 반영한다. 시각적 크기 조절 목적으로 heading 레벨을 건너뛰지 않는다
- heading이 없는 섹션에는 `aria-label`로 대체 레이블을 제공한다

landmark roles:
- `<header>`, `<main>`, `<footer>`, `<nav>`, `<aside>`, `<section>`, `<article>` 을 역할에 맞게 사용한다
- `<div>` + role 속성보다 시맨틱 엘리먼트를 우선 사용한다
- 같은 타입의 landmark가 복수 존재할 때 `aria-label`로 구별한다 (예: `<nav aria-label="상단 메뉴">`)

aria 적용 기준:
- 인터랙티브 요소(`<button>`, `<a>`, `<input>`)는 텍스트 콘텐츠 또는 `aria-label`이 반드시 있어야 한다
- 아이콘 전용 버튼: `aria-label`로 동작 설명 제공. 장식용 아이콘: `aria-hidden="true"`
- 동적으로 변경되는 영역: `aria-live="polite"` 또는 `aria-live="assertive"` 적용
- 모달/다이얼로그: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` 필수

### Step 3. Structured Data (ld+json) 가이드

신규 페이지에 structured data가 유효한 경우 아래 스키마 타입을 적용한다.

- 금융 상품 목록/상세: `FinancialProduct` 스키마
- 조직/서비스 소개: `Organization` 스키마
- FAQ 섹션: `FAQPage` 스키마
- 블로그/아티클: `Article` 스키마
- 빵 부스러기(breadcrumb) 네비게이션: `BreadcrumbList` 스키마

적용 방법:
```tsx
// 기존 패턴과 동일하게 Next.js Head 내부에 script 태그로 삽입
import Head from 'next/head'

const structuredData = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  // ...
}

<Head>
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
  />
</Head>
```

### Step 4. 체크리스트 검증 (리뷰 시 적용)

아래 항목을 pass/fail/해당없음으로 판정한다.

heading 계층:
- 페이지에 `<h1>`이 정확히 1개 있는가
- heading 레벨이 순차적으로 이어지는가 (h1 → h2 → h3, 레벨 건너뜀 없음)

landmark roles:
- `<main>` 엘리먼트가 존재하는가
- `<nav>`가 있는 경우 `aria-label`로 구별되는가
- `<div>` 남용 없이 시맨틱 엘리먼트를 사용했는가

aria:
- 아이콘 전용 버튼에 `aria-label`이 있는가
- 장식용 이미지에 `alt=""`가 지정되어 있는가
- 폼 입력 요소에 `<label>` 또는 `aria-label`이 연결되어 있는가

structured data:
- 페이지 성격에 맞는 schema.org 타입이 적용되어 있는가
- JSON-LD 문법 오류가 없는가 (중괄호, 쉼표, 따옴표)

## 검증

산출물 제출 전 아래를 자가검증한다.

- 기존 `_document.tsx` 또는 기존 페이지 파일 수정 지시가 없는가
- 가이드가 신규 코드 작성 범위 내에서만 적용 가능한가
- 체크리스트 판정 결과가 모두 pass/fail/해당없음으로 분류되었는가

## 적용 제외

- 기존 컴포넌트/페이지의 시맨틱 마크업 개선: 이 스킬 대상 외. 기존 코드 수정은 별도 요청으로 처리
- 전역 레이아웃(`_app.tsx`, `_document.tsx`) 수정: 이 스킬 대상 외
