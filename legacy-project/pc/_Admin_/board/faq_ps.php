<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

use HTMLToMarkdown\HtmlConverter;

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_STRING);
$faq_type = filter_input(INPUT_POST, 'faq_type', FILTER_SANITIZE_STRING);
$question = filter_input(INPUT_POST, 'question', FILTER_SANITIZE_STRING);
$answer = filter_input(INPUT_POST, 'answer', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);

	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	switch($mode){
		case "copy":
			$query = "select * from tbl_faq where idx=:idx";
			$param = array(
				":idx"=>$idx,
			);
			$stmt = $conn_dgkr->prepare($query);
			$stmt->execute($param);
			$faq_data = $stmt->fetch();

			switch($faq_data['item_cd']){
				case "2":
					$faq_type = "M01";
				break;
				case "16":
					$faq_type = "M02";
				break;
				case "13":
					$faq_type = "G01";
				break;
				case "7":
					$faq_type = "G02";
				break;
				case "8":
					$faq_type = "G03";
				break;
				case "11":
					$faq_type = "G04";
				break;
				case "3":
					$faq_type = "O01";
				break;
				case "5":
					$faq_type = "O02";
				break;
				case "4":
					$faq_type = "O03";
				break;
				case "12":
					$faq_type = "O04";
				break;
				case "14":
					$faq_type = "O05";
				break;
				case "1":
					$faq_type = "S01";
				break;
				case "6":
					$faq_type = "S02";
				break;
				case "10":
					$faq_type = "S03";
				break;
				case "9":
					$faq_type = "S04";
				break;
				case "15":
					$faq_type = "E01";
				break;
			}

			$converter = new HtmlConverter();

			$i_query="insert into tbl_faq set faq_type=:faq_type,question=:question,answer=:answer,regdt=:regdt";
			$param = array(
				":faq_type"=>$faq_type,
				":question"=>$faq_data['question'],
				":answer"=>$converter->convert(htmlspecialchars_decode($faq_data['answer'])),
				":regdt"=>$faq_data['regdt']
			);
			$stmt = $conn->prepare($i_query);
			$stmt->execute($param);

			$u_query = "update tbl_faq set is_chk='Y' where idx=:idx";
			$param = array(
				":idx"=>$idx,
			);
			$stmt = $conn_dgkr->prepare($u_query);
			$stmt->execute($param);

		break;
		case "register":
		break;
		case "modify":
			$query="update tbl_faq set faq_type=:faq_type,question=:question,answer=:answer where idx=:idx";
			$param = array(
				":faq_type"=>$faq_type,
				":question"=>$question,
				":answer"=>$answer,
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
			go("faq_list.php");
		break;
		case "delete":
		break;
	}
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>