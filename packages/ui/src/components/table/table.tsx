/**
 * [Machine: 불필요] 테이블 레이아웃. 상태 전이 없음
 */

import { forwardRef } from "react";
import type {
  TableRootProps,
  TableHeaderProps,
  TableBodyProps,
  TableFooterProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
  TableCaptionProps,
} from "./table.types";

const SCOPE = "table";

const Root = forwardRef<HTMLTableElement, TableRootProps>((props, ref) => {
  return <table ref={ref} data-scope={SCOPE} data-part="root" {...props} />;
});

Root.displayName = "Table.Root";

const Header = forwardRef<HTMLTableSectionElement, TableHeaderProps>((props, ref) => {
  return <thead ref={ref} data-scope={SCOPE} data-part="header" {...props} />;
});

Header.displayName = "Table.Header";

const Body = forwardRef<HTMLTableSectionElement, TableBodyProps>((props, ref) => {
  return <tbody ref={ref} data-scope={SCOPE} data-part="body" {...props} />;
});

Body.displayName = "Table.Body";

const Footer = forwardRef<HTMLTableSectionElement, TableFooterProps>((props, ref) => {
  return <tfoot ref={ref} data-scope={SCOPE} data-part="footer" {...props} />;
});

Footer.displayName = "Table.Footer";

const Row = forwardRef<HTMLTableRowElement, TableRowProps>((props, ref) => {
  return <tr ref={ref} data-scope={SCOPE} data-part="row" {...props} />;
});

Row.displayName = "Table.Row";

const Head = forwardRef<HTMLTableCellElement, TableHeadProps>((props, ref) => {
  return <th ref={ref} data-scope={SCOPE} data-part="head" {...props} />;
});

Head.displayName = "Table.Head";

const Cell = forwardRef<HTMLTableCellElement, TableCellProps>((props, ref) => {
  return <td ref={ref} data-scope={SCOPE} data-part="cell" {...props} />;
});

Cell.displayName = "Table.Cell";

const Caption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>((props, ref) => {
  return <caption ref={ref} data-scope={SCOPE} data-part="caption" {...props} />;
});

Caption.displayName = "Table.Caption";

export const Table = { Root, Header, Body, Footer, Row, Head, Cell, Caption };
