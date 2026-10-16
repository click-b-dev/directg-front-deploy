<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	
$topmenu['statistics'] = "active";
$page_title="Genba 퍼블리셔 주문현황";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];
$add_where = "";

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$query = "select Publisher,count(*)as total_count,sum(NetAmount)as total_NetAmount,sum(GrossAmount)as total_GrossAmount,sum(ActualBuyingPrice)as total_ActualBuyingPrice from tbl_order_item_genba where Sku is not null group by Publisher order by sum(GrossAmount) desc";
	$stmt = $conn->prepare($query);
	$stmt->execute();
	$data = $stmt->fetchAll();
	
	$publisher_data = array();
	
	foreach($data as $value){
		$publisher_data[$value['Publisher']] = array(
			"SalesQuantity"=>$value['total_count'],
			"GrossAmount"=>$value['total_GrossAmount'],
			"NetAmount"=>$value['total_NetAmount'],
			"ActualBuyingPrice"=>$value['total_ActualBuyingPrice'],
		);
		$total_count+=$value['total_count'];
		$total_GrossAmount+=$value['total_GrossAmount'];
		$total_NetAmount+=$value['total_NetAmount'];
		$total_ActualBuyingPrice+=$value['total_ActualBuyingPrice'];
	}

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
						<div class="table-responsive">
							<table class="table table-centered w-100 dt-responsive nowrap table-bordered table-sm mb-3" id="">
								<thead class="table-light font-13">
									<tr>
										<th class="text-center">번호</th>
										<th class="text-center">Publisher</th>
										<th class="text-center">주문수량</th>
										<th class="text-center">GrossAmount 합계</th>
										<th class="text-center">NetAmount 합계</th>
										<th class="text-center">ActualBuyingPrice 합계</th>
										<th class="text-center">DGKR 이익</th>
										<th class="text-center">주문비율</th>
									</tr>
								</thead>
								<tbody class="font-12 bg-white">
								<?
										$num="1";
										foreach($publisher_data as $key=>$value){
											if($value['NetAmount']-$value['ActualBuyingPrice']<0){
												$text_color="text-danger";
											}else{
												$text_color="";
											}
								?>
									<tr>
										<td class="text-center"><?=$num+($page-1)*100?></td>
										<td><?=$key?></td>
										<td class="text-end"><?=number_format($value['SalesQuantity'])?></td>
										<td class="text-end"><?=number_format($value['GrossAmount'])?></td>
										<td class="text-end"><?=number_format($value['NetAmount'])?></td>
										<td class="text-end"><?=number_format($value['ActualBuyingPrice'])?></td>
										<td class="text-end <?=$text_color?>"><?=number_format($value['NetAmount']-$value['ActualBuyingPrice'])?><br/>
										<?if($value['NetAmount']>0){?>
										(<?=round(($value['NetAmount']-$value['ActualBuyingPrice'])*100/$value['NetAmount'],2)?>%)
										<?}?>
										</td>
										<td class="text-end"><?=round($value['GrossAmount']*100/$total_GrossAmount,3)?>%</td>
									</tr>
								<?
											$num++;
									}
								?>
								</tbody>
								<tfoot class="table-light">
									<tr>
										<th colspan="2" class="text-center">합계</th>
										<th class="text-end"><?=number_format($total_count)?></th>
										<th class="text-end"><?=number_format($total_GrossAmount)?></th>
										<th class="text-end"><?=number_format($total_NetAmount)?></th>
										<th class="text-end"><?=number_format($total_ActualBuyingPrice)?></th>
										<th class="text-end">
										<?if($total_NetAmount>0){?>
										<?=number_format($total_NetAmount-$total_ActualBuyingPrice)?><br/>(<?=round(($total_NetAmount-$total_ActualBuyingPrice)*100/$total_NetAmount,2)?> %)
										<?}?>
										</th>
										<th class="text-end"></th>
									</tr>
								</tfoot>
							</table>
						</div>
						
					</div>
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
