<?php
$sidebar_file = "sidebar_order.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['order'] = "active";
$page_title = "Asset 주문 키 일괄 조회";

//출력 이스케이프 (admin_head 의 escHtml 은 JS 함수라 PHP용 별도 정의)
if(!function_exists('escHtml')){
	function escHtml($str){ return htmlspecialchars((string)$str, ENT_QUOTES); }
}

$MAX_ORDNO   = 20;      //reserve 건마다 Asset API 1회 호출 → 과도한 입력 방지 상한
$ordnos_raw  = isset($_POST['ordnos']) ? (string)$_POST['ordnos'] : "";
$searched    = false;
$result_rows = array();
$input_count = 0;
$matched_ordno_count = 0;
$key_count   = 0;
$capped      = false;

if(trim($ordnos_raw) !== ""){
	$searched = true;

	//줄바꿈/공백/콤마 구분 모두 허용 + 중복 제거(입력 순서 유지)
	$parts = preg_split('/[\s,]+/', trim($ordnos_raw));
	$ordno_list = array();
	foreach($parts as $p){
		$p = trim($p);
		if($p !== "" && !in_array($p, $ordno_list, true)){ $ordno_list[] = $p; }
	}
	$input_count = count($ordno_list);
	if($input_count > $MAX_ORDNO){
		$ordno_list = array_slice($ordno_list, 0, $MAX_ORDNO);
		$capped = true;
	}

	try{
		$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$asset = new Asset($conn);

		$stmt = $conn->prepare("select reserve_id,asset_id,asset_name,product_name,asset_publisher from tbl_order_item_asset where ordno=:ordno order by asset_id asc");

		foreach($ordno_list as $ordno){
			$stmt->execute(array(":ordno"=>$ordno));
			$recs = $stmt->fetchAll(PDO::FETCH_ASSOC);

			$has_key = false;
			foreach($recs as $rec){
				if($rec['reserve_id'] === "" || $rec['reserve_id'] === null){ continue; }
				$detail = $asset->runReserveAdmin($rec['reserve_id']);
				$result_rows[] = array(
					"ordno"       => $ordno,
					"found"       => true,
					"product"     => ($rec['product_name'] !== "" && $rec['product_name'] !== null) ? $rec['product_name'] : $rec['asset_name'],
					"asset_id"    => $rec['asset_id'],
					"publisher"   => $rec['asset_publisher'],
					"reserve_id"  => $rec['reserve_id'],
					"key"         => (isset($detail->key) && $detail->key !== "") ? $detail->key : null,
					"activated"   => isset($detail->activated) ? $detail->activated : null,
					"activatedDt" => isset($detail->activatedDt) ? $detail->activatedDt : '',
					"po"          => isset($detail->po) ? $detail->po : '',
				);
				$has_key = true;
				$key_count++;
			}

			if($has_key){
				$matched_ordno_count++;
			}else{
				$result_rows[] = array("ordno"=>$ordno, "found"=>false);
			}
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
						<p class="font-12 mb-2">주문번호(ordno)를 여러 개 입력하면 각 주문의 Asset 키를 한 번에 조회합니다(줄바꿈·공백·콤마 구분). 관리자(A) 권한 조회라 <strong>키가 활성화되지 않습니다.</strong> 한 번에 최대 <strong><?=number_format($MAX_ORDNO)?></strong>건.</p>
					</div>
				</div>

				<!-- 입력 -->
				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body py-2">
								<form method="post" action="<?=$_SERVER['PHP_SELF']?>">
									<div class="mb-2">
										<textarea class="form-control" name="ordnos" rows="6" placeholder="주문번호(ordno)를 줄바꿈으로 입력하세요" required><?=escHtml($ordnos_raw)?></textarea>
									</div>
									<button type="submit" class="btn btn-primary shadow-none">키 일괄 조회</button>
								</form>
							</div>
						</div>
					</div>
				</div>

				<?php if($searched){ ?>

				<div class="row">
					<div class="col-12 mb-2">
						입력 <strong><?=number_format($input_count)?></strong>건
						· 키 매칭 주문 <strong class="text-success"><?=number_format($matched_ordno_count)?></strong>건
						· 총 키 <strong class="text-primary"><?=number_format($key_count)?></strong>건
						<?php if($capped){ ?><span class="text-danger">(상한 초과 — 앞 <?=number_format($MAX_ORDNO)?>건만 조회)</span><?php } ?>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body p-0">
								<table class="table table-sm table-centered table-bordered mb-0">
									<thead class="table-dark font-13">
										<tr>
											<th class="text-center text-nowrap">주문번호(ordno)</th>
											<th class="text-start">키</th>
										</tr>
									</thead>
									<tbody class="font-12">
									<?php if(!$result_rows){ ?>
										<tr><td colspan="2" class="text-center py-3">조회 결과가 없습니다.</td></tr>
									<?php }else{ foreach($result_rows as $row){ ?>
										<?php if(empty($row['found'])){ ?>
										<tr>
											<td class="text-center text-nowrap"><?=escHtml($row['ordno'])?></td>
											<td class="text-danger">발급된 Asset 키 없음</td>
										</tr>
										<?php }else{ ?>
										<tr>
											<td class="text-center text-nowrap"><?=escHtml($row['ordno'])?></td>
											<td class="text-start">
												<?php if($row['key'] !== null){ ?>
													<span class="eng"><?=escHtml($row['key'])?></span>
												<?php }else{ ?>
													<span class="text-danger">조회 실패</span>
												<?php } ?>
											</td>
										</tr>
										<?php } ?>
									<?php } } ?>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				<?php } /* searched */ ?>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
