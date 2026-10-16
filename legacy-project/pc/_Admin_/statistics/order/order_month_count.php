<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['statistics'] = "active";
$page_title="월별 주문현황";

$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_STRING);
$search_month = filter_input(INPUT_GET, 'search_month', FILTER_SANITIZE_STRING);

if(!$search_year){
	$search_year = date('Y');
}

$selected['search_year'][$search_year] = "selected";
$selected['search_month'][$search_month] = "selected";


try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$query = "select date_format(ord_ymd,'%Y-%m')as order_month,is_preorder,is_promotion,sum(sales_count)as total_count,sum(sales_count*unit_price)as total_price from tbl_sales where date_format(ord_ymd,'%Y')=:order_year group by date_format(ord_ymd,'%Y-%m'),is_preorder,is_promotion";
	$params = array(
		":order_year"=>$search_year,
	);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	$data = $stmt->fetchAll();

	foreach($data as $value){
		if($value['is_preorder']=="Y"){
			$sales_data[$value['order_month']]['preorder']['total_count']+=$value['total_count'];
			$sales_data[$value['order_month']]['preorder']['total_price']+=$value['total_price'];
		}else{
			if($value['is_promotion']=="Y"){
				$sales_data[$value['order_month']]['promotion']['total_count']+=$value['total_count'];
				$sales_data[$value['order_month']]['promotion']['total_price']+=$value['total_price'];
			}else{
				$sales_data[$value['order_month']]['normal']['total_count']+=$value['total_count'];
				$sales_data[$value['order_month']]['normal']['total_price']+=$value['total_price'];
			}
		}

		$sales_data[$value['order_month']]['total_count']+=$value['total_count'];
		$sales_data[$value['order_month']]['total_price']+=$value['total_price'];
		
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
									<div class="col-3">
										<div class="col-auto">
											<button class="input-group-text btn-primary shadow-none" type="submit">검색</button>
										</div>
									</div>
								</form>
		
								<div class="table-responsive">
									<table class="table table-centered w-100 dt-responsive nowrap table-bordered table-sm" id="">
										<thead class="table-light">
											<tr>
												<th class="text-center" rowspan="2">날짜</th>
												<th class="text-center" colspan="2">예약판매</th>
												<th class="text-center" colspan="2">일반판매</th>
												<th class="text-center" colspan="2">프로모션판매</th>
												<th class="text-center" colspan="2">합계</th>
											</tr>
											<tr>
												<th class="text-center">주문건수</th>
												<th class="text-center">주문합계</th>
												<th class="text-center">주문건수</th>
												<th class="text-center">주문합계</th>
												<th class="text-center">주문건수</th>
												<th class="text-center">주문합계</th>
												<th class="text-center">주문건수</th>
												<th class="text-center">주문합계</th>
											</tr>
										</thead>
										<tbody>
										<?
											for($mm=1;$mm<=12;$mm++){
												$order_month = $search_year."-".sprintf('%02d',$mm);
										?>
										<tr>
											<td class="text-end"><?=$order_month?></td>
											<td class="text-end"><?=number_format($sales_data[$order_month]['preorder']['total_count'])?></td>
											<td class="text-end"><?=number_format($sales_data[$order_month]['preorder']['total_price'])?></td>
											<td class="text-end"><?=number_format($sales_data[$order_month]['normal']['total_count'])?><br/>(<?=($sales_data[$order_month]['normal']['total_count']>0)?round($sales_data[$order_month]['normal']['total_count']*100/$sales_data[$order_month]['total_count'],2):""?>%)</td>
											<td class="text-end"><?=number_format($sales_data[$order_month]['normal']['total_price'])?><br/>(<?=($sales_data[$order_month]['normal']['total_price']>0)?round($sales_data[$order_month]['normal']['total_price']*100/$sales_data[$order_month]['total_price'],2):""?>%)</td>
											<td class="text-end"><?=number_format($sales_data[$order_month]['promotion']['total_count'])?><br/>(<?=($sales_data[$order_month]['promotion']['total_count']>0)?round($sales_data[$order_month]['promotion']['total_count']*100/$sales_data[$order_month]['total_count'],2):""?>%)</td>
											<td class="text-end"><?=number_format($sales_data[$order_month]['promotion']['total_price'])?><br/>(<?=($sales_data[$order_month]['promotion']['total_price']>0)?round($sales_data[$order_month]['promotion']['total_price']*100/$sales_data[$order_month]['total_price'],2):""?>%)</td>
											<td class="text-end"><?=number_format($sales_data[$order_month]['total_count'])?></td>
											<td class="text-end"><?=number_format($sales_data[$order_month]['total_price'])?></td>
										</tr>
										<?
												$preorder_total_count+=$sales_data[$order_month]['normal']['total_count'];
												$preorder_total_price+=$sales_data[$order_month]['normal']['total_count'];


												$normal_total_count+=$sales_data[$order_month]['normal']['total_count'];
												$normal_total_price+=$sales_data[$order_month]['normal']['total_price'];
												$promotion_total_count+=$sales_data[$order_month]['promotion']['total_count'];
												$promotion_total_price+=$sales_data[$order_month]['promotion']['total_price'];

												$total_count+=$sales_data[$order_month]['total_count'];
												$total_price+=$sales_data[$order_month]['total_price'];
											}
										?>
										</tbody>
										<tfoot class="table-light">
										<tr>
											<th class="text-center">합계</th>
											<th class="text-end"><?//=number_format($preorder_total_count)?></th>
											<th class="text-end"><?//=number_format($preorder_total_price)?></th>
											<th class="text-end"><?=number_format($normal_total_count)?><br/>(<?=round(($normal_total_count/$total_count)*100,2)?>%)</th>
											<th class="text-end"><?=number_format($normal_total_price)?><br/>(<?=round(($normal_total_price/$total_price)*100,2)?>%)</th>
											<th class="text-end"><?=number_format($promotion_total_count)?><br/>(<?=round(($promotion_total_count/$total_count)*100,2)?>%)</th>
											<th class="text-end"><?=number_format($promotion_total_price)?><br/>(<?=round(($promotion_total_price/$total_price)*100,2)?>%)</th>
											<th class="text-end"><?=number_format($total_count)?></th>
											<th class="text-end"><?=number_format($total_price)?></th>
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

});
</script>
</body>
</html>
