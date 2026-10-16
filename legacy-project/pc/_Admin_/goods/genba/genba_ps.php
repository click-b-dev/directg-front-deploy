<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$publisher = filter_input(INPUT_POST, 'publisher', FILTER_SANITIZE_STRING);
$status = filter_input(INPUT_POST, 'status', FILTER_SANITIZE_STRING);
$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	switch($mode){
		case "publisher_config": //Genba 퍼블리셔 Relationships
			$query = "insert into genba_publisher set publisher=:publisher,status=:status ON DUPLICATE KEY UPDATE status=:status";
			$stmt = $conn->prepare($query);
			$params = array(
				":publisher"=>$publisher,
				":status"=>$status,
			);
			$stmt->execute($params);
			
			print_r($params);
		break;
		case "download":
			$filename = "Genba_promotion_schedule_".date('Ymd').".xls";
			header("Content-Type: application/vnd.ms-excel; charset=utf-8");
			header("Content-Disposition: attachment; filename=".$filename);
			$query = "select a.*,b.Name as title from genba_promotion a inner join genba_catalogue b on a.Sku=b.Sku where b.PreLiveState='1' and ( b.BlacklistCountryCodes NOT Regexp 'KR') and a.toDate>=DATE_SUB(NOW(), INTERVAL 9 HOUR) group by a.fromDate,a.toDate,a.sku,a.DiscountPercentage order by toDate asc,fromDate asc,Name asc,Title asc";
			$stmt = $conn->prepare($query);
			$stmt->execute();
			$data = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
</head>
<body>
	<table border="1">
	<thead>
		<tr>
			<th class="text-center" style='background:yellow;font-weight:bold'>PromotionId</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>Name</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>From</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>To</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>Sku</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>Titlte</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>OriginalSRP</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>OriginalWSP</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>DiscountPercentage</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>DiscountedSRP</th>
			<th class="text-center" style='background:yellow;font-weight:bold'>DiscountedWSP</th>
		</tr>
	</thead>
	<tbody style="font-size:12px">
	<?
		foreach($data as $value){
	?>
		<tr>
			<td class="text-center" style="font-size:12px"><?=$value['PromotionId']?></td>
			<td class="text-start" style="font-size:12px"><?=$value['Name']?></td>
			<td class="text-center" style="font-size:12px"><?=date("Y-m-d H:i:s",strtotime('+9 hours',strtotime($value['fromDate'])))?></td>
			<td class="text-center" style="font-size:12px"><?=date("Y-m-d H:i:s",strtotime('+9 hours',strtotime($value['toDate'])))?></td>
			<td class="text-start" style="font-size:12px"><?=$value['Sku']?></td>
			<td class="text-start" style="font-size:12px"><?=$value['title']?></td>
			<td class="text-center" style="font-size:12px"><?=number_format($value['OriginalSRP'],0)?></td>
			<td class="text-center" style="font-size:12px"><?=number_format($value['OriginalWSP'],2)?></td>
			<td class="text-center" style="font-size:12px"><?=$value['DiscountPercentage']?>%</td>
			<td class="text-end" style="font-size:12px"><?=number_format($value['DiscountedSRP'],0)?></td>
			<td class="text-end" style="font-size:12px"><?=number_format($value['DiscountedWSP'],2)?></td>
		</tr>
<?		$num++;
		}
	?>
	</tbody>
</table>
</body>
</html>
<?
			
			
		break;
	}
	
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();  
}
?>