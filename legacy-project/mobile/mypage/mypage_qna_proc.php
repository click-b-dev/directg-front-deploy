<?php
ini_set("display_errors",0);
header('Content-Type: application/json');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

$gubun = filter_input(INPUT_POST, 'gubun', FILTER_SANITIZE_STRING);
$subject = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_STRING);
$contents = filter_input(INPUT_POST, 'contents', FILTER_SANITIZE_STRING);
$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_NUMBER_INT);
$ip = get_client_ip_env();

foreach($_FILES['upload_file'] as $key=>$value){
	if($key=="name"){
		foreach($value as $key2=>$value2){
			if($value2){
				$tmp_file[$key2]['name'] = $value2;
			}
		}
	}

	if($key=="type"){
		foreach($value as $key2=>$value2){
			if($value2){
				$tmp_file[$key2]['type'] = $value2;
			}
		}
	}
	if($key=="size"){
		foreach($value as $key2=>$value2){
			if($value2>0){
				$tmp_file[$key2]['size'] = $value2;
			}
		}
	}
	if($key=="tmp_name"){
		foreach($value as $key2=>$value2){
			if($value2){
				$tmp_file[$key2]['tmp_name'] = $value2;
			}
		}
	}
}

foreach($tmp_file as $key=>$value){
	if($value['size']>2000000){
		$json_data = array(
			"error_code"=>"NG",
			"error_msg"=>"첨부파일의 크기는 최대 2MB를 초과하실수 없습니다.",
		);
		echo json_encode($json_data);
		exit;
	}

	if($value['type']<>"image/png" && $value['type']<>"image/jpg" && $value['type']<>"image/jpeg" && $value['type']<>"image/gif" && $value['type']<>"image/webp"){
		$json_data = array(
			"error_code"=>"NG",
			"error_msg"=>"첨부파일은 이미지만 업로드가 가능합니다.",
		);
		echo json_encode($json_data);
		exit;
	}
}

$uploaddir = $_SERVER['DOCUMENT_ROOT'].'/upload/qna/';
if(!file_exists($uploaddir)){
	mkdir($uploaddir, '0777',true);
}

try{
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$mypage = new Mypage($conn_dgkr);

	switch($mode){
		case "register":
			$idx = $mypage->setQna($_SESSION['member']['m_id'],$gubun,$subject,$contents,$ip);

			foreach($tmp_file as $key=>$value){
				$uploadfile = microtime(true)."_".$key;
				move_uploaded_file($value['tmp_name'], $uploaddir.$uploadfile);
				
				$mypage->setQnaFile($idx,$_SESSION['member']['m_id'],$uploadfile,$value['type'],$value['name'],$ip);
			}

			if($gubun=="5"){
				$mail = new DirectSendMail;
				$mail_html = "############################################################################<br/>";
				$mail_html.= "[작성자] : ".$_SESSION['member']['m_id']."<br/>";
				$mail_html.= "[작성일] : ".date('Y-m-d H:i:s')."<br/>";
				$mail_html.= "[제목] : ".$subject."<br/>";
				$mail_html.= "[문의내용] <br/> ".nl2br($contents,true)."<br/>";
				$mail_html.= "############################################################################<br/>";
				$result = $mail->sendMail("[제품 코드(키) 오류] 문의 알람입니다.","admin@h2int.com",$mail_html,"directg@h2int.com");
			}

			$json_data = array(
				"error_code"=>"OK",
				"error_msg"=>"성공적으로 등록되었습니다.",
			);
			echo json_encode($json_data);
		break;
		
		case "view":
			include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
			require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
			Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_qna.xml');
			$logger = Logger::getLogger("mobile");

			$logger->info($_SESSION['member']);
			$logger->info($mode);

			$qry = "UPDATE tbl_qna 
                    SET
                        replyStatus = 1
                    WHERE idx = :idx
                        AND user_id = :user_id";
            $param = array(
                ":idx" => $idx,
                ":user_id" => $_SESSION['member']['m_id']
            );
            $stmt = $conn_dgkr->prepare($qry);
            $stmt->execute($param);
            
            $logger->info("view update success {$idx}");

			break;
	}
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}

?>