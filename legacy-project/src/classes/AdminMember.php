<?
class AdminMember{
	private $_db;

	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}
	
	//관리자 로그인
	public function adminLogin($admin_id,$admin_pwd,$ip){
		$query = "select admin_id,admin_pwd,admin_name,admin_level,status,employeeFl from tbl_admin where admin_id=:admin_id and admin_pwd=password(:admin_pwd)";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':admin_id'=>$admin_id,
			':admin_pwd'=>$admin_pwd
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		if($data['status']<>"y"){
			$json_data = array(
				"error_msg"=>" 미승인된 회원입니다.",
				"error_code"=>"NO_AUTH_CONFIRM"
			);
		}else{
			if($data['admin_id']==""){
				$json_data = array(
					"error_msg"=>"존재하지 않는 회원입니다.",
					"error_code"=>"NOT_FOUND"
				);
			}else{
				$json_data = array(
					"error_msg"=>"성공",
					"error_code"=>"OK",
					"data"=>$data
				);
				$this->adminUpdate($admin_id,$ip);
			}
		}

		return$json_data;
	}
	
	//관리자 로그인 업데이트
	public function adminUpdate($admin_id,$ip){
		$query = "update tbl_admin set ip=:ip,login_date=now() where admin_id=:admin_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':ip'=>$ip,
			':admin_id'=>$admin_id
		);
		$stmt->execute($params);
	}
	
	//------------------------------------------------------------------
	// 관리자 계정 관리 (_Admin_/site/admin_list.php)
	// tbl_admin 은 구 DB(directgames)에 있으므로 반드시 $conn_dgkr 로 생성할 것
	// 비밀번호는 로그인(adminLogin)과 동일하게 MariaDB password() 로 저장한다.
	// 방식을 바꾸면 기존 관리자 전원이 로그인 불가가 되므로 임의 변경 금지.
	//------------------------------------------------------------------

	//권한 등급 — 코드에서 실제 분기하는 값은 1(상품조회)과 99(최고관리자) 뿐이다.
	//10은 분기 없는 일반 관리자. 목록/폼/처리에서 공통으로 참조한다.
	public static function adminLevelList(){
		return array(
			1  => "상품조회 전용",
			10 => "일반 관리자",
			99 => "최고 관리자"
		);
	}

	//권한 등급명 — 정의되지 않은 값(과거 데이터)은 값 그대로 보여준다
	public static function adminLevelName($admin_level){
		$list = self::adminLevelList();
		if(isset($list[(int)$admin_level])){
			return $list[(int)$admin_level];
		}
		return ($admin_level===null || $admin_level==="") ? "미지정" : "기타(".$admin_level.")";
	}

	//관리자 목록 — 아이디/이름 검색
	public function getAdminList($search_keyword=""){
		$query = "select idx,admin_id,admin_name,admin_hp,admin_level,status,ip,login_date,reg_date from tbl_admin";
		$params = array();

		if($search_keyword<>""){
			$query .= " where (admin_id like :keyword or admin_name like :keyword)";
			$params[':keyword'] = "%".$search_keyword."%";
		}
		$query .= " order by admin_level desc, admin_id asc";

		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}

	//관리자 단건 조회 (수정폼) — 비밀번호는 조회하지 않는다
	public function getAdmin($idx){
		$query = "select idx,admin_id,admin_name,admin_hp,admin_level,status,ip,login_date,reg_date from tbl_admin where idx=:idx";
		$stmt = $this->_db->prepare($query);
		$stmt->execute(array(':idx'=>$idx));
		return $stmt->fetch(PDO::FETCH_ASSOC);
	}

	//아이디 중복 확인 — tbl_admin 에 admin_id UNIQUE 인덱스가 없으므로 반드시 앱에서 막는다
	//중복이 생기면 로그인 시 fetch() 가 첫 행만 가져와 어느 계정으로 붙을지 불확실해진다
	//$idx 를 넘기면 자기 자신은 제외하고 검사(수정 시)
	public function isDuplicateAdminId($admin_id,$idx=""){
		$query = "select count(*) as cnt from tbl_admin where admin_id=:admin_id";
		$params = array(':admin_id'=>$admin_id);

		if($idx<>""){
			$query .= " and idx<>:idx";
			$params[':idx'] = $idx;
		}
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return ((int)$data['cnt'] > 0);
	}

	//관리자 등록
	public function insertAdmin($admin_id,$admin_pwd,$admin_name,$admin_hp,$admin_level,$status){
		$query = "insert into tbl_admin set admin_id=:admin_id,admin_pwd=password(:admin_pwd),admin_name=:admin_name,admin_hp=:admin_hp,admin_level=:admin_level,status=:status,reg_date=now()";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':admin_id'=>$admin_id,
			':admin_pwd'=>$admin_pwd,
			':admin_name'=>$admin_name,
			':admin_hp'=>$admin_hp,
			':admin_level'=>$admin_level,
			':status'=>$status
		);
		$stmt->execute($params);
		return $this->_db->lastInsertId();
	}

	//관리자 수정 — $admin_pwd 가 빈값이면 비밀번호는 그대로 둔다
	public function updateAdmin($idx,$admin_name,$admin_hp,$admin_level,$status,$admin_pwd=""){
		$set = "admin_name=:admin_name,admin_hp=:admin_hp,admin_level=:admin_level,status=:status";
		$params = array(
			':idx'=>$idx,
			':admin_name'=>$admin_name,
			':admin_hp'=>$admin_hp,
			':admin_level'=>$admin_level,
			':status'=>$status
		);

		if($admin_pwd<>""){
			$set .= ",admin_pwd=password(:admin_pwd)";
			$params[':admin_pwd'] = $admin_pwd;
		}

		$query = "update tbl_admin set ".$set." where idx=:idx";
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}

	//사용/중지 토글 — 계정은 삭제하지 않는다(이력 보존)
	public function updateAdminStatus($idx,$status){
		$query = "update tbl_admin set status=:status where idx=:idx";
		$stmt = $this->_db->prepare($query);
		$stmt->execute(array(':status'=>$status,':idx'=>$idx));
	}

	//사용중인 최고관리자 수 — 마지막 최고관리자가 강등/중지되는 것을 막기 위해 사용
	public function getActiveMasterCount(){
		$query = "select count(*) as cnt from tbl_admin where admin_level=99 and status='y'";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetch();

		return (int)$data['cnt'];
	}

	//클래스 소멸자
	public function __destruct() {
		$this->_db=null;
	}
}
?>