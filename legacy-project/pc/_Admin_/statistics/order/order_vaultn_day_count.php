<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	
$topmenu['statistics'] = "active";
$page_title="Vaultn 일별 주문현황";

$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_STRING);
$search_month = filter_input(INPUT_GET, 'search_month', FILTER_SANITIZE_STRING);
$search_day = filter_input(INPUT_GET, 'search_day', FILTER_SANITIZE_STRING);

if(!$search_year){
	$search_year = date('Y');
}

if(!$search_month){
	$search_month = date('m');
}
if(!$search_day){
	$search_day = date('d');
}

$selected['search_year'][$search_year] = "selected";
$selected['search_month'][$search_month] = "selected";
$selected['search_day'][$search_day] = "selected";

if($search_day){
	$search_date = date('Y-m-d', strtotime($search_year."-".$search_month."-".$search_day));
}else {
	$search_date = date('Y-m-d');
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$query = "select sku,Name,publisherName,count(*)as total_count,sum(salesPriceGross)as total_GrossAmount,sum(salesPriceGross/1.1)as total_NetAmount,sum(netPurchasePrice)as total_ActualBuyingPrice from tbl_order_item_vaultn where ord_ymd=:ord_ymd group by sku order by sum(salesPriceGross) desc";
	$stmt = $conn->prepare($query);
	$params = array(
		":ord_ymd"=>$search_date,
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
									<div class="col-12">
										<select class="form-select" id="search_day" name="search_day">
											<option value="">:::일:::</option>
											<?
												$day_count = date('t', strtotime($search_year."-".$search_month."-01"));
												for($i=1;$i<=$day_count;$i++){
											?>
											<option value="<?=sprintf('%02d',$i)?>" <?=$selected['search_day'][sprintf('%02d',$i)]?>><?=sprintf('%02d',$i)?>일</option>
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
							</div> 
						</div> 
						
						<div class="table-responsive">
							<table class="table table-centered w-100 dt-responsive nowrap table-bordered table-sm mb-3" id="">
								<thead class="table-light font-13">
									<tr>
										<th class="text-center">동기화</th>
										<th class="text-center">Publisher</th>
										<th class="text-center">SKU</th>
										<th class="text-center">Name</th>
										<th class="text-center">주문수량</th>
										<th class="text-center">GrossAmount 합계</th>
										<th class="text-center">NetAmount 합계</th>
										<th class="text-center">ActualBuyingPrice 합계</th>
										<th class="text-center">DGKR 이익</th>
									</tr>
								</thead>
								<tbody class="font-12 bg-white">
								<?
										foreach($data as $value){
											if($value['total_NetAmount']-$value['total_ActualBuyingPrice']<0){
												$text_color="text-danger";
											}else{
												$text_color="";
											}
								?>
									<tr>
										<td class="text-center">
											<?
												if($value['Name']==""){
											?>
											<button type="button" class="btn btn-info shadow-none btn_vaultn_sync" data-sku="<?=$value['sku']?>"><i class="uil uil-refresh"></i></button>
											<?
												}
											?>
										</td>
										<td><?=$value['publisherName']?></td>
										<td class="text-center"><?=$value['sku']?></td>
										<td><?=$value['Name']?></td>
										<td class="text-end"><?=number_format($value['total_count'])?></td>
										<td class="text-end"><?=number_format($value['total_GrossAmount'])?></td>
										<td class="text-end"><?=number_format($value['total_NetAmount'])?></td>
										<td class="text-end"><?=number_format($value['total_ActualBuyingPrice'])?></td>
										<td class="text-end <?=$text_color?>"><?=number_format($value['total_NetAmount']-$value['total_ActualBuyingPrice'])?><br/>
										<?if($value['total_NetAmount']>0){?>
										(<?=round(($value['total_NetAmount']-$value['total_ActualBuyingPrice'])*100/$value['total_NetAmount'],2)?>%)
										<?}?>
										</td>
									</tr>
								<?
										$total_count+=$value['total_count'];
										$total_GrossAmount+=$value['total_GrossAmount'];
										$total_NetAmount+=$value['total_NetAmount'];
										$total_ActualBuyingPrice+=$value['total_ActualBuyingPrice'];
									}
								?>
								</tbody>
								<tfoot class="table-light">
									<tr>
										<th colspan="4" class="text-center">합계</th>
										<th class="text-end"><?=number_format($total_count)?></th>
										<th class="text-end"><?=number_format($total_GrossAmount)?></th>
										<th class="text-end"><?=number_format($total_NetAmount)?></th>
										<th class="text-end"><?=number_format($total_ActualBuyingPrice)?></th>
										<th class="text-end">
										<?if($total_NetAmount>0){?>
										<?=number_format($total_NetAmount-$total_ActualBuyingPrice)?><br/>(<?=round(($total_NetAmount-$total_ActualBuyingPrice)*100/$total_NetAmount,2)?> %)
										<?}?>
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
	$(".btn_vaultn_sync").bind("click",function(){
		var index = $(".btn_vaultn_sync").index(this);
		var sku = $(".btn_vaultn_sync").eq(index).attr("data-sku");
		$.ajax({
			 type: "POST",
			 url: "/_Admin_/goods/vaultn/vaultn_catalogue_sync.php",
			 data: {sku:sku},
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
