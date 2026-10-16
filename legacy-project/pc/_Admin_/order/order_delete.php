<?
$sidebar_file = "sidebar_order.php";
	header('Content-Type: text/html; charset=UTF-8');
	ini_set( "display_errors", 1 );
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	
	$topmenu['order'] = "active";

$page_title="주문삭제대상 리스트";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

$end_date = date('Y-m-d');
$start_date = date("Y-m-d", strtotime($treatDateEnd.' -7day'));

//$where[] ="a.ord_ymd between '2018-07-01' and '2019-12-31' and a.cdt='1970-01-01 09:00:00'"; 

//$where[] ="a.ord_ymd between '2018-08-01' and '2022-12-31' and b.supp_cd in ('3')"; 

$where[]="b.status='9' and a.ord_ymd between '2019-01-01' and '2019-12-31' and a.settlekind='SC0040'";

try{  
	//$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);

	//$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	$adminOrder= new AdminOrder($conn_dgkr); 
	//$ztorm = new Ztorm();

	$add_where = "";

	foreach($where as $value){
		$add_where.= " and ".$value;
	}

	//echo $add_where;

	foreach($_GET as $key=>$value){
		if($key<>"page" ){
			if($value<>""){
				$param.="&".$key."=".$value;
			}
		}
	}

	$orderby = "b.ordno asc";

	$order_list = $adminOrder->getOrderList($page,$add_where,$orderby,$param);

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
										<li class="breadcrumb-item"><a href="javascript: void(0);">주문 관리</a></li>
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
									<div class="d-flex flex-row justify-content-between mb-2">
										<div class="float-start"><? echo number_format($order_list->total_results)?> 개</div>
									</div>
									
									<div class="table-responsive">
										<table class="table table-centered w-100 dt-responsive nowrap table-sm table-bordered" id="">
											<thead class="table-light font-14">
												<tr>
													<th class="text-center">주문일자</th>
													<th class="text-center">결제일자</th>
													<th class="text-center">결제번호</th>
													<th class="text-center">주문번호</th>
													<th class="text-center">회원아이디</th>
													<th class="text-center">주문상품</th>
													<th class="text-center">주문금액</th>
													<th class="text-center">결제수단</th>
													<th class="text-center">주문금액<br/>(결제금액)</th>
													<th class="text-center">결제상태</th>
													<th class="text-center">주문상태</th>
													<th class="text-center">키확인</th>
												</tr>
											</thead>
											<tbody class="font-13">
											<?
											if($order_list->success == true){
												$result = $order_list->resultset->fetchAll();

												foreach($result as $value){
													if($value['zt_ord_no']>0){
														$tr_active="table-active";
													}else{
														$tr_active = "";
													}

													$params = array(
															"RetailerOrderID"=>$value['ordno'],
													);
													//$ztorm_order = $ztorm->runGetOrder($params);
											?>
											<tr class="<?=$tr_active?>">
												<td class="text-center"><?=$value['ord_ymd']?></td>
												<td class="text-center"><?=$value['cdt']?></td>
												<td class="text-center"><?=$value['settle_no']?><br/>(<?=number_format($value['emoney'])?>)</td>
												<td class="text-center"><?=$value['ordno']?></td>
												<td class="text-center"><?=$value['email']?></td>
												<td class="text-center"><?=$value['product_code']?></td>
												<td><?=$value['product_nm']?> <?=($value['supp_cd']=="4")?"<span class='badge bg-info text-light font-12 fw-normal mb-1'>번들</span>":""?></td>
												<td class="text-center"><?=$adminOrder->getSettlekindLabel($value['settlekind'])?><br/>(<?=$value['pg_provider']?>)</td>
												<td class="text-end"><?=number_format($value['tot_pay'])?>원 <br/>(<?=number_format($value['settleprice'])?>원)</td>
												<td class="text-center"><?=$adminOrder->getCheckoutStatus($value['step'])?></td>
												<td class="text-center"><?=$adminOrder->getOrderStatus($value['status'])?></td>
												<td class="text-center"><?=($value['is_lic_actv']=="0")?"X":"O"?></td>
											</tr>
											<?
													print_r($ztorm_order);
												}
											}
											?>
											</tbody>
										</table>
									</div>
									<div class="text-center mt-3"><?echo $order_list->links_html;?></div>
								</div>
								<!-- end card-body-->
							</div>
							<!-- end card-->
						</div>
						<!-- end col -->
					</div>
					<!-- end row -->   
				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>
