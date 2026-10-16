<?
header('Content-Type: text/html; charset=UTF-8');
ini_set("display_errors", 0);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_STRING);
$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
$zipcode = filter_input(INPUT_POST, 'zipcode', FILTER_SANITIZE_STRING);
$address = filter_input(INPUT_POST, 'address', FILTER_SANITIZE_STRING);
$tel = filter_input(INPUT_POST, 'tel', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	switch($mode){
		case "modify":
			$query = "update tbl_invoice_address set name=:name,zipcode=:zipcode,address=:address,tel=:tel where idx=:idx";
				$params = array(
				":name"=>$name,
				":zipcode"=>$zipcode,
				":address"=>$address,
				":tel"=>$tel,
				":idx"=>$idx
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);

			//print_r($params);
		break;
	}

	go("invoice_member.php");
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}


?>