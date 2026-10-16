/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // 라우트 확장자 제거(.html/.php) 후, 기존 legacy 유입 URL·북마크·검색엔진 색인을
      // 확장자 없는 정식 URL로 301(permanent) 보존한다. 쿼리스트링은 Next가 자동 전달한다.
      { source: "/:path(.*).html", destination: "/:path", permanent: true },
      { source: "/member/logout.php", destination: "/member/logout", permanent: true },
      { source: "/service/refund_policy.php", destination: "/service/refund_policy", permanent: true },
    ];
  },
  async rewrites() {
    return [
      // 개발 fixture 전용: 백엔드 상품 이미지(`/upload/product/{code}/header/header.jpg`) 부재 →
      // placeholder로 대체해 카드 썸네일이 실데이터처럼 비율/높이를 채우도록 한다.
      // 백엔드 연결 시 fixture domain을 실제 이미지 origin으로 되돌리면 이 rewrite는 무효화된다.
      { source: "/upload/product/:path*", destination: "/assets/images/placeholder-thumb.svg" },
    ];
  },
};

export default nextConfig;
