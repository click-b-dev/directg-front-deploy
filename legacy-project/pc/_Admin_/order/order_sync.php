<?
$sidebar_file = "sidebar_order.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

$topmenu['order'] = "active";
$page_title="결제내역 동기화";


$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_STRING);
$search_month = filter_input(INPUT_GET, 'search_month', FILTER_SANITIZE_STRING);

if(!$search_year){
	$search_year = "2025";
}

if(!$search_month){
	$search_month = "07";
}

$day_count = date('t', strtotime($search_year."-".$search_month."-01"));

$start_date = $search_year."-".$search_month."-01";
$end_date = $search_year."-".$search_month."-".$day_count;

$selected['search_year'][$search_year] = "selected";
$selected['search_month'][$search_month] = "selected";

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	//$orderby = "ord_ymd desc";
	//$orderby = "product_code desc";

	//$adminOrder= new AdminOrder($conn); 
	//$order_list = $adminOrder->getOrderReadyList($page,$add_where,$orderby,$param,'30');
	$query = "select ord_ymd,count(*)as total_count,sum(total_price)as total_price,sum(use_emoney)as total_emoney,sum(use_cash)as total_cash from tbl_order where step='2' and ord_ymd between :start_date and :end_date group by ord_ymd";
	$params = array(
		":start_date"=>$start_date,
		":end_date"=>$end_date,
	);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	$data = $stmt->fetchAll();

	foreach($data as $value){
		$order_data[$value['ord_ymd']]['total_count']+=$value['total_count'];
		$order_data[$value['ord_ymd']]['total_price']+=$value['total_price'];
		$order_data[$value['ord_ymd']]['total_emoney']+=$value['total_emoney'];
		$order_data[$value['ord_ymd']]['total_cash']+=$value['total_cash'];
	}
	
	//print_r($order_data);

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
										<li class="breadcrumb-item"><a href="javascript: void(0);">주문</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">결제 관리</a></li>
										<li class="breadcrumb-item active"><?=$page_title?></li>
									</ol>
								</div>
								<h4 class="page-title"><?=$page_title?></h4>
							</div>
						</div>
					</div>     
					<!-- end page title --> 
					
					<form class="row row-cols-lg-auto g-3 align-items-center mb-3" action="<?=$_SERVER["PHP_SELF"]?>" method="get">
						<div class="col-12">
							<div class="d-flex align-items-center">
								<label for="status-select" class="col-4 col-form-label me-2">주문날짜</label>
								<div class="col-8">
									<select class="form-select" id="search_year" name="search_year">
										<option value="">:::년도:::</option>
										<?
											for($i=2013;$i<=date('Y');$i++){
										?>
										<option value="<?=$i?>" <?=$selected['search_year'][$i]?>><?=$i?>년</option>
										<?
											}
										?>
									</select>
								</div>
							</div>
						</div>
						<div class="col-12">
							<select class="form-select" id="search_month" name="search_month">
								<option value="">:::월:::</option>
								<?
									for($i=1;$i<=12;$i++){
								?>
								<option value="<?=sprintf('%02d',$i)?>" <?=$selected['search_month'][sprintf('%02d',$i)]?>><?=sprintf('%02d',$i)?>월</option>
								<?
									}
								?>
							</select>
						</div>
						<div class="col-3">
							<div class="col-auto">
								<button class="input-group-text btn-primary shadow-none" type="submit">검색</button>
							</div>
						</div>
					</form>
					<div class="row">
						<div class="col-12">
							<table class="table table-centered w-100  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
								<thead class="table-light">
									<tr>
										<th class="text-center">주문일자</th>
										<th class="text-center">결제건수</th>
										<th class="text-center">주문합계</th>
										<th class="text-center">적립금할인</th>
										<th class="text-center">결제합계</th>
										<th class="text-center">동기화</th>
									</tr>
								</thead>
								<tbody>
								<?
									for($dd=1;$dd<=$day_count;$dd++){
										$order_date = $search_year."-".$search_month."-".sprintf('%02d',$dd);
								?>
									<tr>
										<td class="text-center"><?=$order_date?></td>
										<td class="text-end"><?=number_format($order_data[$order_date]['total_count'])?></td>
										<td class="text-end"><?=number_format($order_data[$order_date]['total_price']+$order_data[$order_date]['total_emoney']+$order_data[$order_date]['total_cash'])?></td>
										<td class="text-end"><?=number_format($order_data[$order_date]['total_emoney'])?></td>
										<td class="text-end"><?=number_format($order_data[$order_date]['total_price'])?></td>
										<td class="text-center">
											<button type="button" class="btn btn-outline-secondary btn-sm btn_order_sync_batch" data-date="<?=$search_year."-".$search_month."-".sprintf('%02d',$dd)?>" data-year="<?=$search_year?>">동기화</button>
										</td>
									</tr>
									<?	
											$order_total_count+=$order_data[$order_date]['total_count'];
											$order_total_price+=$order_data[$order_date]['total_price'];
											$order_total_emoney+=$order_data[$order_date]['total_emoney'];
										}
									?>
								</tbody>
								<tfoot class="table-light">
									<tr>
										<th class="text-center"><?=$search_year."-".$search_month?> 결제 합계</th>
										<th class="text-end"><?=number_format($order_total_count)?></th>
										<th class="text-end"><?=number_format($order_total_price+$order_total_emoney)?></th>
										<th class="text-end"><?=number_format($order_total_emoney)?></th>
										<th class="text-end"><?=number_format($order_total_price)?></th>
									</tr>
								</tfoot>
							</table>
						</div> <!-- end col -->
					</div>
				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$(".btn_order_sync_batch").bind("click",function(){
		var index = $(".btn_order_sync_batch").index(this);
		var ord_ymd = $(".btn_order_sync_batch").eq(index).attr("data-date");
		var search_year = $(".btn_order_sync_batch").eq(index).attr("data-year");
		$(".btn_order_sync_batch").eq(index).text("처리중");
		
		$.ajax({
			 type: "POST",
			 url: "order_sync_batch.php",
			 data: {mode:"batch_day",search_year:search_year,ord_ymd:ord_ymd},
			 success: function (data, status) {
				//location.reload();
				alert(data);
				location.reload();
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
