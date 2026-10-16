<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['stock'] = "active";
$sidebar_file = "sidebar_stock.php";

$page_title="재고 대시보드";

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin = new Admin($conn);
	$admin_goods = new AdminGoods($conn);

	//재고 0인 디지털 Asset 옵션상품 (판매종료 제외) → status 기준으로 분류
	$stock_zero_list = $admin_goods->getGoodsOptionStockZeroList();

	$selling_list = array();      //판매중(status=0) & 재고 0
	$not_selling_list = array();  //판매중 아님(판매중지/승인대기) & 재고 0
	foreach($stock_zero_list as $row){
		if($row['status'] === '0'){
			$selling_list[] = $row;
		}else{
			$not_selling_list[] = $row;
		}
	}

	//판매중 목록은 품절처리 안 된(soldout=N) 건을 위로 정렬 — 재고 없는데 품절 안 된 게 최우선 점검 대상
	usort($selling_list, function($a, $b){
		return strcmp($a['soldout'], $b['soldout']); //N < Y
	});

	//판매중 & 품절 옵션상품 (재고/Asset 무관, 비Asset 포함)
	$selling_soldout_list = $admin_goods->getGoodsOptionSellingSoldoutList();

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}

//대시보드 공통 테이블 행 출력 ($highlight_unsoldout=true면 미품절 행 강조)
function render_stock_rows($list, $admin, $highlight_unsoldout=false){
	if(!$list){
		echo '<tr><td colspan="4" class="text-center text-muted py-2">해당 항목이 없습니다.</td></tr>';
		return;
	}
	foreach($list as $value){
		$rowcls = ($highlight_unsoldout && $value['soldout'] !== 'Y') ? ' class="table-danger"' : '';
		echo '<tr'.$rowcls.'>';
		echo '<td class="text-center"><a href="'.goods_link($value['product_code']).'" target="_blank">'.$value['product_code'].'</a></td>';
		echo '<td>'.$value['product_name'].' '.$admin->getProductStatus($value['status']).' '.soldout_badge($value['soldout']).'</td>';
		echo '<td><a href="'.asset_stock_link($value['item_id']).'" target="_blank">['.$value['item_id'].']</a> '.$value['item_name'].'</td>';
		echo '<td>'.$value['item_publisher'].'</td>';
		echo '</tr>';
	}
}

//판매중 & 품절 목록 행 출력 (재고/Asset 무관 — 배송시스템 표시)
function render_selling_soldout_rows($list, $admin){
	if(!$list){
		echo '<tr><td colspan="3" class="text-center text-muted py-2">해당 항목이 없습니다.</td></tr>';
		return;
	}
	foreach($list as $value){
		$os_name = $admin->getOrderSystem($value['order_system']);
		if(!$os_name){
			$os_name = ($value['order_system'] !== null && $value['order_system'] !== '') ? $value['order_system'] : '-';
		}
		echo '<tr>';
		echo '<td class="text-center"><a href="'.goods_link($value['product_code']).'" target="_blank">'.$value['product_code'].'</a></td>';
		echo '<td>'.$value['product_name'].'</td>';
		echo '<td class="text-center">'.$os_name.'</td>';
		echo '</tr>';
	}
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
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<div class="col-12">
						<p class="font-12 text-muted mb-2">* 재고 기반 카드(Asset)는 동기화된 재고 기준 · 판매종료 제외. 재고 0이어도 자동 품절되지 않습니다(관리자 수동). 'Asset 외' 카드는 재고와 무관하게 판매중 &amp; 품절 상품을 표시합니다.</p>
					</div>
				</div>

				<div class="row">
					<!-- 1순위: 판매중 & 재고 0 (미품절 강조) -->
					<div class="col-lg-6">
						<div class="card border-warning">
							<div class="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
								<h5 class="card-title mb-0">Asset &middot; 판매중 &amp; 재고 0</h5>
								<span class="badge bg-dark text-white"><?=number_format(count($selling_list))?> 건</span>
							</div>
							<div class="card-body p-1">
								<table class="table table-centered w-100 table-sm table-bordered mb-0">
									<thead class="table-light font-13">
										<tr>
											<th class="text-center">옵션상품코드</th>
											<th class="text-center">옵션상품명 / 상태 / 품절여부</th>
											<th class="text-center">Asset 정보</th>
											<th class="text-center">Asset 공급처</th>
										</tr>
									</thead>
									<tbody class="font-12">
										<? render_stock_rows($selling_list, $admin, true); ?>
									</tbody>
								</table>
							</div>
						</div>
					</div>

					<!-- 판매중 & 품절 (재고/Asset 무관, 비Asset 포함) -->
					<div class="col-lg-6">
						<div class="card">
							<div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
								<h5 class="card-title mb-0">Asset 외 &middot; 판매중 &amp; 품절</h5>
								<span class="badge bg-light text-dark"><?=number_format(count($selling_soldout_list))?> 건</span>
							</div>
							<div class="card-body p-1">
								<table class="table table-centered w-100 table-sm table-bordered mb-0">
									<thead class="table-light font-13">
										<tr>
											<th class="text-center">옵션상품코드</th>
											<th class="text-center">옵션상품명</th>
											<th class="text-center">배송시스템</th>
										</tr>
									</thead>
									<tbody class="font-12">
										<? render_selling_soldout_rows($selling_soldout_list, $admin); ?>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				<!-- 2순위: 판매중 아님 & 재고 0 -->
				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
								<h5 class="card-title mb-0">Asset &middot; 판매중 아님 &amp; 재고 0</h5>
								<span class="badge bg-light text-dark"><?=number_format(count($not_selling_list))?> 건</span>
							</div>
							<div class="card-body p-1">
								<table class="table table-centered w-100 table-sm table-bordered mb-0">
									<thead class="table-light font-13">
										<tr>
											<th class="text-center">옵션상품코드</th>
											<th class="text-center">옵션상품명 / 상태 / 품절여부</th>
											<th class="text-center">Asset 정보</th>
											<th class="text-center">Asset 공급처</th>
										</tr>
									</thead>
									<tbody class="font-12">
										<? render_stock_rows($not_selling_list, $admin); ?>
									</tbody>
								</table>
							</div>
						</div>
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
</body>
</html>
