<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	
$topmenu['statistics'] = "active";
$page_title="PG별 결제현황";

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

	$query = "select ord_ymd,pg_provider,count(*)as checkout_count,sum(total_price)as checkout_price from tbl_order where step='2' and ord_ymd between :start_date and :end_date group by ord_ymd,pg_provider";
	$params = array(
		":start_date"=>$start_date,
		":end_date"=>$end_date,
	);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	$data = $stmt->fetchAll();

	foreach($data as $value){
		$sales_data[$value['ord_ymd']][$value['pg_provider']]['checkout_price']=$value['checkout_price'];
		$sales_data[$value['ord_ymd']][$value['pg_provider']]['checkout_count']=$value['checkout_count'];
		$sales_data[$value['ord_ymd']]['total_count']+=$value['checkout_count'];
		$sales_data[$value['ord_ymd']]['total_price']+=$value['checkout_price'];
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">결제분석</a></li>
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
												<th class="text-center" colspan="2">KCP</th>
												<th class="text-center" colspan="2">네이버페이</th>
												<th class="text-center" colspan="2">페이코</th>
												<th class="text-center" colspan="2">토스페이먼츠</th>
												<th class="text-center" colspan="2">토스페이</th>
											</tr>
											<tr>
												<th class="text-center">결제건수</th>
												<th class="text-center">결제금액</th>
												<th class="text-center">결제건수</th>
												<th class="text-center">결제금액</th>
												<th class="text-center">결제건수</th>
												<th class="text-center">결제금액</th>
												<th class="text-center">결제건수</th>
												<th class="text-center">결제금액</th>
												<th class="text-center">결제건수</th>
												<th class="text-center">결제금액</th>
											</tr>
										</thead>
										<tbody class="font-12">
										<?
											for($dd=1;$dd<=$day_count;$dd++){
												$order_date = $search_year."-".$search_month."-".sprintf('%02d',$dd);
										?>
										<tr>
											<td class="text-center"><?=$order_date?></td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['kcp']['checkout_count'])?><br/>(<?=($sales_data[$order_date]['total_count']>0)?round($sales_data[$order_date]['kcp']['checkout_count']*100/$sales_data[$order_date]['total_count'],2):"0"?> %)</td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['kcp']['checkout_price'])?><br/>(<?=($sales_data[$order_date]['total_price']>0)?round($sales_data[$order_date]['kcp']['checkout_price']*100/$sales_data[$order_date]['total_price'],2):"0"?> %)</td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['naverpay']['checkout_count'])?><br/>(<?=($sales_data[$order_date]['total_count']>0)?round($sales_data[$order_date]['naverpay']['checkout_count']*100/$sales_data[$order_date]['total_count'],2):"0"?> %)</td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['naverpay']['checkout_price'])?><br/>(<?=($sales_data[$order_date]['total_price']>0)?round($sales_data[$order_date]['naverpay']['checkout_price']*100/$sales_data[$order_date]['total_price'],2):"0"?> %)</td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['payco']['checkout_count'])?><br/>(<?=($sales_data[$order_date]['total_count']>0)?round($sales_data[$order_date]['payco']['checkout_count']*100/$sales_data[$order_date]['total_count'],2):"0"?> %)</td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['payco']['checkout_price'])?><br/>(<?=($sales_data[$order_date]['total_price']>0)?round($sales_data[$order_date]['payco']['checkout_price']*100/$sales_data[$order_date]['total_price'],2):"0"?> %)</td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['toss']['checkout_count'])?><br/>(<?=($sales_data[$order_date]['total_count']>0)?round($sales_data[$order_date]['toss']['checkout_count']*100/$sales_data[$order_date]['total_count'],2):"0"?> %)</td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['toss']['checkout_price'])?><br/>(<?=($sales_data[$order_date]['total_price']>0)?round($sales_data[$order_date]['toss']['checkout_price']*100/$sales_data[$order_date]['total_price'],2):"0"?> %)</td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['toss_pay']['checkout_count'])?><br/>(<?=($sales_data[$order_date]['total_count']>0)?round($sales_data[$order_date]['toss_pay']['checkout_count']*100/$sales_data[$order_date]['total_count'],2):"0"?> %)</td>
											<td class="text-end"><?=number_format($sales_data[$order_date]['toss_pay']['checkout_price'])?><br/>(<?=($sales_data[$order_date]['total_price']>0)?round($sales_data[$order_date]['toss_pay']['checkout_price']*100/$sales_data[$order_date]['total_price'],2):"0"?> %)</td>
										</tr>
										<?
												$kcp_checkout_count+=$sales_data[$order_date]['kcp']['checkout_count'];
												$kcp_checkout_price+=$sales_data[$order_date]['kcp']['checkout_price'];
												$naverpay_checkout_count+=$sales_data[$order_date]['naverpay']['checkout_count'];
												$naverpay_checkout_price+=$sales_data[$order_date]['naverpay']['checkout_price'];
												$payco_checkout_count+=$sales_data[$order_date]['payco']['checkout_count'];
												$payco_checkout_price+=$sales_data[$order_date]['payco']['checkout_price'];
												$toss_checkout_count+=$sales_data[$order_date]['toss']['checkout_count'];
												$toss_checkout_price+=$sales_data[$order_date]['toss']['checkout_price'];
												$tosspay_checkout_count+=$sales_data[$order_date]['toss_pay']['checkout_count'];
												$tosspay_checkout_price+=$sales_data[$order_date]['toss_pay']['checkout_price'];
												
												$total_count+=$sales_data[$order_date]['kcp']['checkout_count']+$sales_data[$order_date]['naverpay']['checkout_count']+$sales_data[$order_date]['payco']['checkout_count']+$sales_data[$order_date]['toss']['checkout_count']+$sales_data[$order_date]['toss_pay']['checkout_count'];
												$total_price+=$sales_data[$order_date]['kcp']['checkout_price']+$sales_data[$order_date]['naverpay']['checkout_price']+$sales_data[$order_date]['payco']['checkout_price']+$sales_data[$order_date]['toss']['checkout_price']+$sales_data[$order_date]['toss_pay']['checkout_price'];
											}
										?>
										</tbody>
										<tfoot class="table-light">
										<tr>
											<th class="text-center">합계</th>
											<th class="text-end"><?=number_format($kcp_checkout_count)?><br/>(<?=($kcp_checkout_count>0)?round($kcp_checkout_count*100/$total_count,2):"0"?> %)</th>
											<th class="text-end"><?=number_format($kcp_checkout_price)?><br/>(<?=($kcp_checkout_price>0)?round($kcp_checkout_price*100/$total_price,2):"0"?> %)</th>
											<th class="text-end"><?=number_format($naverpay_checkout_count)?><br/>(<?=($naverpay_checkout_count>0)?round($naverpay_checkout_count*100/$total_count,2):"0"?> %)</th>
											<th class="text-end"><?=number_format($naverpay_checkout_price)?><br/>(<?=($naverpay_checkout_price>0)?round($naverpay_checkout_price*100/$total_price,2):"0"?> %)</th>
											<th class="text-end"><?=number_format($payco_checkout_count)?><br/>(<?=($payco_checkout_count>0)?round($payco_checkout_count*100/$total_count,2):"0"?> %)</th>
											<th class="text-end"><?=number_format($payco_checkout_price)?><br/>(<?=($payco_checkout_price>0)?round($payco_checkout_price*100/$total_price,2):"0"?> %)</th>
											<th class="text-end"><?=number_format($toss_checkout_count)?><br/>(<?=($toss_checkout_count>0)?round($toss_checkout_count*100/$total_count,2):"0"?> %)</th>
											<th class="text-end"><?=number_format($toss_checkout_price)?><br/>(<?=($toss_checkout_price>0)?round($toss_checkout_price*100/$total_price,2):"0"?> %)</th>
											<th class="text-end"><?=number_format($tosspay_checkout_count)?><br/>(<?=($tosspay_checkout_count>0)?round($tosspay_checkout_count*100/$total_count,2):"0"?> %)</th>
											<th class="text-end"><?=number_format($tosspay_checkout_price)?><br/>(<?=($tosspay_checkout_price>0)?round($tosspay_checkout_price*100/$total_price,2):"0"?> %)</th>
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
