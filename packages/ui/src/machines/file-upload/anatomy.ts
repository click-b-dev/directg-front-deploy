/**
 * FileUpload 컴포넌트 해부학 (Zag.js 기준)
 */

export const fileUploadAnatomy = {
  root: "root",
  dropzone: "dropzone",
  trigger: "trigger",
  hiddenInput: "hidden-input",
  itemGroup: "item-group",
  item: "item",
  itemName: "item-name",
  itemSizeText: "item-size-text",
  itemDeleteTrigger: "item-delete-trigger",
  itemPreview: "item-preview",
  itemPreviewImage: "item-preview-image",
  label: "label",
} as const;

export type FileUploadPart = keyof typeof fileUploadAnatomy;
