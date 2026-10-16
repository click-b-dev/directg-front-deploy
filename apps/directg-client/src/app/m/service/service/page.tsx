import type { Metadata, Viewport } from "next";
import Script from "next/script";

import { MobileServiceIntroScreen } from "@screens/mobile-service-intro";

/** legacy mobile service.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile service.html head: title="서비스 소개", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "서비스 소개",
  description: "",
  keywords: "",
};

/**
 * legacy mobile service.html head 인라인 `<style>` — 전체 verbatim 이식.
 * `/assets/` → `/mobile-assets/` 경로 치환(모바일 자산 네임스페이스)만 적용.
 * (swiper CDN CSS는 매칭 요소 부재로 미로드. `.swiper-*`·`#container`·`#header`·`header .gnb` 규칙은
 *  해당 요소가 없어 무효지만 verbatim 유지.)
 */
const SERVICE_STYLE = `
body {
	color:#000000;
}
header .gnb {
	background:#1B2838;
	color:#ffffff;
}
#container {
	background:#1B2838;
	color:#ffffff;
	font-size:16px;
}
#header .head{
	background:#1B2838;
}
#header .sub{
	background:#ffffff;
}
.content {
	padding:0.5em;
	margin:0;
	font-size:16px;
	border-bottom: 1px solid rgba(255,255,255,0.1);
}
.content h3{
	font-size:1em;
	font-family: "Noto Sans KR", sans-serif;
	font-weight:normal;
	padding-top:2em;
	padding-bottom:1em;
	text-align:center;
	letter-spacing:-1px;
}
#ja-masthead-bg{
	width : 100%;
	background:url('/mobile-assets/images/service/DG_Introbr_mobile_object0_460x540.jpg');
	background-size:cover;
}
.ja-masthead{
	position:relative;
}
.ja-masthead-detail{
	position:absolute;
	top:0;
	padding:0.5em;
	margin:0;
	display: flex;
	flex-direction: column;
	align-content: center;
	align-items: flex-end;
	justify-content: center;
}
.ja-masthead-detail .bg_tag{
	position:relative;
	margin-top:1em;
	margin-bottom:1em;
}
.tag_color{
	border-radius:15px;
	background:#ffffff;
	color:#0c7ced;
	padding:0.25em 0.5em;
	font-weight:700;
	font-size:0.625em;
	font-family: "Noto Sans KR", sans-serif;
	line-height:150%;
}
.section_content{
	 padding: 0;
	 margin:0;
}
.section_item{
	flex: 1 1 100%;
    background: #131c27;
    margin: 0;
    padding: 1em;
    display: flex;
    flex-direction: column;
}
.section_item img {
    align-self: center;
}
.section_item p{
	padding:0.25em;
	line-height:150%;
	word-break:keep-all;
	white-space:pre-line;
	letter-spacing:-1px;
	text-align:center;
	font-family: "Noto Sans KR", sans-serif;
	font-size:1em;
}
.section_item h4{
	font-size:1.25em;
	text-align:center;
}
.section_item .btn_link{
	background:#0C7CEC;
	padding:0.25em 0.5em;
	margin-top:auto;
	line-height:150%;
	color:#ffffff;
	text-align:center;
	display:block;
	font-family: "Noto Sans KR", sans-serif;
	font-size:1em;
}
.section_content .section_container{
	display: flex;
	flex-wrap: wrap;
}
.section_content .section_item2{
	flex: 1 1 30%;
    background: #131B26;
    margin: 0.25em;
    padding: 0;
    text-align: center;
}
.section_content .section_item2 a{
	color:#ffffff;

}
.section_content .section_item2 p{
	font-size:0.75em;
	font-family: "Noto Sans KR", sans-serif;
	margin-top:-1em;
	padding-bottom:0.5em;
}
.section_content .section_item2 img {
	width:100%;
}
.section_content .section_container2{
	display: flex;
	flex-wrap: wrap;
	font-size: 0;
	margin-right: -10px;
	margin-bottom: -10px;
}
.section_content .section_item3{
	flex-grow: 0;
	flex-shrink: 1;
	flex-basis: calc(25% - 10px);
	box-sizing: border-box;
	background:#131B26;
	margin-bottom:10px;
}
.section_content .section_item3:nth-child(even) {
	margin: 0 10px 10px 10px;
}
.section_content .section_item3 img{
	text-align:center;
	width:100%;
}
.swiper-pagination{
	position:relative;
}
.swiper-pagination-bullet{
	width:1em;
	height:1em;
	border:2px solid rgba(255,255,255,0.8);
}
.swiper-pagination-bullet-active{
	border:2px solid #106ACA;
}
.progressbar-wrapper {
	background: none;
	width: 100%;
	padding-top: 1em;
	padding-bottom: 1em;
	display:block;
	float:left;
	margin:0;
}
.progressbar{
	width: 100%;
	display:block;
}
.progressbar li {
	list-style-type: none;
	width: 33%;
	float: left;
	position: relative;
	text-align: center;
	text-transform: uppercase;
	color: #ffffff;
}
.progressbar li:first-child:before {
	background-image:url("/mobile-assets/images/service/01-00_publisher.png");
	background-size:cover;
	background-color:#FFF;
}
.progressbar li.active:before {
	background-image:url("/mobile-assets/images/service/01-01_dglogo_v2.png");
	background-size:cover;
	background-color:#0C7CEC;
}
.progressbar li:last-child:before {
	background-image:url("/mobile-assets/images/service/01-02_member.png");
	background-size:cover;
	background-color:#FFF;
}
.progressbar li:before {
    width: 70%;
    height: auto;
	padding-top:70%;
    content: "";
    border: 4px solid #0C7CEC;
    display: block;
    text-align: center;
    border-radius: 50%;
    position: relative;
    z-index: 2;
	background-size:cover;
	margin: 0 auto;
	background:rgba(27,40,56,1);
}
.progressbar-wrapper hr{
	display:block;
	width:70%;
	border:2px solid #0C7CEC;
}
.progressbar li:first-child:after, .progressbar li.active:after {
	content: "";
	background: #0C7CEC;
	position:absolute;
	width:70%;
	height:4px;
	top:50%;
}
.flex-container{
	position:relative;
	display: flex;
	height:100%;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	align-content:space-between;
}
.flex-item{
	text-align:center;
}
.flex-item:nth-child(1){
	height:60px;
}
.flex-item:nth-child(2){
	height:40px;
}
.flex-item:nth-child(3){
	margin-top:auto;
}
.flex-item .ja-masthead-title{
	font-size:1em;
	font-family: "Noto Sans KR", sans-serif;
	text-align:center;
	line-height:150%;
	font-weight:600;
	margin-top:1em;
}
.flex-item .bg_tag{
	margin-top:1em;
}
.flex-item .ja-masthead-description{
	padding:1em;
	display:flex;
	flex-direction: row;
	align-items:center;
}
.flex-item .ja-masthead-description .flex_item2 img{
	width:100%;
}
.flex-item .ja-masthead-description .flex_item2 p{
	font-size:0.8em;
	line-height:150%;
	font-family: "Noto Sans KR", sans-serif;
	padding-left:1em;
	text-align:left;
}
.swiper-slide {
    width: 80%;
    height: auto;
}
.swiper-wrapper{
	max-height:340px;
}
`;

export default function MobileServiceIntroPage() {
  return (
    <>
      {/* legacy: Noto Sans KR (인라인 style에서 다수 사용) */}
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap"
        rel="stylesheet"
      />
      <style>{SERVICE_STYLE}</style>

      {/* Splide JS (window.Splide) — 혜택 캐러셀 마운트. CSS는 mobile style.css @import. */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js"
        strategy="afterInteractive"
      />

      <MobileServiceIntroScreen />
    </>
  );
}
