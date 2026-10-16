<?
$sidebar_file = "sidebar_partner.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['partner'] = "active";

$page_title="파트너 계정 등록";

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	//파트너 현황
	$adminPartner= new AdminPartner($conn);
	
	$partner_data= $adminPartner->getPartnerListAll('');

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
					<input type="hidden" name="mode" value="register">
					<div class="row">
						<div class="col-6">
							<div class="card">
								<div class="card-body">
									<div class="row mb-2">
										<label for="publisher_code" class="col-3 col-form-label bg-light border">* 파트너</label>
										<div class="col-9">
											<select id="publisher_code" name="publisher_code" class="form-select select2" data-toggle="select2" required>
												<option value="">:::파트너 선택:::</option>
												<?
													foreach($partner_data as $value){
												?>
												<option value="<?=$value['publisher_code']?>"><?=$value['publisher_name']?></option>
												<?
													}
												?>
											</select>
										</div>
									</div>
									<div class="row mb-2">
										<label for="name" class="col-3 col-form-label bg-light border">* 파트너 담당자명</label>
										<div class="col-9">
											<input type="text" class="form-control" id="name" name="name">
										</div>
									</div>
									
									<div class="row mb-2">
										<label for="partner_id" class="col-3 col-form-label bg-light border">* 파트너 아이디</label>
										<div class="col-9">
											<input type="email" class="form-control" id="partner_id" name="partner_id" autocomplete="one-time-code">
											<span>* 아이디는 파트너 담당자 이메일주소</span>
										</div>
									</div>
									
									<div class="row mb-2">
										<label for="partner_pwd" class="col-3 col-form-label bg-light border">* 파트너 비밀번호</label>
										<div class="col-9">
											<input type="password" class="form-control" id="partner_pwd" name="partner_pwd" autocomplete="one-time-code">
										</div>
									</div>
									
									<div class="row mb-2">
										<label for="flag" class="col-3 col-form-label bg-light border">* 접속상태</label>
										<div class="col-9">
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="flag_y" name="flag" class="form-check-input" value="Y">
												<label class="form-check-label" for="flag_y">접속가능</label>
											</div>
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="flag_n" name="flag" class="form-check-input" value="N">
												<label class="form-check-label" for="flag_n">접속불가</label>
											</div>
										</div>
									</div>
									<div class="row mb-2">
										<label for="kr" class="col-3 col-form-label bg-light border">* 조회 지역</label>
										<div class="col-9">
											<div class="form-check form-check-inline mt-2">
												<input type="checkbox" class="form-check-input" id="kr" name="kr" value="Y">
												<label class="form-check-label" for="kr">한국</label>
											</div>
											<div class="form-check form-check-inline mt-2">
												<input type="checkbox" class="form-check-input" id="jp" name="jp" value="Y">
												<label class="form-check-label" for="jp">일본</label>
											</div>
										</div>
									</div>
									<div class="row mb-2">
										<label for="kr" class="col-3 col-form-label bg-light border">* 조회 시작 일자</label>
										<div class="col-4">
											<div class="position-relative" id="datepicker1">
												<input type="text" class="form-control" name="start_date" id="start_date" readonly autocomplete="one-time-code">
											</div>
										</div>
									</div>
									
									<div class="row mb-2">
										<div class="col-12">
											<div class="float-end">
												<button type="submit" class="btn btn-primary shadow-none">파트너 계정 등록</button>
											</div>
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

<script>
 
$(function() {
	  $.datepicker.setDefaults($.datepicker.regional['ko']); //datepicker 한국어로 사용하기 위한 언어설정
	  $('#start_date').datepicker();
	});
</script>
</body>
</html>