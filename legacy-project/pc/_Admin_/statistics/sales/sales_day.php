<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	
$topmenu['statistics'] = "active";
$page_title="일별 매출현황";

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

	$query = "select order_day,order_price,checkout_price,checkout_count,emoney,batch_date from tbl_sales_day where order_day between :start_date and :end_date ";
	$params = array(
		":start_date"=>$start_date,
		":end_date"=>$end_date,
	);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	$data = $stmt->fetchAll();

	foreach($data as $value){
		$sales_data[$value['order_day']]['order_price']=$value['order_price'];
		$sales_data[$value['order_day']]['checkout_price']=$value['checkout_price'];
		$sales_data[$value['order_day']]['checkout_count']=$value['checkout_count'];
		$sales_data[$value['order_day']]['emoney']=$value['emoney'];
		$sales_data[$value['order_day']]['batch_date']=$value['batch_date'];
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">매출분석</a></li>
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
												<th class="text-center">날짜</th>
												<th class="text-center">결제건수</th>
												<th class="text-center">결제금액</th>
												<th class="text-center">포인트할인</th>
												<th class="text-center">할인비율</th>
												<th class="text-center">주문금액</th>
											</tr>
										</thead>
										<tbody class="font-12">
										<?
											for($dd=1;$dd<=$day_count;$dd++){
												$order_date = $search_year."-".$search_month."-".sprintf('%02d',$dd);
										?>
										<tr>
											<td class="text-center"><?=$order_date?></td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['checkout_count'])?></td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['checkout_price'])?></td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['emoney'])?></td>
											<td class="text-end">
											<?
												if($sales_data[$order_date]['order_price']>0){
													echo round(($sales_data[$order_date]['emoney']/$sales_data[$order_date]['order_price'])*100,2)."%";
												}
											?>
											</td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['order_price'])?></td>
										</tr>
										<?
												$total_checkout_count+=$sales_data[$order_date]['checkout_count'];
												$total_checkout_price+=$sales_data[$order_date]['checkout_price'];
												$total_use_point+=$sales_data[$order_date]['emoney'];
												$total_order_price+=$sales_data[$order_date]['order_price'];
											}
										?>
										</tbody>
										<tfoot class="table-light">
										<tr>
											<th class="text-center">합계</th>
											<th class="text-end"><?=number_format($total_checkout_count)?></th>
											<th class="text-end"><?=number_format($total_checkout_price)?></th>
											<th class="text-end"><?=number_format($total_use_point)?></td>
											<th class="text-end">
											<?
												if($total_order_price>0){
													echo round(($total_use_point/$total_order_price)*100,2)."%";
												}
											?>
											</td>
											<th class="text-end"><?=number_format($total_order_price)?></td>
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

</body>
</html>
