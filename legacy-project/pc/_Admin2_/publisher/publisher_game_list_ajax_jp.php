<?
include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

include_once("../../../_engine/dbconn_jp.php");

if($_SESSION['publisher']['admin_id']==""){
	go("./index.php");
}

$search_publisher = filter_input(INPUT_POST, 'search_publisher', FILTER_SANITIZE_NUMBER_INT);
$search_game = filter_input(INPUT_POST, 'search_game', FILTER_SANITIZE_NUMBER_INT);

if($_SESSION['publisher']['admin_level']=="99"){ //전체관리자
	if(!$search_publisher){
		$search_publisher = $_SESSION['publisher']['publisher_jp'];
	}
}else{ //퍼블리셔 관리자
	if($_SESSION['publisher']['publisher_jp']=="12"){ //2K
		if(!$search_publisher){
			$search_publisher = $_SESSION['publisher']['publisher_jp'];
		}else{ //일반 퍼블리셔
			if($search_publisher<>'12' && $search_publisher<>'14' && $search_publisher<>'317'){
				$search_publisher = $_SESSION['publisher']['publisher_jp'];
			}
		}
	}else{
		$search_publisher = $_SESSION['publisher']['publisher_jp'];
	}
}

$selected['search_game'][$search_game] = "selected";

$dsn_dgjp = 'mysql:host='.DBJP_HOST.';dbname='.DBJP_DB.';port=3306;charset=utf8';
try  {  
	$conn_dgjp = new PDO($dsn_dgjp,DBJP_USER,DBJP_PASSWORD);
	$conn_dgjp->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	//퍼블리셔 게임목록
	$game_query = "select a.goods_code,a.goods_nm_en,b.platform from tbl_goods a inner join tbl_platform b on a.platform_code=b.idx where a.publisher_code=:publisher_code and a.prod_tp in('1','2','4','5') and a.flag='0' and a.goods_nm_en<>''  order by a.goods_nm_en asc";
	$params = array(
		":publisher_code"=>$search_publisher,
	);

	$stmt = $conn_dgjp->prepare($game_query);
	$stmt->execute($params);
	$game_data = $stmt->fetchAll();

	foreach($game_data as $key=>$value){
		echo "<option value='".$value['goods_code']."' ".$selected['search_game'][$value['goods_code']].">[".$value['platform']."] ".$value['goods_nm_en']."</option>";
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>