<?
header('Content-Type: text/html; charset=UTF-8');
ini_set("display_errors", 1);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

	$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_NUMBER_INT);
	$settle_no = filter_input(INPUT_GET, 'settle_no', FILTER_SANITIZE_STRING);

	try{
		$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		//주문정보
		$query= "select * from directgames.tbl_invoice_order where idx=:idx";
		$params = array(
						':idx'=>$idx
					);
		$stmt = $conn->prepare($query);
		$stmt->execute($params);
		$order_data = $stmt->fetch();
	}catch (PDOException $e){  
		echo 'Error!: '.$e->getMessage();  
		die();  
	}

	$invoice_html = "
	<html>
	<head></head>
	<body>
	<p>
		Dear [name] <br/>
			
		Invoice #INVOICE [invoice_no] 

		Check your invoice and request payment

		id : [email]
		pwd : [pwd]
	</p>
	<p>
	Payment Link : <a href='https://directg.net/invoice/login.html' target='_blank'>[link]</a>
	</p>
	</body>
	</html>
	";

	
	$subject = "#INVOICE ".date('Y')."-".$idx." Payment Request"; 

	$mail_html = htmlspecialchars_decode($invoice_html);
	$mail_html = str_replace("&#60;","<",$mail_html);
	$mail_html = str_replace("&#62;",">",$mail_html);
	$mail_html = str_replace("&#34;","'",$mail_html);
	$mail_html = str_replace("&#38;","&",$mail_html);
	$mail_html = str_replace("&nbsp;"," ",$mail_html);
	$mail_html = str_replace("[name]",$order_data['name'],$mail_html);
	$mail_html = str_replace("[invoice_no]",date('Y')."-".$idx,$mail_html);


	$headers['Name']    = "H2interactive";
	$headers['From']    = "directg@h2int.com";
	$headers['To']      = $order_data['email'];
	$headers['Subject'] = iconv("utf-8","euckr",$subject);

	$body = $mail_html;

	$mail = new Mail($params);
	$result = $mail->send($headers, $body);

	echo $result;
?>