<?
class Member{
	private $_db;

	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}
	
	//회원가입 허용도메인 체크
	public function chkJoinDomain($m_id){
		$email_domain = str_replace("@", "", strstr($m_id, '@'));
		$query = "SELECT COUNT(*) FROM tbl_join_domain WHERE domain=:domain";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':domain'=>$email_domain
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		if($data[0]==0){
			$join_chk = false;
		}else{
			$join_chk = true;
		}

		return $join_chk;
	}

	//DGKR 회원여부 확인
	public function memberChk($m_id,$m_pwd,$ip){
		$query = "select m_id,m_pwd,status from tbl_member where m_id=:m_id ";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_id'=>$m_id
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		if($data['status']=="5"){
			$json_data = array(
				"status"=>"fail",
				"error_code"=>"NO_AUTH_CONFIRM",
				"error_msg"=>" 미승인된 회원입니다.",
			);
		}else{
			if($data['m_id']==""){
				$json_data = array(
					"status"=>"fail",
					"error_code"=>"NOT_FOUND",
					"error_msg"=>"존재하지 않는 회원입니다.",
				);
			}else{
				if($data['m_pwd']<>$m_pwd){
					$json_data = array(
						"status"=>"fail",
						"error_code"=>"NOT_VALID",
						"error_msg"=>"아이디 또는 비밀번호 오류입니다",
					);
				}else{
					$json_data = array(
						"status"=>"success",
						"error_code"=>"OK",
						"error_msg"=>"성공",
						"data"=>$data
					);
				}
			}
		}

		return $json_data;
	}
	
	//간편로그인 연동여부 확인
	public function getSnsMemberChk($sns_type,$sns_id){
		$query = "select a.m_no,b.m_id,b.name,b.nickname,b.mem_level,b.status,b.mem_type from sns_info a inner join tbl_member b on a.m_no=b.m_no where a.sns_type=:sns_type and a.sns_id=:sns_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':sns_type'=>$sns_type,
			':sns_id'=>$sns_id,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		return$data;
	}
	
	//간편로그인 이메일주소로 가입여부 확인
	public function isMemberChk($email){
		$query = "select m_no,m_id,name,nickname,mem_level,status,sns_type from tbl_member where m_id=:m_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_id'=>$email,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		return $data;
	}
	
	public function isMemberChk2($m_id){
		$query = "select m_id from tbl_member where m_id=:m_id and status='0'";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_id'=>$m_id,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		if(!$data['m_id']){
			$result = "NO MEMBER";
		}else{
			$result = "OK";
		}

		return $result;
	}
	
	//로그인 성공후 업데이트
	public function setMemberLogin($m_id,$ip,$country){
		//휴면(mem_type='S') 회원이면 로그인 시 유형 재설정 (회원가입 규칙: 닷(.)변형 유사아이디가 status=0으로 존재하면 R, 아니면 P. 본인 제외)
		$wake_set = "";
		$wake_param = array();
		$cur = $this->_db->prepare("select mem_type from tbl_member where m_id=:m_id");
		$cur->execute(array(':m_id'=>$m_id));
		$cur_row = $cur->fetch();
		if($cur_row && $cur_row['mem_type']=='S'){
			$chk = $this->_db->prepare("select count(*) as cnt from tbl_member where REPLACE(m_id,'.','')=REPLACE(:a,'.','') and status='0' and m_id<>:b");
			$chk->execute(array(':a'=>$m_id, ':b'=>$m_id));
			$c = $chk->fetch();
			$wake_type = ($c['cnt']>0) ? 'R' : 'P';
			$wake_set = ",mem_type=:wake_type";
			$wake_param = array(':wake_type'=>$wake_type);
		}

		$query = "update tbl_member set log_date = now(),visited=visited+1,ip =:ip,country=:country".$wake_set." where m_id=:m_id ";
		$stmt = $this->_db->prepare($query);
		$params = array_merge(array(
			':ip'=>$ip,
			':country'=>$country,
			':m_id'=>$m_id
		), $wake_param);
		$stmt->execute($params);
	}

	public function memberLogin($m_id,$m_pwd,$ip){
		$query = "SELECT m_no,m_id,m_pwd,mem_level,name,nickname,hp,status,mem_type FROM tbl_member WHERE m_id=:m_id AND m_pwd=PASSWORD(:m_pwd)";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_id'=>$m_id,
			':m_pwd'=>$m_pwd
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		return $data;
	}

	//아이디 중복체크

	//회원가입여부 체크

	//본인인증 아이디 갯수 체크
	public function getMemberDupinfo($birth_day,$name,$dupinfo){
		$query = "SELECT COUNT(*) FROM tbl_member WHERE birth_day=:birth_day AND name=:name AND dupinfo=:dupinfo";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':birth_day'=>$birth_day,
			':name'=>$name,
			':dupinfo'=>$dupinfo
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		return $data;
	}
	
	public function getMemeberSameID($m_id){
		/*	아이디에 .을 넣어서 만드는 유사 아이디를 판단하기 위한 함수
		*/
		$query = "SELECT m_no,m_id,status,log_date FROM tbl_member WHERE REPLACE(m_id,'.','')=REPLACE(:m_id,'.','') AND status='0'";
		$params = array(
			":m_id"=>$m_id
		);

		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$result = $stmt->fetchAll();
		return $result;
	}
	
	//회원가입
	public function setMemberJoin($user_info,$ip,$country,$access_token,$sns_type){
		$query = "insert into tbl_member set m_id=:m_id,name=:name,nickname=:nickname,m_pwd=:m_pwd,ip=:ip,country=:country,mailling=:mailling,visited='1',reg_date=now(),status='0',mem_level='1',channel='pc',sns_type=:sns_type ON DUPLICATE KEY UPDATE reg_date=now()";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_id'=>$user_info['email'],
			':name'=>$user_info['name'],
			':nickname'=>$user_info['nickname'],
			':m_pwd'=>$sns_type.$user_info['userID'],
			':ip'=>$ip,
			':country'=>$country,
			':sns_type'=>$sns_type,
			':mailling'=>'N'
		);
		$stmt->execute($params);
		$m_no = $this->_db->lastInsertId();
		if($m_no>0){
			$this->setSnsMemberJoin($m_no,$user_info,$access_token,$sns_type);
		}
		
		return $m_no;
	}

	//회원가입 (본인인증 이후)
	public function setMemberAuth($m_id,$name,$nickname,$m_pwd,$birth_day,$ip,$country,$mem_type,$is_auth,$mailling,$dupinfo,$auth_type,$channel,$hp,$sex,$visitorId){
		try{
			$query = "INSERT INTO tbl_member SET m_id=:m_id,name=:name,nickname=:nickname,m_pwd=PASSWORD(:m_pwd),birth_day=:birth_day,visited=:visited,reg_date=NOW(),status=:status,mem_level=:mem_level,ip=:ip,country=:country,mem_type=:mem_type,is_auth=:is_auth,mailling=:mailling,dupinfo=:dupinfo,auth_type=:auth_type,channel=:channel,hp=:hp,sex=:sex,visitorId=:visitorId";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':m_id'=>$m_id,
				':name'=>$name,
				':nickname'=>$nickname,
				':m_pwd'=>$m_pwd,
				':birth_day'=>$birth_day,
				':visited'=>'1',
				':status'=>'5',
				':mem_level'=>'1',
				':ip'=>$ip,
				':country'=>$country,
				':mem_type'=>$mem_type,
				':is_auth'=>$is_auth,
				':mailling'=>$mailling,
				':dupinfo'=>$dupinfo,
				':auth_type'=>$auth_type,
				':channel'=>$channel,
				':hp'=>$hp,
				':sex'=>$sex,
				':visitorId'=>$visitorId
			);
			$stmt->execute($params);
			$m_no = $this->_db->lastInsertId();
			if($m_no>0){
				$auth_key = md5($m_id.$m_no);
			}
			
			//가입인증 메일 발송 작성 필요
			
			return $m_no;
		}catch (PDOException $e){
			return 0;
		}
	}
	
	public function updateMemberAuthkey($m_id,$auth_key){
		try{
			$query = "UPDATE tbl_member SET auth_key=:auth_key WHERE m_id=:m_id";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':auth_key'=>$auth_key,
				':m_id'=>$m_id
			);
			$stmt->execute($params);
			return 1;
		}catch (PDOException $e){
			return 0;
		}
	}

	public function updateMemberDupinfo($m_no,$name,$birth_day,$hp,$dupinfo,$sex,$ci=''){
		try{
			$query = "UPDATE tbl_member SET is_auth=:is_auth,name=:name,birth_day=:birth_day,hp=:hp,dupinfo=:dupinfo,ci=:ci,sex=:sex,mem_type=:mem_type,auth_type=:auth_type WHERE m_no=:m_no";
			$stmt = $this->_db->prepare($query);
			$params = array(
				':is_auth'=>'Y',
				':name'=>$name,
				':birth_day'=>$birth_day,
				':hp'=>$hp,
				':dupinfo'=>$dupinfo,
				':ci'=>$ci,
				':sex'=>$sex,
				':mem_type'=>'P',
				':auth_type'=>'ASC007',
				':m_no'=>$m_no
			);
			$stmt->execute($params);
			return 1;
		}catch (PDOException $e){
			return 0;
		}
	}
	
	public function chkMemberAuth($auth_key){
		$query = "SELECT m_id,m_no,status FROM tbl_member WHERE auth_key=:auth_key";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':auth_key'=>$auth_key
		);
		$stmt->execute($params);
		$result = $stmt->fetch();
		return $result;
	}
	
	public function approvalMember($m_no){
		try{
			$query = "UPDATE tbl_member SET status=:status,mem_level=:mem_level WHERE m_no=:m_no";

			$stmt = $this->_db->prepare($query);
			$params = array(
				':status'=>'0',
				':mem_level'=>'1',
				':m_no'=>$m_no
			);
			$stmt->execute($params);
			return 1;
		}catch (PDOException $e){
			return 0;
		}
	}
	
	//간편로그인을 통한 자동회원가입
	public function setSnsMemberJoin($m_no,$user_info,$access_token,$sns_type){
		$sub_query = "insert into sns_info set m_no=:m_no,email=:email ,sns_id=:sns_id,sns_type=:sns_type,sns_name=:sns_name,sns_profile=:sns_profile,access_token=:access_token,sns_connect_date=now(),flag='N'";
		$stmt = $this->_db->prepare($sub_query);
		$params = array(
			':m_no'=>$m_no,
			':email'=>$user_info['email'],
			':sns_id'=>$user_info['userID'],
			':sns_type'=>$sns_type,
			':sns_name'=>$user_info['name'],
			':sns_profile'=>$user_info['nickname'],
			':access_token'=> $access_token
		);
		$stmt->execute($params);
	}
	
	//회원 보유포인트 현황
	public function getMemberEmoney($m_no){
		$query = "SELECT SUM(amt_delta) FROM tbl_emoney_log WHERE m_no=:m_no";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_no'=>$m_no
		);
		$stmt->execute($params);
		$emoney = $stmt->fetch();
		return $emoney['0'];
	}
	
	//결제시 사용된 포인트 차감
	public function setMemberEmoney($m_no,$emoney,$memo,$settle_no){
		$amt_delta = -$emoney;
		$query = "insert into tbl_emoney_log set m_no=:m_no,emoney_type='-',emoney=:emoney,regdt=now(),memo=:memo,settle_no=:settle_no,amt_delta=:amt_delta";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_no'=>$m_no,
			':emoney'=>$emoney,
			':memo'=>$memo,
			':settle_no'=>$settle_no,
			':amt_delta'=>$amt_delta,
		);
		$stmt->execute($params);
	}

	//비밀번호찾기
	public function getCountry($ip){
		$reader = new GeoIp2\Database\Reader($_SERVER["DOCUMENT_ROOT"].'/../geoip2/GeoLite2-City.mmdb');
		$record = $reader->city($ip);
		$country = $record->country->isoCode;
		return $country;
	}
	
	//비밀번호 찾기시 인증번호 조회
	public function getMemberOtp($m_id){
		$query = "SELECT * FROM tbl_otp WHERE m_id=:m_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_id'=>$m_id
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	//비밀번호 찾기시 만료된 인증번호 삭제
	public function deleteMemberOtp($m_id){
		$query = "delete FROM tbl_otp WHERE m_id=:m_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_id'=>$m_id
		);
		$stmt->execute($params);
	}
	
	//비밀번호 찾기시 인증번호 등록
	public function setMemberOtp($params){
		$query = "insert into tbl_otp set m_id=:m_id,token=:token,otp=:otp,expire=:expire,auth='0'";
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}
	
	//비밀번호 찾기시 인증번호 갱신
	public function updateMemberOtp($params){
		$query = "update tbl_otp set token=:token,otp=:otp,expire=:expire,auth='0' where m_id=:m_id";
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}
	
	//비밀번호 찾기 인증번호 검증
	public function chkAuthConfirm($m_id,$auth_code){
		$query = "SELECT * FROM tbl_otp WHERE m_id=:m_id and otp=:otp";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_id'=>$m_id,
			':otp'=>$auth_code,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	//비밀번호 찾기 인증번호 인증완료
	public function authComplete($m_id){
		$query = "update tbl_otp set auth='1' where m_id=:m_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_id'=>$m_id
		);
		$stmt->execute($params);
	}
	
	//비밀번호 재설정
	public function memberPwdReset($m_id,$m_pwd){
		$query = "update tbl_member set m_pwd=password(:m_pwd),status='0' where m_id=:m_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_pwd'=>$m_pwd,
			':m_id'=>$m_id
		);
		$stmt->execute($params);
	}
	
	//간편로그인 연결정보조회
	public function getMemberSnsLogin($m_no){
		$query = "select sns_type,sns_connect_date,sns_id,sns_name,email from sns_info where m_no=:m_no";
		$params = array(
					':m_no'=>$m_no
				);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		
		return $data;
	}
	
	//본인인증 및 성인인증
	public function isAuthAdult($m_id,$age_limit){
		$query = "select is_auth,birth_day from directgames.tbl_member where m_id=:m_id";
		$params = array(
					':m_id'=>$m_id
				);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetch();

		$age = $this->getMemberAge($m_id);

		if($data['is_auth']=="Y"){
			if($age<18){
				return "NO_PURCHARSE"; //나이제한 구매불가
			}else{
				return "OK";
			}
		}else{
			if($age_limit>15){
				return "NO_AUTH"; //본인인증 필요
			}else{
				return "OK";
			}
			
		}
	}
	
	//본인인증 필수 상품 확인 (성인여부 무관, 실명인증 완료 여부만 확인)
	public function isAuthSelf($m_id){
		$query = "select is_auth from directgames.tbl_member where m_id=:m_id";
		$params = array(
					':m_id'=>$m_id
				);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetch();

		if($data['is_auth']=="Y"){
			return "OK";
		}else{
			return "NO_SELF_AUTH"; //본인인증 필요
		}
	}

	//나이계산
	public function getMemberAge($m_id){
		$query = "select is_auth,birth_day from directgames.tbl_member where m_id=:m_id";
		$params = array(
					':m_id'=>$m_id
				);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		if($data['is_auth']=="Y"){
			if(strlen($data['birth_day'])=="6"){
				if(date('y')>substr($data['birth_day'],0,2)){
					$age = date('Y') - ("20".substr($data['birth_day'],0,2));
				}else{
					$age = date('Y') - ("19".substr($data['birth_day'],0,2));
				}
			}else{
				$age = date('Y') - substr($data['birth_day'],0,4);
			}

			if(substr($data['birth_day'],4,4)-date('md')>0){
				//$age = $age-1;
			}
		}else{
			$age = 0;
		}

		return ($age);
	}
	
	//클래스 소멸자
	public function __destruct() {
		$this->_db=null;
	}
}
?>