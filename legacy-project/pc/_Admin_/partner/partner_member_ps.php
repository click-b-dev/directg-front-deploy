<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_NUMBER_INT);
$publisher_code = filter_input(INPUT_POST, 'publisher_code', FILTER_SANITIZE_NUMBER_INT);
$partner_id = filter_input(INPUT_POST, 'partner_id', FILTER_SANITIZE_EMAIL);
$partner_pwd = filter_input(INPUT_POST, 'partner_pwd', FILTER_SANITIZE_STRING);
$isModManagerPw = filter_input(INPUT_POST, 'isModManagerPw', FILTER_SANITIZE_STRING);
$modManagerPw = filter_input(INPUT_POST, 'modManagerPw', FILTER_SANITIZE_STRING);
$modManagerPwRe = filter_input(INPUT_POST, 'modManagerPwRe', FILTER_SANITIZE_STRING);

$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
$start_date = filter_input(INPUT_POST, 'start_date', FILTER_SANITIZE_STRING);
$end_date = filter_input(INPUT_POST, 'end_date', FILTER_SANITIZE_STRING);
$kr = filter_input(INPUT_POST, 'kr', FILTER_SANITIZE_STRING);
$jp = filter_input(INPUT_POST, 'jp', FILTER_SANITIZE_STRING);
if($kr!="Y"){
	$kr="N";
}
if($jp!="Y"){
	$jp="N";
}

try  {  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	switch($mode){
		case "register":
			$query = "insert into directgames.tbl_admin_publisher set publisher_code=:publisher_code,name=:name,id=:id,pwd=password(:pwd),reg_date=now(),flag='Y',kr=:kr,jp=:jp,start_date=:start_date,end_date=:end_date";
			$params = array(
				":publisher_code" => $publisher_code,
				":name" => $name,
				":id" => $partner_id,
				":pwd" => $partner_pwd,
				":kr" => $kr,
				":jp" => $jp,
				":start_date" => $start_date,
				":end_date" => $end_date
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);

			$json_array = array(
					'msg'=>'등록완료',
					'result'=>'ok'
					);
			$json = json_encode($json_array);
			
			echo "<script>alert('등록되었습니다.')</script>";
            go($_SERVER['HTTP_REFERER']);

			// echo $json;
		break;
		case "edit":
			$query ="update directgames.tbl_admin_publisher set publisher_code=:publisher_code,name=:name,id=:id,kr=:kr,jp=:jp,start_date=:start_date,end_date=:end_date where idx=:idx";
			$params = array(
				":publisher_code" => $publisher_code,
				":name" => $name,
				":id" => $id,
				":kr" => $kr,
				":jp" => $jp,
				":start_date" => $start_date,
				":end_date" => $end_date,
				":idx" => $idx
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);
			if($isModManagerPw=="y"){
				if($modManagerPw==$modManagerPwRe){
					$pw_query ="update directgames.tbl_admin_publisher set pwd=password(:pwd) where idx=:idx";
					$pw_params=array(
						":pwd"=>$modManagerPw,
						":idx"=>$idx
					);
					$stmt = $conn->prepare($pw_query);
					$stmt->execute($pw_params);
				}
			}

			$json_array = array(
					'msg'=>'수정완료',
					'result'=>'ok'
					);
			$json = json_encode($json_array);
			echo $json;
		break;
		case "delete":
		break;
		case "chk_id": //아이디 중복검사
			$query = "select count(*) from directgames.tbl_admin_publisher where id=:id";
			$params = array(
				":id" => $id
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);
			$data = $stmt->fetch();

			if($data['0']==0){
				$json_array = array(
					'msg'=>'등록가능',
					'result'=>'ok'
					);
			}else{
				$json_array = array(
					'msg'=>'등록 불가',
					'result'=>'error'
					);
			}

			$json = json_encode($json_array);
			echo $json;
			//exit;
		break;
		case "isModManagerPw":

		break;
	}
	

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>