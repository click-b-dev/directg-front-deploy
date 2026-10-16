<?
	ini_set( "display_errors", 1 );
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
	header('Content-Type: text/html; charset=UTF-8');

	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

	include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
	require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
	Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_admin.xml');
	$logger = Logger::getLogger("admin");


	if($_SESSION['admin']['admin_id']==""){
		go("../index.php");
	}

	$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
	$ordno = filter_input(INPUT_POST, 'ordno', FILTER_SANITIZE_STRING);
	$item_order_id = filter_input(INPUT_POST, 'item_order_id', FILTER_SANITIZE_STRING);

try{
	//리뉴얼DB
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	
//	$genba = new Genba("Live");
//	$ztorm = new Ztorm();
//	$vaultn = new Vaultn();
	
	//
	switch($mode){
		case "getAssetLicence": //Asset 주문 키확인
		//$order_item_info = $order->getOrderItemOption($ordno);
			$asset = new Asset();
			if($item_order_id){
				$asset_result = $asset->runReserveAdmin($item_order_id);
				//print_r($result);
				$logger->info($asset_result);
				echo "<div class='list-group'>";
				//foreach($asset_result as $key=>$value){
					echo "<li class='list-group-item'><h4 class='list-group-item-heading'>".$asset_result->title."</h4><p class='list-group-item-text' style='font-size:14px'>".$asset_result->key."</p><p> <small>제품키 활성화 일자 : (".$asset_result->activatedDt.")</small></p></li>";
				//}
				echo "</div>";
				//echo $result;
			}
		break;
		case "getZtormLicence":
		break;
		case "getGenbaLicence":
			//$order_item_genba = $order->getOrderItemGenba($ordno);
		break;
		case "getVaultnLicence":
			//$order_item_vaultn = $order->getOrderItemVaultn($ordno);
		break;
		case "getPointNexusLicence": //PointNexus 키확인 — 배송행(상품) 1건만 (item_order_id = tbl_order_item_pointnexus.idx). 라이브 조회(실패 시 DB 폴백)
			$stmt = $conn->prepare("SELECT * FROM tbl_order_item_pointnexus WHERE idx=:idx LIMIT 1");
			$stmt->execute(array(':idx' => (int)$item_order_id));
			$row = $stmt->fetch(PDO::FETCH_ASSOC);
			echo "<div class='list-group'>";
			if(empty($row)){
				echo "<li class='list-group-item'>발급 정보가 없습니다.</li>";
			} else {
				//sold/confirmed/pending_reveal은 PointNexus 라이브 조회 (실패 시 DB 폴백)
				$view = OrderFulfillment_PointNexus::fetchLicenseForView($conn, $row, $logger);
				echo "<li class='list-group-item'>";
				echo "<h4 class='list-group-item-heading'>".htmlspecialchars($row['Name'])."</h4>";
				//라이브 조회 실패 시 어드민에 명시 (고객 화면은 그대로 폴백 노출)
				if($view['source'] == 'db_fallback'){
					echo "<div class='alert alert-danger py-1 px-2 my-1' style='font-size:12px;'>";
					if(!empty($view['error'])){
						echo "<small class=''>".htmlspecialchars($view['error'])."</small><br>DB 저장값";
					}
					echo "</div>";
				}
				switch($view['status']){
					case 'sold':
					case 'confirmed':
						if(!empty($view['license_key'])){
							echo "<p class='list-group-item-text' style='font-size:14px'>".htmlspecialchars($view['license_key'])."</p>";
							if(!empty($view['license_platform'])){
								echo "<p><small>플랫폼: ".htmlspecialchars($view['license_platform'])."</small></p>";
							}
						} else {
							echo "<p>키 정보를 확인하는 중입니다.</p>";
						}
					break;
					case 'booked':
						echo "<p>가상계좌 입금 대기 중인 주문입니다. 입금 완료 후 키가 발급됩니다.</p>";
					break;
					case 'pending_reveal':
						echo "<p>예약 판매 상품으로, 출시 후 키가 발급됩니다.</p>";
					break;
					case 'canceled':
						echo "<p>환불처리가 완료된 주문입니다.</p>";
					break;
					case 'failed':
						echo "<p>주문 처리 중 오류가 발생한 건입니다. 확인이 필요합니다.</p>";
					break;
					default:
						echo "<p>주문 처리 중입니다.</p>";
				}
				echo "</li>";
			}
			echo "</div>";
		break;
	}
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>