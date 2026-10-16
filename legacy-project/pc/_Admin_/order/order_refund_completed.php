<?
$sidebar_file = "sidebar_order.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_settle_no = filter_input(INPUT_GET, 'search_settle_no', FILTER_SANITIZE_STRING);
$search_ordno = filter_input(INPUT_GET, 'search_ordno', FILTER_SANITIZE_STRING);
$search_product_code = filter_input(INPUT_GET, 'search_product_code', FILTER_SANITIZE_STRING);
$search_start_date = filter_input(INPUT_GET, 'search_start_date', FILTER_SANITIZE_STRING);
$search_end_date = filter_input(INPUT_GET, 'search_end_date', FILTER_SANITIZE_STRING);
$search_m_id = filter_input(INPUT_GET, 'search_m_id', FILTER_SANITIZE_STRING);

$topmenu['order'] = "active";
$page_title="취소/환불 완료 리스트";


if(!$page){
$page=1;
}

$where = [];

if($search_start_date==""){
	$d = mktime(0,0,0, date("m"), 1, date("Y"));
	//이번달 1일
	//$search_start_date = date('Y-m-01',$d);
	//$search_start_date = "2024-11-06";
	$search_start_date = "2025-01-01";
}

if($search_end_date==""){
	$d = mktime(0,0,0, date("m"), 1, date("Y"));
	//이번달 말일
	$search_end_date = date('Y-m-t',$d);
	//$search_end_date = "2024-11-07";
}

//$where[] = "ord_ymd>='2021-01-01' and ord_ymd<'2021-12-31'";

if(isset($search_settle_no) && $search_settle_no<>""){
	$where[] = "a.settle_no ='".$search_settle_no."'";
}

if(isset($search_ordno) && $search_ordno<>""){
	$where[] = "b.ordno ='".$search_ordno."'";
}

if(isset($search_product_code) && $search_product_code<>""){
	$where[] = "b.product_code ='".$search_product_code."'";
}

if($search_start_date){
	$where[] = "b.cancel_date >='".$search_start_date."'";
}

if($search_end_date){
	$where[] = "b.cancel_date <='".$search_end_date."'";
}

if($search_m_id){
	$where[] = "a.m_id ='".$search_m_id."'";
}


foreach($_GET as $key=>$value){
	if($key<>"page" ){
		if($value<>""){
			$param.="&".$key."=".$value;
		}
	}
}

	
$add_where = "";

foreach($where as $value){
	$add_where.= " and ".$value;
}

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$orderby = "b.cancel_date desc";

	$adminOrder= new AdminOrder($conn); 
	$order_list = $adminOrder->getOrderRefund($page,$add_where,$orderby,$param,'30');

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$checked['search_pg_provider'][$search_pg_provider] = "checked";
$checked['search_payment_method'][$search_payment_method] = "checked";
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
					
					<div class="row g-2">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">검색필터</h5>
							<div class="card-body py-2">
								<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
									<div class="row mb-2">
										<div class="col-lg-3">
											<div class="row">
												<label for="search_settle_no" class="col-sm-4 col-form-label bg-light border">결제번호</label>
												<div class="col-sm-8">
													<input type="text" class="form-control" id="search_settle_no" name="search_settle_no" placeholder="결제번호" value="<?=$search_settle_no?>">
												</div>
											</div>
										</div>
										<div class="col-lg-3">
											<div class="row">
												<label for="search_ordno" class="col-sm-4 col-form-label bg-light border">주문번호</label>
												<div class="col-sm-8">
													<input type="text" class="form-control" id="search_ordno" name="search_ordno" placeholder="주문번호" value="<?=$search_ordno?>">
												</div>
											</div>
										</div>
										<div class="col-lg-4">
											<div class="row">
												<label for="search_m_id" class="col-sm-3 col-form-label bg-light border">회원아이디</label>
												<div class="col-sm-9">
													<input type="text" class="form-control" id="search_m_id" name="search_m_id" placeholder="회원아이디(이메일)" value="<?=$search_m_id?>">
												</div>
											</div>
										</div>
									</div>
									<div class="row mb-2">
										<div class="col-lg-3">
											<div class="row">
												<label for="search_product_code" class="col-sm-4 col-form-label bg-light border">옵션상품코드</label>
												<div class="col-sm-8">
													<input type="text" class="form-control" id="search_product_code" name="search_product_code" placeholder="옵션상품코드" value="<?=$search_product_code?>">
												</div>
											</div>
										</div>
									</div>
									<div class="row mb-2">
										<div class="col-lg-12">
											<div class="row">
												<label for="search_payment_method" class="col-sm-1 col-form-label bg-light border">기간검색</label>
												<div class="col-sm-2">
													<div id="reportrange" class="form-control" data-toggle="date-picker-range" data-target-display="#reportrange"  data-cancel-class="btn-light">
														<i class="mdi mdi-calendar"></i>&nbsp;
														<span id="reportrange"></span> <i class="mdi mdi-menu-down"></i>
													</div>
												</div>
												<div class="col-sm-4">
													<div class="input-group">
														<input type="text" class="form-control" id="search_start_date" name="search_start_date" placeholder="시작일자" value="<?=$search_start_date?>" readonly>
														<span class="input-group-text">~</span>
														<input type="text" class="form-control" id="search_end_date" name="search_end_date" placeholder="종료일자" value="<?=$search_end_date?>" readonly>
													</div>
												</div>
											</div>
										</div>
									</div>
									<div class="row">
										<div class="col-lg-12">
											<div class="float-end">
												<button type="submit" class="btn btn-primary shadow-none">주문내역 검색</button>
											</div>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
					
					<div class="d-flex flex-row justify-content-between mb-2">
						<div class="float-start"><? echo number_format($order_list->total_results)?> 개</div>
						<div class="float-end"></div>
					</div>

					<div class="row">
						<div class="col-12">
							<table class="table table-centered w-100  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
								<thead class="table-light">
									<tr>
										<th class="text-center">번호</th>
										<th class="text-center">주문일자<br/>(취소일자)</th>
										<th class="text-center">결제번호</th>
										<th class="text-center">주문번호</th>
										<th class="text-center">회원아이디</th>
										<th class="text-center">상품코드</th>
										<th class="text-center">상품명</th>
										<th class="text-center">주문금액</th>
										<th class="text-center">주문상태</th>
										<th class="text-center">수령여부</th>
									</tr>
								</thead>
								<tbody class="bg-white font-12">
								<?
								if($order_list->success == true){
									$result = $order_list->resultset->fetchAll();
									
									$num = 0;

									foreach($result as $value){
								?>
									<tr>
										<td class="text-center"><?=$order_list->total_results-($num+($page-1)*20)?></td>
										<td class="text-center"><?=$value['order_date']?><br/>(<?=$value['cancel_date']?>)</td>
										<td class="text-center"><a href="order_view.php?settle_no=<?=$value['settle_no']?>"><?=$value['settle_no']?></a></td>
										<td class="text-center"><?=$value['ordno']?></td>
										<td><?=$value['m_id']?></td>
										<td class="text-center"><?=$value['product_code']?></td>
										<td class="text-start"><?if($value['is_mobile']=="Y"){?><span class="badge bg-secondary">M</span><?}?> <?=$value['product_name']?></td>
										<td class="text-end"><?=number_format($value['price'])?></td>
										<td class="text-center"><?=$adminOrder->getOrderStatus($value['status'])?></td>
										<td class="text-center"><?=($value['is_actv']=="1"?"O":"X")?></td>
									</tr>
								<?		$num++;
										}
									}
								?>
								</tbody>
							</table>
							<div class="text-center mt-3"><?echo $order_list->links_html;?></div>
						</div> <!-- end col -->
					</div>
				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script type="text/javascript">
$(function() {
    var start = moment().subtract(29, 'days');
    var end = moment();
    function cb(start, end) {
		$('#reportrange span').html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD'));
		$('#search_start_date').val(start.format('YYYY-MM-DD'));
		$('#search_end_date').val(end.format('YYYY-MM-DD'));
    }
    $('#reportrange').daterangepicker({
        startDate: start,
        endDate: end,
        ranges: {
           '오늘': [moment(), moment()],
           '어제': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
           '지난 7일': [moment().subtract(6, 'days'), moment()],
           '지난 30일': [moment().subtract(29, 'days'), moment()],
           '이번달': [moment().startOf('month'), moment().endOf('month')],
           '지난달': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb);
   //cb(start, end);
});
</script>
</body>
</html>
