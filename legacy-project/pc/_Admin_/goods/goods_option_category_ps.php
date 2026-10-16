<?
/*
검색 필수
SELECT * FROM newspaperWHERE MATCH(article) AGAINST('영화 +액션' IN BOOLEAN MODE);

검색 제외
SELECT * FROM newspaperWHERE MATCH(article) AGAINST('영화 -액션' IN BOOLEAN MODE);

검색 부정( - 보다 부드러운 방식 )
SELECT * FROM newspaperWHERE MATCH(article) AGAINST('영화 ~액션' IN BOOLEAN MODE);

부분 검색
SELECT * FROM newspaperWHERE MATCH(article) AGAINST('영화*' IN BOOLEAN MODE);

부분 검색 “” 안에 있는 구문과 정확히 동일한 철자의 구문
SELECT * FROM newspaperWHERE MATCH(article) AGAINST("재밌는 영화" IN BOOLEAN MODE);

*/
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$page = filter_input(INPUT_POST, 'page', FILTER_SANITIZE_STRING);
$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
$game_type = filter_input(INPUT_POST, 'game_type', FILTER_SANITIZE_STRING);
$referer = filter_input(INPUT_POST, 'referer', FILTER_SANITIZE_STRING);
$tag = filter_input(INPUT_POST, 'tag', FILTER_SANITIZE_STRING);
$genre = filter_input(INPUT_POST, 'genre', FILTER_SANITIZE_STRING);
$category = filter_input(INPUT_POST, 'category', FILTER_SANITIZE_STRING);

$search_status = filter_input(INPUT_POST, 'search_status', FILTER_SANITIZE_STRING);
$search_product_platform = filter_input(INPUT_POST, 'search_product_platform', FILTER_SANITIZE_STRING);
$search_product_name = filter_input(INPUT_POST, 'search_product_name', FILTER_SANITIZE_STRING);
$search_game_type = filter_input(INPUT_POST, 'search_game_type', FILTER_SANITIZE_STRING);
$search_display_type = filter_input(INPUT_POST, 'search_display_type', FILTER_SANITIZE_STRING);
$genre_code = filter_input(INPUT_POST, 'genre_code', FILTER_SANITIZE_STRING);

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	if($_POST['category']){
		$category_list =  implode(",",$_POST['category']);
	}else{
		$category_list = "";
	}

	$t_query="update tbl_goods_item set category=:category where product_code=:product_code";
	$t_param = array(
		":category"=> $category_list,
		":product_code"=>$product_code,
	);
	$stmt = $conn->prepare($t_query);
	$stmt->execute($t_param);


	go($referer.'?product_code='.$product_code);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>