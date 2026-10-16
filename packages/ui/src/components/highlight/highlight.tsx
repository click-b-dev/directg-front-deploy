/**
 * [Machine: 불필요] 텍스트 하이라이트. 상태 전이 없음
 */

import { forwardRef, useMemo } from "react";
import type { HighlightRootProps } from "./highlight.types";

interface TextChunk {
  text: string;
  highlighted: boolean;
}

const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const splitText = (
  text: string,
  query: string,
  matchAll: boolean,
  ignoreCase: boolean,
): TextChunk[] => {
  if (!query || !text) {
    return [{ text, highlighted: false }];
  }

  const flags = `${ignoreCase ? "i" : ""}${matchAll ? "g" : ""}`;
  const regex = new RegExp(`(${escapeRegex(query)})`, flags);
  const parts = text.split(regex);

  if (parts.length === 1) {
    return [{ text, highlighted: false }];
  }

  return parts
    .filter((part) => part !== "")
    .map((part) => {
      const isMatch = ignoreCase ? part.toLowerCase() === query.toLowerCase() : part === query;
      return { text: part, highlighted: isMatch };
    });
};

const Root = forwardRef<HTMLSpanElement, HighlightRootProps>((props, ref) => {
  const { text, query, matchAll = true, ignoreCase = true, ...restProps } = props;

  const chunks = useMemo(
    () => splitText(text, query, matchAll, ignoreCase),
    [text, query, matchAll, ignoreCase],
  );

  return (
    <span ref={ref} data-scope="highlight" data-part="root" {...restProps}>
      {chunks.map((chunk, index) =>
        chunk.highlighted ? (
          <mark key={index} data-scope="highlight" data-part="text">
            {chunk.text}
          </mark>
        ) : (
          <span key={index}>{chunk.text}</span>
        ),
      )}
    </span>
  );
});

Root.displayName = "Highlight.Root";

export const Highlight = { Root };
