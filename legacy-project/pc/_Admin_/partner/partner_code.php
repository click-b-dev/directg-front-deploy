<?
$sidebar_file = "sidebar_partner.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['partner'] = "active";

$page_title="파트너 코드 관리";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_publisher_name = filter_input(INPUT_GET, 'search_publisher_name', FILTER_SANITIZE_STRING);
$report_term = filter_input(INPUT_GET, 'report_term', FILTER_SANITIZE_STRING);
$is_system = filter_input(INPUT_GET, 'is_system', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

if($search_publisher_name){
	$where[] = " publisher_name like '%".$search_publisher_name."%'";
}

if($report_term){
	$where[] = "report_term='".$report_term."'";
}

if($is_system){
	$where[] = "is_system='".$is_system."'";
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
	
	$orderby = " publisher_name asc";
	$partner_list = $adminPartner->getPartnerList($page,$add_where,$orderby,$param,'50');
	
	$publisher_data= $adminPartner->getSupplierList();

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$checked['report_term'][$report_term] = "checked";
$checked['is_system'][$is_system] = "checked";
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
												<input type="text" class="form-control" id="search_publisher_name" name="search_publisher_name" placeholder="상품명" value="<?=$search_publisher_name?>">
											</div>
										</div>
									</div>
									<div class="col-lg-3">
										<div class="row">
											<label for="report_term" class="col-sm-3 col-form-label bg-light border">리포트 주기</label>
											<div class="col-sm-9">
												<div class="form-check form-check-inline mt-2">
													<input type="radio" id="report_term_m" name="report_term" class="form-check-input"  value="M" <?=$checked['report_term']['M']?>>
													<label class="form-check-label" for="report_term_m">월별</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="report_term_t" name="report_term" class="form-check-input"  value="T" <?=$checked['report_term']['T']?>>
													<label class="form-check-label" for="report_term_t">분기별</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-lg-3">
										<div class="row">
											<label for="is_system" class="col-sm-5 col-form-label bg-light border">파트너 시스템 사용</label>
											<div class="col-sm-7">
												<div class="form-check form-check-inline mt-2">
													<input type="radio" id="is_system_y" name="is_system" class="form-check-input"  value="Y" <?=$checked['is_system']['Y']?>>
													<label class="form-check-label" for="is_system_y">사용</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="is_system_n" name="is_system" class="form-check-input"  value="N" <?=$checked['is_system']['N']?>>
													<label class="form-check-label" for="is_system_n">미사용</label>
												</div>
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
					<div class="float-start"><? echo number_format($partner_list->total_results)?> 개</div>
					<div class="float-end"><button type="button" class="btn btn-danger shadow-none" data-bs-toggle="modal" data-bs-target="#partner-modal">파트너 추가</button></div>
				</div>
				
				<div class="row">
					<div class="col-12">
						<table class="table table-centered w-100  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
							<thead class="table-light">
								<tr>
									<th class="text-center">번호</th>
									<th class="text-center">파트너 정보</th>
									<th class="text-center">리포트 주기</th>
									<th class="text-center">파트너 시스템 사용</th>
									<th class="text-center">수정</th>
								</tr>
							</thead>
							<tbody class="bg-white font-12">
							<?
							if($partner_list->success == true){
								$result = $partner_list->resultset->fetchAll();
								
								$num = 0;

								foreach($result as $value){
							?>
								<tr>
									<td class="text-center"><?=$partner_list->total_results-($num+($page-1)*20)?></td>
									<td class="text-start">[<?=$value['publisher_code']?>] <?=$value['publisher_name']?></td>
									<td class="text-center"><?=($value['report_term']=="M")?"월별":"분기별"?></td>
									<td class="text-center">
										<input type="checkbox" class="is_system" id="publisher<?=$num?>" name="publisher" value="<?=$value['publisher_code']?>" data-switch="primary" <?=($value['is_system']=="Y")?"checked":""?>/>
										<label for="publisher<?=$num?>" data-on-label="Yes" data-off-label="No"></label>
									</td>
									<td class="text-center"><button class="btn action-icon btn_modify" data-publishercode="<?=$value['publisher_code']?>" data-publishername="<?=$value['publisher_name']?>" data-term="<?=$value['report_term']?>"> <i class="mdi mdi-square-edit-outline"></i></button></td>
								</tr>
							<?		
										$num++;
									}
								}
							?>
							</tbody>
						</table>
						<div class="text-center mt-3 fs-5"><?echo $partner_list->links_html;?></div>
					</div> 
				</div>
				
			</div> <!-- container -->
		</div> <!-- content -->
</div>
	
	<div id="partner-modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header modal-colored-header bg-primary">
					<h4 class="modal-title" id="partner-modalLabel">파트너 등록</h4>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
				</div>
				<div class="modal-body">
					<form class="px-2" method="POST" action="partner_ps.php" autocomplete="one-time-code">
						<input type="hidden" name="mode" value="partner_add">
						<div class="row mb-3">
							<label for="search_publisher_code" class="col-sm-3 col-form-label border bg-light">파트너</label>
							<div class="col-sm-9">
								<select id="search_publisher_code" name="search_publisher_code" class="form-select select2" data-toggle="select2" required>
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
						<div class="row mb-3 ">
							<label for="report_term" class="col-sm-3 col-form-label border bg-light">리포트 주기</label>
							<div class="col-sm-9 border-bottom border-top border-end">
								<div class="form-check form-check-inline mt-1">
									<input class="form-check-input" type="radio" name="report_term" id="report_term1" value="M" required>
									<label class="form-check-label" for="report_term1">월별</label>
								</div>
								<div class="form-check form-check-inline mt-1">
									<input class="form-check-input" type="radio" name="report_term" id="report_term2" value="T" required>
									<label class="form-check-label" for="report_term2">분기별</label>
								</div>
							</div>
						</div>
						<div class="mb-3 text-center">
							<button class="btn btn-primary shadow-none" type="button" id="btn_partner_add">파트너 등록</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
	
	<div id="partner-modify-modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header modal-colored-header bg-primary">
					<h4 class="modal-title" id="partner-modify-modalLabel">파트너 수정</h4>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
				</div>
				<div class="modal-body">
					<form class="px-2" method="POST" action="partner_ps.php" autocomplete="one-time-code">
						<input type="hidden" name="mode" value="partner_report_config">
						<input type="hidden" name="publisher_code" id="publisher_code">
						<div class="row mb-3">
							<label for="search_publisher_code" class="col-sm-3 col-form-label border bg-light">파트너</label>
							<div class="col-sm-9">
								<span id="publisher_name" class="form-control-plaintext"></span>
							</div>
						</div>
						<div class="row mb-3 ">
							<label for="report_term" class="col-sm-3 col-form-label border bg-light">리포트 주기</label>
							<div class="col-sm-9 border-bottom border-top border-end">
								<div class="form-check form-check-inline mt-1">
									<input class="form-check-input" type="radio" name="report_term" id="report_term1" value="M" required>
									<label class="form-check-label" for="report_term1">월별</label>
								</div>
								<div class="form-check form-check-inline mt-1">
									<input class="form-check-input" type="radio" name="report_term" id="report_term2" value="T" required>
									<label class="form-check-label" for="report_term2">분기별</label>
								</div>
							</div>
						</div>
						<div class="mb-3 text-center">
							<button class="btn btn-primary shadow-none" type="button" id="btn_partner_modify">파트너 설정 저장</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$('#search_publisher_code').select2({
		dropdownParent: $('#partner-modal')
	});
		
	$(document).on('click', '#partner-modal #btn_partner_add', function(e){
		let publisher_code = $("#search_publisher_code option:selected").val();
		let publisher_name = $("#search_publisher_code option:selected").text();
		let report_term = $('input[name="report_term"]:checked').val();
		
		$.ajax({
			type: "POST",
			 url: "partner_ps.php",
			 data: {mode:"partner_add",publisher_code:publisher_code,publisher_name:publisher_name,report_term:report_term},
			 success: function (data, status) {
				  alert(data);
				  window.location.reload();
				  //location.reload();
			 },
			error: function(data) {
				//에러코드
				alert(data);
				return false;
			}
		});
	});
	
	$(document).on('click', '#partner-modify-modal #btn_partner_modify', function(e){
		let publisher_code = $("#partner-modify-modal #publisher_code").val();
		let report_term = $('#partner-modify-modal input[name="report_term"]:checked').val();
		
		$.ajax({
			type: "POST",
			 url: "partner_ps.php",
			 data: {mode:"partner_report_config",publisher_code:publisher_code,report_term:report_term},
			 success: function (data, status) {
				  alert(data);
				  window.location.reload();
				  //location.reload();
			 },
			error: function(data) {
				//에러코드
				alert(data);
				return false;
			}
		});
	});
	
	$('input[name="publisher"]').change(function() {
		var publisher_code = $(this).val();              // value
		var checked = $(this).prop('checked');  // checked 상태 (true, false)
		var $label = $(this).next();            // find a label element
		if(checked){
			var is_system = "Y";
		}else{
			var is_system = "N";
		}
		
		$.ajax({
			 type: "POST",
			 url: "partner_ps.php",
			 data: {mode:"partner_config",publisher_code:publisher_code,is_system:is_system},
			 success: function (data, status) {
				alert(data);
				//location.reload();
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//파트너 설정수정
	$(".btn_modify").bind("click",function(){
		var index = $(".btn_modify").index(this);
		var publisher_code = $(".btn_modify").eq(index).attr("data-publishercode");
		var publisher_name = $(".btn_modify").eq(index).attr("data-publishername");
		var report_term = $(".btn_modify").eq(index).attr("data-term");
		$('#partner-modify-modal #publisher_code').val(publisher_code);
		$('#partner-modify-modal #publisher_name').text(publisher_name);
		
		$('input:radio[name="report_term"]:input[value="'+report_term+'"]').prop('checked', true);
		
		$("#partner-modify-modal").modal('show');
	});
});
</script>
</body>
</html>