<?
//exit;
include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

$asset = new Asset();

//header("Content-Type: application/json; charset=UTF-8"); 

$thr = filter_input(INPUT_POST, 'thr', FILTER_SANITIZE_NUMBER_INT);
//$thr = "50";

$result = $asset->runAssetSoldOutBatch($thr);

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	foreach($result->content as $value){
		//echo $value->id."<br/>";
		//echo $value->title."<br/>";
		//echo $value->count."<br/>";
		$query = "insert into directgames.tbl_goods_stock set asset_id=:asset_id,stock=:stock,batch_date=now() ON DUPLICATE KEY UPDATE stock=:stock,batch_date=now();";
		$params = array(
						':asset_id'=>$value->id,
						':stock'=>$value->count
					);
		$stmt = $conn->prepare($query);
		$stmt->execute($params);

		if($value->count==0){
			$soldout_query = "insert into directgames.tbl_goods_soldout_log set asset_id=:asset_id,regdt=now() ON DUPLICATE KEY UPDATE regdt=now();";
			$params = array(
							':asset_id'=>$value->id
						);
			$stmt = $conn->prepare($soldout_query);
			$stmt->execute($params);
		}
	}

	$u_query = "update directgames.tbl_admin_publisher set stock_update=now() where id=:id";
	$params = array(
					':id'=>$_SESSION['publisher']['admin_id']
				);
	$stmt = $conn->prepare($u_query);
	$stmt->execute($params);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

//$db->close();
?>