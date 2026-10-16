<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['statistics'] = "active";
$sidebar_file = "sidebar_statistics.php";

$page_title="옵션상품 주문통계";

$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_STRING);
$search_product_code = filter_input(INPUT_GET, 'search_product_code', FILTER_SANITIZE_STRING);
$search_supplier_code = filter_input(INPUT_GET, 'search_supplier_code', FILTER_SANITIZE_STRING);

if($search_year==""){
//	$search_year = date('Y');
}

$selected['search_product_code'][$search_product_code] = "selected";
$selected['search_supplier_code'][$search_supplier_code] = "selected";
$checked['search_year'][$search_year] = "checked";

if(!$page){
	$page=1;
}

$where = [];


if(isset($search_year) && $search_year<>""){
	//$where[] = "date_format(t3.ord_ymd,'%Y') ='".$search_year."'";
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$admin= new Admin($conn);
	$adminGoods= new AdminGoods($conn);

	$publisher_data= $admin->getSupplierList();

	if($search_year==""){
		$search_year = "1970";
		$start_date = $search_year."-01-01";
	}

	if($search_year==""){
		$search_year = "1970";
		$start_date = $search_year."-01-01";
		$last_day = date("t", mktime(0, 0, 1, $search_month, 1, $search_year));
		$end_date = "2026-".$search_month."-".$last_day;
	}else{
		if($search_month==""){
			$start_date = $search_year."-01-01";
			$last_day = date("t", mktime(0, 0, 1, 12, 1, $search_year));
			$end_date = "2026-12-".$last_day;
		}else{
			$start_date = $search_year."-".$search_month."-01";
			$last_day = date("t", mktime(0, 0, 1, $search_month, 1, $search_year));
			$end_date = "2026-".$search_month."-".$last_day;
		}
	}


	if($search_product_code){
		//옵션상품정보
		$goods_item_info = $admin->getGoodsItemInfo($search_product_code);

		//판매가격별 통계
		$query="select unit_price,sum(sales_count)as total_count from tbl_sales where product_code=:product_code group by unit_price";
		$stmt = $conn->prepare($query);
		$params = array(
			":product_code"=>$search_product_code,

		);
		$stmt->execute($params);

		$order_price_data = $stmt->fetchAll();

		//일자별 통계
		$query="select ord_ymd,unit_price,sum(sales_count)as total_count from tbl_sales where product_code=:product_code and ord_ymd between :start_date and :end_date group by ord_ymd,unit_price order by ord_ymd asc,unit_price asc";
		$stmt = $conn->prepare($query);
		$params = array(
			":product_code"=>$search_product_code,
			":start_date"=>$start_date,
			":end_date"=>$end_date,
		);
		$stmt->execute($params);

		$order_day_data = $stmt->fetchAll();

		//할인 프로모션 이력
		$query="select * from tbl_promotion_schedule where product_code=:product_code and promotion_start>=:start_date and promotion_end<=:end_date";
		$stmt = $conn->prepare($query);
		$params = array(
			":product_code"=>$search_product_code,
			":start_date"=>$start_date,
			":end_date"=>$end_date,

		);
		$stmt->execute($params);

		$promotion_history = $stmt->fetchAll();
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
<?debug($params);?>
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
				<div class="row g-2">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">검색필터</h5>
							<div class="card-body py-2">
								<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
									<div class="row mb-2">
										<label for="search_year" class="col-sm-1 col-form-label bg-light border">주문연도</label>
										<div class="col-sm-11">
											<?
												for($i=2020;$i<=date('Y');$i++){
											?>
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="search_year_<?=$i?>" name="search_year" class="form-check-input"  value="<?=$i?>" <?=$checked['search_year'][$i]?>>
												<label class="form-check-label" for="search_year_<?=$i?>"><?=$i?>년</label>
											</div>
											<?
												}
											?>
										</div>
									</div>

									<div class="row">
										<div class="col-lg-4 mb-2">
											<div class="row">
												<label for="search_supplier_code" class="col-sm-2 col-form-label bg-light border">공급처</label>
												<div class="col-sm-8">
													<select id="search_supplier_code" name="search_supplier_code" class="form-control select2" data-toggle="select2">
														<option value="">:::공급처 선택:::</option>
														<?
															foreach($publisher_data as $value){
														?>
														<option value="<?=$value['publisher_code']?>" <?=$selected['search_supplier_code'][$value['publisher_code']]?>><?=$value['publisher_name']?></option>
														<?
															}
														?>
													</select>
												</div>
											</div>
										</div>
										<div class="col-lg-8 mb-2">
											<div class="row">
												<label for="search_product_code" class="col-sm-2 col-form-label bg-light border">옵션상품</label>
												<div class="col-sm-10">
													<select id="search_product_code" name="search_product_code" class="form-control select2" data-toggle="select2">
														<option value="">:::옵션상품 선택:::</option>
													</select>
												</div>
											</div>
										</div>
									</div>
									<div class="col-auto">
										<button class="input-group-text btn-primary shadow-none" type="submit">검 색</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<table class="table table-bordered table-centered table-sm caption-top">
							<caption class="fw-bold">옵션상품정보</caption>
							<thead class="table-light font-13">
							<tr>
								<th class="text-center">옵션상품코드</th>
								<th class="text-center">옵션상품명</th>
								<th class="text-center">진열그룹</th>
								<th class="text-center">플랫폼</th>
								<th class="text-center">출시일</th>
								<th class="text-center">소비자가</th>
								<th class="text-center">판매가</th>
								<th class="text-center">판매상태</th>
							</tr>
							</thead>
							<?if($search_product_code){?>
							<tbody class="bg-white">
							<tr>
								<td class="text-center"><?=$goods_item_info['product_code']?></td>
								<td><?=$goods_item_info['product_name']?></td>
								<td class="text-center"><?=$goods_item_info['display_type']?></td>
								<td class="text-center"><?=$admin->getProductPlatform($goods_item_info['product_platform'])?></td>
								<td class="text-center"><?=date('Y-m-d',strtotime($goods_item_info['release_date']))?></td>
								<td class="text-end"><?=number_format($goods_item_info['consumer_price'])?></td>
								<td class="text-end"><?=number_format($goods_item_info['price'])?></td>
								<td class="text-center"><?=$admin->getProductStatus($goods_item_info['status'])?></td>
							</tr>
							</tbody>
							<?}?>
						</table>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<table class="table table-bordered table-centered table-sm caption-top">
							<caption class="fw-bold">판매가격별 통계</caption>
							<thead class="table-light font-13">
							<tr>
								<th class="text-center">판매가</th>
								<th class="text-center">판매수량</th>
								<th class="text-center">합계</th>
							</tr>
							</thead>
							<tbody class="bg-white">
							<?
								foreach($order_price_data as $order_price){
							?>
							<tr>
								<td class="text-end"><?=number_format($order_price['unit_price'])?></td>
								<td class="text-end"><?=number_format($order_price['total_count'])?></td>
								<td class="text-end"><?=number_format($order_price['unit_price']*$order_price['total_count'])?></td>
							</tr>
							<?
									$total_count+=$order_price['total_count'];
									$total_price+=($order_price['unit_price']*$order_price['total_count']);
								}
							?>
							</tbody>
							<tfoot class="table-light font-13">
							<tr>
								<th class="text-center">합계</th>
								<th class="text-end"><?=number_format($total_count)?></th>
								<th class="text-end"><?=number_format($total_price)?></th>
							</tr>
							</tfoot>
						</table>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<table class="table table-bordered table-centered table-sm caption-top">
							<caption class="fw-bold">일자별 통계</caption>
							<thead class="table-light font-13">
							<tr>
								<th class="text-center">주문일자</th>
								<th class="text-center">판매가</th>
								<th class="text-center">판매수량</th>
								<th class="text-center">합계</th>
							</tr>
							</thead>
							<tbody class="bg-white">
							<?
								foreach($order_day_data as $order_day){
							?>
							<tr>
								<td class="text-center"><?=$order_day['ord_ymd']?></td>
								<td class="text-end"><?=number_format($order_day['unit_price'])?></td>
								<td class="text-end"><?=number_format($order_day['total_count'])?></td>
								<td class="text-end"><?=number_format($order_day['unit_price']*$order_day['total_count'])?></td>
							</tr>
							<?
									$total_day_count+=$order_day['total_count'];
									$total_day_price+=($order_day['unit_price']*$order_day['total_count']);
								}
							?>
							</tbody>
							<tfoot class="table-light font-13">
							<tr>
								<th class="text-center" colspan="2"><?=$search_year?>년 합계</th>
								<th class="text-end"><?=number_format($total_day_count)?></th>
								<th class="text-end"><?=number_format($total_day_price)?></th>
							</tr>
							</tfoot>
						</table>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<table class="table table-bordered table-centered table-sm caption-top">
							<caption class="fw-bold">할인 프로모션 이력</caption>
							<thead class="table-light font-13">
							<tr>
								<th class="text-center">할인 프로모션 기간</th>
								<th class="text-center">승인할인율</th>
								<th class="text-center">DG할인율</th>
								<th class="text-center">할인 프로모션 판매가</th>
								<th class="text-center">할인 프로모션 판매수량</th>
								<th class="text-center">할인 프로모션 판매합계</th>
							</tr>
							</thead>
							<tbody class="bg-white">
							<?
								foreach($promotion_history as $promotion){
							?>
							<tr>
								<td class="text-center"><?=$promotion['promotion_start']?> ~ <?=$promotion['promotion_end']?></td>
								<td class="text-end"><?=$promotion['p_discount_rate']?>%</td>
								<td class="text-end"><?=$promotion['discount_rate']?>%</td>
								<td class="text-end"><?=number_format($promotion['sale_price'])?></td>
								<td class="text-end"><?=number_format($promotion['order_count'])?></td>
								<td class="text-end"><?=number_format($promotion['sale_price']*$promotion['order_count'])?></td>
							</tr>
							<?
									$total_order_count+=$promotion['order_count'];
									$total_order_price+=($promotion['sale_price']*$promotion['order_count']);
								}
							?>
							</tbody>
							<tfoot class="table-light font-13">
							<tr>
								<th class="text-center" colspan="4"><?=$search_year?>년 합계</th>
								<th class="text-end"><?=number_format($total_order_count)?></th>
								<th class="text-end"><?=number_format($total_order_price)?></th>
							</tr>
							</tfoot>
						</table>
					</div>
				</div>

			</div>
			<!-- /container-fluid -->
		</div>
		<!-- /content -->
	</div>
	<!-- /content-page -->
</div>
<!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	var search_supplier_code = $("#search_supplier_code option:selected").val();
	var search_product_code = "<?=$search_product_code?>";
	if(search_supplier_code){
		$.ajax({
			 type: "POST",
			 url: "ajax_publisher_goods_item.php",
			 data: {search_supplier_code:search_supplier_code,search_product_code:search_product_code},
			 success: function (data, status) {
				$("#search_product_code").html(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	}

	//공급처의 옵션상품 가져오기
	$("#search_supplier_code").bind("change",function(){
		var search_supplier_code = $("#search_supplier_code option:selected").val();
		var search_product_code = "<?=$search_product_code?>";

		$.ajax({
			 type: "POST",
			 url: "ajax_publisher_goods_item.php",
			 data: {search_supplier_code:search_supplier_code,search_product_code:search_product_code},
			 success: function (data, status) {
				$("#search_product_code").html(data);
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
