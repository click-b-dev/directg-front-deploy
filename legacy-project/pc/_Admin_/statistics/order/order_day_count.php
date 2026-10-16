<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	
$topmenu['statistics'] = "active";
$page_title="일별 주문현황";

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

	$query = "select ord_ymd,is_preorder,is_promotion,sum(sales_count)as total_count,sum(sales_count*unit_price)as total_price from tbl_sales where ord_ymd between :start_date and :end_date group by ord_ymd,is_preorder,is_promotion";
	$params = array(
		":start_date"=>$start_date,
		":end_date"=>$end_date,
	);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	$data = $stmt->fetchAll();

	foreach($data as $value){
		if($value['is_preorder']=="Y"){
			$sales_data[$value['ord_ymd']]['preorder']['total_count']=$value['total_count'];
			$sales_data[$value['ord_ymd']]['preorder']['total_price']=$value['total_price'];
		}else{
			if($value['is_promotion']=="Y"){
				$sales_data[$value['ord_ymd']]['promotion']['total_count']=$value['total_count'];
				$sales_data[$value['ord_ymd']]['promotion']['total_price']=$value['total_price'];
			}else{
				$sales_data[$value['ord_ymd']]['normal']['total_count']=$value['total_count'];
				$sales_data[$value['ord_ymd']]['normal']['total_price']=$value['total_price'];
			}
		}

		$sales_data[$value['ord_ymd']]['total_count']+=$value['total_count'];
		$sales_data[$value['ord_ymd']]['total_price']+=$value['total_price'];
	}
	
	$query = "select ord_ymd,batch_date from tbl_sales_log where ord_ymd between :start_date and :end_date order by ord_ymd asc";
	$params = array(
		":start_date"=>$start_date,
		":end_date"=>$end_date,
	);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	$log_data = $stmt->fetchAll();
	
	foreach($log_data as $value){
		$sales_data[$value['ord_ymd']]['batch_date']=$value['batch_date'];
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
		
								<div class="table-responsive">
									<table class="table table-centered w-100 dt-responsive nowrap table-bordered table-sm" id="">
										<thead class="table-light font-13">
											<tr>
												<th class="text-center" rowspan="2">날짜</th>
												<th class="text-center" colspan="3">예약 판매</th>
												<th class="text-center" colspan="3">일반 판매</th>
												<th class="text-center" colspan="3">프로모션 판매</th>
												<th class="text-center" colspan="2">합계</th>
												<th class="text-center" rowspan="2">집계</th>
											</tr>
											<tr>
												<th class="text-center">주문건수</th>
												<th class="text-center">주문합계</th>
												<th class="text-center">건수별 비율<br/>(금액별 비율)</th>
												<th class="text-center">주문건수</th>
												<th class="text-center">주문합계</th>
												<th class="text-center">건수별 비율<br/>(금액별 비율)</th>
												<th class="text-center">주문건수</th>
												<th class="text-center">주문합계</th>
												<th class="text-center">건수별 비율<br/>(금액별 비율)</th>
												<th class="text-center">주문건수</th>
												<th class="text-center">주문합계</th>
											</tr>
										</thead>
										<tbody class="font-12">
										<?
											for($dd=1;$dd<=$day_count;$dd++){
												$order_date = $search_year."-".$search_month."-".sprintf('%02d',$dd);
										?>
										<tr>
											<td class="text-center"><?=$order_date?></td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['preorder']['total_count'])?></td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['preorder']['total_price'])?></td>
											<td class="text-end">

												<?=($sales_data[$order_date]['total_count']>0)?round($sales_data[$order_date]['preorder']['total_count']*100/$sales_data[$order_date]['total_count'],2):""?>%<br/>
												(<?=($sales_data[$order_date]['total_price']>0)?round($sales_data[$order_date]['preorder']['total_price']*100/$sales_data[$order_date]['total_price'],2):""?>%)
											</td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['normal']['total_count'])?></td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['normal']['total_price'])?></td>
											<td class="text-end">
												<?=($sales_data[$order_date]['total_count']>0)?round($sales_data[$order_date]['normal']['total_count']*100/$sales_data[$order_date]['total_count'],2):""?>%<br/>
												(<?=($sales_data[$order_date]['total_price']>0)?round($sales_data[$order_date]['normal']['total_price']*100/$sales_data[$order_date]['total_price'],2):""?>%)
											</td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['promotion']['total_count'])?></td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['promotion']['total_price'])?></td>
											<td class="text-end">
												<?=($sales_data[$order_date]['total_count']>0)?round($sales_data[$order_date]['promotion']['total_count']*100/$sales_data[$order_date]['total_count'],2):""?>%<br/>
												(<?=($sales_data[$order_date]['total_price']>0)?round($sales_data[$order_date]['promotion']['total_price']*100/$sales_data[$order_date]['total_price'],2):""?>%)
											</td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['total_count'])?></td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['total_price'])?></td>
											<td class="text-center">
											<?//if($sales_data[$order_date]['total_count']==0){?>
											<?=$sales_data[$order_date]['batch_date']?><br/>
											<button type="button" class="btn btn-outline-secondary btn-sm btn_order_batch" data-date="<?=$search_year."-".$search_month."-".sprintf('%02d',$dd)?>" data-year="<?=$search_year?>">집계</button>
											<?//}?>
											</td>
										</tr>
										<?
												$preorder_total_count+=$sales_data[$order_date]['preorder']['total_count'];
												$preorder_total_price+=$sales_data[$order_date]['preorder']['total_price'];
												$normal_total_count+=$sales_data[$order_date]['normal']['total_count'];
												$normal_total_price+=$sales_data[$order_date]['normal']['total_price'];
												$promotion_total_count+=$sales_data[$order_date]['promotion']['total_count'];
												$promotion_total_price+=$sales_data[$order_date]['promotion']['total_price'];

												$total_count+=$sales_data[$order_date]['total_count'];
												$total_price+=$sales_data[$order_date]['total_price'];
											}
										?>
										</tbody>
										<tfoot class="table-light">
										<tr>
											<th class="text-center">합계</th>
											<th class="text-end"><?=number_format($preorder_total_count)?></th>
											<th class="text-end"><?=number_format($preorder_total_price)?></th>
											<th class="text-end"></td>
											<th class="text-end"><?=number_format($normal_total_count)?></th>
											<th class="text-end"><?=number_format($normal_total_price)?></th>
											<th class="text-end"><?if($total_count>0){?><?=round(($normal_total_count/$total_count)*100,2)?>%<?}?><br/><?if($total_price>0){?>(<?=round(($normal_total_price/$total_price)*100,2)?>%)<?}?></td>
											<th class="text-end"><?=number_format($promotion_total_count)?></th>
											<th class="text-end"><?=number_format($promotion_total_price)?></th>
											<th class="text-end"><?if($total_count>0){?><?=round(($promotion_total_count/$total_count)*100,2)?>%<?}?><br/><?if($total_price>0){?>((<?=round(($promotion_total_price/$total_price)*100,2)?>%)<?}?></td>
											<th class="text-end"><?=number_format($total_count)?></th>
											<th class="text-end"><?=number_format($total_price)?></th>
											<th></th>
										</tr>
										</tfoot>
									</table>
								</div>
							</div> <!-- end card-body-->
						</div> <!-- end card-->
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
