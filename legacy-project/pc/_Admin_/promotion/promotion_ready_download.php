<?
ini_set( "display_errors", 0 );
header("Content-Type:application/vnd.ms-excel;charset=utf-8");
//error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$admin= new Admin($conn); 
	
	$filename = "promotion_ready_list_".date('Ymd');

	
	header('Content-Disposition: attachment;filename='.$filename.'.xls'); 
	header('Cache-Control: max-age=0');
	$query = "select c.publisher_name,b.product_code,b.product_name,date_format(a.promotion_start,'%Y-%m-%d %H:%i:%s')as promotion_start,date_format(a.promotion_end,'%Y-%m-%d %H:%i:%s')as promotion_end,b.product_srp,a.promotion_srp,a.p_discount_rate,b.consumer_price,a.sale_price,a.discount_rate from tbl_promotion_schedule a inner join tbl_goods_item b on a.product_code=b.product_code inner join tbl_publisher c on c.publisher_code=a.publisher_code where a.confirm='N'";
	
	$stmt = $conn->prepare($query);
	$stmt->execute();
	$data = $stmt->fetchAll();
	
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();  
}

?>

	<table border="1">
	<thead style="font-size:12px">
		<tr>
			<th class="text-center" style='background:yellow;font-weight:bold'>공급처</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>옵션상품코드</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>옵션상품명</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>시작일자</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>종료일자</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>퍼블리셔 SRP</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>퍼블리셔 승인 SRP</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>퍼블리셔 승인 할인율</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>DG 소비자가</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>DG 할인판매가</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>DG 할인율</th>
		</tr>
	</thead>
	<tbody style="font-size:12px">
	<?
		foreach($data as $value){
	?>
		<tr>
			<td class="text-center" style="font-size:12px;text-align:center"><?=$value['publisher_name']?></td>
			<td class="text-center" style="font-size:12px;text-align:center"><?=$value['product_code']?></td>
			<td class="text-start" style="font-size:12px"><?=$value['product_name']?></td>
			<td class="text-center" style="font-size:12px;text-align:center"><?=$value['promotion_start']?></td>
			<td class="text-center" style="font-size:12px;text-align:center"><?=$value['promotion_end']?></td>
			<td class="text-end" style="font-size:12px;text-align:right"><?=number_format($value['product_srp'])?></td>
			<td class="text-end" style="font-size:12px;text-align:right"><?=number_format($value['promotion_srp'])?></td>
			<td class="text-end" style="font-size:12px;text-align:right"><?=$value['p_discount_rate']?>%</td>
			<td class="text-end" style="font-size:12px;text-align:right"><?=number_format($value['consumer_price'])?></td>
			<td class="text-end" style="font-size:12px;text-align:right"><?=number_format($value['sale_price'])?></td>
			<td class="text-end" style="font-size:12px;text-align:right"><?=$value['discount_rate']?>%</td>
		</tr>
<?		//$num++;
		}
	?>
	</tbody>
</table>