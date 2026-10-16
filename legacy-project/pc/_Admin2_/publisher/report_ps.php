<?
include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

if($_SESSION['publisher']['admin_id']==""){
	go("./index.php");
}

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_NUMBER_INT);

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$query = "select a.report_year,a.report_month,b.publisher from tbl_report_config a inner join tbl_publisher b on a.publisher_code=b.idx where a.idx='$idx'";
	$stmt = $conn->prepare($query);
	$stmt->execute();
	$report_config = $stmt->fetch();

	$headers['Name']    = "Directgames Partners";
	$headers['From']    = "directgames@h2int.com";
	$headers['To']      = "mojh@h2int.com,directgames@h2int.com";
	$Subject = $report_config['report_year']."년 ".$report_config['report_month']."월 ".$report_config['publisher']." 세일즈 리포트가 승인되었습니다.";
	$headers['Subject'] = iconv("utf-8","euckr",$Subject);

	$body = $report_config['publisher']." 퍼블리셔가 리포트 승인을 완료하였습니다. ";

	//$mail = new Mail($params);
	//$result = $mail->send($headers, $body);
	$mail = new DirectSendMail;
	$result = $mail->sendMailPublisher($Subject,$headers['From'],$body,$headers['To']);

	switch($mode){
		case "approval": // 리포트 검토승인완료
			$query = "update directgames.tbl_report_config set approval_date=now(),status='approval' where idx=:idx";
			$params = array(
					":idx" => $idx
					);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);
		break;
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>