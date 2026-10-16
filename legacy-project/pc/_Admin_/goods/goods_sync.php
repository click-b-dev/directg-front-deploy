<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$goods_code = filter_input(INPUT_GET, 'goods_code', FILTER_SANITIZE_STRING);

try{
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	if($goods_code){
		$query = "select goods_code,goods_nm,goods_nm_en,goods_kind,open_date,flag,publisher,publisher_code,platform_code,goods_srp,goods_ppr,revenue,consumer_price,price,developer,asset_id,zt_item_id,product_id,prod_tp from tbl_goods where goods_code=:goods_code";
		$params = array(
			":goods_code"=>$goods_code
		);
		$stmt = $conn_dgkr->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetch();

		//print_r($data);
		//exit;
		if($data['consumer_price']=="0"){
			$discount = 0;
		}else{
			$discount = round(($data['consumer_price']-$data['price'])/$data['consumer_price']*100);
		}

		switch($data['goods_kind']){
			case "기본게임":
				$game_type="game";
			break;
			case "DLC":
				$game_type="dlc";
			break;
			case "번들":
				$game_type="bundle";
			break;
		}

		$i_query="select count(*) from tbl_goods_item where product_code=:product_code";
		$params = array(
			":product_code"=>$goods_code
		);
		$stmt = $conn->prepare($i_query);
		$stmt->execute($params);
		$data2 = $stmt->fetch();

		if($data2['0']=="0"){
			$admin= new Admin($conn);
			$goods_sku = $admin->uuidgen4();
			
			$query2 = "insert into tbl_goods_item set product_code=:product_code,product_name=:product_name,product_name_en=:product_name_en,product_platform=:product_platform,supplier_code=:supplier_code,product_srp=:product_srp,product_ppr=:product_ppr,product_rs=:product_rs,consumer_price=:consumer_price,price=:price,discount=:discount,status=:status,game_type=:game_type,release_date=:release_date,goods_sku=:goods_sku";
			$param2 = array(
				":product_code"=>$data['goods_code'],
				":product_name"=>$data['goods_nm'],
				":product_name_en"=>$data['goods_nm_en'],
				":product_platform"=>$data['platform_code'],
				":supplier_code"=>$data['publisher_code'],
				":product_srp"=>$data['goods_srp'],
				":product_ppr"=>$data['goods_ppr'],
				":product_rs"=>$data['revenue'],
				":consumer_price"=>$data['consumer_price'],
				":price"=>$data['price'],
				":discount"=>$discount,
				":status"=>$data['flag'],
				":game_type"=>$game_type,
				":release_date"=>$data['open_date'],
				":goods_sku"=>$goods_sku,
			);

			//print_r($param2);
			$stmt = $conn->prepare($query2);
			$stmt->execute($param2);
		}

			$u_query="update tbl_goods set is_chk='Y'where goods_code=:goods_code";
			$params = array(
				":goods_code"=>$goods_code
			);
			$stmt = $conn_dgkr->prepare($u_query);
			$stmt->execute($params);

	}
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>