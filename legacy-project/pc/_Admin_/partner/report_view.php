<?
$sidebar_file = "sidebar_partner.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['partner'] = "active";

$idx = filter_input(INPUT_GET,'idx',FILTER_SANITIZE_NUMBER_INT);

$page_title="리포트 상세보기";

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	$adminPartner= new AdminPartner($conn);
	
	
	//리포트 설정 정보
	$report_config = $adminPartner->getPartnerReportInfo($idx);

	//리포트 통계 정보
	$report_data = $adminPartner->getPartnerReportData($idx);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$start_date = $report_config['report_year']."-".$report_config['report_month']."-01";

if($report_config['report_term']=="T"){//분기별
	$quarter = array(
		"1"=>"01.01~03.31",
		"2"=>"04.01~06.30",
		"3"=>"07.01~09.30",
		"4"=>"010.01~12.31",
	);

	$period = $report_config['report_year']."Q".$report_config['report_month']." (".$quarter[$report_config['report_month']].")";
}else{//월별
	$period = $report_config['report_year'].".".$report_config['report_month'].".01~".$report_config['report_month'].".".date('t', strtotime($start_date));
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">파트너</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">리포트 관리</a></li>
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

								<!-- Invoice Logo-->
								<div class="clearfix">
									<div class="float-start mb-2">
										<h4 class="m-0 d-print-none">Product Statistics - <?=$report_config['publisher']?></h4>
									</div>
								</div>

								<!-- Invoice Detail-->
								<div class="row">
									<div class="col-sm-6">
										<div class="mt-0">
											<ol class="list-group list-group-numbered border-0">
												<li class="list-group-item border-0 py-1">Period: <?=$period?></li>
												<li class="list-group-item border-0 py-1">Royalty: KRW 1-> <?=$report_config['currency_converter']?> <?=$report_config['royalty']?> (<?=$report_config['royalty_info']?>)</li>
												<li class="list-group-item border-0 py-1">Default currency: KRW</li>
												<li class="list-group-item border-0 py-1">Revenue Share: </li>
												<li class="list-group-item border-0 py-1">Payment Gateway Fee: Bank Transfer - <?=$report_config['account_fee']?> %, Credit Card - <?=$report_config['card_fee']?> %, Mobile Payment - <?=$report_config['mobile_fee']?> %</li>
											</ol>
										</div>
									</div>
									<!-- end col -->
									<div class="col-sm-4 offset-sm-2">
										<div class="float-sm-end">
											<div class="d-grid mb-2">
												<button type="button" class="btn btn-sm btn-info shadow-none" id="btn_email_notice" data-idx="<?=$report_config['idx']?>" data-publisher="<?=$report_config['publisher_code']?>" data-year="<?=$report_config['report_year']?>" data-month="<?=$report_config['report_month']?>">알림메일발송</button>
											</div>
											<p class="font-12 mb-1"><strong>리포트 생성일: </strong> <?=$report_config['reg_date']?></p>
											<p class="font-12 mb-1"><strong>리포트 수정일: </strong> <?=$report_config['update_date']?></p>
											<p class="font-12 mb-1"><strong>알림메일 발송일: </strong> <?=$report_config['notice_date']?></p>
											<p class="font-12 mb-1"><strong>리포트 승인일: </strong> <?=$report_config['approval_date']?></p>
											<p class="font-12 mb-1"><strong>진행상태: </strong> <span class="badge bg-success font-12"><?=$report_config['status']?></span></p>
										</div>
									</div><!-- end col -->
								</div>
								<!-- end row -->

								<div class="row">
									<div class="col-12">
										<div class="table-responsive">
											<table class="table table-bordered table-sm table-centered mt-2">
												<thead class="table-light">
												<tr>
													<th class="text-center">Platform</th>
													<th class="text-center">Product</th>
													<th class="text-center">SRP<br/>(KRW)</th>
													<th class="text-center">Rate</th>
													<th class="text-center">Price<br/>(KRW)</th>
													<th class="text-center">Product Cost<br/>(KRW)</th>
													<th class="text-center">Payment<br/>Gateway</th>
													<th class="text-center">Units Sold</th>
													<th class="text-center">Gross Sales<br/>(KRW)</th>
													<th class="text-center">PG Fee</th>
													<th class="text-center">Net Sales<br/>(KRW)</th>
													<th class="text-center">Revenue Share<br/>(KRW)</th>
												</tr>
												</thead>
												<tbody class="font-12">
												<?
													foreach($report_data as $value){

														if($value['gross_units_sold']<0){
															$color = "text-danger";
														}else{
															$color = "";
														}
														
														if($value['rate']=="0"){
															$product_cost = $value['product_cost'];
														}else{
															$product_cost = $value['product_cost']*(1-($value['rate']/100));
														}
												?>
												<tr>
													<td class="text-center"><?=$value['platform']?></td>
													<td><?=$value['product_nm_en']?></td>
													<td class="text-end"><?=number_format($value['publisher_srp'],0)?></td>
													<td class="text-center"><?=$value['rate']?> %</td>
													<td class="text-end"><?=number_format($value['publisher_price'],0)?></td>
													<td class="text-end"><?=number_format($product_cost,0)?></td>
													<td class="text-center"><?=$value['payment_gateway']?></td>
													<td class="text-end"><?=number_format($value['gross_units_sold'],0)?></td>
													<td class="text-end"><?=number_format($value['gross_sales_ex_vat'],0)?></td>
													<td class="text-end"><?=number_format($value['payment_gateway_fee'],0)?></td>
													<td class="text-end"><?=number_format($value['net_sales'],0)?></td>
													<td class="text-end"><?=number_format($value['revenue_share'],0)?></td>
												</tr>
												<?
														$sum_gross_units_sold +=$value['gross_units_sold'];
														$sum_gross_sales_ex_vat +=$value['gross_sales_ex_vat'];
														$sum_payment_gateway_fee+=$value['payment_gateway_fee'];
														$sum_net_sales+=$value['net_sales'];
														$sum_revenue_share+=$value['revenue_share'];
													}
												?>
												</tbody>
												<tfoot class="table-light">
												<tr>
													<th colspan="7"></th>
													<th class="text-end"><?=number_format($sum_gross_units_sold)?></th>
													<th class="text-end"><?=number_format($sum_gross_sales_ex_vat)?></th>
													<th class="text-end"><?=number_format($sum_payment_gateway_fee)?></th>
													<th class="text-end"><?=number_format($sum_net_sales)?></th>
													<th class="text-end"><?=number_format($sum_revenue_share)?></th>
												</tr>
												</tfoot>
											</table>
										</div> <!-- end table-responsive-->
									</div> <!-- end col -->
								</div>
								<!-- end row -->

								<div class="row">
									<div class="col-sm-6">
										<div class="clearfix pt-3">
										</div>
									</div>
									<div class="col-sm-6">
										<div class="float-end mt-3 mt-sm-0">
											<h4>Royalty Payable: <?=$report_config['currency_converter']?> <?=number_format($sum_revenue_share*$report_config['royalty'],2)?> </h4>
										</div>
										<div class="clearfix"></div>
									</div>
								</div>
								<!-- end row-->

								<div class="d-print-none mt-4">
									<div class="float-start">
										<a href="report_list.php" class="btn btn-secondary shadow-none">목록가기</a>
									</div>
									<div class="float-end">
										<!--<a href="javascript:window.print()" class="btn btn-primary shadow-none"><i class="mdi mdi-printer"></i> Print</a>-->
									</div>
								</div>   
								<!-- end buttons -->

							</div> <!-- end card-body-->
						</div> <!-- end card -->
					</div> <!-- end col-->
				</div>
						
			</div> <!-- container -->
		</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>