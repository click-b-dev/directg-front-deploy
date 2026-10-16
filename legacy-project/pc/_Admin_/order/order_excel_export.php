<?php
	ini_set( "display_errors", 1 );
	header('Content-Type: text/csv; charset=utf-8');
	header('Content-Disposition: attachment;filename=DGKR_미발송목록_'.DATE('Y-m-d').'.csv');

	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

try {
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	$query = "SELECT d.name,d.zipcode,d.address,d.address_detail,d.tel,b.product_name,'1',
		d.msg,c.shipment_status,c.tracking_number,b.settle_no,c.ordno,b.m_id
		FROM tbl_order a INNER JOIN tbl_order_item b ON a.settle_no=b.settle_no 
		INNER JOIN tbl_order_address d ON a.settle_no=d.settle_no
		INNER JOIN tbl_order_shipment c ON b.ordno=c.ordno 
		WHERE a.step='2' AND b.status='2' AND c.shipment_status='2' AND b.delivery_type<>'1'";

	$stmt = $conn->prepare($query);
	$stmt->execute();

	$result = $stmt->fetchAll();

	$update_query="UPDATE tbl_order_shipment c
		INNER JOIN tbl_order_item b ON b.ordno = c.ordno
		INNER JOIN tbl_order a ON a.settle_no = b.settle_no
		SET c.shipment_status='3'
		WHERE a.step='2' AND b.status='2' AND c.shipment_status='2' AND b.delivery_type<>'1'";
	$stmt = $conn->prepare($update_query);
	$stmt->execute();

	}catch (PDOException $e){
		echo 'Error!: '.$e->getMessage();
		die();
}

	$output = fopen('php://output', 'w');
	echo "\xEF\xBB\xBF";
	fputcsv($output, array('이름','우편번호','주소','전화번호','품목','수량','배송메시지','주문번호','회원아이디'));
	foreach($result as $data){
		fputcsv($output, array($data['name'],$data['zipcode'],$data['address']." ".$data['address_detail'],$data['tel'],$data['product_name'],"1",$data['msg'],$data['ordno'],$data['m_id']));
	}
	fclose($output);
	
	exit;
?>
