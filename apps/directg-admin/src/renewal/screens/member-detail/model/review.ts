export const REVIEW_PAGE_SIZE = 20;

// 기획: 평가 항목은 최대 2개까지 노출하고, 나머지는 "+N"으로 표시한다.
const MAX_TAGS = 2;

export const splitReviewTags = (tags: string[]) => ({
  shown: tags.slice(0, MAX_TAGS),
  more: Math.max(0, tags.length - MAX_TAGS),
});
