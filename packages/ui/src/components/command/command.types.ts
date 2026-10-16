/**
 * Command React 컴포넌트 타입 정의
 * Command palette — shadcn/cmdk 스타일 간소화된 Combobox 변형
 */

export interface CommandRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 필터 함수 (기본: label에 검색어 포함) */
  filter?: (label: string, search: string) => boolean;
  /** 키보드 이벤트 루프 */
  loop?: boolean;
  children?: React.ReactNode;
}

export interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** 값 (controlled) */
  value?: string;
  /** 값 변경 콜백 */
  onValueChange?: (value: string) => void;
}

export interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 그룹 제목 */
  heading?: React.ReactNode;
  children?: React.ReactNode;
}

export interface CommandGroupHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface CommandItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** 아이템 값 (필수) */
  value: string;
  /** 검색 키워드 (기본: children 텍스트) */
  keywords?: string[];
  /** 비활성화 */
  disabled?: boolean;
  /** 선택 콜백 */
  onSelect?: (value: string) => void;
  children?: React.ReactNode;
}

export type CommandSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

export interface CommandShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

/** 내부 Context */
export interface CommandContextValue {
  /** 현재 검색어 */
  search: string;
  /** 현재 선택된 아이템 값 */
  selectedValue: string;
  /** 필터 함수 */
  filter: (label: string, search: string) => boolean;
  /** 검색어 변경 */
  setSearch: (value: string) => void;
  /** 선택 아이템 변경 */
  setSelectedValue: (value: string) => void;
  /** 아이템 등록 */
  registerItem: (value: string, label: string, keywords?: string[]) => void;
  /** 아이템 등록 해제 */
  unregisterItem: (value: string) => void;
  /** 아이템 활성화 (Enter) */
  activateItem: (value: string) => void;
  /** 아이템 onSelect 등록 */
  registerOnSelect: (value: string, onSelect: (value: string) => void) => void;
  /** 필터 매칭 여부 */
  isMatching: (value: string) => boolean;
  /** 매칭 아이템이 있는지 */
  hasMatches: boolean;
  /** loop */
  loop: boolean;
}
