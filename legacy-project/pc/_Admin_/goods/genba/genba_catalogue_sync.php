<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$sku = filter_input(INPUT_POST, 'sku', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	$query="update tbl_order_item_genba a inner join (select Sku,Name,Publisher,Platform from genba_catalogue where sku=:sku)as b on a.Sku=b.sku set a.Name = b.Name,a.Publisher=b.Publisher,a.Platform=b.Platform";
	$params = array(
		":sku"=>$sku,
	);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();  
}
?>