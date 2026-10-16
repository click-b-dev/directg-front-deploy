<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$search_supplier_code = filter_input(INPUT_POST, 'search_supplier_code', FILTER_SANITIZE_STRING);
$search_product_code = filter_input(INPUT_POST, 'search_product_code', FILTER_SANITIZE_STRING);

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$admin= new Admin($conn); 

	//옵션상품정보 — 판매 당시 공급처(tbl_sales.supplier_code) 기준. 공급처 변경 전 판매이력도 조회 가능
	$query="select a.product_code,b.product_name,b.product_name_en,b.product_platform,b.display_type,b.release_date from tbl_sales a inner join tbl_goods_item b on a.product_code=b.product_code where COALESCE(a.supplier_code,b.supplier_code)=:supplier_code group by a.product_code order by b.status asc,b.product_name asc";
	$stmt = $conn->prepare($query);
	$params = array(
		":supplier_code"=>$search_supplier_code
	);
	$stmt->execute($params);

	$goods_item_data = $stmt->fetchAll();

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>
<?
	echo "<option value=''>:::옵션상품 선택:::</option>";
	foreach($goods_item_data as $goods_item){
		if($search_product_code==$goods_item['product_code']){
			echo "<option value='".$goods_item['product_code']."' selected>[".$goods_item['product_code']."] ".$goods_item['product_name']." (".$goods_item['product_name_en'].") (".$admin->getProductPlatform($goods_item['product_platform']).") (".$goods_item['display_type'].") - ".date('Y-m-d',strtotime($goods_item['release_date']))." 출시</option>";
		}else{
			echo "<option value='".$goods_item['product_code']."'>[".$goods_item['product_code']."] ".$goods_item['product_name']." (".$goods_item['product_name_en'].") (".$admin->getProductPlatform($goods_item['product_platform']).") (".$goods_item['display_type'].") - ".date('Y-m-d',strtotime($goods_item['release_date']))." 출시</option>";
		}
	}
?>