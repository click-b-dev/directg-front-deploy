<?
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$tag_group_code = filter_input(INPUT_POST, 'tag_group_code', FILTER_SANITIZE_STRING);
$num = filter_input(INPUT_POST, 'num', FILTER_SANITIZE_STRING);
$tag_name = filter_input(INPUT_POST, 'tag_name', FILTER_SANITIZE_STRING);
$tag_name_en = filter_input(INPUT_POST, 'tag_name_en', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$admin= new Admin($conn);

	switch($mode){
		case "tag_group_config": //태그 그룹설정
			$query = "update tbl_tags set tag_group_code=:tag_group_code,tag_code=:tag_code where idx=:idx";
			$stmt = $conn->prepare($query);
			$params = array(
				":tag_group_code"=>$tag_group_code,
				":tag_code"=>$admin->setTagcode($tag_group_code),
				":idx"=>$num
			);
			print_r($params);
			$stmt->execute($params);

			
		break;
		case "tag_register": //태그 등록
			$query = "insert into tbl_tags set tag_name=:tag_name,tag_name_en=:tag_name_en";
			$stmt = $conn->prepare($query);
			$params = array(
				":tag_name"=>$tag_name,
				":tag_name_en"=>$tag_name_en,
			);
			$stmt->execute($params);

			print_r($params);
		break;
		case "tag_delete": //태그 삭제
			$query = "update tbl_tags set tag_group_code=null,tag_code=null where tag_name=:tag_name";
			$stmt = $conn->prepare($query);
			$params = array(
				":tag_name"=>$tag_name,
			);
			$stmt->execute($params);

			print_r($params);
		break;
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>