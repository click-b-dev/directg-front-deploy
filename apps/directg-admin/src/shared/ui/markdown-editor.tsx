import { useEffect, useRef } from "react";
import EasyMDE from "easymde";
import "easymde/dist/easymde.min.css";

// legacy admin: SimpleMDE 마크다운 에디터. 유지보수 포크 EasyMDE로 재현(얇은 React 래퍼).
// EasyMDE가 DOM 상태를 소유하므로 마운트 시 1회 초기화하고, 변경을 onChange로 상위에 전달한다.
type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export const MarkdownEditor = ({ value, onChange }: MarkdownEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }
    const editor = new EasyMDE({
      element: textareaRef.current,
      initialValue: value,
      // 영문 사전(CDN)·한국어 오탐 방지로 비활성(편집 보조 기능).
      spellChecker: false,
    });
    editor.codemirror.on("change", () => onChangeRef.current(editor.value()));
    return () => {
      editor.toTextArea();
      editor.cleanup();
    };
    // 마운트 시 1회 초기화. 외부 값 변경(sync 후 reload)은 상위에서 key로 remount 처리.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <textarea ref={textareaRef} />;
};
