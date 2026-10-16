<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$ord_ymd = filter_input(INPUT_POST, 'ord_ymd', FILTER_SANITIZE_STRING);
$settle_no = filter_input(INPUT_GET, 'settle_no', FILTER_SANITIZE_STRING);

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	$admin= new Admin($conn); 

	$query = "select * from retail_order where settle_no=:settle_no order by id asc";
	$params = array(
		":settle_no"=>$settle_no,
	);
	$stmt = $conn_dgkr->prepare($query);
	$stmt->execute($params);
	$order_data = $stmt->fetchAll();

	foreach($order_data as $value){
		
		switch($value['settlekind']){
			case "BANK":
				$settlekind = "SC0030";
			break;
			case "CARD":
				$settlekind = "SC0010";
			break;
			case "DGPOINT":
				$settlekind = "DG0000";
			break;
			case "POINT":
				$settlekind = "POINT";
			break;
		}
		
		switch($value['pg_provider']){
			case "kcp":
				$pg_provider = "kcp";
			break;
			case "naverpay":
				$pg_provider = "naverpay";
			break;
			case "dgpoint":
				$pg_provider = "dgkr";
			break;
		}
		
		switch($value['step']){
			case "2":
				$step = "2";
				$status="2";
			break;
			case "4":
				$step = "2";
				$status="2";
			break;
			case "5":
				$step = "2";
				$status="2";
			break;
			case "6":
				$step = "2";
				$status="2";
			break;
			case "8":
				$step = "2";
				$status="8";
			break;
			case "9":
				$step = "9";
				$status="9";
			break;
		}
		
		//주문서 저장
		$query="insert into tbl_order set settle_no=:settle_no,m_no=:m_no,m_id=:m_id,ord_ymd=:ord_ymd,step=:step,use_emoney=:use_emoney,pg_provider=:pg_provider,payment_method=:payment_method,total_price=:total_price,is_mobile=:is_mobile,ip=:ip,reg_date=:reg_date,payment_date=:payment_date,cancel_date=:cancel_date,batch_date=now(),version='1' ON DUPLICATE KEY UPDATE total_price=:total_price,batch_date=now()";
		$stmt = $conn->prepare($query);
		$params = array(
			":settle_no"=>$value['settle_no'],
			":m_no"=>$value['m_no'],
			":m_id"=>$value['email'],
			":ord_ymd"=>$value['ord_ymd'],
			":step"=>$step,
			":use_emoney"=>$value['emoney'],
			":pg_provider"=>$pg_provider,
			":payment_method"=>$settlekind,
			":total_price"=>$value['settleprice'],
			":is_mobile"=>strtoupper($value['mobilepay']),
			":ip"=>$value['ip'],
			":reg_date"=>$value['orddt'],
			":payment_date"=>$value['cdt'],
			":cancel_date"=>$value['canceldt'],
		);
		
		$stmt->execute($params);
		print_r($params);
		
		//배송지 저장
		$query="insert into tbl_order_address set settle_no=:settle_no,name=:name,zipcode=:zipcode,address=:address,address_detail=:address_detail,tel=:tel,msg=:msg";
		$stmt = $conn->prepare($query);
		$params = array(
			":settle_no"=>$value['settle_no'],
			":name"=>$value['name'],
			":zipcode"=>$value['zipcode'],
			":address"=>$value['address'],
			":address_detail"=>$value['address_detail'],
			":tel"=>$value['phone'],
			":msg"=>$value['message'],
		);
		
		$stmt->execute($params);
		print_r($params);
		
		//배송이력 저장
		$query="insert into tbl_order_shipment set settle_no=:settle_no,ordno=:ordno,courier_name=:courier_name,tracking_number=:tracking_number,shipment_status=:shipment_status,shipped_date=:shipped_date,estimated_delivery_date=:estimated_delivery_date,actual_delivery_date=:actual_delivery_date";
		$stmt = $conn->prepare($query);
		$params = array(
			":settle_no"=>$value['settle_no'],
			":ordno"=>$value['settle_no'],
			":courier_name"=>$value['name'],
			":tracking_number"=>$value['tracking_no'],
			":shipment_status"=>$value['step'],
			":shipped_date"=>$value['tracking_date'],
			":estimated_delivery_date"=>$value['order_end_date'],
			":actual_delivery_date"=>$value['order_end_date'],
		);
		
		$stmt->execute($params);
			print_r($params);
		
		
		if($value['asset_id']>0){
			$order_system = "Asset";
			$delivery_type="3";
			$delivery_item_info= $admin->getGoodsItemDeliveryInfo($value['goods_code'],$value['asset_id']);
			
			$item_name = $delivery_item_info['item_name'];
			$item_publisher = $delivery_item_info['item_publisher'];
			$item_platform = $delivery_item_info['item_platform'];
			$item_type = $delivery_item_info['item_type'];
			
			$query="insert into tbl_order_item_asset set m_no=:m_no,m_id=:m_id,ordno=:ordno,product_code=:product_code,product_name=:product_name,asset_id=:asset_id,asset_name=:asset_name,reserve_id=:reserve_id,asset_publisher=:asset_publisher,asset_platform=:asset_platform,asset_type=:asset_type,order_date=:order_date,ord_ymd=:ord_ymd ON DUPLICATE KEY UPDATE asset_name=:asset_name,asset_publisher=:asset_publisher,asset_type=:asset_type,batch_date=now()";
			$stmt = $conn->prepare($query);
			$c_params = array(
				":m_no"=>$value['m_no'],
				":m_id"=>$value['email'],
				":ordno"=>$value['settle_no'],
				":product_code"=>$value['goods_code'],
				":product_name"=>$value['goods_nm'],
				":asset_id"=>$value['asset_id'],
				":asset_name"=>$delivery_item_info['item_name'],
				":reserve_id"=>$value['reserve_id'],
				":asset_publisher"=>$delivery_item_info['item_publisher'],
				":asset_platform"=>$delivery_item_info['item_platform'],
				":asset_type"=>$item_type,
				":order_date"=>$value['reg_date'],
				":ord_ymd"=>date('Y-m-d',strtotime($value['reg_date'])),
			);
			$stmt->execute($c_params);
			print_r($c_params);
		}else{
			$order_system = "";
			$delivery_type="2";
		}
		
		$query="insert into tbl_order_item set settle_no=:settle_no,ordno=:ordno,product_code=:product_code,product_name=:product_name,quantity='1',status=:status,delivery_type=:delivery_type,goods_price=:goods_price,price=:price,order_srp=:order_srp,publisher_code=:publisher_code,m_no=:m_no,m_id=:m_id,ip=:ip,order_date=:order_date,is_actv=:is_actv,order_system=:order_system,cancel_date=:cancel_date,batch_date=now(),version='1' ON DUPLICATE KEY UPDATE batch_date=now()";
		$stmt = $conn->prepare($query);
		$i_params = array(
			":settle_no"=>$value['settle_no'],
			":ordno"=>$value['settle_no'],
			":product_code"=>$value['goods_code'],
			":product_name"=>$value['goods_nm'],
			":status"=>$status,
			":delivery_type"=>$delivery_type,
			":goods_price"=>$value['goodsprice'],
			":price"=>$value['goodsprice'],
			":order_srp"=>$value['order_srp'],
			":publisher_code"=>$value['publisher_code'],
			":m_no"=>$value['m_no'],
			":m_id"=>$value['email'],
			":ip"=>$value['ip'],
			":order_date"=>$value['orddt'],
			":is_actv"=>$value['is_lic_actv'],
			":order_system"=>$order_system,
			":cancel_date"=>$value['canceldt'],
		);
		
		$stmt->execute($i_params);
		print_r($i_params);
	}
	
	echo "완료";


}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>