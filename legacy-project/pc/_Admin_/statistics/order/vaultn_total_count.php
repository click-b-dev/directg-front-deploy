<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	
$topmenu['statistics'] = "active";
$page_title="Vaultn 누적 주문현황";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];
$add_where = "";

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn); 
	$vaultn_order_count = $admin->getOrderVaultnCount($page,$add_where,$orderby,$param,'30');

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
									<li class="breadcrumb-item"><a href="javascript: void(0);">Vaultn 주문분석</a></li>
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
										<th class="text-center">SKU</th>
										<th class="text-center">Name</th>
										<th class="text-center">주문수량</th>
										<th class="text-center">GrossAmount 합계</th>
										<th class="text-center">NetAmount 합계</th>
										<th class="text-center">ActualBuyingPrice 합계</th>
										<th class="text-center">이익</th>
									</tr>
								</thead>
								<tbody class="font-12 bg-white">
								<?
									if($vaultn_order_count->success == true){
										$result = $vaultn_order_count->resultset->fetchAll();
										$num="1";
										foreach($result as $value){
											if($value['total_NetAmount']-$value['total_ActualBuyingPrice']<0){
												$text_color="text-danger";
											}else{
												$text_color="";
											}
								?>
									<tr>
										<td class="text-center"><?=$num+($page-1)*100?></td>
										<td class="text-center"><?=$value['publisherName']?></td>
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
										$num++;
										$total_count+=$value['total_count'];
										$total_GrossAmount+=$value['total_GrossAmount'];
										$total_NetAmount+=$value['total_NetAmount'];
										$total_ActualBuyingPrice+=$value['total_ActualBuyingPrice'];
										}
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
						
						<div class="text-center mt-3"><?echo $vaultn_order_count->links_html;?></div>
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
