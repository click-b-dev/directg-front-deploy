import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from "react";

// legacy admin: Naver SmartEditor2(HuskyEZCreator, iframe WYSIWYG HTML). description_v2 필드.
// SE2 에셋은 public/smarteditor2/(legacy 원본 복사). jindo 프레임워크 자체 번들 — jQuery 불필요.
// 저장 시 legacy처럼 getIR()로 HTML을 추출한다(onChange 없음, 명령형 getContent).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Se2Global = any;

let huskyPromise: Promise<void> | null = null;
const loadHusky = (): Promise<void> => {
  if ((window as unknown as { nhn?: Se2Global }).nhn?.husky?.EZCreator) {
    return Promise.resolve();
  }
  if (huskyPromise) {
    return huskyPromise;
  }
  huskyPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/smarteditor2/js/service/HuskyEZCreator.js";
    script.charset = "utf-8";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("SmartEditor2 로드 실패"));
    document.head.appendChild(script);
  });
  return huskyPromise;
};

export type SmartEditorHandle = { getContent: () => string };

type SmartEditorProps = { initialValue: string };

export const SmartEditor = forwardRef<SmartEditorHandle, SmartEditorProps>(
  ({ initialValue }, ref) => {
    const rawId = useId();
    const id = `se2_${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
    // SE2가 oAppRef.getById[id]에 에디터 인스턴스를 등록.
    const oEditorsRef = useRef<Se2Global>([]);
    const initialRef = useRef(initialValue);

    useImperativeHandle(ref, () => ({
      getContent: () => {
        const editor = oEditorsRef.current?.getById?.[id];
        if (!editor) {
          return initialRef.current;
        }
        // legacy: UPDATE_CONTENTS_FIELD로 iframe→textarea 반영 후 getIR()로 HTML 추출.
        editor.exec("UPDATE_CONTENTS_FIELD", []);
        return editor.getIR();
      },
    }));

    useEffect(() => {
      let cancelled = false;
      loadHusky()
        .then(() => {
          if (cancelled || oEditorsRef.current?.getById?.[id]) {
            return;
          }
          const nhn = (window as unknown as { nhn: Se2Global }).nhn;
          nhn.husky.EZCreator.createInIFrame({
            oAppRef: oEditorsRef.current,
            elPlaceHolder: id,
            sSkinURI: "/smarteditor2/SmartEditor2Skin.html",
            htParams: {
              bUseToolbar: true,
              bUseVerticalResizer: true,
              bUseModeChanger: true,
              bSkipXssFilter: true,
              I18N_LOCALE: "ko_KR",
            },
            fCreator: "createSEditor2",
          });
        })
        .catch(() => {
          // 로드 실패 시 textarea 원본으로 폴백(에디터 없이 편집).
        });
      return () => {
        cancelled = true;
      };
    }, [id]);

    // div로 감싸 언마운트 시 SE2가 삽입한 iframe까지 React가 함께 제거.
    return (
      <div>
        <textarea
          id={id}
          name={id}
          defaultValue={initialValue}
          className="form-control font-12"
          style={{ width: "790px", height: "auto" }}
        />
      </div>
    );
  },
);

SmartEditor.displayName = "SmartEditor";
