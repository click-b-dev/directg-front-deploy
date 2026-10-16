<?
$sidebar_file = "sidebar_partner.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['partner'] = "active";

$page_title="Refund list 동기화";

$search_publisher_code = filter_input(INPUT_GET, 'search_publisher_code', FILTER_SANITIZE_NUMBER_INT);
$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_STRING);
$search_month = filter_input(INPUT_GET, 'search_month', FILTER_SANITIZE_STRING);

if($search_year==""){
	$search_year = date("Y");
}

if($search_month==""){
	$search_month = date('m',strtotime('-1 month'));
	if($search_month=="12"){
		$search_year=$search_year-1;
	}
}

$search_date = $search_year."-".$search_month;

$refund_list = array();

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$adminPartner= new AdminPartner($conn);
	
	if($search_publisher_code){
		$refund_list = $adminPartner->getPartnerRefundList($search_publisher_code,$search_date);
	}
	
	$publisher_data= $adminPartner->getPartnerListAll('');

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$selected['search_publisher_code'][$search_publisher_code] = "selected";
$selected['search_year'][$search_year] = "selected";
$checked['search_month'][$search_month] = "checked";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">리포트 관리</a></li>
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
						<h5 class="card-header bg-secondary text-white">검색필터</h5>
						<div class="card-body py-2">
							<form class="form-horizontal" method="GET" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row mb-3">
									<div class="col-8">
										<div class="row">
											<label for="reportrange" class="col-sm-1 col-form-label bg-light border">기간검색</label>
											<div class="col-sm-11">
												<div class="input-group">
													<select class="form-select" id="search_year" name="search_year">
														<option value="">:::년도:::</option>
														<?
															for($i=2021;$i<=date('Y');$i++){
														?>
														<option value="<?=$i?>" <?=$selected['search_year'][$i]?>><?=$i?>년</option>
														<?
															}
														?>
													</select>
													<div class="ms-2">
													<?
														for($i=1;$i<=12;$i++){
													?>
														<input type="radio" class="btn-check" name="search_month" id="search_month_<?=$i?>" value="<?=sprintf('%02d',$i)?>" autocomplete="off" <?=$checked['search_month'][sprintf('%02d',$i)]?>>
														<label class="btn btn-outline-secondary shadow-none" for="search_month_<?=$i?>"><?=sprintf('%02d',$i)?>월</label>
													<?
														}
													?>
													</div>
												</div>
											</div>
										</div>
									</div>
									<div class="col-4">
										<div class="row">
											<label for="search_publisher_code" class="col-sm-3 col-form-label bg-light border">파트너</label>
											<div class="col-sm-9">
												<select id="search_publisher_code" name="search_publisher_code" class="form-control select2" data-toggle="select2">
													<option value="">:::파트너 선택:::</option>
													<?
														foreach($publisher_data as $value){
													?>
													<option value="<?=$value['publisher_code']?>" <?=$selected['search_publisher_code'][$value['publisher_code']]?>><?=$value['publisher_name']?></option>
													<?
														}
													?>
												</select>
											</div>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-lg-12">
										<div class="text-center">
											<button type="submit" class="btn btn-secondary shadow-none" id="btn_search">Refund list 조회</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
				
				<div class="d-flex flex-row justify-content-between mb-2">
					<div class="float-start"><button type="button" class="btn btn-primary shadow-none" id="btn_refund_sync">Refund list 동기화</button></div>
					<div class="float-end"><button type="button" class="btn btn-light shadow-none border" id="btn_excel_download"><i class="mdi mdi-microsoft-excel font-16"></i> Refund list 엑셀 다운로드</button></div>
				</div>
				
				<div class="d-flex flex-row justify-content-between mb-2">
					<div class="float-start"><? echo number_format(count($refund_list))?> 개</div>
				</div>
				
				<div class="row">
					<div class="col-12">
						<table class="table table-centered w-100  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
							<colgroup>
								<col width="15%"/>
								<col width="10%"/>
								<col width="*"/>
								<col width="10%"/>
								<col width="10%"/>
								<col width="10%"/>
							</colgroup>
							<thead class="table-light">
								<tr>
									<th class="text-center">파트너명</th>
									<th class="text-center">옵션상품코드</th>
									<th class="text-center">옵션상품명</th>
									<th class="text-center">SRP</th>
									<th class="text-center">판매수량</th>
									<th class="text-center">합계</th>
								</tr>
							</thead>
							<tbody class="bg-white font-12">
							<?

								$num = 0;

								foreach($refund_list as $value){
							?>
								<tr>
									<td class="text-center"><?=$adminPartner->getPartnerName($value['publisher_code'])?></td>
									<td class="text-center"><?=$value['product_code']?></td>
									<td class="text-start"><?=$value['product_nm']?></td>
									<td class="text-end"><?=number_format($value['order_srp'])?></td>
									<td class="text-end"><span class="total_count"><?=number_format($value['cc'],0)?></span></td>
									<td class="text-end"><span class="total_price"><?=number_format($value['sum_settleprice'],0)?></span></td>
								</tr>
							<?		
									$num++;
									
									$total_sold +=$value['cc'];
									$total_price +=$value['sum_settleprice'];
								}
							?>
							</tbody>
							<tfoot class="table-light">
							<tr>
								<th class="text-center" colspan="3"><?=$search_year?>년 <?=$search_month?>월 합계</th>
								<th></th>
								<th class="text-end"><?=number_format($total_sold,0)?></th>
								<th class="text-end"><?=number_format($total_price,0)?> 원</th>
							</tr>
							</tfoot>
						</table>
					</div> 
				</div>
				
			</div> <!-- container -->
		</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script type="text/javascript">
$(document).ready(function(){
	//Refund List 동기화
	$("#btn_refund_sync").bind("click",function(){
		var publisher_code = $('#search_publisher_code option:selected').val();
		var search_year = $('#search_year option:selected').val();
		var search_month = $('input:radio[name="search_month"]:checked').val();

		if(!publisher_code){
			alert("퍼블리셔를 선택하세요.");
			return;
		}

		if(publisher_code!="" && search_year!="" && search_month!=""){
			$.ajax({
				 type: "POST",
				 url: "report_ps.php",
				 data: {mode:'refund_batch',publisher_code:publisher_code,search_year:search_year,search_month:search_month},
				 success: function (data, status) {
					  //console.log(data);
					 //alert(data);
					 //location.reload();
					  location.href='refund_list.php?search_year='+search_year+"&search_month="+search_month+"&search_publisher_code="+publisher_code;
				 },
				error: function(data){
					 alert(data);
				 }
			});
		}
	});
	
	// Refund List 엑셀다운로드
	  $('#btn_excel_download').click(function () {
			var $form = $('<form></form>');
			$form.attr('action', './excel_refund_ps.php');
			$form.attr('method', 'post');
			$form.appendTo('body');

			var publisher = $('#search_publisher_code option:selected').text();
			var publisher_code = $('#search_publisher_code option:selected').val();
			var search_year = $('#search_year option:selected').val();
			var search_month = $('input[name="search_month"]:checked').val();

			var mode = $('<input type="hidden" name="mode" value="refund_excel_download">');
			var excel_name = $('<input type="hidden" name="excel_name" value="'+publisher+'_환불통계_'+search_year+'_'+search_month+'">');
			var publisher_value = $('<input type="hidden" name="publisher" value="'+publisher+'">');
			var publisher_code_value = $('<input type="hidden" name="publisher_code" value="'+publisher_code+'">');
			var search_year_value = $('<input type="hidden" name="search_year" value="'+search_year+'">');
			var search_month_value = $('<input type="hidden" name="search_month" value="'+search_month+'">');
			
			$form.append(mode).append(excel_name).append(publisher_value).append(publisher_code_value).append(search_year_value).append(search_month_value);
			$form.submit();
	  });
});
</script>
</body>
</html>