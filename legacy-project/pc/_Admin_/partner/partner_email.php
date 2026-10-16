<?
$sidebar_file = "sidebar_partner.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['partner'] = "active";

$page_title="파트너 알림 주소록 관리";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	$adminPartner= new AdminPartner($conn);
	
	$orderby = " b.publisher_name asc";
	
	$partner_notification_email = $adminPartner->getPartnerNotificationEmail($page,$add_where,$orderby,$param,'20');
	
	$publisher_data= $adminPartner->getNonEmailPartner();

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
				
				<div class="d-flex flex-row justify-content-between mb-2">
					<div class="float-start"><? echo number_format($partner_notification_email->total_results)?> 개</div>
					<div class="float-end"><button type="button" class="btn btn-danger shadow-none" data-bs-toggle="modal" data-bs-target="#partner-email-modal">파트너 일림 주소록 등록</button></div>
				</div>
				<div class="row">
					<div class="col-12">
						<form class="align-items-center">
							<table class="table table-centered w-100  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
								<colgroup>
									<col width="10%"/>
									<col width="30%"/>
									<col width="*"/>
									<col width="10%"/>
									<col width="10%"/>
								</colgroup>
								<thead class="table-light">
									<tr>
										<th class="text-center">번호</th>
										<th class="text-center">파트너정보</th>
										<th class="text-center">알림이메일 주소</th>
										<th class="text-center">수정</th>
										<th class="text-center">삭제</th>
									</tr>
								</thead>
								<tbody class="bg-white font-12">
								<?
								if($partner_notification_email->success == true){
									$result = $partner_notification_email->resultset->fetchAll();
									
									$num = 0;

									foreach($result as $value){
								?>
									<tr>
										<td class="text-center"><?=$partner_notification_email->total_results-($num+($page-1)*20)?></td>
										<td class="text-start"><?=$value['publisher_name']?></td>
										<td class="text-center"><textarea name="email[]" class="form-control font-12" rows="4"><?foreach(json_decode($value['email']) as $value){
												echo $value."\n";
											}?></textarea>
										</td>
										<td class="text-center"><button type="button" class="btn action-icon"> <i class="mdi mdi-square-edit-outline"></i></button></td>
										<td class="text-center"><button type="button" class="btn action-icon"> <i class="mdi mdi-delete"></i></button></td>
									</tr>
								<?		
											$num++;
										}
									}
								?>
								</tbody>
							</table>
						</div>
						<div class="text-center mt-3 fs-5"><?echo $partner_notification_email->links_html;?></div>
					</div> 
				</div>
				
			</div> <!-- container -->
		</div> <!-- content -->
</div>
<div id="partner-email-modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header modal-colored-header bg-primary">
					<h4 class="modal-title" id="partner-email-modalLabel">파트너 알림 주소록 등록</h4>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
				</div>
				<div class="modal-body">
					<form class="px-3" name="pgfeeFrm" id="pgfeeFrm" method="POST" action="partner_pg_fee_ps.php" autocomplete="one-time-code">
						<input type="hidden" name="mode" value="register">
						<div class="row mb-2">
							<label for="publisher_code" class="col-sm-4 col-form-label border bg-light">파트너</label>
							<div class="col-sm-8">
								<select id="publisher_code" name="publisher_code" class="form-select select2" data-toggle="select2" required>
									<option value="">:::파트너 선택:::</option>
									<?
										foreach($publisher_data as $value){
									?>
									<option value="<?=$value['publisher_code']?>"><?=$value['publisher_name']?></option>
									<?
										}
									?>
								</select>
							</div>
						</div>
						<div class="row mb-2">
							<label for="partner_email" class="col-sm-4 col-form-label border bg-light">알림이메일 주소</label>
							<div class="col-sm-8">
								<textarea id="partner_email" name="partner_email" class="form-control" rows="3"></textarea>
							</div>
						</div>
						<div class="text-center">
							<button class="btn btn-primary shadow-none" type="button" id="btn_pg_fee_add">파트너 PG 수수료 등록</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function () {
	$('#publisher_code').select2({
		dropdownParent: $('#partner-email-modal')
	});
});
document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener('hide.bs.modal', function (event) {
        if (document.activeElement) {
            document.activeElement.blur();
        }
    });
});
</script>
</body>
</html>