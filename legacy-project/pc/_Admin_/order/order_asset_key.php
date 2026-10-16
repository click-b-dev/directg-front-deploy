<?php
$sidebar_file = "sidebar_order.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$ordno = trim((string)filter_input(INPUT_GET, 'ordno', FILTER_SANITIZE_STRING));

$topmenu['order'] = "active";
$page_title = "Asset 주문 키 조회";

//출력 이스케이프 (admin_head 의 escHtml 은 JS 함수라 PHP용 별도 정의)
if(!function_exists('escHtml')){
	function escHtml($str){ return htmlspecialchars((string)$str, ENT_QUOTES); }
}

$searched   = false;
$order_info = null;     //tbl_order_item 주문 요약
$key_rows   = array();  //tbl_order_item_asset 기반 키 결과

if($ordno !== ""){
	$searched = true;
	try{
		$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$asset = new Asset($conn);

		//주문 항목(요약)
		$stmt = $conn->prepare("select ordno,settle_no,product_code,product_name,status,is_actv,order_system,m_id from tbl_order_item where ordno=:ordno");
		$stmt->execute(array(":ordno"=>$ordno));
		$order_info = $stmt->fetch(PDO::FETCH_ASSOC);

		//발급된 Asset 키 기록 — ordno 당 N건
		$stmt = $conn->prepare("select reserve_id,asset_id,asset_name,product_name,asset_type,asset_publisher from tbl_order_item_asset where ordno=:ordno order by asset_id asc");
		$stmt->execute(array(":ordno"=>$ordno));
		$asset_records = $stmt->fetchAll(PDO::FETCH_ASSOC);

		//각 reserve_id → Asset 3.3 (관리자 A 권한 — 활성화 없이 실제 키 조회)
		foreach($asset_records as $rec){
			if($rec['reserve_id'] === "" || $rec['reserve_id'] === null){ continue; }
			$detail = $asset->runReserveAdmin($rec['reserve_id']);
			$key_rows[] = array(
				"product"     => ($rec['product_name'] !== "" && $rec['product_name'] !== null) ? $rec['product_name'] : $rec['asset_name'],
				"asset_id"    => $rec['asset_id'],
				"publisher"   => $rec['asset_publisher'],
				"reserve_id"  => $rec['reserve_id'],
				"key"         => (isset($detail->key) && $detail->key !== "") ? $detail->key : null,
				"activated"   => isset($detail->activated) ? $detail->activated : null,
				"activatedDt" => isset($detail->activatedDt) ? $detail->activatedDt : '',
				"po"          => isset($detail->po) ? $detail->po : '',
			);
		}
	}catch(PDOException $e){
		echo 'Error!: '.$e->getMessage();
		die();
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
						<p class="font-12 mb-2">주문번호(ordno)로 해당 주문의 Asset 키를 조회합니다(tbl_order_item_asset 기준). 관리자(A) 권한 조회라 <strong>키가 활성화되지 않습니다.</strong></p>
					</div>
				</div>

				<!-- 검색 -->
				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body py-2">
								<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
									<div class="row g-2">
										<div class="col-lg-5">
											<div class="input-group">
												<span class="input-group-text">주문번호(ordno)</span>
												<input type="text" class="form-control" name="ordno" placeholder="ordno 입력" value="<?=escHtml($ordno)?>" required>
												<button type="submit" class="btn btn-primary shadow-none">키 조회</button>
											</div>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>

				<?php if($searched){ ?>
				<?php if(!$order_info){ ?>
				<div class="row">
					<div class="col-12">
						<div class="alert alert-warning">해당 주문번호(ordno = <strong><?=escHtml($ordno)?></strong>)의 주문 항목이 없습니다.</div>
					</div>
				</div>
				<?php }else{ ?>

				<!-- 주문 요약 -->
				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-header bg-secondary text-white"><h5 class="card-title mb-0">주문 정보</h5></div>
							<div class="card-body p-0">
								<table class="table table-sm table-bordered mb-0">
									<tbody class="font-13">
										<tr>
											<th class="bg-light text-center">주문번호(ordno)</th>
											<td><?=escHtml($order_info['ordno'])?></td>
											<th class="bg-light text-center">결제번호(settle_no)</th>
											<td><?=escHtml($order_info['settle_no'])?></td>
										</tr>
										<tr>
											<th class="bg-light text-center">구매자 ID</th>
											<td><?=escHtml($order_info['m_id'])?></td>
											<th class="bg-light text-center">활성화 여부</th>
											<td><?=($order_info['is_actv']=='1' ? '<span class="badge bg-success">활성화</span>' : '<span class="badge bg-secondary">미활성</span>')?></td>
										</tr>
										<tr>
											<th class="bg-light text-center">상품</th>
											<td colspan="3"><?=escHtml($order_info['product_name'])?> (<?=escHtml($order_info['product_code'])?>)</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				<!-- 키 목록 -->
				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
								<h5 class="card-title mb-0">Asset 키</h5>
								<span class="badge bg-light text-dark"><?=count($key_rows)?> 건</span>
							</div>
							<div class="card-body p-0">
								<table class="table table-sm table-centered table-bordered mb-0">
									<thead class="table-dark font-13">
										<tr>
											<th class="text-start">상품</th>
											<th class="text-center text-nowrap">Asset ID</th>
											<th class="text-center text-nowrap">공급처</th>
											<th class="text-center text-nowrap">Reserve ID</th>
											<th class="text-start">키</th>
											<th class="text-center text-nowrap">활성화</th>
											<th class="text-center text-nowrap">PO</th>
										</tr>
									</thead>
									<tbody class="font-12 user-select-none">
									<?php if(!$key_rows){ ?>
										<tr><td colspan="7" class="text-center py-3">이 주문에는 발급된 Asset 키가 없습니다. (다른 키발급 시스템이거나 미발급)</td></tr>
									<?php }else{ foreach($key_rows as $row){ ?>
										<tr>
											<td class="text-start"><?=escHtml($row['product'])?></td>
											<td class="text-center text-nowrap"><?=escHtml($row['asset_id'])?></td>
											<td class="text-center text-nowrap"><?=escHtml($row['publisher'])?></td>
											<td class="text-center text-nowrap"><?=escHtml($row['reserve_id'])?></td>
											<td class="text-start">
												<?php if($row['key'] !== null){ ?>
													<span class="eng fw-bold user-select-all"><?=escHtml($row['key'])?></span>
												<?php }else{ ?>
													<span class="text-danger">조회 실패</span>
												<?php } ?>
											</td>
											<td class="text-center text-nowrap">
												<?php if($row['activated'] === true){ ?>
													<span class="badge bg-success">활성화</span><br/><span class="num font-11"><?=escHtml($row['activatedDt'])?></span>
												<?php }elseif($row['activated'] === false){ ?>
													<span class="badge bg-secondary">미활성</span>
												<?php }else{ ?>
													-
												<?php } ?>
											</td>
											<td class="text-center text-nowrap"><span class="eng font-11"><?=escHtml($row['po'])?></span></td>
										</tr>
									<?php } } ?>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				<?php } /* order_info */ ?>
				<?php } /* searched */ ?>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
