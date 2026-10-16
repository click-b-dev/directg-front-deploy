<?
//exit;
include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

include_once("../../../_engine/dbconn_jp.php");

$asset_jp = new AssetJP();

//header("Content-Type: application/json; charset=UTF-8"); 

$thr = filter_input(INPUT_POST, 'thr', FILTER_SANITIZE_NUMBER_INT);
//$thr = "50";

$result = $asset_jp->runAssetSoldOutBatch($thr);

$dsn_dgjp = 'mysql:host='.DBJP_HOST.';dbname='.DBJP_DB.';port=3306;charset=utf8';
try{  
	$conn_dgjp = new PDO($dsn_dgjp,DBJP_USER,DBJP_PASSWORD);
	$conn_dgjp->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	foreach($result->content as $value){
		//echo $value->id."<br/>";
		//echo $value->title."<br/>";
		//echo $value->count."<br/>";
		$query = "insert into tbl_goods_stock set asset_id=:asset_id,stock=:stock,batch_date=now() ON DUPLICATE KEY UPDATE stock=:stock,batch_date=now();";
		$params = array(
						':asset_id'=>$value->id,
						':stock'=>$value->count
					);
		$stmt = $conn_dgjp->prepare($query);
		$stmt->execute($params);

		if($value->count==0){
			$soldout_query = "insert into tbl_goods_soldout_log set asset_id=:asset_id,regdt=now() ON DUPLICATE KEY UPDATE regdt=now();";
			$params = array(
							':asset_id'=>$value->id
						);
			$stmt = $conn_dgjp->prepare($soldout_query);
			$stmt->execute($params);
		}
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

try  {
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$u_query = "update tbl_admin_publisher set stock_update_jp=now() where id=:id";
	$params = array(
					':id'=>$_SESSION['publisher']['admin_id']
				);
	$stmt = $conn_dgkr->prepare($u_query);
	$stmt->execute($params);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}


?>