<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header('Content-Type: text/html; charset=UTF-8');

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$appid = filter_input(INPUT_POST, 'appid', FILTER_SANITIZE_STRING);

if($appid==""){
	$appid = filter_input(INPUT_GET, 'appid', FILTER_SANITIZE_STRING);
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$admin= new Admin($conn);

	$query = "delete from steam_tag_ko where appid=:appid";
	$stmt = $conn->prepare($query);
	$t_params = array(
		":appid"=>$appid,
	);
	$stmt->execute($t_params);

	$tag_path = "/home/dgkrshop/www/upload/tag/tag_".$appid."_ko.json";
	$tag_data = array();

	if(file_exists($tag_path)){
		$json_string = file_get_contents($tag_path);
		$data = json_decode($json_string, true);
		foreach($data['data'] as $key=>$value){
			foreach($value as $sub_key=>$sub_value){
				if($sub_key=="appid"){
					$params['appid'] = $sub_value;
				}
				if($sub_key=="app_name"){
					$params['name'] = $sub_value;
				}
				if($sub_key=="tag"){
					$tag_data=json_decode($sub_value,true);
				}
			}
		}
	}else{
		echo "저장된 tag정보가 없습니다.";
	}
//
	foreach($tag_data as $tag_key=>$tag){
		//echo $tag['tag_name'];

		if($tag['tag_name']<>"앞서 해보기" && $tag['tag_name']<>"멀티플레이어" && $tag['tag_name']<>"캐주얼" && $tag['tag_name']<>"인디" && $tag['tag_name']<>"어드벤처" && $tag['tag_name']<>"액션" && $tag['tag_name']<>"스포츠" && $tag['tag_name']<>"레이싱" && $tag['tag_name']<>"전략" && $tag['tag_name']<>"시뮬레이션" && $tag['tag_name']<>"RPG" && $tag['tag_name']<>"싱글 플레이어"){
			$query = "insert into steam_tag_ko set appid=:appid,name=:name,tag_code=:tag_code,tag_name=:tag_name ON DUPLICATE KEY UPDATE tag_name=:tag_name";
			$stmt = $conn->prepare($query);
			$t_params = array(
				":appid"=>$params['appid'],
				":name"=>$params['name'],
				":tag_code"=>$tag_key,
				":tag_name"=>$tag['tag_name'],
			);
			$stmt->execute($t_params);
			//echo $key;
			print_r($t_params);
		}

		$t_query = "insert into tbl_tags set tag_name=:tag_name ON DUPLICATE KEY UPDATE update_dt=now()";
		$stmt = $conn->prepare($t_query);
		$t_params = array(
			":tag_name"=>$tag['tag_name'],
		);
		$stmt->execute($t_params);

	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>