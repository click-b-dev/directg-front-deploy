<?
ini_set( "display_errors", 0 );
header("Content-Type:application/vnd.ms-excel;charset=utf-8");
//error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
$supplier_code = filter_input(INPUT_POST, 'supplier_code', FILTER_SANITIZE_STRING);
$search_year = filter_input(INPUT_POST, 'search_year', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$admin= new Admin($conn); 
	
	$goods_item_info = $admin->getGoodsItemInfo($product_code);
	
	$filename = "[".$product_code."]".$goods_item_info['product_name']."_일자별 판매현황";

	header('Content-Disposition: attachment;filename='.$filename.'.xls'); 
	header('Cache-Control: max-age=0');
	$supplier_where = "";
	$supplier_param = array();
	if($supplier_code){
		$supplier_where = " and COALESCE(a.supplier_code,b.supplier_code)=:supplier_code";
		$supplier_param = array(":supplier_code"=>$supplier_code);
	}

	$year_where = "";
	$year_param = array();
	if($search_year<>"" && $search_year<>"all"){
		$year_where = " and a.ord_ymd between :start_date and :end_date";
		$year_param = array(":start_date"=>$search_year."-01-01", ":end_date"=>$search_year."-12-31");
	}

	$show_supplier = ($supplier_code=="");
	$query="select COALESCE(a.supplier_code,b.supplier_code)as supplier_code,c.publisher_name,d.publisher as old_publisher_name,a.ord_ymd,a.unit_price,sum(a.sales_count)as total_count from tbl_sales a left join tbl_goods_item b on a.product_code=b.product_code left join tbl_publisher c on COALESCE(a.supplier_code,b.supplier_code)=c.publisher_code left join directgames.tbl_publisher d on COALESCE(a.supplier_code,b.supplier_code)=d.idx where a.product_code=:product_code".$supplier_where.$year_where." group by COALESCE(a.supplier_code,b.supplier_code),a.ord_ymd,a.unit_price order by COALESCE(c.publisher_name,d.publisher) asc,a.ord_ymd asc,a.unit_price asc";
	$stmt = $conn->prepare($query);
	$params = array(
		":product_code"=>$product_code
	);
	$params = array_merge($params,$supplier_param,$year_param);
	$stmt->execute($params);
	
	$order_day_data = $stmt->fetchAll();
	
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();  
}

?>

	<table border="1">
	<thead style="font-size:12px">
		<tr>
			<?if($show_supplier){?><th class="text-center" style='background:yellow;font-weight:bold'>공급처</th><?}?>
			<th class="text-center" style='background:yellow;font-weight:bold'>주문일자</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>판매가</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>판매수량</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>합계</th>
		</tr>
	</thead>
	<tbody style="font-size:12px">
	<?
		foreach($order_day_data as $order_day){
	?>
		<tr>
			<?if($show_supplier){?><td class="text-center" style="font-size:12px;text-align:center"><?=$order_day['publisher_name'] ?: ($order_day['old_publisher_name'] ? $order_day['old_publisher_name'].' (예전DB)' : $order_day['supplier_code'])?></td><?}?>
			<td class="text-center" style="font-size:12px;text-align:center"><?=$order_day['ord_ymd']?></td>
			<td class="text-end" style="font-size:12px;text-align:right"><?=number_format($order_day['unit_price'])?></td>
			<td class="text-end" style="font-size:12px;text-align:right"><?=number_format($order_day['total_count'])?></td>
			<td class="text-end" style="font-size:12px;text-align:right"><?=number_format($order_day['unit_price']*$order_day['total_count'])?></td>
		</tr>
<?		$total_day_count+=$order_day['total_count'];
			$total_day_price+=($order_day['unit_price']*$order_day['total_count']);
		}
	?>
	<tfoot class="table-light" style="font-size:12px">
	<tr>
		<th class="text-center" colspan="<?=$show_supplier?'3':'2'?>" style="background:#eef2f7">합계</th>
		<th class="text-end" style="background:#eef2f7"><?=number_format($total_day_count)?></th>
		<th class="text-end" style="background:#eef2f7"><?=number_format($total_day_price)?></th>
	</tr>
	</tfoot>
	</tbody>
</table>