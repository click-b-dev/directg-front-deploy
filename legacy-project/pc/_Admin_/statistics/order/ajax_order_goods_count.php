<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
$search_year = filter_input(INPUT_POST, 'search_year', FILTER_SANITIZE_STRING);
$search_month = filter_input(INPUT_POST, 'search_month', FILTER_SANITIZE_STRING);

/*상품정보*/

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	//옵션상품정보
	$query="select * from tbl_goods_item where product_code=:product_code";
	$stmt = $conn->prepare($query);
	$params = array(
		":product_code"=>$product_code
	);
	$stmt->execute($params);

	$goods_data = $stmt->fetch();

	$query="select unit_price,sum(sales_count)as sales_count,count(*)as day_diff from tbl_sales where product_code=:product_code group by unit_price order by unit_price asc";
	$stmt = $conn->prepare($query);
	$params = array(
		":product_code"=>$product_code
	);
	$stmt->execute($params);
	$sales_price_data = $stmt->fetchAll();


	foreach($sales_price_data as $value){
		$goods_data['total']+=$value['sales_count'];
	}

	//옵션상품 주문일자별 통계
	$query="select date_format(ord_ymd,'%Y')as order_year,ord_ymd,unit_price,sum(sales_count)as sales_count,count(*)as day_diff from tbl_sales where product_code=:product_code and ord_ymd between :start_date and :end_date  group by ord_ymd,unit_price order by ord_ymd asc,unit_price asc";
	$stmt = $conn->prepare($query);
	$params = array(
		":product_code"=>$product_code,
		":start_date"=>$search_year."-".$search_month."-01",
		":end_date"=>$search_year."-".$search_month."-".date('t', strtotime($search_year."-".$search_month."-01")),
	);
	$stmt->execute($params);

	
	$goods_option_sales_data = $stmt->fetchAll();

	foreach($goods_option_sales_data as $value){
		$sales_day_data[$value['order_year']][$value['ord_ymd']][]=array(
			"unit_price"=>$value['unit_price'],
			"sales_count"=>$value['sales_count'],
		);
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}


	$last_day_count = date('t', strtotime($search_year."-".$search_month."-01"));
?>
<table class="table table-centered table-bordered mb-0 table-sm" >
	<thead class="table-dark font-13">
		<tr>
			<th class="text-center p-1">주문일자</th>
			<th class="text-center p-1">DG 할인율</th>
			<th class="text-center p-1">DG 판매가</th>
			<th class="text-center p-1">주문수량</th>
			<th class="text-center p-1">주문합계</th>
		</tr>
	</thead>
	<tbody class="p-1 font-12">
		<?
			for($i=1;$i<=$last_day_count;$i++){
				$tmp_date = $search_year."-".$search_month."-".sprintf("%02d",$i);
				$loop = 0;
				if(is_array($sales_day_data[$search_year][$tmp_date])){
					foreach($sales_day_data[$search_year][$tmp_date] as $sub_value){
		?>
		<tr>
		<?if($loop==0){?>
		<td class="text-center p-1" rowspan="<?=count($sales_day_data[$search_year][$tmp_date])?>"><?=$tmp_date?></td>
		<?}?>
		<td class="text-end p-1">
		<span class="text-danger mdi mdi-arrow-down-bold"></span> <span class="text-danger num"><?=(1-round($sub_value['unit_price']/$goods_data['product_srp'],2))*100?>%</span>
		</td>
		<td class="text-end p-1">
			<?=number_format($sub_value['unit_price'])?>
		</td>
		<td class="text-end p-1"><?=number_format($sub_value['sales_count'])?></td>
		<td class="text-end p-1"><?=number_format($sub_value['unit_price']*$sub_value['sales_count'])?></td>
		</tr>
		<?	$total_count+=$sub_value['sales_count'];
				$total_price+=($sub_value['unit_price']*$sub_value['sales_count']);
		//}
					$loop++;
				}
			}else{
		?>
		<tr>
		<?if($loop==0){?>
		<td class="text-center p-1"><?=$tmp_date?></td>
		<?}?>
		<td class="text-end p-1">
			
		</td>
		<td class="text-end p-1">0</td>
		<td class="text-end p-1">0</td>
		<td class="text-end p-1">0</td>
		</tr>
		<?
			}
		}
		?>
	</tbody>
	<tfoot class="table-dark font-14">
	<tr>
		<th colspan="2" class="text-center p-1">합계</th>
		<td class="text-end p-1"></td>
		<td class="text-end p-1"><?=number_format($total_count)?></td>
		<td class="text-end p-1"><?=number_format($total_price)?></td>
	</tr>
	</tfoot>
</table>