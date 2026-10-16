<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['china'] = "active";
$sidebar_file = "sidebar_china.php";

$page_title = "주문서 상세보기";

$settle_no = filter_input(INPUT_GET, 'settle_no', FILTER_SANITIZE_STRING);

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try{  
	if($settle_no){
		$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		//주문정보
		$query= "select * from directgames.tbl_invoice_order where settle_no=:settle_no";
		$params = array(
						':settle_no'=>$settle_no
					);
		$stmt = $conn->prepare($query);
		$stmt->execute($params);
		$order_data = $stmt->fetch();
		
		//주문상품정보
		$item_query = "select * from directgames.tbl_invoice_order_item where settle_no=:settle_no order by order_num asc";
		$params = array(
						':settle_no'=>$settle_no
					);
		$stmt = $conn->prepare($item_query);
		$stmt->execute($params);
		$order_item_data = $stmt->fetchAll();

		//결제로그
		$lgd_cas_query = "select imp_uid,merchant_uid,pay_method,paid_amount,status,name,pg_provider,pg_tid,buyer_name,buyer_email,paid_at,receipt_url,card_name,apply_num,vbank_num,
			vbank_name,vbank_holder,vbank_date,settle_count,reg_date from directgames.tbl_kcp_log_invoice where merchant_uid=:order_no";
		$params = array(
						':order_no'=>$settle_no
					);
		$stmt = $conn->prepare($lgd_cas_query);
		$stmt->execute($params);
		$log_data = $stmt->fetchAll();

		//배송지정보
		$address_query = "select * from directgames.tbl_invoice_address where settle_no=:settle_no order by idx asc";
		$params = array(
						':settle_no'=>$settle_no
					);
		$stmt = $conn->prepare($address_query);
		$stmt->execute($params);
		$address_data = $stmt->fetchAll();
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
			<div class="container-fluid">
				<!-- start page title -->
				<div class="row">
					<div class="col-12">
						<div class="page-title-box">
							<div class="page-title-right">
								<ol class="breadcrumb m-0">
									<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">중국결제</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">중국 결제 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>     

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body">
								<!-- Invoice Logo-->
								<div class="clearfix">
									<div class="text-center">
										<h4 class="m-0 d-print-none">Invoice for purchase #<?=$settle_no?></h4>
									</div>
									<div class="text-end">
										<!--<button type="button" class="btn btn-danger shadow-none">수정</button>-->
									</div>
								</div>

								<!-- Invoice Detail-->
	
								<div class="row mt-4">
									<div class="col-sm-6">
										<div class="card">
											<h5 class="card-header bg-light">주문자 정보</h5>
											<div class="card-body p-2">
												<ul class="list-group">
													<li class="list-group-item"><strong>주문자명:</strong> <?=$order_data['name']?></li>
													<li class="list-group-item"><strong>주문자이메일:</strong> <?=$order_data['email']?></li>
													<li class="list-group-item"><strong>주문일자:</strong> <?=$order_data['ord_ymd']?></li>
												</ul>
											</div>
										</div>
										
										<div class="table-responsive">
											<table class="table table-sm table-bordered caption-top">
												<caption class="">주문상품 정보</caption>
												<thead class="table-light">
												<tr>
													<th class="text-center">상품명</th>
													<th class="text-center">판매가</th>
													<th class="text-center">판매수량</th>
													<th class="text-center">합계</th>
												</tr>
												</thead>
												<tbody>
												<?
													$num = "1";
													foreach($order_item_data as $order_item){
												?>
												<tr>
													<td class="text-start"><?=$order_item['product_nm']?></td>
													<td class="text-end"><span style="font-family:dotum">&#92;</span> <?=number_format($order_item['price'])?></td>
													<td class="text-end"><?=number_format($order_item['qty'])?></td>
													<td class="text-end"><span style="font-family:dotum">&#92;</span> <?=number_format($order_item['price']*$order_item['qty'])?></td>
												</tr>
												<?
														$num++;
														$total_count+=$order_item['qty'];
														$total_price+= $order_item['price']*$order_item['qty'];
													}
												?>
												</tbody>
												<tfoot class="table-light">
												<tr>
													<th colspan="2" class="text-center">힙계</th>
													<th class="text-end"><?=number_format($total_count)?></th>
													<th class="text-end"><span style="font-family:dotum">&#92;</span> <?=number_format($total_price)?></th>
												</tr>
												</tfoot>
											</table>
										</div>
									</div>
									<div class="col-sm-6">
										<div class="card">
											<h5 class="card-header bg-light">결제 정보</h5>
											<div class="card-body p-2">
												<ul class="list-group">
													<li class="list-group-item"><strong>결제예정금액:</strong> <span style="font-family:dotum">&#92;</span> <?=number_format($order_data['settle_price'])?></li>
													<li class="list-group-item"><strong>결제완료금액:</strong> <span style="font-family:dotum">&#92;</span> <?=number_format($order_data['amount_paid'])?></li>
													<li class="list-group-item"><strong>남은금액:</strong> <span style="font-family:dotum">&#92;</span> <?=number_format($order_data['settle_price']-$order_data['amount_paid'])?></li>
													<li class="list-group-item"><strong>결제횟수:</strong> <?=$order_data['settle_count']?></li>
													<li class="list-group-item"><strong>결제상태: </strong>
														<?	
															switch($order_data['step']){
																case "1":
																	echo "결제대기";
																break;
																case "2":
																	echo "결제완료";
																break;
															}
														?>
													</li>
												</ul>
											</div>
										</div>
										
										<div class="card">
											<h5 class="card-header bg-light">결제 상세정보</h5>
											<div class="card-body p-2">
												<ul class="list-group">
													<?foreach($log_data as $value){?>
													<li class="list-group-item"><?=$value['settle_count']?>회차 / <?=$value['pg_provider']?> / <?=($value['status']=="paid")?"결제완료":"결제대기"?> / <?=($value['pg_provider']=="kcp")?$value['imp_uid']:$value['pg_tid']?> / <?=number_format($value['paid_amount'])?> 원/ <?=$value['reg_date']?></li>
													<?}?>
												</ul>
											</div>
										</div>
										
										<div class="card">
											<h5 class="card-header bg-light">배송지 정보</h5>
											<div class="card-body p-2">
												<table class="table table-bordered table-sm">
													<thead class="table-light">
													<tr>
														<th class="text-center">번호</th>
														<th class="text-center">이름</th>
														<th class="text-center">우편번호</th>
														<th class="text-center">주소</th>
														<th class="text-center">전화번호</th>
													</tr>
													</thead>
													<tbody>
													<?
														$num=1;
														foreach($address_data as $address){
													?>
													<tr>
														<td><?=$num?></td>
														<td><?=$address['name']?></td>
														<td><?=$address['zipcode']?></td>
														<td><?=$address['address']?></td>
														<td><?=$address['tel']?></td>
													</tr>
													<?
															$num++;
														}
													?>
													</tbody>
												</table>
											</div>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-sm-6">
									</div>
									<div class="col-sm-6">
										<div class="float-end mt-3 mt-sm-0">
											<h3><span style="font-family:dotum">&#92;</span> <?=number_format($total_price)?></h3>
										</div>
										<div class="clearfix"></div>
									</div> 
								</div>
								<!-- end row-->
								<!--
								<div class="d-print-none mt-4">
									<div class="text-end">
										<a href="javascript:window.print()" class="btn btn-primary"><i class="mdi mdi-printer"></i> Print</a>
										<a href="javascript: void(0);" class="btn btn-info">Submit</a>
									</div>
								</div>
								-->
								<!-- end buttons -->

							</div> <!-- end card-body-->
						</div> <!-- end card -->
					</div> <!-- end col-->
				</div>
			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
