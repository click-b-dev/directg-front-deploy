/**
 * [Machine: 불필요] 레이아웃 컨테이너. 상태 전이 없음
 */

import { forwardRef } from "react";
import type {
  CardRootProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
} from "./card.types";

const SCOPE = "card";

const Root = forwardRef<HTMLElement, CardRootProps>((props, ref) => {
  return <article ref={ref} data-scope={SCOPE} data-part="root" {...props} />;
});

Root.displayName = "Card.Root";

const Header = forwardRef<HTMLElement, CardHeaderProps>((props, ref) => {
  return <header ref={ref} data-scope={SCOPE} data-part="header" {...props} />;
});

Header.displayName = "Card.Header";

const Title = forwardRef<HTMLHeadingElement, CardTitleProps>((props, ref) => {
  return <h3 ref={ref} data-scope={SCOPE} data-part="title" {...props} />;
});

Title.displayName = "Card.Title";

const Description = forwardRef<HTMLParagraphElement, CardDescriptionProps>((props, ref) => {
  return <p ref={ref} data-scope={SCOPE} data-part="description" {...props} />;
});

Description.displayName = "Card.Description";

const Content = forwardRef<HTMLDivElement, CardContentProps>((props, ref) => {
  return <div ref={ref} data-scope={SCOPE} data-part="content" {...props} />;
});

Content.displayName = "Card.Content";

const Footer = forwardRef<HTMLElement, CardFooterProps>((props, ref) => {
  return <footer ref={ref} data-scope={SCOPE} data-part="footer" {...props} />;
});

Footer.displayName = "Card.Footer";

export const Card = { Root, Header, Title, Description, Content, Footer };
