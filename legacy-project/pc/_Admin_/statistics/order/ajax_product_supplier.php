<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$search_product_code = filter_input(INPUT_POST, 'search_product_code', FILTER_SANITIZE_STRING);
$search_supplier_code = filter_input(INPUT_POST, 'search_supplier_code', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	//해당 옵션상품이 판매된 공급처 목록 — 판매 당시 공급처(tbl_sales.supplier_code) 기준, NULL은 현재 공급처로 폴백
	//현재DB(tbl_publisher)에 이름 없으면 예전DB(directgames.tbl_publisher.idx)에서 이름 조회
	$query="select s.supplier_code,c.publisher_name,d.publisher as old_publisher_name from (select distinct COALESCE(a.supplier_code,b.supplier_code) as supplier_code from tbl_sales a inner join tbl_goods_item b on a.product_code=b.product_code where a.product_code=:product_code and COALESCE(a.supplier_code,b.supplier_code) is not null and COALESCE(a.supplier_code,b.supplier_code)<>0) s left join tbl_publisher c on s.supplier_code=c.publisher_code left join directgames.tbl_publisher d on s.supplier_code=d.idx order by COALESCE(c.publisher_name,d.publisher) asc";
	$stmt = $conn->prepare($query);
	$params = array(
		":product_code"=>$search_product_code
	);
	$stmt->execute($params);

	$supplier_data = $stmt->fetchAll();

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>
<?
	echo "<option value=''>:::공급처 선택:::</option>";
	foreach($supplier_data as $supplier){
		$label = $supplier['publisher_name'] ?: ($supplier['old_publisher_name'] ? $supplier['old_publisher_name'].' (예전DB)' : $supplier['supplier_code']);
		if($search_supplier_code==$supplier['supplier_code']){
			echo "<option value='".$supplier['supplier_code']."' selected>".$label."</option>";
		}else{
			echo "<option value='".$supplier['supplier_code']."'>".$label."</option>";
		}
	}
?>
