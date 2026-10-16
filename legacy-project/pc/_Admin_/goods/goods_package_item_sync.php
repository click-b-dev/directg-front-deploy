<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$goods_code = filter_input(INPUT_POST, 'goods_code', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	if($goods_code){
		$query = "select package_set from directgames.tbl_goods where goods_code=:goods_code";
		$params = array(
			":goods_code"=>$goods_code
		);
		$stmt = $conn->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		$package_set = $data['package_set'];
		
		$package_set_json = str_replace("&#34;",'"',htmlspecialchars_decode($package_set));
		$package_array = array();
		$package_obj = json_decode($package_set_json,true);
		if(is_array($package_obj)){
			foreach($package_obj as $value){
				$tmp['goods_code'] = $value['goods_code'];
				$tmp['goods_nm'] = $value['goods_nm'];
				//$data['consumer_price'] = $value['consumer_price'];
				//$data['price'] = $value['price'];
				array_push($package_array,$tmp);
			}
		}

		if(is_array($package_array)){
			//등록된 데이터 삭제
			$d_query = "delete from tbl_goods_option_bundle where product_code=:product_code";
			$d_param = array(
				":product_code"=>$goods_code,
			);
			
			$stmt = $conn->prepare($d_query);
			$stmt->execute($d_param);
			
			foreach($package_array as $sub_value){
				$query2 = "insert into tbl_goods_option_bundle set product_code=:product_code,unit_code=:unit_code,unit_name=:unit_name";
				$param2 = array(
					":product_code"=>$goods_code,
					":unit_code"=>$sub_value['goods_code'],
					":unit_name"=>$sub_value['goods_nm'],
				);
				
				$stmt = $conn->prepare($query2);
				$stmt->execute($param2);
			}

			//print_r($param2);
			//$stmt = $conn->prepare($query2);
			//$stmt->execute($param2);
		}

	}
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>