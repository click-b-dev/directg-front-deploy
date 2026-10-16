<?
header('Content-Type: text/html; charset=UTF-8');
ini_set("display_errors", 1);
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');

//PointNexus 카탈로그 매핑 처리 전용 (pointnexus_catalogue_map.php 의 AJAX/폼 핸들러)
$action = filter_input(INPUT_POST, "action", FILTER_SANITIZE_STRING);

try {
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	//product_platform 코드 → 표시명 변환용 (기존 Admin 메서드 재사용)
	$admin = new Admin($conn);

	//매핑 등록 — PRG 패턴 (처리 후 화면 페이지로 redirect)
	if($action == "map"){
		$post_product_code = filter_input(INPUT_POST, "product_code", FILTER_SANITIZE_STRING);
		$post_productID    = filter_input(INPUT_POST, "productID",    FILTER_SANITIZE_STRING);
		$post_mode         = filter_input(INPUT_POST, "mode",         FILTER_SANITIZE_STRING);
		$post_mode         = pn_normalize_mode($post_mode);
		$flash = ""; $flash_type = "";

		if($post_product_code && $post_productID){
			//PointNexus 카탈로그에서 정보 조회
			$stmt = $conn->prepare("SELECT genericName, platform, publisher, type FROM pointnexus_catalogue WHERE productID=:productID AND mode=:mode");
			$stmt->execute(array(":productID" => $post_productID, ":mode" => $post_mode));
			$pn = $stmt->fetch(PDO::FETCH_ASSOC);

			if($pn){
				//중복 체크
				$stmt = $conn->prepare("SELECT COUNT(*) FROM tbl_goods_item_delivery WHERE product_code=:pc AND item_id=:iid AND order_system='10'");
				$stmt->execute(array(":pc" => $post_product_code, ":iid" => $post_productID));
				$exists = (int)$stmt->fetchColumn();

				if($exists > 0){
					$flash = "이미 매핑되어 있습니다.";
					$flash_type = "warning";
				} else {
					$adminGoods = new AdminGoods($conn);
					$adminGoods->setGoodsOptionDeliveryItem(
						$post_product_code,
						$pn['platform'],
						$post_productID,
						$pn['genericName'],
						$pn['publisher'],
						'10',
						$pn['type']
					);
					$flash = "매핑 완료: ".$post_product_code." ↔ ".$post_productID;
					$flash_type = "success";
				}
			} else {
				$flash = "PointNexus 카탈로그에서 해당 productID를 찾을 수 없습니다.";
				$flash_type = "danger";
			}
		}

		header("Location: pointnexus_catalogue_map.php?mode=".urlencode($post_mode)."&productID=".urlencode($post_productID)."&flash=".urlencode($flash)."&flash_type=".urlencode($flash_type));
		exit;
	}

	//매핑 해제 — PRG 패턴
	if($action == "unmap"){
		$post_product_code = filter_input(INPUT_POST, "product_code", FILTER_SANITIZE_STRING);
		$post_productID    = filter_input(INPUT_POST, "productID",    FILTER_SANITIZE_STRING);
		$post_mode         = filter_input(INPUT_POST, "mode",         FILTER_SANITIZE_STRING);
		$post_mode         = pn_normalize_mode($post_mode);
		$flash = ""; $flash_type = "";

		if($post_product_code && $post_productID){
			$stmt = $conn->prepare("DELETE FROM tbl_goods_item_delivery WHERE product_code=:pc AND item_id=:iid AND order_system='10'");
			$stmt->execute(array(":pc" => $post_product_code, ":iid" => $post_productID));
			$flash = "매핑 해제: ".$post_product_code;
			$flash_type = "success";
		}

		header("Location: pointnexus_catalogue_map.php?mode=".urlencode($post_mode)."&productID=".urlencode($post_productID)."&flash=".urlencode($flash)."&flash_type=".urlencode($flash_type));
		exit;
	}

	//자사 상품 검색 (AJAX) — 모달 결과용 <tr> HTML 반환
	if($action == "search"){
		$kw             = filter_input(INPUT_POST, "keyword",   FILTER_SANITIZE_STRING);
		$post_productID = filter_input(INPUT_POST, "productID", FILTER_SANITIZE_STRING);
		$post_mode      = filter_input(INPUT_POST, "mode",      FILTER_SANITIZE_STRING);
		$post_mode      = pn_normalize_mode($post_mode);

		if(!$kw){ echo '<tr><td colspan="6" class="text-center text-muted py-3">검색어를 입력하세요.</td></tr>'; exit; }

		//이 productID에 이미 매핑된 product_code 목록
		$stmt = $conn->prepare("SELECT product_code FROM tbl_goods_item_delivery WHERE item_id=:iid AND order_system='10'");
		$stmt->execute(array(":iid" => $post_productID));
		$mapped_codes = $stmt->fetchAll(PDO::FETCH_COLUMN);

		$stmt = $conn->prepare("SELECT product_code, product_name, product_platform, option_type, status
		                        FROM tbl_goods_item
		                        WHERE (product_code LIKE :kw OR product_name LIKE :kw)
		                        ORDER BY product_code ASC
		                        LIMIT 100");
		$stmt->execute(array(":kw" => '%'.$kw.'%'));
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

		if(empty($rows)){ echo '<tr><td colspan="6" class="text-center text-muted py-3">검색 결과가 없습니다.</td></tr>'; exit; }

		foreach($rows as $r){
			$already = in_array($r['product_code'], $mapped_codes);
			$st = $r['status'];
			if($st == '0'){      $st_badge = '<span class="badge bg-success">판매중</span>'; }
			else if($st == '1'){ $st_badge = '<span class="badge bg-warning text-dark">판매중지</span>'; }
			else if($st == '3'){ $st_badge = '<span class="badge bg-secondary">삭제</span>'; }
			else if($st == '9'){ $st_badge = '<span class="badge bg-info">승인대기</span>'; }
			else {               $st_badge = '<span class="badge bg-light text-dark border">'.htmlspecialchars($st).'</span>'; }

			echo '<tr>';
			echo '<td class="product-id text-center">'.htmlspecialchars($r['product_code']).'</td>';
			echo '<td>'.htmlspecialchars($r['product_name']).'</td>';
			echo '<td class="text-center">'.($admin->getProductPlatform($r['product_platform']) ?: '—').'</td>';
			echo '<td class="text-center">'.htmlspecialchars($r['option_type'] ?: '—').'</td>';
			echo '<td class="text-center">'.$st_badge.'</td>';
			echo '<td class="text-center">';
			if($already){
				echo '<span class="badge bg-success">매핑됨</span>';
			} else {
				echo '<form method="post" action="pointnexus_catalogue_map_ps.php" style="display:inline;">'
					.'<input type="hidden" name="action" value="map">'
					.'<input type="hidden" name="product_code" value="'.htmlspecialchars($r['product_code']).'">'
					.'<input type="hidden" name="productID" value="'.htmlspecialchars($post_productID).'">'
					.'<input type="hidden" name="mode" value="'.htmlspecialchars($post_mode).'">'
					.'<button type="submit" class="btn btn-sm btn-outline-primary shadow-none">매핑</button>'
					.'</form>';
			}
			echo '</td>';
			echo '</tr>';
		}
		exit;
	}

} catch (PDOException $e) {
	//search(AJAX)는 행 형태로, map/unmap은 화면으로 redirect
	if($action == "search"){
		echo '<tr><td colspan="6" class="text-center text-danger py-3">'.htmlspecialchars($e->getMessage()).'</td></tr>';
	} else {
		$post_productID = filter_input(INPUT_POST, "productID", FILTER_SANITIZE_STRING);
		$post_mode      = pn_normalize_mode(filter_input(INPUT_POST, "mode", FILTER_SANITIZE_STRING));
		header("Location: pointnexus_catalogue_map.php?mode=".urlencode($post_mode)."&productID=".urlencode($post_productID)."&flash=".urlencode($e->getMessage())."&flash_type=danger");
	}
	exit;
}

//알 수 없는 action — 카탈로그 목록으로
header("Location: pointnexus_catalogue.php");
exit;
?>
