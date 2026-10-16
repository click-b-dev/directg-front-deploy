<?
ini_set( "display_errors", 0 );
header("Content-Type:text/html; charset=utf-8");

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/login_check.php');

$page = filter_input(INPUT_POST, 'page', FILTER_SANITIZE_NUMBER_INT);
$search_goods_name = filter_input(INPUT_POST, 'search_goods_name', FILTER_SANITIZE_STRING);
$search_start_date = filter_input(INPUT_POST, 'search_start_date', FILTER_SANITIZE_STRING);
$search_end_date = filter_input(INPUT_POST, 'search_end_date', FILTER_SANITIZE_STRING);

if($search_start_date==""){
	$d = mktime(0,0,0, date("m"), 1, date("Y"));
	$search_start_date = date('Y-m-d',strtotime('-1 month'));
}

if($search_end_date==""){
	$d = mktime(0,0,0, date("m"), 1, date("Y"));
	$search_end_date = date('Y-m-d');
}
	
$page=$page+1;

foreach($_GET as $key=>$value){
	if($key<>"page" ){
		if($value<>""){
			$param.="&".$key."=".$value;
		}
	}
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	$order = new Order($conn);
	$mypage = new Mypage2($conn);
	
	$where = array();
	$where[] = " a.step='1' and b.status='3' and b.m_no='{$_SESSION['member']['m_no']}'";
	
	if($search_goods_name){
		$where[] = "b.product_name like '%".$search_goods_name."%'";
	}

	if($search_start_date){
	//	$where[] = "a.ord_ymd >='".$search_start_date."'";
	}

	if($search_end_date){
	//	$where[] = "a.ord_ymd <='".$search_end_date."'";
	}

	$where_query = implode(" AND ", $where);
	$orderby = "b.order_item_id DESC";

	$order_list = $mypage->getOrderList_vbank($page,$where_query,$orderby,$param);
	$list = $order_list->resultset->fetchAll();

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>

<?
	foreach($list as $data){
?>
<div class="card mb-2 ">
	<div class="card-header">
		<div class="d-flex justify-content-between">
			<div><?=substr($data['order_date'],0,10)?></div>
			<div class='in'>
				<a href="/mypage/mypage_order_view.html?settle_no=<?=$data['settle_no']?>" class="item">상세보기</a>
			</div>
		</div>
	</div>
	<div class="card-body p-2" style="background:#191919">
		<?if($data['delivery_type']=="1"){?><span class="label-bg-secondary"><?=($data['is_actv']=="1")?"수령완료":"수령대기"?></span><?}?>
		<?
			//택배발송상품 배송진행상태 표기
			if($data['delivery_type']<>"1"){
				$order_shipment = $order->getOrderShipment($data['settle_no'],$data['ordno']);
		?>
		<span class="label-bg-secondary"><?=$order->getShipmentStatus($order_shipment['shipment_status']);?></span>
		<?}?>
		<p class="mt-2 card-text"><?=$data['product_name']?></p>
		<p class="card-text"><span class="num"><?=number_format($data['price'])?></span> 원 </p>
	</div>
	<?if($order_shipment['shipment_status']=="4" || $order_shipment['shipment_status']=="5" || $order_shipment['shipment_status']=="6"){?>
	<div class="card-footer">
		<button type="button" class="btn btn-primary btn-block">배송조회</button>
	</div>
	<?}?>
</div>
<?
	}
?>