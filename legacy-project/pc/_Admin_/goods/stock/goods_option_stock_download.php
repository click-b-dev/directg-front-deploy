<?
ini_set( "display_errors", 0 );
header("Content-Type:application/vnd.ms-excel;charset=utf-8");
//error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$publisherCd = filter_input(INPUT_POST, 'publisherCd', FILTER_SANITIZE_STRING);

if($publisherCd){
	try{
		$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
		$admin= new Admin($conn); 
		
		$publisher_name = $admin->getAssetCodeInfo($publisherCd);
		$filename = str_replace(',','',$publisher_name)."_stock_".date('Ymd');

		
		header('Content-Disposition: attachment;filename='.$filename.'.xls'); 
		header('Cache-Control: max-age=0');
		$query = "select a.product_code,a.product_name,a.soldout,a.status,b.item_id,b.item_name,b.item_type,b.item_platform,b.item_publisher,b.stock,b.update_date from tbl_goods_item a inner join tbl_goods_item_delivery b on a.product_code=b.product_code where b.order_system='1' and a.status<>'3' and b.item_publisher ='".$publisher_name."' order by b.stock asc,b.item_name asc";
		
		$stmt = $conn->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		
	}catch (PDOException $e){
		echo 'Error!: '.$e->getMessage();
		die();  
	}
}
?>

	<table border="1">
	<thead style="font-size:12px">
		<tr>
			<th class="text-center" style='background:yellow;font-weight:bold'>옵션상품코드</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>옵션상품명</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>Asset ID</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>Asset 이름</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>Asset 형식</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>Asset 플랫폼</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>Asset 공급처</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>재고</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>업데이트일자</th>
		</tr>
	</thead>
	<tbody style="font-size:12px">
	<?
		foreach($data as $value){
	?>
		<tr>
			<td class="text-center" style="font-size:12px;text-align:center"><?=$value['product_code']?></td>
			<td class="text-start" style="font-size:12px"><?=$value['product_name']?></td>
			<td class="text-center" style="font-size:12px;text-align:center"><?=$value['item_id']?></td>
			<td class="text-center" style="font-size:12px"><?=$value['item_name']?></td>
			<td class="text-start" style="font-size:12px;text-align:center"><?=$value['item_type']?></td>
			<td class="text-start" style="font-size:12px;text-align:center"><?=$value['item_platform']?></td>
			<td class="text-center" style="font-size:12px"><?=$value['item_publisher']?></td>
			<td class="text-end" style="font-size:12px;text-align:right"><?=number_format($value['stock'])?></td>
			<td class="text-center" style="font-size:12px"><?=$value['update_date']?></td>
		</tr>
<?		$num++;
		}
	?>
	</tbody>
</table>