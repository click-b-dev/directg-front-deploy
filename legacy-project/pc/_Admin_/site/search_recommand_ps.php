<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header('Content-Type: text/html; charset=UTF-8');
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_STRING);
$slot = filter_input(INPUT_POST, 'slot', FILTER_SANITIZE_NUMBER_INT);
$keyword = filter_input(INPUT_POST, 'keyword', FILTER_SANITIZE_STRING);
$link_url = filter_input(INPUT_POST, 'link_url', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	switch($mode){
		case "slot_register": //슬롯에 새 검색어 등록(교체 포함)
			if($slot<1 || $slot>4){ echo 'invalid slot'; die(); }
			//링크 미입력 시 해당 검색어의 검색결과 URL로 저장
			if($link_url==''){ $link_url = "/game/game_search_thumb.html?q=".$keyword; }
			$conn->beginTransaction();
			//해당 슬롯(sort=N)의 기존 노출 검색어를 노출해제(보관)
			$conn->prepare("update tbl_search_recommand set is_view='N' where is_del='N' and is_view='Y' and recommand_sort=:slot")->execute(array(":slot"=>$slot));
			//새 검색어를 해당 슬롯에 노출등록
			$conn->prepare("insert into tbl_search_recommand set keyword=:keyword,link_url=:link_url,recommand_sort=:slot,is_view='Y',reg_date=now()")->execute(array(":keyword"=>$keyword,":link_url"=>$link_url,":slot"=>$slot));
			$conn->commit();
			go("search_recommand.php");
		break;
		case "slot_assign": //비노출(보관) 검색어를 슬롯에 노출
			if($slot<1 || $slot>4){ echo 'invalid slot'; die(); }
			$conn->beginTransaction();
			//해당 슬롯의 기존 노출 검색어를 노출해제(보관)
			$conn->prepare("update tbl_search_recommand set is_view='N' where is_del='N' and is_view='Y' and recommand_sort=:slot")->execute(array(":slot"=>$slot));
			//선택한 검색어를 해당 슬롯에 노출
			$conn->prepare("update tbl_search_recommand set is_view='Y',recommand_sort=:slot where idx=:idx")->execute(array(":slot"=>$slot,":idx"=>$idx));
			$conn->commit();
		break;
		case "slot_clear": //슬롯 비우기(노출해제, 보관)
			$conn->prepare("update tbl_search_recommand set is_view='N' where idx=:idx")->execute(array(":idx"=>$idx));
		break;
		case "modify": //슬롯 검색어 내용 수정
			//링크 미입력 시 해당 검색어의 검색결과 URL로 저장
			if($link_url==''){ $link_url = "/game/game_search_thumb.html?q=".$keyword; }
			$conn->prepare("update tbl_search_recommand set keyword=:keyword,link_url=:link_url where idx=:idx")->execute(array(":keyword"=>$keyword,":link_url"=>$link_url,":idx"=>$idx));
			go("search_recommand.php");
		break;
		case "delete": //완전삭제
			$conn->prepare("update tbl_search_recommand set is_del='Y' where idx=:idx")->execute(array(":idx"=>$idx));
		break;
	}
}catch (PDOException $e){
	if($conn->inTransaction()){ $conn->rollBack(); }
	echo 'Error!: '.$e->getMessage();
	die();
}
?>
