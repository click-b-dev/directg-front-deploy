<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header('Content-Type: text/html; charset=UTF-8');
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

//관리자 계정 관리는 최고관리자(99)만 가능. 화면뿐 아니라 처리에서도 반드시 막는다
if($_SESSION['admin']['admin_level']<>"99"){
	echo "접근 권한이 없습니다.";
	exit;
}

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_NUMBER_INT);
$admin_id = filter_input(INPUT_POST, 'admin_id', FILTER_SANITIZE_STRING);
$admin_pwd = filter_input(INPUT_POST, 'admin_pwd', FILTER_SANITIZE_STRING);
$admin_name = filter_input(INPUT_POST, 'admin_name', FILTER_SANITIZE_STRING);
$admin_hp = filter_input(INPUT_POST, 'admin_hp', FILTER_SANITIZE_STRING);
$admin_level = filter_input(INPUT_POST, 'admin_level', FILTER_SANITIZE_NUMBER_INT);
$status = filter_input(INPUT_POST, 'status', FILTER_SANITIZE_STRING);

//권한값은 정의된 등급만 허용
$level_list = AdminMember::adminLevelList();
if(!isset($level_list[(int)$admin_level])){
	$admin_level = 10;
}
//상태는 y(사용) / 0(중지) 두 가지만
if($status<>"y"){
	$status = "0";
}

try{
	//tbl_admin 은 구 DB(directgames)에 있다
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$adminMember = new AdminMember($conn_dgkr);

	switch($mode){
		case "register": //관리자 등록
			if($admin_id=="" || $admin_pwd=="" || $admin_name==""){
				msg("필수 항목이 입력되지 않았습니다.",-1);
				exit;
			}
			//tbl_admin 에 admin_id UNIQUE 인덱스가 없으므로 여기서 반드시 막는다
			if($adminMember->isDuplicateAdminId($admin_id)){
				msg("이미 사용중인 아이디입니다.",-1);
				exit;
			}

			$adminMember->insertAdmin($admin_id,$admin_pwd,$admin_name,$admin_hp,$admin_level,$status);
			msg("등록되었습니다.","admin_list.php");
		break;

		case "modify": //관리자 수정 — 비밀번호는 입력했을 때만 변경
			if($idx=="" || $admin_name==""){
				msg("필수 항목이 입력되지 않았습니다.",-1);
				exit;
			}

			$target = $adminMember->getAdmin($idx);
			if(!$target){
				msg("존재하지 않는 관리자입니다.","admin_list.php");
				exit;
			}

			//본인 계정은 권한/상태를 바꾸지 못한다(스스로 잠기는 사고 방지)
			//폼에서도 막지만 POST 조작 가능성이 있으므로 서버에서 기존값으로 되돌린다
			if($target['admin_id']==$_SESSION['admin']['admin_id']){
				$admin_level = $target['admin_level'];
				$status = $target['status'];
			}

			//마지막 최고관리자를 강등/중지하면 아무도 이 화면에 들어올 수 없게 된다
			if($target['admin_level']=="99" && $target['status']=="y"){
				if($admin_level<>"99" || $status<>"y"){
					if($adminMember->getActiveMasterCount() <= 1){
						msg("마지막 최고 관리자입니다. 다른 최고 관리자를 먼저 지정해주세요.",-1);
						exit;
					}
				}
			}

			$adminMember->updateAdmin($idx,$admin_name,$admin_hp,$admin_level,$status,$admin_pwd);
			msg("수정되었습니다.","admin_list.php");
		break;

		case "status": //목록에서 사용/중지 토글 (ajax) — 메시지는 텍스트로만 응답
			if($idx==""){
				echo "잘못된 접근입니다.";
				exit;
			}

			$target = $adminMember->getAdmin($idx);
			if(!$target){
				echo "존재하지 않는 관리자입니다.";
				exit;
			}
			//본인 계정은 스스로 중지할 수 없다
			if($target['admin_id']==$_SESSION['admin']['admin_id']){
				echo "본인 계정은 변경할 수 없습니다.";
				exit;
			}
			//마지막 최고관리자 보호
			if($status<>"y" && $target['admin_level']=="99" && $target['status']=="y"){
				if($adminMember->getActiveMasterCount() <= 1){
					echo "마지막 최고 관리자입니다. 다른 최고 관리자를 먼저 지정해주세요.";
					exit;
				}
			}

			$adminMember->updateAdminStatus($idx,$status);
		break;

		default:
			echo "잘못된 접근입니다.";
			exit;
	}

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>
