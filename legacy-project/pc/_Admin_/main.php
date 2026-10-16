<?
	header('Content-Type: text/html; charset=UTF-8');
	ini_set( "display_errors", 0 );
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	
	$topmenu['dashboard'] = "active";
	
?>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<title>관리자시스템::다이렉트 게임즈 관리자시스템 V2</title>
<meta name="viewport" content="width=1620">
<meta content="" name="description" />
<meta content="" name="author" />
<!-- App favicon -->
<link rel="shortcut icon" href="/favicon.ico">

<!-- third party css -->
<link href="<?=$document_root?>/assets/css/vendor/jquery-jvectormap-1.2.2.css" rel="stylesheet" type="text/css" />
<!-- third party css end -->

<!-- App css -->
<link href="<?=$document_root?>/assets/css/icons.min.css" rel="stylesheet" type="text/css" />
<link href="<?=$document_root?>/assets/css/app.min.css?33" rel="stylesheet" type="text/css" id="light-style" />
<link href="<?=$document_root?>/assets/css/app-dark.min.css?11" rel="stylesheet" type="text/css" id="dark-style" />

<style>
.nav-item{
	width:100px;
}

.topnav-logo{
	width:260px;
}
</style>
</head>

<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<!-- Topbar Start -->
<div class="navbar-custom topnav-navbar topnav-navbar-dark">
	<div class="container-fluid">
		<div class="d-flex flex-row">
			<!-- LOGO -->
			<div class="px-0 text-center">
				<a href="/_Admin_/main.php" class="topnav-logo">
					<span class="topnav-logo-lg">
						<img src="/assets/images/logo/H2_DG_BI_nm_194x45_v2.png" alt="" >
					</span>
					<span class="topnav-logo-sm">
						<img src="/assets/images/logo/H2_DG_BI_nm_194x45_v2.png" alt="" >
					</span>
				</a>
			</div>

			<ul class="nav nav-pills col-9 justify-content-start">
				<li class="nav-item">
					<a href="#" class="nav-link h-100 px-2 rounded-0 <?=$topmenu['dashboard']?>">
						<div class="d-flex flex-column text-center">
							<i class="uil uil-dashboard font-22"></i>
							<span class="">대시보드</span>
						</div>
					</a>
				</li>
				<li class="nav-item border-end border-secondary">
						<a href="<?=$document_root?>/site/banner_list.php" class="nav-link px-2 rounded-0 <?=$topmenu['site']?>">
							<div class="d-flex flex-column text-center">
								<i class="dripicons-gear noti-icon font-22"></i>
								<span class="">사이트</span>
							</div>
						</a>
					</li>
					
				<li class="nav-item">
					<a href="<?=$document_root?>/goods/dashboard_goods.php" class="nav-link h-100 px-2 rounded-0 border-end border-secondary <?=$topmenu['goods']?>">
						<div class="d-flex flex-column text-center">
							<i class="uil-store font-22"></i>
							<span class="">상품</span>
						</div>
					</a>
				</li>
				<li class="nav-item">
					<a href="<?=$document_root?>/goods/stock/dashboard_stock.php" class="nav-link h-100 px-2 rounded-0 border-end border-secondary <?=$topmenu['stock']?>">
						<div class="d-flex flex-column text-center">
							<i class="mdi mdi-warehouse font-22"></i>
							<span class="">재고</span>
						</div>
					</a>
				</li>
				<li class="nav-item">
					<a href="<?=$document_root?>/member/dashboard_crm.php" class="nav-link h-100 px-2 rounded-0 border-end border-secondary <?=$topmenu['member']?>">
						<div class="d-flex flex-column text-center">
							<i class="dripicons-user font-22"></i>
							<span class="">회원</span>
						</div>
					</a>
				</li>
				<li class="nav-item">
					<a href="<?=$document_root?>/order/dashboard_order.php" class="nav-link h-100 px-2 rounded-0 border-end border-secondary <?=$topmenu['order']?>">
						<div class="d-flex flex-column text-center">
							<i class="uil uil-notes font-22"></i>
							<span class="">주문</span>
						</div>
					</a>
				</li>
				
				<li class="nav-item">
					<a href="<?=$document_root?>/promotion/dashboard_promotion.php" class="nav-link h-100 px-2 rounded-0 border-end border-secondary <?=$topmenu['promotion']?>">
						<div class="d-flex flex-column text-center">
							<i class="uil-calender font-22"></i>
							<span class="">프로모션</span>
						</div>
					</a>
				</li>
				<li class="nav-item">
					<a href="<?=$document_root?>/event/event_board_list.php" class="nav-link h-100 px-2 rounded-0 border-end border-secondary <?=$topmenu['event']?>">
						<div class="d-flex flex-column text-center">
							<i class="uil uil-document font-22"></i>
							<span>이벤트</span>
						</div>
					</a>
				</li>
				
				<li class="nav-item">
					<a href="<?=$document_root?>/board/dashboard_board.php" class="nav-link h-100 px-2 rounded-0 border-end border-secondary <?=$topmenu['board']?>">
						<div class="d-flex flex-column text-center">
							<i class="uil uil-document font-22"></i>
							<span>게시판</span>
						</div>
					</a>
				</li>
				
				<li class="nav-item">
					<a href="<?=$document_root?>/statistics/order/order_day_count.php" class="nav-link h-100 px-2 rounded-0 border-end border-secondary <?=$topmenu['statictics']?>">
						<div class="d-flex flex-column text-center">
							<i class="uil-chart font-22"></i>
							<span class="">통계</span>
						</div>
					</a>
				</li>
				<li class="nav-item">
					<a href="<?=$document_root?>/china/invoice_list.php" class="nav-link h-100 px-2 rounded-0 border-end border-secondary <?=$topmenu['invoice']?>">
						<div class="d-flex flex-column text-center">
							<i class="uil uil-invoice font-22"></i>
							<span class="">중국결제</span>
						</div>
					</a>
				</li>
				<li class="nav-item">
					<a href="<?=$document_root?>/partner/partner_list.php" class="nav-link h-100 px-2 rounded-0 border-end border-secondary <?=$topmenu['partner']?>">
						<div class="d-flex flex-column text-center">
							<i class="dripicons-article font-22"></i>
							<span class="">파트너</span>
						</div>
					</a>
				</li>
			</ul>

			<div class="dropdown float-end col-1">
				<a class="nav-link dropdown-toggle nav-user arrow-none me-0" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
					<span class="account-user-name"><?=$_SESSION['admin']["admin_name"]?></span>(<?=$_SESSION['admin']["admin_level"]?>)
				</a>
				<div class="dropdown-menu dropdown-menu-end dropdown-menu-animated topbar-dropdown-menu profile-dropdown">
					<!-- item-->
					<a href="javascript:void(0);" class="dropdown-item notify-item">
						<i class="mdi mdi-account-circle me-1"></i>
						<span>프로필 관리</span>
					</a>

					<!-- item-->
					<a href="javascript:void(0);" class="dropdown-item notify-item">
						<i class="mdi mdi-account-edit me-1"></i>
						<span>설정</span>
					</a>

					<!-- item-->
					<a href="javascript:void(0);" class="dropdown-item notify-item">
						<i class="mdi mdi-lifebuoy me-1"></i>
						<span>활동이력</span>
					</a>

					<!-- item-->
					<a href="javascript:void(0);" class="dropdown-item notify-item">
						<i class="mdi mdi-lock-outline me-1"></i>
						<span>화면잠금</span>
					</a>

					<!-- item-->
					<a href="javascript:void(0);" class="dropdown-item notify-item">
						<i class="mdi mdi-logout me-1"></i>
						<span>로그아웃</span>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
<!-- end Topbar -->
	<!-- Begin page -->
	<div class="wrapper">
		<!-- ============================================================== -->
		<!-- Start Page Content here -->
		<!-- ============================================================== -->

		<div class="content-page ms-0 pt-0">
			<div class="content">
				<!-- Start Content-->
				<div class="container-fluid">

					<!-- start page title -->
					<div class="row">
						<div class="col-12">
							<div class="page-title-box">
								<div class="page-title-right">
								</div>
								<h4 class="page-title">대시보드</h4>
							</div>
						</div>
					</div>
					<!-- end page title -->
					
					<div class="row">
						<div class="col-9">
							<div class="card">
								<h5 class="card-header bg-secondary text-white">운영서비스 관리현황</h5>
								<div class="card-body p-2">
									<table class="table table-bordered table-sm table-centered">
										<colgroup>
											<col >
											<col >
											<col >
											<col >
											<col>
											<col>
											<col>
										</colgroup>
										<thead class="table-light font-13">
										<tr>
											<th class="text-center">시스템분류</th>
											<th class="text-center">서비스 분류</th>
											<th class="text-center">서비스 용도</th>
											<th class="text-center">서비스 내용</th>
											<th class="text-center">서비스 기간</th>
											<th class="text-center">서비스 제공업체</th>
											<th class="text-center">운영관리업무</th>
										</tr>
										</thead>
										<tbody class="font-12">
										<tr>
											<td rowspan="16" class="text-center">DGKR 리뉴얼<br/>(PC버전 - https://directg.net)<br/>(모바일버전 - https://m.directg.net)</td>
											<td class="text-center">서버호스팅</td>
											<td class="">웹서버 (175.126.82.76)</td>
											<td>DG 웹서비스 운영</td>
											<td class="">~ 2026-12-04 (<?=intval((strtotime('2026-12-04')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">카페24 (dgkrshop)</td>
											<td class="">
												- 서버호스팅 기간연장 관리<br>
												- 서버 트래픽 모니터링
											</td>
										</tr>
										<tr>
											<td class="text-center">보안</td>
											<td class="">웹방화벽<br>(딥파이더)</td>
											<td class="">DG 웹서비스 해킹공격 방어</td>
											<td class="">~ 2026-12-04 (<?=intval((strtotime('2026-12-04')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">카페24 (dgkrshop)</td>
											<td class="">
												- 웹방화벽 정상동작 모니터링<br>
												- 웹방화벽 오탐지 여부 모니터링 및 차단해제
											</td>
										</tr>
										<tr>
											<td class="text-center">보안</td>
											<td class="">SSL보안인증서<br>(멀티도메인)</td>
											<td class="">
												* 적용 도메인 현황<br>
												 - directg.net (DG PC 대표도메인)<br>
												- m.directg.net (DG 모바일 대표도메인)<br>
											 </td>
											<td class="">~ 2026-11-13 (<?=intval((strtotime('2026-11-13')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">카페24 (h2intershop)</td>
											<td class="">
												- SSL 보안인증서 기간연장 관리 <br>
												- SSL 보안인증서 갱신
											</td>
										</tr>
										<tr>
											<td class="text-center">이미지호스팅</td>
											<td class="">트래픽분산</td>
											<td class="">DG 웹서비스 이미지파일 업로드</td>
											<td class="">~2027-01-21 (<?=intval((strtotime('2027-01-21')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">디스크엔 (directg)</td>
											<td class="">
												- 서비스 정상동작 모니터링 <br>
												- DG 웹서비스 이미지파일 업로드 <br>
											</td>
										</tr>
										<tr>
											<td class="text-center">API</td>
											<td class="">유료메일발송</td>
											<td class="">
												- DG 회원가입시 인증메일 발송<br> 
												- DG 비밀번호찾기시 인증메일 발송
											</td>
											<td class="">충전식 포인트 차감 <br>(건당 0.5원)</td>
											<td class="">다이렉트샌드 (dcpinter)</td>
											<td class="">
												- 메일발송 서비스 정상동작 모니터링 <br>
												- 충전포인트 관리 <br>
											</td>
										</tr>
										<tr>
											<td class="text-center">API</td>
											<td class="">결제 PG</td>
											<td class="">신용카드, 계좌이체, 휴대폰 결제서비스</td>
											<td class=""></td>
											<td class="">KCP (directg2)</td>
											<td class=""></td>
										</tr>
										<tr>
											<td class="text-center">API</td>
											<td class="">간편결제 PG</td>
											<td class="">PAYCO 간편결제서비스</td>
											<td class=""></td>
											<td class="">PAYCO (h2interactive)</td>
											<td class=""></td>
										</tr>
										<tr>
											<td class="text-center">API</td>
											<td class="">간편결제 PG</td>
											<td class="">네이버페이 간편결제서비스</td>
											<td class=""></td>
											<td class="">네이버페이</td>
											<td class=""></td>
										</tr>
										<tr>
											<td class="text-center">API</td>
											<td class="">간편로그인</td>
											<td class="">네이버 간편로그인 서비스</td>
											<td class=""></td>
											<td class="">네이버</td>
											<td class=""></td>
										</tr>
										<tr>
											<td class="text-center">API</td>
											<td class="">간편로그인</td>
											<td class="">카카오 간편로그인 서비스</td>
											<td class=""></td>
											<td class="">카카오</td>
											<td class=""></td>
										</tr>
										<tr>
											<td class="text-center">API</td>
											<td class="">간편로그인</td>
											<td class="">페이코 간편로그인 서비스</td>
											<td class=""></td>
											<td class="">페이코</td>
											<td class=""></td>
										</tr>
										<tr>
											<td class="text-center">API</td>
											<td class="">본인인증</td>
											<td class="">휴대폰 본인인증 서비스</td>
											<td class=""></td>
											<td class="">KCP (gamepara)</td>
											<td class=""></td>
										</tr>
										<tr>
											<td class="text-center">API</td>
											<td class="">결제 연동 모듈</td>
											<td class="">KCP 결제연동</td>
											<td class=""></td>
											<td class="">포트원 (구 아임포트)</td>
											<td class=""></td>
										</tr>
										<tr>
											<td class="text-center">API</td>
											<td class="">주문연동</td>
											<td class="">Ztorm API 서비스</td>
											<td class=""></td>
											<td class=""></td>
											<td class=""></td>
										</tr>
										<tr>
											<td class="text-center">API</td>
											<td class="">주문연동</td>
											<td class="">Genba API 서비스</td>
											<td class=""></td>
											<td class=""></td>
											<td class=""></td>
										</tr>
										<tr>
											<td class="text-center">API</td>
											<td class="">주문연동</td>
											<td class="">Vaultn API 서비스</td>
											<td class=""></td>
											<td class=""></td>
											<td class=""></td>
										</tr>
										<tr>
											<td rowspan="7" class="text-center">DGKR<br/>(PC버전 - https://directgames.co.kr)<br/>(모바일버전 - https://m.directgames.co.kr)</td>
											<td class="text-center">서버호스팅</td>
											<td class="">웹서버 (110.10.129.207)</td>
											<td>DG 웹서비스 운영</td>
											<td class="">~ 2026-09-09 (<?=intval((strtotime('2026-09-09')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">카페24 (h2intershop)</td>
											<td class="">
												- 서버호스팅 기간연장 관리<br>
												- 서버 트래픽 모니터링
											</td>
										</tr>
										<tr>
											<td class="text-center">서버호스팅</td>
											<td class="">DB서버 (110.10.130.54)</td>
											<td class="">DG 웹서비스 데이터 저장</td>
											<td class="">~ 2026-11-08 (<?=intval((strtotime('2026-11-08')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">카페24 (h2interdb)</td>
											<td class="">
												- 서버호스팅 기간연장 관리<br>
												- 서버 트래픽 모니터링
											</td>
										</tr>
										<tr>
											<td class="text-center">서버호스팅</td>
											<td class="">Asset서버 (175.125.94.163)</td>
											<td class="">DG 키 재고 관리 및 키 발송 API서비스</td>
											<td class="">~ 2027-02-25 (<?=intval((strtotime('2027-02-25')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">카페24 (dgassetjp)</td>
											<td class="">
												- 서버호스팅 기간연장 관리<br>
												- 서버 트래픽 모니터링
											</td>
										</tr>
										<tr>
											<td class="text-center">보안</td>
											<td class="">웹방화벽<br>(딥파이더)</td>
											<td class="">DG 웹서비스 해킹공격 방어</td>
											<td class="">~ 2026-06-09 (<?=intval((strtotime('2026-06-09')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">카페24 (h2intershop)</td>
											<td class="">
												- 웹방화벽 정상동작 모니터링<br>
												- 웹방화벽 오탐지 여부 모니터링 및 차단해제
											</td>
										</tr>
										<tr>
											<td class="text-center">보안</td>
											<td class="">SSL보안인증서<br>(멀티도메인)</td>
											<td class="">
												- directgames.co.kr (대표도메인)<br>
												- m.directgames.co.kr (대표도메인)<br>
												
											 </td>
											<td class="">~ 2026-11-13 (<?=intval((strtotime('2026-11-13')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">카페24 (h2intershop)</td>
											<td class="">
												- SSL 보안인증서 기간연장 관리 <br>
												- SSL 보안인증서 갱신
											</td>
										</tr>
										<tr>
											<td class="text-center">도메인</td>
											<td class="">DG 도메인</td>
											<td class="">DGKR  <br>- directg.net</td>
											<td class="">~ 2027-04-17 (<?=intval((strtotime('2027-04-17')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">고도몰 (dcpinter)</td>
											<td class="">- 도메인 기간연장 관리</td>
										</tr>
										<tr>
											<td class="text-center">도메인</td>
											<td class="">DG 도메인</td>
											<td class="">DGKR<br>- directgames.co.kr</td>
											<td class="">~ 2028-07-29 (<?=intval((strtotime('2028-07-29')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">카페24 (h2intershop)</td>
											<td class="">- 도메인 기간연장 관리</td>
										</tr>
										<tr>
											<td rowspan="7" class="text-center">DGJP</td>
											<td class="text-center">서버호스팅</td>
											<td class="">웹서버 (1.234.83.241)</td>
											<td>DGJP 웹서비스 운영</td>
											<td class="">~ 2026-10-27 (<?=intval((strtotime('2026-10-27')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">카페24 (h2interactive)</td>
											<td class="">
												- 서버호스팅 기간연장 관리<br>
												- 서버 트래픽 모니터링
											</td>
										</tr>
										<tr>
											<td class="text-center">서버호스팅</td>
											<td class="">DB서버 (175.126.146.157)</td>
											<td class="">DGJP 웹서비스 데이터 저장</td>
											<td class="">~ 2026-11-16 (<?=intval((strtotime('2026-11-16')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">카페24 (dgjpdb)</td>
											<td class="">
												- 서버호스팅 기간연장 관리<br>
												- 서버 트래픽 모니터링
											</td>
										</tr>
										<tr>
											<td class="text-center">서버호스팅</td>
											<td class="">Asset서버 (211.110.44.14)</td>
											<td class="">DGJP 키 재고 관리 및 키 발송 API서비스</td>
											<td class="">~ 2027-06-09 (<?=intval((strtotime('2027-06-09')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">카페24 (h2interasset)</td>
											<td class="">
												- 서버호스팅 기간연장 관리<br>
												- 서버 트래픽 모니터링
											</td>
										</tr>
										<tr>
											<td class="text-center">보안</td>
											<td class="">웹방화벽<br>(딥파이더)</td>
											<td class="">DGJP 웹서비스 해킹공격 방어</td>
											<td class="">~ 2026-10-27 (<?=intval((strtotime('2026-10-27')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">카페24  (h2interactive)</td>
											<td class="">
												- 웹방화벽 정상동작 모니터링<br>
												- 웹방화벽 오탐지 여부 모니터링 및 차단해제
											</td>
										</tr>
										<tr>
											<td class="text-center">보안</td>
											<td class="">SSL보안인증서<br>(멀티도메인)</td>
											<td class="">
												* 적용 도메인 현황<br>
												- directg.jp (DGJP PC 대표도메인)<br>
												- directgames.jp <br>
												- m.directg.jp (DGJP 모바일 대표도메인)<br>
											 </td>
											<td class="">~ 2026-11-06 (<?=intval((strtotime('2026-11-06')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">카페24  (h2interactive)</td>
											<td class="">
												- SSL 보안인증서 기간연장 관리 <br>
												- SSL 보안인증서 갱신
											</td>
										</tr>
										<tr>
											<td class="text-center">도메인</td>
											<td class="">DGJP 도메인</td>
											<td class="">DGJP PC,모바일<br> - directg.jp </td>
											<td class="">~2026-10-31 (<?=intval((strtotime('2026-10-31')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">muumuu-domain.com</td>
											<td class="">- 도메인 기간연장 관리</td>
										</tr>
										<tr>
											<td class="text-center">도메인</td>
											<td class="">DGJP 도메인</td>
											<td class="">도메인 포워딩 <br>- directgames.jp </td>
											<td class="">~2026-10-31 (<?=intval((strtotime('2026-10-31')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">muumuu-domain.com</td>
											<td class="">- 도메인 기간연장 관리</td>
										</tr>
										<tr>
											<td rowspan="8" class="text-center">H2 홈페이지 한국어버전<br/> (http://h2int.com)</td>
											<td class="text-center">서버호스팅</td>
											<td class="">웹서버 (110.10.189.175)</td>
											<td class="">H2 홈페이지 웹서비스 운영</td>
											<td class="">~ 2026-12-18 (<?=intval((strtotime('2026-12-18')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">카페24 (h2interhome)</td>
											<td class="">
												- 서버호스팅 기간연장 관리<br>
												- 서버 트래픽 모니터링
											</td>
										</tr>
										<tr>
											<td class="text-center">도메인</td>
											<td class="">H2 홈페이지 도메인</td>
											<td class="">도메인 포워딩 <br> - h2interactive.co.kr</td>
											<td class="">~2027-02-14 (<?=intval((strtotime('2027-02-14')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">고도몰</td>
											<td class="">- 도메인 기간연장 관리</td>
										</tr>
										<tr>
											<td class="text-center">도메인</td>
											<td class="">H2 홈페이지 도메인</td>
											<td class="">도메인 포워딩 <br> - h2inter.com</td>
											<td class="">~2027-07-28 (<?=intval((strtotime('2027-07-28')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">고도몰</td>
											<td class="">- 도메인 기간연장 관리</td>
										</tr>
										<tr>
											<td class="text-center">도메인</td>
											<td class="">H2 홈페이지 도메인</td>
											<td class="">도메인 포워딩 <br> - h2inter.co.kr </td>
											<td class="">~2035-08-14 (<?=intval((strtotime('2035-08-14')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">후이즈</td>
											<td class="">- 도메인 기간연장 관리</td>
										</tr>
										<tr>
											<td class="text-center">도메인</td>
											<td class="">H2 홈페이지 도메인</td>
											<td class="">도메인 포워딩 <br> - h2inter.net </td>
											<td class="">~2035-08-14 (<?=intval((strtotime('2035-08-14')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">후이즈</td>
											<td class="">- 도메인 기간연장 관리</td>
										</tr>
										<tr>
											<td class="text-center">도메인</td>
											<td class="">H2 홈페이지 도메인</td>
											<td class="">도메인 포워딩 <br> - h2int.co.kr </td>
											<td class="">~2030-09-28 (<?=intval((strtotime('2030-09-28')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">후이즈</td>
											<td class="">- 도메인 기간연장 관리</td>
										</tr>
										<tr>
											<td class="text-center">도메인</td>
											<td class="">H2 홈페이지 도메인</td>
											<td class="">H2 홈페이지 대표도메인<br> - h2int.com </td>
											<td class="">~2030-09-28 (<?=intval((strtotime('2030-09-28')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">후이즈</td>
											<td class="">- 도메인 기간연장 관리</td>
										</tr>
										<tr>
											<td class="text-center">도메인</td>
											<td class="">H2 홈페이지 도메인</td>
											<td class="">도메인 포워딩 <br> - h2int.net </td>
											<td class="">~2030-09-28 (<?=intval((strtotime('2030-09-28')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">후이즈</td>
											<td class="">- 도메인 기간연장 관리</td>
										</tr>
										<tr>
											<td rowspan="2" class="text-center">H2 홈페이지 일본어버전 <br/> (http://h2int.jp)</td>
											<td class="text-center">서버호스팅</td>
											<td class="">웹서버</td>
											<td class="">H2 홈페이지 일본어버전 웹서비스 운영</td>
											<td class="">~ 2026-12-18 (<?=intval((strtotime('2026-12-18')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">카페24 (h2interhome)</td>
											<td class="">
												- 서버호스팅 기간연장 관리<br>
												- 서버 트래픽 모니터링
											</td>
										</tr>
										<tr>
											<td class="text-center">도메인</td>
											<td class="">H2 홈페이지 도메인</td>
											<td class="">H2 홈페이지 일본어버전 대표도메인 <br> - h2int.jp</td>
											<td class="">~2026-08-31 (<?=intval((strtotime('2026-12-18')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">일본지사</td>
											<td class="">- 도메인 기간연장 관리</td>
										</tr>
										<tr>
											<td rowspan="2" class="text-center">H2몰</td>
											<td class="text-center">도메인</td>
											<td class="">H2몰 도메인</td>
											<td class="">H2몰 대표도메인 <br> - h2mall.net</td>
											<td class="">~2029-11-27 (<?=intval((strtotime('2029-11-27')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">후이즈</td>
											<td class="">- 도메인 기간연장 관리</td>
										</tr>
										<tr>
											<td class="text-center">도메인</td>
											<td class="">H2몰 도메인</td>
											<td class="">도메인 포워딩<br> - h2mall.co.kr</td>
											<td class="">~2030-09-22 (<?=intval((strtotime('2030-09-22')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">후이즈</td>
											<td class="">- 도메인 기간연장 관리</td>
										</tr>
										<tr>
											<td class="text-center">메일서비스<br/>(https://mail.h2int.com)</td>
											<td class="text-center">웹메일</td>
											<td class="">사내메일</td>
											<td class="">접속도메인 <br>-mail.h2int.com (대표도메인)<br>-mail.h2interactive.co.kr</td>
											<td class="">~2027-01-23 (<?=intval((strtotime('2027-01-23')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">닷홈</td>
											<td class="">
												- 웹메일서비스 기간연장 관리<br>
												- 웹메일서비스 장애시 원인분석 및 조치<br>
											</td>
										</tr>
										<tr>
											<td rowspan="3" class="text-center">제휴DG 현대이지웰 <br/>(PC버전 - https://ezwel.directg.net) <br/>(모바일버전 - https://m.ezwel.directg.net)</td>
											<td class="text-center">서버호스팅</td>
											<td class="">웹서버</td>
											<td class="">현대이지웰 제휴 웹서비스</td>
											<td class="">~2026-06-01 (<?=intval((strtotime('2026-06-01')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">카페24 (dgezwel)</td>
											<td class="">
												- 서버호스팅 기간연장 관리<br>
												- 서버 트래픽 모니터링<br>
											</td>
										</tr>
										<tr>
											<td class="text-center">보안</td>
											<td class="">웹방화벽<br>(딥파이더)</td>
											<td class="">현대이지웰 제휴 웹서비스 해킹공격 방어</td>
											<td class="">~ 2026-06-01 (<?=intval((strtotime('2026-06-01')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">카페24  (dgezwel)</td>
											<td class="">
												- 웹방화벽 정상동작 모니터링<br>
												- 웹방화벽 오탐지 여부 모니터링 및 차단해제
											</td>
										</tr>
										<tr>
											<td class="text-center">보안</td>
											<td class="">SSL보안인증서<br>(멀티도메인)</td>
											<td class="">
												* 적용 도메인 현황<br>
												- ezwel.directg.net (제휴DG PC도메인)<br>
												- m.ezwel.directg.net (제휴DG 모바일도메인)<br>
											 </td>
											<td class="">~ 2026-11-13 (<?=intval((strtotime('2026-11-13')-strtotime(date('Y-m-d')))/86400)?>일 남음)</td>
											<td class="">카페24 (h2intershop)</td>
											<td class="">
												- SSL 보안인증서 기간연장 관리 <br>
												- SSL 보안인증서 갱신
											</td>
										</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>

				</div>
				<!-- container -->

			</div>
			<!-- content -->

			<!-- Footer Start -->
			<? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/footer.php');?>
			<!-- end Footer -->

		</div>

		<!-- ============================================================== -->
		<!-- End Page content -->
		<!-- ============================================================== -->


	</div>
	<!-- END wrapper -->

	<!-- bundle -->
	<script src="<?=$document_root?>/assets/js/vendor.min.js"></script>
	<script src="<?=$document_root?>/assets/js/app.min.js"></script>

	<!-- third party js -->
	<script src="<?=$document_root?>/assets/js/vendor/apexcharts.min.js"></script>
	<script src="<?=$document_root?>/assets/js/vendor/jquery-jvectormap-1.2.2.min.js"></script>
	<script src="<?=$document_root?>/assets/js/vendor/jquery-jvectormap-world-mill-en.js"></script>
	<!-- third party js ends -->

	<!-- demo app -->
	<script src="<?=$document_root?>/assets/js/pages/demo.dashboard.js"></script>
	<!-- end demo js-->
</body>
</html>