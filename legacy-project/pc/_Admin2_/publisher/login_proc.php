<?
	include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

	header("Content-Type: text/html; charset=UTF-8"); 
	$ip = get_client_ip_env();

//if($ip!="211.118.10.11"){
//	msg("접근할수 없는 사용자 입니다.",-1);
//}else{
	$managerId = filter_input(INPUT_POST, 'managerId', FILTER_SANITIZE_EMAIL);
	$managerPw = filter_input(INPUT_POST, 'managerPw', FILTER_SANITIZE_STRING);

	if(isset($_POST['g-recaptcha-response'])){ 
		$captcha=$_POST['g-recaptcha-response']; 
	} 
	
	if(!$captcha) { 
		echo '등록폼에 리캡챠를 확인하세요.'; 
	} 
	
	$secretKey = "6LfPkCYUAAAAAJRDa8vIV_0S7SbGLO7o1OHx3jZv"; 
	$ip = $_SERVER['REMOTE_ADDR']; 

	//$response = file_get_contents(); 

	$url = "https://www.google.com/recaptcha/api/siteverify?secret=".$secretKey."&response=".$captcha."&remoteip=".$ip;
   
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url); 
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
	curl_setopt($ch, CURLOPT_TIMEOUT, '120');

	$result = curl_exec($ch);
	curl_close($ch);


	$responseKeys = json_decode($result,true);

	if(intval($responseKeys["success"]) !== 1) {
		msg('Failed to recaptcha validation.',-1); 
	}else{
		$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';

		try{  
			$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
			$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			
			$partner = new Partner($conn);

			$query = "select publisher_code,publisher_code_jp,id,name,flag,level,start_date,end_date,kr,jp,start_date_jp,end_date_jp from directgames.tbl_admin_publisher where id=:id and pwd=password(:pwd)";
			$params = array(
						':id'=>$managerId,
						':pwd'=>$managerPw,
					);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);
			$data = $stmt->fetch();

			if($data['id']<>''){
				if($data['flag']<>'Y'){
					msg('승인되지 않은 계정입니다.',-1);
					exit;
				}else{
					$login_query = "update directgames.tbl_admin_publisher set log_date = now(),ip=:ip where id=:id";
					$params = array(
								':ip'=>$ip,
								':id'=>$data['id']
							);
					$stmt = $conn->prepare($login_query);
					$stmt->execute($params);

					$_SESSION['publisher']=array(
						'publisher'=>$data['publisher_code'],
						'publisher_jp'=>$data['publisher_code_jp'],
						'start_date'=>$data['start_date'],
						'end_date'=>$data['end_date'],
						'start_date_jp'=>$data['start_date_jp'],
						'end_date_jp'=>$data['end_date_jp'],
						'admin_id'=>$data['id'],
						'admin_name'=>$data['name'],
						'admin_level'=>$data['level'],
						'kr'=>$data['kr'],
						'jp'=>$data['jp']
					);
					
					
					$start_date = date('Y-m')."-01";
					$end_date = date('Y-m-d');
					
					if($data['publisher_code']=="12"){
						//접속월 sales data 동기화
						$partner->setPartnerSalesDataBatch("12",$start_date,$end_date);
						$partner->setPartnerSalesDataBatch("14",$start_date,$end_date);
						$partner->setPartnerSalesDataBatch("321",$start_date,$end_date);
					
						//접속월 refund data 동기화
						$partner->setPartnerRefundDataBatch("12",$start_date,$end_date);
						$partner->setPartnerRefundDataBatch("14",$start_date,$end_date);
						$partner->setPartnerRefundDataBatch("321",$start_date,$end_date);
					}else{
						//접속월 sales data 동기화
						$partner->setPartnerSalesDataBatch($data['publisher_code'],$start_date,$end_date);
					
						//접속월 refund data 동기화
						$partner->setPartnerRefundDataBatch($data['publisher_code'],$start_date,$end_date);
					}
					
					
					//exit;
				}
			}else{
				msg('아이디 또는 비밀번호 오류입니다',-1);
				exit;
			}

		}catch (PDOException $e){  
			echo 'Error!: '.$e->getMessage();  
			die();  
		}
		
		$stmt = null;
		$conn = null;

		go("main.php");

	}
//}
?>