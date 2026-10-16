<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	
$topmenu['statistics'] = "active";
$page_title="Vaultn 주문현황";

$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_STRING);
$search_month = filter_input(INPUT_GET, 'search_month', FILTER_SANITIZE_STRING);
$search_publisher = filter_input(INPUT_GET, 'search_publisher', FILTER_SANITIZE_STRING);

if(!$search_year){
	$search_year = date('Y');
}

if(!$search_month){
	$search_month = date('m');
}

if(!$search_publisher){
	$search_publisher="38";
}

$selected['search_year'][$search_year] = "selected";
$selected['search_month'][$search_month] = "selected";
$selected['search_publisher'][$search_publisher] = "selected";

$day_count = date('t', strtotime($search_year."-".$search_month."-01"));

$start_date = $search_year."-".$search_month."-01 09:00:00";
$end_date = date('Y-m-d H:i:s', strtotime($search_year."-".$search_month."-".$day_count." 23:59:59 +9 hours"));

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$admin = new AdminOrder($conn);
	
	$query = "SELECT a.ordno, a.product_code, a.product_name, a.status, a.publisher_code, a.order_date, b.sku, b.status AS vaultn_status, b.reg_date FROM tbl_order_item a LEFT JOIN tbl_order_item_vaultn b ON a.ordno = b.clientOrderReference WHERE a.status>1 AND a.publisher_code=:publisher_code AND a.order_date BETWEEN :start_date AND :end_date ORDER BY a.order_date ASC";
	$stmt = $conn->prepare($query);
	$params = array(
		":publisher_code"=>$search_publisher,
		":start_date"=>$start_date,
		":end_date"=>$end_date
	);
	
	$stmt->execute($params);
	$data = $stmt->fetchAll();
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">통계</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">Vaultn 주문 분석</a></li>
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
						<div class="card">
							<div class="card-body">
								<form class="align-items-center mb-3" action="<?=$_SERVER["PHP_SELF"]?>" method="get">
									<div class="row g-2 align-items-center mb-2">
										<div class="col-auto">
											<label class="col-form-label">공급처</label>
										</div>
										<div class="col-auto">
											<select class="form-select" id="search_publisher" name="search_publisher">
												<option value=""></option>
												<option value="38" <?=$selected['search_publisher']['38']?>>Bethesda</option>
												<option value="81" <?=$selected['search_publisher']['81']?>>Funcom</option>
											</select>
										</div>
									</div>

									<div class="row g-2 align-items-center">
										<div class="col-auto">
											<label class="col-form-label">주문날짜</label>
										</div>
										<div class="col-auto">
											<select class="form-select" id="search_year" name="search_year">
												<option value="">:::년도:::</option>
												<? for($i=2013;$i<=date('Y');$i++): ?>
												<option value="<?=$i?>" <?=$selected['search_year'][$i]?>><?=$i?>년</option>
												<? endfor; ?>
											</select>
										</div>
										<div class="col-auto">
											<select class="form-select" id="search_month" name="search_month">
												<option value="">:::월:::</option>
												<? for($i=1;$i<=12;$i++): ?>
												<option value="<?=sprintf('%02d',$i)?>" <?=$selected['search_month'][sprintf('%02d',$i)]?>><?=sprintf('%02d',$i)?>월</option>
												<? endfor; ?>
											</select>
										</div>
										<div class="col-auto">
											<button class="btn btn-primary" type="submit">검색</button>
										</div>
									</div>
								</form>
							</div>
						</div>
						
						<div class="table-responsive">
							<table class="table table-centered w-100 dt-responsive nowrap table-bordered table-sm mb-3" id="">
								<thead class="table-light font-13">
									<tr>
										<th class="text-center">주문일</th>
										<th class="text-center">상품번호</th>
										<th class="text-center">SKU</th>
										<th class="text-center">Name</th>
										<th class="text-center">주문번호</th>
										<th class="text-center">주문상태</th>
										<th class="text-center">VaultN 상태</th>
										<th class="text-center">API 전송날짜</th>
									</tr>
								</thead>
								<tbody class="font-12 bg-white">
								<?
									$order_count=0;
									$refund_count=0;
									$etc_count=0;
									foreach($data as $value){
										$order_count++;
										if($value['status']=="2"){

										} else if($value['status']=="9"){
											$refund_count++;
										} else {
											$etc_count++;
										}
										
										if($value['status']!="2"){
											$text_color="text-danger";
										} else {
											$text_color="";
										}
										
										if($value['vaultn_status']!="Completed"){
											$bg_color="bg-warning";
										} else {
											$bg_color="";
										}
								?>
									<tr>
										<td class="text-center <?=$text_color?> <?=$bg_color?>"><?=$value['order_date']?></td>
										<td class="text-center <?=$text_color?> <?=$bg_color?>"><?=$value['product_code']?></td>
										<td class="text-center <?=$text_color?> <?=$bg_color?>"><?=$value['sku']?></td>
										<td class="<?=$text_color?> <?=$bg_color?>"><?=$value['product_name']?></td>
										<td class="text-center <?=$text_color?> <?=$bg_color?>"><?=$value['ordno']?></td>
										<td class="text-center <?=$text_color?> <?=$bg_color?>"><?=$admin->getOrderStatus($value['status'])?></td>
										<td class="text-center <?=$text_color?> <?=$bg_color?>"><?=$value['vaultn_status']?></td>
										<td class="text-center <?=$text_color?> <?=$bg_color?>"><?=$value['reg_date']?><br/>
										</td>
									</tr>
								<?
									}
								?>
								</tbody>
								<tfoot class="table-light">
									<tr>
										<th colspan="7" class="text-start">
											VaultN의 기준시간은 UTC시간이므로 우리 주문에 맞추기 위해 UTC+9 사용<br><br>
											주문은 해당 달에 발생한 총 주문수량<br>
											DG통계가 더 많은 경우는 해외IP로 주문해서 VaultN에서는 주문실패한 경우, VaultN이 아닌 다른 경로로 판매된 경우<br><br>
											취소 수는 해당 달에 발생한 주문중에서 취소된 수량<br>
											지난달에 발생한 주문을 취소한 경우에 일치하지 않음
										</th>
										<th class="text-end">
											주문 : <?=number_format($order_count)?><br>
											취소 : <?=number_format($refund_count)?><br>
											기타 : <?=number_format($etc_count)?><br>
											합계 : <?=number_format($order_count-$refund_count-$etc_count)?>
										</th>
									</tr>
								</tfoot>
							</table>
						</div>
					</div> <!-- end col -->
				</div>
				<!-- end row -->   
				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$(".btn_order_batch").bind("click",function(){
		var index = $(".btn_order_batch").index(this);
		var ord_ymd = $(".btn_order_batch").eq(index).attr("data-date");
		var search_year = $(".btn_order_batch").eq(index).attr("data-year");
		$.ajax({
			 type: "POST",
			 url: "order_count_batch.php",
			 data: {mode:"batch_day",search_year:search_year,ord_ymd:ord_ymd},
			 success: function (data, status) {
				location.reload();
				//alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
});
</script>
</body>
</html>
