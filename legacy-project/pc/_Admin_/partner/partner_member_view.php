<?
$sidebar_file = "sidebar_partner.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['partner'] = "active";

$page_title="파트너 계정 정보보기";

$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	$adminPartner= new AdminPartner($conn);
	
	$partner_member_info = $adminPartner->getPartnerMemberView($idx);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">파트너</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">파트너 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>
				<!-- end page title --> 
				
				<form id="frm" name="frm" method="post" action="partner_member_ps.php" class="form-horizontal" >
					<div class="row">
						<div class="col-6">
							<div class="card">
								<div class="card-body">
									<div class="row mb-2">
										<label for="publisher_code" class="col-3 col-form-label bg-light border">* 파트너</label>
										<div class="col-9">
											<?=$partner_member_info['publisher_code']?>
										</div>
									</div>
									<div class="row mb-2">
										<label for="name" class="col-3 col-form-label bg-light border">* 파트너 담당자명</label>
										<div class="col-9">
											<?=$partner_member_info['name']?>
										</div>
									</div>
									
									<div class="row mb-2">
										<label for="partner_id" class="col-3 col-form-label bg-light border">* 파트너 아이디</label>
										<div class="col-9">
											<?=$partner_member_info['id']?>
										</div>
									</div>
									
									<div class="row mb-2">
										<label for="partner_pwd" class="col-3 col-form-label bg-light border">* 파트너 비밀번호</label>
										<div class="col-9">
											
										</div>
									</div>
									
									<div class="row mb-2">
										<label for="flag" class="col-3 col-form-label bg-light border">* 접속상태</label>
										<div class="col-9">
											<?=$partner_member_info['flag']?>
										</div>
									</div>
									<div class="row mb-2">
										<label for="kr" class="col-3 col-form-label bg-light border">* 조회 지역</label>
										<div class="col-9">
											<?=$partner_member_info['kr']?>
											<?=$partner_member_info['jp']?>
										</div>
									</div>
									<div class="row mb-2">
										<label for="kr" class="col-3 col-form-label bg-light border">* 조회 시작 일자</label>
										<div class="col-4">
											<?=$partner_member_info['start_date']?>
										</div>
									</div>
								</div>
							</div>

						</div>
					</div>
				</form>
			</div> <!-- container -->
		</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<script src="https://code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script>

<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/i18n/jquery-ui-i18n.min.js"></script>

	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>