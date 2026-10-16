<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);
$referer = filter_input(INPUT_POST, 'referer', FILTER_SANITIZE_STRING);
$page = filter_input(INPUT_POST, 'page', FILTER_SANITIZE_STRING);
$search_sales_status = filter_input(INPUT_POST, 'search_sales_status', FILTER_SANITIZE_STRING);
$search_is_view = filter_input(INPUT_POST, 'search_is_view', FILTER_SANITIZE_STRING);
$search_publisher = filter_input(INPUT_POST, 'search_publisher', FILTER_SANITIZE_STRING);
try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	switch($mode){
		case "tag_save":
			if($_POST['genre']){
				$genre = implode(",",$_POST['genre']);
			}else{
				$genre = "";
			}
			
			if($_POST['category']){
				$category = implode(",",$_POST['category']);
			}else{
				$category = "";
			}
			
			$u_query="update tbl_goods set genre=:genre,category=:category where title_id=:title_id";
			$u_param = array(
				":genre"=> $genre,
				":category"=>$category,
				":title_id"=>$title_id,
			);
			$stmt = $conn->prepare($u_query);
			$stmt->execute($u_param);
			//print_r($u_param);
		break;
	}

	go('title_tag_register.php?title_id='.$title_id);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>