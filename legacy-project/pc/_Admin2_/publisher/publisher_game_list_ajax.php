<?
include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

if($_SESSION['publisher']['admin_id']==""){
	go("./index.php");
}

$search_publisher = filter_input(INPUT_POST, 'search_publisher', FILTER_SANITIZE_NUMBER_INT);
$search_game = filter_input(INPUT_POST, 'search_game', FILTER_SANITIZE_NUMBER_INT);

if($_SESSION['publisher']['admin_level']=="99"){ //전체관리자
	if(!$search_publisher){
		$search_publisher = $search_publisher;
	}
}else{ //퍼블리셔 관리자
	if($_SESSION['publisher']['publisher']=="12"){ //2K
		if(!$search_publisher){
			$search_publisher = $_SESSION['publisher']['publisher'];
		}else{ //일반 퍼블리셔
			if($search_publisher<>'12' && $search_publisher<>'14' && $search_publisher<>'321'){
				$search_publisher = $_SESSION['publisher']['publisher'];
			}
		}
	}else{
		$search_publisher = $_SESSION['publisher']['publisher'];
	}
}

$selected['search_game'][$search_game] = "selected";

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try  {  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	//퍼블리셔 게임목록
	$game_query = "select a.product_code,a.product_name_en,b.platform from tbl_goods_item a inner join directgames.tbl_platform b on a.product_platform=b.idx where a.supplier_code=:supplier_code  and a.status='0' order by a.product_name_en asc";
	$params = array(
		":supplier_code"=>$search_publisher,
	);

	$stmt = $conn->prepare($game_query);
	$stmt->execute($params);
	$game_data = $stmt->fetchAll();

	foreach($game_data as $key=>$value){
		echo "<option value='".$value['product_code']."' ".$selected['search_game'][$value['product_code']].">[".$value['platform']."] ".$value['product_name_en']."</option>";
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>