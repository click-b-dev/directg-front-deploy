import type { NoticeView } from "@entities/board-notice";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

/**
 * 모바일 공지사항 상세 (legacy `mobile/board/notice_view.html`). blog-post + 목록 버튼.
 * 본문은 백엔드 렌더 HTML(`contents_html`) 주입.
 */
export function MobileNoticeViewScreen({ data }: { data: NoticeView }) {
  return (
    <>
      <MobileSubHeader pageTitle="공지사항" />
      <div id="appCapsuleSub">
        <div className="blog-post">
          <h1 className="title pt-2">{data.subject}</h1>
          <div className="post-header">
            <span className="font-12">{data.deploy_date}</span> <span>다이렉트 게임즈</span>
          </div>
          <div
            className="post-body mb-2"
            dangerouslySetInnerHTML={{ __html: data.contents_html }}
          />
        </div>

        <div className="section full">
          <div className="wide-block">
            <a href="/board/notice" className="btn btn-cprimary btn-block">
              목록
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
