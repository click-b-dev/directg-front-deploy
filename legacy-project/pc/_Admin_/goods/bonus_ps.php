<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$bonus_no = filter_input(INPUT_POST, 'bonus_no', FILTER_SANITIZE_STRING);

$bonus_delivery_type = filter_input(INPUT_POST, 'bonus_delivery_type', FILTER_SANITIZE_STRING);
$bonus_name = filter_input(INPUT_POST, 'bonus_name', FILTER_SANITIZE_STRING);
$bonus_asset = filter_input(INPUT_POST, 'bonus_asset', FILTER_SANITIZE_STRING);
$bonus_count = filter_input(INPUT_POST, 'bonus_count', FILTER_SANITIZE_STRING);
$bonus_start_date = filter_input(INPUT_POST, 'bonus_start_date', FILTER_SANITIZE_STRING);
$bonus_end_date = filter_input(INPUT_POST, 'bonus_end_date', FILTER_SANITIZE_STRING);
$pre_delivery = filter_input(INPUT_POST, 'pre_delivery', FILTER_SANITIZE_STRING);
$pre_delivery_date = filter_input(INPUT_POST, 'pre_delivery_date', FILTER_SANITIZE_STRING);
$bonus_info = filter_input(INPUT_POST, 'bonus_info', FILTER_SANITIZE_STRING);
$is_bonus = filter_input(INPUT_POST, 'is_bonus', FILTER_SANITIZE_STRING);

if($bonus_count==""){
	$bonus_count= 0;
}

if($pre_delivery_date=="" || $pre_delivery_date==0){
	$pre_delivery_date = 0;
}else{
	$pre_delivery_date = strtotime($pre_delivery_date);
}

if($bonus_start_date=="" || $bonus_start_date==0){
	$bonus_start_date = "2000-01-01 00:00:00";
}

if($bonus_end_date=="" || $bonus_end_date==0){
	$bonus_end_date = "2999-12-31 23:59:59";
}


try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	switch($mode){
		case "register":
			$query = "insert into tbl_bonus set bonus_delivery_type=:bonus_delivery_type,bonus_name=:bonus_name,bonus_asset=:bonus_asset,bonus_count=:bonus_count,bonus_info=:bonus_info,is_bonus=:is_bonus";
			$stmt = $conn->prepare($query);
			$params = array(
				":bonus_delivery_type"=>$bonus_delivery_type,
				":bonus_name"=>$bonus_name,
				":bonus_asset"=>$bonus_asset,
				":bonus_count"=>$bonus_count,
				":bonus_info"=>$bonus_info,
				":is_bonus"=>$is_bonus,
			);
			$stmt->execute($params);

			go("bonus_list.php");

			print_r($params);
		break;
		case "modify":
			$query = "update tbl_bonus set bonus_delivery_type=:bonus_delivery_type,bonus_name=:bonus_name,bonus_asset=:bonus_asset,bonus_count=:bonus_count,bonus_info=:bonus_info,is_bonus=:is_bonus where bonus_no=:bonus_no";
			$stmt = $conn->prepare($query);
			$params = array(
				":bonus_delivery_type"=>$bonus_delivery_type,
				":bonus_name"=>$bonus_name,
				":bonus_asset"=>$bonus_asset,
				":bonus_count"=>$bonus_count,
				":bonus_info"=>$bonus_info,
				":is_bonus"=>$is_bonus,
				":bonus_no"=>$bonus_no
			);

				print_r($params);
			$stmt->execute($params);

		

			go("bonus_list.php");

			//print_r($params);
		break;

		case "asset_search":
			$asset_id = filter_input(INPUT_POST, 'asset_id', FILTER_SANITIZE_STRING);

			$asset= new Asset($conn);
			$result = $asset->runAssetDetail($asset_id);

			$data = json_decode($result);

				switch($data->productType){
					case "기본게임":
						$asset_type="기본게임";
					break;
					case "DLC":
						$asset_type="DLC";
					break;
					case "스탠드얼론":
						$asset_type="스탠드얼론";
					break;
					case "번들":
						$asset_type="번들";
					break;
					case "특전":
						$asset_type="특전";
					break;
				}
				
				if($data->id==""){
					echo "<tr><td colspan='3' class='text-center'>검색된 결과가 없습니다.</td></tr>";
				}else{
					echo "<tr>";
					echo "<td><input type='text' class='form-control' name='asset_type[]' value='".$data->productType."' readonly /></td>";
					echo "<td><input type='text' class='form-control' name='asset_platform[]' value='".$data->platform."' readonly /></td>";
					echo "<td><input type='text' class='form-control' name='asset_id[]'  value='".$data->id."' readonly /></td>";
					echo "<td><input type='text' class='form-control' name='asset_name[]' value='".$data->name."' readonly /></td>";
					echo "<td><button class='btn btn-outline-secondary btn_asset_add' type='button'>특전추가 추가</button></td>";
					echo "</tr>";
				}
		break;
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>