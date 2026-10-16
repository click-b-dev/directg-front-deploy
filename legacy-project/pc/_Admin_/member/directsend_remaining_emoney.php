<?
$sidebar_file = "sidebar_member.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['member'] = "active";

$page_title = "자동메일 잔액조회";

$directsend = new DirectSendMail();
(int)$remaining_point = $directsend->remainingMoney();

?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>

<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<div class="wrapper">
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_start.php'); ?>

<div class="content-page">
			<div class="content">
<!-- Start Content-->
				<div class="container-fluid">
					<!-- start page title -->
					<div class="row">
						<div class="col-12">
							<div class="page-title-box">
								<div class="page-title-right">
									<ol class="breadcrumb m-0">
										<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">회원</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">자동메일 관리</a></li>
										<li class="breadcrumb-item active"><?=$page_title?></li>
									</ol>
								</div>
								<h4 class="page-title"><?=$page_title?></h4>
							</div>
						</div>
					</div>     
					<!-- end page title --> 

					<div class="row">
						<div class="col-12">
							<table class="table table-centered w-100  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
								<tbody class="font-12 table-light">
									<tr>
										<th class="bg-light">연동시스템</th>
										<td class="bg-white">다이렉트샌드 메일발송 API (https://directsend.co.kr/)</td>
									</tr>
									<tr>
										<th class="bg-light">계정정보</th>
										<td class="bg-white">dcpinter / 비밀번호는 별도 문의</td>
									</tr>
									<tr>
										<th class="bg-light">잔액조회</th>
										<td class="bg-white"><?=$remaining_point?> 원</td>
									</tr>
								</tbody>
							</table>
						</div>
						<!-- end col -->
					</div>
					<!-- end row -->
					
					<div class="alert alert-info" role="alert">
						<span><i class="dripicons-information me-2"></i> 메일발송 비용은 발송 1건당 0.5원입니다.</span><br/>
					</div>
					<div class="alert alert-info" role="alert">
						<span><i class="dripicons-information me-2"></i> 잔액이 얼마 남지 않은 것을 확인 할 경우 충전요청 부탁드립니다.</span>
					</div>
				</div> <!-- container -->
	</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>
