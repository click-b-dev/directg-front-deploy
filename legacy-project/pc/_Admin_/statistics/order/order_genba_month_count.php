<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	
$topmenu['statistics'] = "active";
$page_title="Genba 월별 주문현황";

$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_STRING);
$search_month = filter_input(INPUT_GET, 'search_month', FILTER_SANITIZE_STRING);

if(!$search_year){
	$search_year = date('Y');
}

if(!$search_month){
	$search_month = date('m');
}

$selected['search_year'][$search_year] = "selected";
$selected['search_month'][$search_month] = "selected";

$day_count = date('t', strtotime($search_year."-".$search_month."-01"));

$start_date = $search_year."-".$search_month."-01";
$end_date = $search_year."-".$search_month."-".$day_count;

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$query = "select Sku,Name,Publisher,count(*)as total_count,sum(NetAmount)as total_NetAmount,sum(GrossAmount)as total_GrossAmount,sum(ActualBuyingPrice)as total_ActualBuyingPrice from tbl_order_item_genba where ord_ymd between :start_date and :end_date and Sku is not null group by Sku order by sum(GrossAmount) desc";
	$stmt = $conn->prepare($query);
	$params = array(
		":start_date"=>$start_date,
		":end_date"=>$end_date,
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">주문분석</a></li>
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
											
											if($value['total_ActualBuyingPrice']<'500'){
												$ActualBuyingPrice = $value['total_ActualBuyingPrice']*1500;
											}else{
												$ActualBuyingPrice = $value['total_ActualBuyingPrice'];
											}
											
											if($value['total_NetAmount']-$ActualBuyingPrice<0){
												$text_color="text-danger";
											}else{
												$text_color="";
											}
								?>
									<tr>
										<td><?=$value['Publisher']?></td>
										<td class="text-center"><?=$value['Sku']?></td>
										<td><?=$value['Name']?></td>
										<td class="text-end"><?=number_format($value['total_count'])?></td>
										<td class="text-end"><?=number_format($value['total_GrossAmount'])?></td>
										<td class="text-end"><?=number_format($value['total_NetAmount'])?></td>
										<td class="text-end"><?=number_format($ActualBuyingPrice)?></td>
										<td class="text-end <?=$text_color?>"><?=number_format($value['total_NetAmount']-$ActualBuyingPrice)?><br/>
										<?if($value['total_NetAmount']>0){?>
										(<?=round(($value['total_NetAmount']-$ActualBuyingPrice)*100/$value['total_NetAmount'],2)?>%)
										<?}?>
										</td>
									</tr>
								<?
										$total_count+=$value['total_count'];
										$total_GrossAmount+=$value['total_GrossAmount'];
										$total_NetAmount+=$value['total_NetAmount'];
										$total_ActualBuyingPrice+=$ActualBuyingPrice;
									}
								?>
								</tbody>
								<tfoot class="table-light">
									<tr>
										<th colspan="3" class="text-center">합계</th>
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
