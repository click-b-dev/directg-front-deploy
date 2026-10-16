<?
//사용x
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_asset.xml');
$logger = Logger::getLogger("admin");

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$asset_id = filter_input(INPUT_POST, 'asset_id', FILTER_SANITIZE_STRING);
$asset_name = filter_input(INPUT_POST, 'asset_name', FILTER_SANITIZE_STRING);
$qty = filter_input(INPUT_POST, 'qty', FILTER_SANITIZE_STRING);
$unit_price = filter_input(INPUT_POST, 'unit_price', FILTER_SANITIZE_STRING);
$warehousing_date = filter_input(INPUT_POST, 'warehousing_date', FILTER_SANITIZE_STRING);
$reg_date = filter_input(INPUT_POST, 'reg_date', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	switch($mode){
		case "stock_in_confirm": //입고처리
			$query = "insert into tbl_asset_stock_log set stock_type='+',asset_id=:asset_id,asset_name=:asset_name,qty=:qty,unit_price=:unit_price,warehousing_date=:warehousing_date,reg_date=:reg_date";
			$stmt = $conn->prepare($query);
			$params = array(
				":asset_id"=>$asset_id,
				":asset_name"=>$asset_name,
				":qty"=>$qty,
				":unit_price"=>str_replace(",","",$unit_price),
				":warehousing_date"=>$warehousing_date,
				":reg_date"=>$reg_date,
			);
			$stmt->execute($params);
			echo "완료";
		break;
		case "stock_chk": //재고체크
			$asset= new Asset($conn);
			$stock = $asset->runAssetItemStock($asset_id);

			//API 정상 응답(재고 숫자 수신)일 때만 갱신. 통신 실패 시 stock=null → 기존 재고 유지(덮어쓰기 방지)
			//정상 품절(0)은 그대로 반영
			if(!is_null($stock)){
				try{
					$conn->beginTransaction();

					$query = "update tbl_asset set stock=:stock,update_dt=now() where asset_id=:asset_id";
					$stmt = $conn->prepare($query);
					$stmt->execute(array(":stock"=>$stock, ":asset_id"=>$asset_id));

					$query = "update tbl_goods_item_delivery set stock=:stock,update_date=now() where item_id=:item_id";
					$stmt = $conn->prepare($query);
					$stmt->execute(array(":stock"=>$stock, ":item_id"=>$asset_id));

					$conn->commit();
				}catch(PDOException $e){
					$conn->rollBack();
					$logger->error("stock_chk update fail asset_id=".$asset_id." : ".$e->getMessage());
					throw $e;
				}
			}else{
				$logger->warn("stock_chk skip (API 응답 없음) asset_id=".$asset_id);
			}

			//Asset 정보수정
			$result = $asset->runAssetDetail($asset_id);
		break;
		case "stock_chk_batch":
			$thr = "30";
			$asset= new Asset($conn);
			$result = $asset->runAssetSoldOutBatch($thr);

			//API 정상 응답일 때만 처리 (재고 thr 미만 = 저재고 품목만 반환됨). tbl_asset도 함께 갱신해 두 화면 정합성 유지
			if($result && isset($result->content) && is_array($result->content)){
				foreach($result->content as $value){
					try{
						$conn->beginTransaction();

						$query = "update tbl_asset set stock=:stock,update_dt=now() where asset_id=:asset_id";
						$stmt = $conn->prepare($query);
						$stmt->execute(array(':stock'=>$value->count, ':asset_id'=>$value->id));

						$query = "update tbl_goods_item_delivery set stock=:stock,update_date=now() where item_id=:item_id";
						$stmt = $conn->prepare($query);
						$stmt->execute(array(':stock'=>$value->count, ':item_id'=>$value->id));

						$conn->commit();
					}catch(PDOException $e){
						$conn->rollBack();
						$logger->error("stock_chk_batch update fail asset_id=".$value->id." : ".$e->getMessage());
					}
				}
			}else{
				$logger->warn("stock_chk_batch skip (API 응답 없음)");
			}
		break;
		case "search_asset":
			$publisher = filter_input(INPUT_POST, 'publisher', FILTER_SANITIZE_STRING);
			$admin = new Admin($conn);
			$asset_publisher = $admin->getAssetPublisherPlacingOrder($publisher);
			foreach($asset_publisher as $value){
				echo "<tr>";
				echo "<td class='text-center'>".$value['asset_id']."</td>";
				echo "<td>".$value['asset_name']."</td>";
				echo "<td class='text-center'>".$value['productType']."</td>";
				echo "<td class='text-center'>".$value['assetType']."</td>";
				echo "<td class='text-center'>".$value['platform']."</td>";
				echo "<td class='text-end'>".number_format($value['stock'])."</td>";
				echo "<tr>";
			}
		break;
	}
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>