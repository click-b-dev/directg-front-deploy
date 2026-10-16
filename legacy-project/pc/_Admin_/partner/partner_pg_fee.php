<?
$sidebar_file = "sidebar_partner.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['partner'] = "active";

$page_title="파트너 PG수수료 관리";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_publisher_name = filter_input(INPUT_GET, 'search_publisher_name', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

if($search_publisher_name){
	$where[] = " b.publisher_name like '%".$search_publisher_name."%'";
}

foreach($_GET as $key=>$value){
	if($key<>"page" ){
		if($value<>""){
			$param.="&".$key."=".$value;
		}
	}
}

$add_where = "";

foreach($where as $value){
	$add_where.= " and ".$value;
}

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	$adminPartner= new AdminPartner($conn);
	
	$orderby = " b.publisher_name asc";
	$partner_pg_fee_list = $adminPartner->getPartnerPGFeeList($page,$add_where,$orderby,$param,'30');
	
	$publisher_data= $adminPartner->getNonPgfeePartner();

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
				
				<div class="row g-2">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">파트너 검색필터</h5>
						<div class="card-body py-2">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row mb-2">
									<div class="col-lg-3">
										<div class="row">
											<label for="search_publisher_name" class="col-sm-3 col-form-label bg-light border">파트너 이름</label>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_publisher_name" name="search_publisher_name" placeholder="파트너 이름" value="<?=$search_publisher_name?>">
											</div>
										</div>
									</div>
									<div class="col-lg-3">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
				
				<div class="d-flex flex-row justify-content-between mb-2">
					<div class="float-start"><? echo number_format($partner_pg_fee_list->total_results)?> 개</div>
					<div class="float-end"><button type="button" class="btn btn-danger shadow-none" data-bs-toggle="modal" data-bs-target="#partner-pg-modal">파트너 PG 수수료 등록</button></div>
				</div>
				
				<div class="row">
					<div class="col-12">
						<form class="align-items-center">
							<table class="table table-centered  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
								<colgroup>
									<col width="5%"/>
									<col width="*"/>
									<col width="10%"/>
									<col width="10%"/>
									<col width="10%"/>
									<col width="5%"/>
									<col width="5%" />
								</colgroup>
								<thead class="table-light">
									<tr>
										<th class="text-center">번호</th>
										<th class="text-center">파트너정보</th>
										<th class="text-center">Account</th>
										<th class="text-center">Credit Card</th>
										<th class="text-center">Mobile Payment</th>
										<th class="text-center">수정</th>
										<th class="text-center">삭제</th>
									</tr>
								</thead>
								<tbody class="bg-white font-12">
								<?
								if($partner_pg_fee_list->success == true){
									$result = $partner_pg_fee_list->resultset->fetchAll();
									
									$num = 0;

									foreach($result as $value){
								?>
									<tr>
										<td class="text-center"><?=$partner_pg_fee_list->total_results-($num+($page-1)*30)?></td>
										<td class="text-start"><?=$value['publisher_name']?></td>
										<td class="text-center">
											<div class="input-group">
												<input type="text" name="account[]" value="<?=$value['account']?>" class="form-control form-control-sm font-12 text-end">
												<div class="input-group-text font-12">%</div>
											</div>
										</td>
										<td class="text-center px-1">
												<div class="input-group">
													<input type="text" name="credit_card[]" value="<?=$value['credit_card']?>" class="form-control form-control-sm font-12 text-end">
													<div class="input-group-text font-12">%</div>
												</div>
										</td>
										<td class="text-center">
											<div class="input-group">
												<input type="text" name="mobile_payment[]" value="<?=$value['mobile_payment']?>" class="form-control form-control-sm font-12 text-end">
												<div class="input-group-text font-12">%</div>
											</div>
										</td>
										<td class="text-center"><button type="button" class="btn action-icon btn_modify" data-idx="<?=$value['publisher_code']?>"> <i class="mdi mdi-square-edit-outline"></i></button></td>
										<td class="text-center"><button type="button" class="btn action-icon btn_delete" data-idx="<?=$value['publisher_code']?>"> <i class="mdi mdi-delete"></i></button></td>
									</tr>
								<?		
											$num++;
										}
									}
								?>
								</tbody>
							</table>
						</div>
						<div class="text-center mt-3 fs-5"><?echo $partner_pg_fee_list->links_html;?></div>
					</div> 
				</div>
				
			</div> <!-- container -->
		</div> <!-- content -->
</div>
<div id="partner-pg-modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header modal-colored-header bg-primary">
					<h4 class="modal-title" id="partner-pg-modalLabel">파트너 PG 수수료 등록</h4>
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
							<label for="account" class="col-sm-4 col-form-label border bg-light">Account</label>
							<div class="col-sm-4">
								<div class="input-group">
									<input type="text" name="account" value="" class="form-control font-12 text-end">
									<div class="input-group-text font-12">%</div>
								</div>
							</div>
						</div>
						<div class="row mb-2 ">
							<label for="credit_card" class="col-sm-4 col-form-label border bg-light">Credit Card</label>
							<div class="col-sm-4">
								<div class="input-group">
									<input type="text" name="credit_card" value="" class="form-control font-12 text-end">
									<div class="input-group-text font-12">%</div>
								</div>
							</div>
						</div>
						<div class="row mb-2">
							<label for="mobile_payment" class="col-sm-4 col-form-label border bg-light">Mobile Payment</label>
							<div class="col-sm-4">
								<div class="input-group">
									<input type="text" name="mobile_payment" value="" class="form-control font-12 text-end">
									<div class="input-group-text font-12">%</div>
								</div>
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
		dropdownParent: $('#partner-pg-modal')
	});
		
	//파트너 PG 수수료 등록
	$(document).on('click', '#partner-pg-modal #btn_pg_fee_add', function(e){
		e.preventDefault();
		let publisher_code = $("#publisher_code option:selected").val();
		let account = $('input[name="account"]').val();
		let credit_card = $('input[name="credit_card"]').val();
		let mobile_payment = $('input[name="mobile_payment"]').val();
		
		$.ajax({
			 type: "POST",
			 url: "partner_pg_fee_ps.php",
			 data: {mode:"register",publisher_code:publisher_code,account:account,credit_card:credit_card,mobile_payment:mobile_payment},
			 success: function (data, status) {
				  alert(data);
				  location.reload();
				  //console.log(data);
			 }
		});
		
	});
	
	//파트너 PG 수수료 수정
	$(".btn_modify").bind("click",function(){
			var index = $(".btn_modify").index(this);
			var publisher_code = $(".btn_modify").eq(index).attr("data-idx");
			var account = $('input[name="account[]"]').eq(index).val();
			var credit_card = $('input[name="credit_card[]"]').eq(index).val();
			var mobile_payment = $('input[name="mobile_payment[]"]').eq(index).val();
			 $.ajax({
				 type: "POST",
				 url: "partner_pg_fee_ps.php",
				 data: {mode:'modify',publisher_code:publisher_code,account:account,credit_card:credit_card,mobile_payment:mobile_payment},
				 success: function (data, status) {
					  alert(data);
					  //location.reload();
					  //console.log(data);
				 }
			});
		return false; // ajax used, block the normal submit
	});
	
	//파트너 PG 수수료 삭제
	$(".btn_delete").bind("click",function(){
			var index = $(".btn_delete").index(this);
			var publisher_code = $(".btn_delete").eq(index).attr("data-idx");
			 $.ajax({
				 type: "POST",
				 url: "partner_pg_fee_ps.php",
				 data: {mode:'delete',publisher_code:publisher_code},
				 success: function (data, status) {
					alert(data);
					 location.reload();
					  //console.log(data);
				 }
			});
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