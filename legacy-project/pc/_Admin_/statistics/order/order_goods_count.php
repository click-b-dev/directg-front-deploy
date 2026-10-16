<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['statistics'] = "active";
$page_title="옵션상품 주문통계";

$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_STRING);
$search_product_code = filter_input(INPUT_GET, 'search_product_code', FILTER_SANITIZE_STRING);
$search_supplier_code = filter_input(INPUT_GET, 'search_supplier_code', FILTER_SANITIZE_STRING);

if($search_year==""){
	$search_year = date('Y');
}

$selected['search_product_code'][$search_product_code] = "selected";
$selected['search_supplier_code'][$search_supplier_code] = "selected";
$checked['search_year'][$search_year] = "checked";
$year_label = ($search_year=="all") ? "전체" : $search_year."년";

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
	
	//$product_data 프리로드 제거 — select2 AJAX(ajax_sales_product.php) 원격검색으로 대체
	$supplier_data = $admin->getSalesSupplierList(); //공급처를 먼저 선택할 수 있도록 전체 공급처 목록 프리로드
	
	//주문연도 조건 (전체 선택 시 기간 제한 없음)
	$year_where = "";
	$year_param = array();
	if($search_year<>"" && $search_year<>"all"){
		$start_date = $search_year."-01-01";
		$end_date = $search_year."-12-31";
		$year_where = " and a.ord_ymd between :start_date and :end_date";
		$year_param = array(":start_date"=>$start_date, ":end_date"=>$end_date);
	}

	
	if($search_product_code){
		//공급처 조건 — 판매 당시 공급처(tbl_sales.supplier_code) 기준. NULL은 현재 공급처로 폴백
		$supplier_where = "";
		$supplier_param = array();
		if($search_supplier_code){
			$supplier_where = " and COALESCE(a.supplier_code,b.supplier_code)=:supplier_code";
			$supplier_param = array(":supplier_code"=>$search_supplier_code);
		}

		//공급처 미선택 시 통계를 공급처별로 분리 표시
		$show_supplier = ($search_supplier_code=="");

		//옵션상품정보
		$goods_item_info = $admin->getGoodsItemInfo($search_product_code);
		//select2에 표시할 선택상품명 (등록상품: tbl_goods_item, 미등록상품: tbl_sales 최신 상품명)
		if($goods_item_info){
			$selected_product_name = $goods_item_info['product_name'];
		}else{
			$stmt = $conn->prepare("select product_name from tbl_sales where product_code=:pc order by ord_ymd desc limit 1");
			$stmt->execute(array(":pc"=>$search_product_code));
			$selected_product_name = $stmt->fetchColumn();
		}
		
		//판매가격별 통계
		$query="select COALESCE(a.supplier_code,b.supplier_code)as supplier_code,c.publisher_name,d.publisher as old_publisher_name,a.unit_price,sum(a.sales_count)as total_count from tbl_sales a left join tbl_goods_item b on a.product_code=b.product_code left join tbl_publisher c on COALESCE(a.supplier_code,b.supplier_code)=c.publisher_code left join directgames.tbl_publisher d on COALESCE(a.supplier_code,b.supplier_code)=d.idx where a.product_code=:product_code".$supplier_where.$year_where." group by COALESCE(a.supplier_code,b.supplier_code),a.unit_price order by COALESCE(c.publisher_name,d.publisher) asc,a.unit_price asc";
		$stmt = $conn->prepare($query);
		$params = array(
			":product_code"=>$search_product_code,

		);
		$params = array_merge($params,$supplier_param,$year_param);
		$stmt->execute($params);

		$order_price_data = $stmt->fetchAll();
		
		//일자별 통계
		$query="select COALESCE(a.supplier_code,b.supplier_code)as supplier_code,c.publisher_name,d.publisher as old_publisher_name,a.ord_ymd,a.unit_price,sum(a.sales_count)as total_count from tbl_sales a left join tbl_goods_item b on a.product_code=b.product_code left join tbl_publisher c on COALESCE(a.supplier_code,b.supplier_code)=c.publisher_code left join directgames.tbl_publisher d on COALESCE(a.supplier_code,b.supplier_code)=d.idx where a.product_code=:product_code".$supplier_where.$year_where." group by COALESCE(a.supplier_code,b.supplier_code),a.ord_ymd,a.unit_price order by COALESCE(c.publisher_name,d.publisher) asc,a.ord_ymd asc,a.unit_price asc";
		$stmt = $conn->prepare($query);
		$params = array(
			":product_code"=>$search_product_code,
		);
		$params = array_merge($params,$supplier_param,$year_param);
		$stmt->execute($params);

		$order_day_data = $stmt->fetchAll();
		
		//할인 프로모션 이력 (전체 선택 시 기간 제한 없음)
		$promo_where = "";
		if($search_year<>"" && $search_year<>"all"){
			$promo_where = " and promotion_start>=:start_date and promotion_end<=:end_date";
		}
		$query="select * from tbl_promotion_schedule where product_code=:product_code".$promo_where;
		$stmt = $conn->prepare($query);
		$params = array(
			":product_code"=>$search_product_code,
		);
		$params = array_merge($params,$year_param);
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
					<div class="row g-2">
						<div class="col-12">
							<div class="card">
								<h5 class="card-header bg-secondary text-white">검색필터</h5>
								<div class="card-body py-2">
									<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
										<div class="row mb-2">
											<label for="search_year" class="col-sm-1 col-form-label bg-light border">주문연도</label>
											<div class="col-sm-11">
												<div class="form-check form-check-inline mt-2">
													<input type="radio" id="search_year_all" name="search_year" class="form-check-input" value="all" <?=$checked['search_year']['all']?>>
													<label class="form-check-label" for="search_year_all">전체</label>
												</div>
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
											<div class="col-lg-8 mb-2">
												<div class="row">
													<label for="search_product_code" class="col-sm-2 col-form-label bg-light border">옵션상품</label>
													<div class="col-sm-10">
														<select id="search_product_code" name="search_product_code" class="form-control">
												<option value=""></option>
												<?if($search_product_code){?>
												<option value="<?=$search_product_code?>" selected>[<?=$search_product_code?>] <?=$selected_product_name?><?=$goods_item_info?'':' (미등록)'?></option>
												<?}?>
											</select>
													</div>
												</div>
											</div>
											<div class="col-lg-4 mb-2">
												<div class="row">
													<label for="search_supplier_code" class="col-sm-2 col-form-label bg-light border">공급처</label>
													<div class="col-sm-8">
														<select id="search_supplier_code" name="search_supplier_code" class="form-control select2">
												<option value="">:::공급처 선택:::</option>
												<?foreach($supplier_data as $sup){?>
												<option value="<?=$sup['publisher_code']?>" <?=($search_supplier_code==$sup['publisher_code'])?'selected':''?>><?=$sup['publisher_name']?></option>
												<?}?>
											</select>
													</div>
												</div>
											</div>
										</div>
										<div class="row">
											<div class="col-lg-12">
												<div class="d-flex justify-content-center">
													<button class="btn btn-primary shadow-none" type="submit">검 색</button>
												</div>
											</div>
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
								<?if($goods_item_info){?>
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
								<?}else{?>
								<tr>
									<td class="text-center"><?=$search_product_code?></td>
									<td><?=$selected_product_name?> <span class="badge bg-secondary">미등록</span></td>
									<td class="text-center" colspan="6">현재 상품 등록정보가 없습니다 (판매이력만 존재)</td>
								</tr>
								<?}?>
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
									<?if($show_supplier){?><th class="text-center">공급처</th><?}?>
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
									<?if($show_supplier){?><td class="text-center"><?=$order_price['publisher_name'] ?: ($order_price['old_publisher_name'] ? $order_price['old_publisher_name'].' <span class="badge bg-warning text-dark">예전DB</span>' : $order_price['supplier_code'])?></td><?}?>
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
									<th class="text-center" colspan="<?=$show_supplier?'2':'1'?>">합계</th>
									<th class="text-end"><?=number_format($total_count)?></th>
									<th class="text-end"><?=number_format($total_price)?></th>
								</tr>
								</tfoot>
							</table>
						</div>
					</div>
					
					<div class="row">
						<div class="col-12 mb-2">
							<div class="float-start"><h5>일자별 통계</h5></div>
							<div class="float-end">
								<button type="button" class="btn btn-success btn-sm shadow-none" id="btn_order_day_all_download" data-productcode="<?=$goods_item_info['product_code']?>" data-suppliercode="<?=$search_supplier_code?>" data-year="<?=$search_year?>"><i class="mdi mdi-microsoft-excel mdi-18px"></i> 일자별 통계 엑셀 다운로드</button>
							</div>
						</div>
					</div>
					
					<div class="row">
						<div class="col-12">

							<table class="table table-bordered table-centered table-sm caption-top">
								<thead class="table-light font-13">
								<tr>
									<?if($show_supplier){?><th class="text-center">공급처</th><?}?>
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
									<?if($show_supplier){?><td class="text-center"><?=$order_day['publisher_name'] ?: ($order_day['old_publisher_name'] ? $order_day['old_publisher_name'].' <span class="badge bg-warning text-dark">예전DB</span>' : $order_day['supplier_code'])?></td><?}?>
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
									<th class="text-center" colspan="<?=$show_supplier?'3':'2'?>"><?=$year_label?> 합계</th>
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
									<td class="text-center"><a href="<?=$document_root?>/statistics/promotion/promotion_report.php?search_start=<?=$promotion['promotion_start']?>&search_end=<?=$promotion['promotion_end']?>&search_key=search_product_code&search_value=<?=$promotion['product_code']?>" target="_blank"><?=$promotion['promotion_start']?> ~ <?=$promotion['promotion_end']?></a></td>
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
									<th class="text-center" colspan="4"><?=$year_label?> 합계</th>
									<th class="text-end"><?=number_format($total_order_count)?></th>
									<th class="text-end"><?=number_format($total_order_price)?></th>
								</tr>
								</tfoot>
							</table>
						</div>
					</div>

				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<style>
/* 옵션상품 select2 취소(x) 버튼이 드롭다운 화살표와 겹치지 않도록 */
.select2-container--default .select2-selection--single .select2-selection__arrow{ right: 4px; }
.select2-container--default .select2-selection--single .select2-selection__clear{
	position: absolute;
	right: 26px;
	top: 50%;
	transform: translateY(-50%);
	margin: 0;
	padding: 0 4px;
	font-size: 1.1rem;
	line-height: 1;
	z-index: 3;
	cursor: pointer;
}
.select2-container--default .select2-selection--single .select2-selection__rendered{ padding-right: 46px; }
</style>
<script>
$(document).ready(function(){
	//옵션상품 select2 원격검색 — 전체 프리로드 대신 타이핑(2자+) 시 상위 30개만 조회
	$("#search_product_code").select2({
		placeholder: ":::옵션상품 검색 (상품코드/상품명):::",
		allowClear: true,
		minimumInputLength: 0, //공급처 먼저 선택 시 타이핑 전에도 목록 표시
		ajax: {
			url: "ajax_sales_product.php",
			dataType: "json",
			delay: 300,
			data: function(params){ return { q: params.term, supplier_code: ($("#search_supplier_code").val()||"") }; },
			processResults: function(data){ return { results: data.results }; },
			cache: true
		}
	});

	//공급처도 취소(x) 가능하도록 allowClear select2 수동 초기화
	$("#search_supplier_code").select2({
		placeholder: ":::공급처 선택:::",
		allowClear: true
	});
	//연동 리셋용: 최초 전체 공급처 목록 보관
	var fullSupplierOptions = $("#search_supplier_code").html();

	var search_product_code = $("#search_product_code option:selected").val();
	var search_supplier_code = "<?=$search_supplier_code?>";
	if(search_product_code){
		$.ajax({
			 type: "POST",
			 url: "ajax_product_supplier.php",
			 data: {search_product_code:search_product_code,search_supplier_code:search_supplier_code},
			 success: function (data, status) {
				//location.reload();
				//alert(data);
				//$("#search_product_code").empty();
				//$("#search_product_code option:eq(0)").append("<option>:옵션상품선택::</option>");
				$("#search_supplier_code").html(data).trigger("change");
			 },
			error: function(data){
				 alert(data);
			 }
		});
	}
	
	//옵션상품의 공급처 가져오기
	$("#search_product_code").bind("change",function(){
		var search_product_code = $("#search_product_code option:selected").val();
		if(!search_product_code){
			//연동 리셋: 상품을 비우면 공급처도 초기화 (전체 목록 복원 + 선택 해제)
			$("#search_supplier_code").html(fullSupplierOptions).val(null).trigger("change");
			return;
		}
		var search_supplier_code = $("#search_supplier_code").val();
		
		$.ajax({
			 type: "POST",
			 url: "ajax_product_supplier.php",
			 data: {search_product_code:search_product_code,search_supplier_code:search_supplier_code},
			 success: function (data, status) {
				//location.reload();
				//alert(data);
				//$("#search_product_code").empty();
				//$("#search_product_code option:eq(0)").append("<option>:옵션상품선택::</option>");
				$("#search_supplier_code").html(data).trigger("change");
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//일자별 통계 엑셀 다운로드
	$("#btn_order_day_all_download").bind("click",function(){
		var product_code = $("#btn_order_day_all_download").attr("data-productcode");
		var supplier_code = $("#btn_order_day_all_download").attr("data-suppliercode");
		var search_year = $("#btn_order_day_all_download").attr("data-year");

		var $form = $('<form></form>');
		$form.attr('action', 'order_goods_count_download.php');
		$form.attr('method', 'post');
		$form.appendTo('body');
		$form.append('<input type="hidden" name="product_code" value="'+product_code+'">');
		$form.append('<input type="hidden" name="supplier_code" value="'+supplier_code+'">');
		$form.append('<input type="hidden" name="search_year" value="'+search_year+'">');
		$form.submit();
			
	});
});
</script>
</body>
</html>
