<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

use HTMLToMarkdown\HtmlConverter;

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_STRING);
$notice_type = filter_input(INPUT_POST, 'notice_type', FILTER_SANITIZE_STRING);
$subject = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_STRING);
//$contents = filter_input(INPUT_POST, 'contents', FILTER_SANITIZE_SPECIAL_CHARS);
$is_notice = filter_input(INPUT_POST, 'is_notice', FILTER_SANITIZE_STRING);
$deploy_date = filter_input(INPUT_POST, 'deploy_date', FILTER_SANITIZE_STRING);
$is_view = filter_input(INPUT_POST, 'is_view', FILTER_SANITIZE_STRING);
//print_r($_POST);

$contents = str_replace("<","&lt;",$_POST['contents']);
$contents = str_replace(">","&gt;",$contents);
$contents = str_replace("&","&amp;",$contents);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);

	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	switch($mode){
		case "copy":
			$query = "select * from tbl_notice where idx=:idx";
			$param = array(
				":idx"=>$idx,
			);
			$stmt = $conn_dgkr->prepare($query);
			$stmt->execute($param);
			$notice_data = $stmt->fetch();

			//print_r($param);

			$converter = new HtmlConverter();

			$i_query="insert into tbl_notice set subject=:subject,contents=:contents,reg_date=:reg_date,deploy_date=:deploy_date,hit=:hit,notice_no=:notice_no,admin_id=:admin_id,is_view=:is_view";
			$param = array(
				":subject"=>$notice_data['subject'],
				":contents"=>$converter->convert(htmlspecialchars_decode($notice_data['contents'])),
				":reg_date"=>$notice_data['reg_date'],
				":deploy_date"=>$notice_data['reg_date'],
				":hit"=>$notice_data['hit'],
				":notice_no"=>$notice_data['idx'],
				":admin_id"=>"admin@h2int.com",
				":is_view"=>($notice_data['flag']=="1")?"Y":"N",
			);
			$stmt = $conn->prepare($i_query);
			$stmt->execute($param);

			$u_query = "update tbl_notice set is_chk='Y' where idx=:idx";
			$param = array(
				":idx"=>$idx,
			);
			$stmt = $conn_dgkr->prepare($u_query);
			$stmt->execute($param);

			//print_r($param);

			//go("notice_list.php");
		break;
		case "regitster":
			$i_query="insert into tbl_notice set notice_type=:notice_type,subject=:subject,contents=:contents,reg_date=now(),hit='0',is_notice=:is_notice,is_view=:is_view,deploy_date=:deploy_date,admin_id=:admin_id";
			$stmt = $conn->prepare($i_query);
			$param = array(
				":notice_type"=>$notice_type,
				":subject"=>$subject,
				":contents"=>$contents,
				":is_notice"=>$is_notice,
				":is_view"=>$is_view,
				":deploy_date"=>$deploy_date,
				":admin_id"=>"admin@h2int.com",
			);
			
			$stmt->execute($param);
			//print_r($param);
			go("notice_list.php");
		break;
		case "modify":
			$query="update tbl_notice set notice_type=:notice_type,subject=:subject,contents=:contents,deploy_date=:deploy_date,is_notice=:is_notice,is_view=:is_view where idx=:idx";
			$param = array(
				":notice_type"=>$notice_type,
				":subject"=>$subject,
				":contents"=>$contents,
				":deploy_date"=>$deploy_date,
				":is_notice"=>$is_notice,
				":is_view"=>$is_view,
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
			go("notice_list.php");
		break;
		case "delete":
			$query="delete from tbl_notice where idx=:idx";
			$param = array(
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
		case "product_search": //관련상품 검색
			$search_value = filter_input(INPUT_POST, 'search_value', FILTER_SANITIZE_STRING);

			$admin= new Admin($conn);
			$goods_item = $admin->getNoticeProductSearch($search_value);

			foreach($goods_item as $value){
				if($value['genba_sku']){
					$goods_sku = $value['genba_sku'];
				}else{
					$goods_sku = $value['goods_sku'];
				}
				echo "<tr>";
				echo "<td class='text-center'><input type='hidden' name='goods_sku[]' value=".$goods_sku.">".$goods_sku."</td>";
				echo "<td class='text-center'>".$admin->getProductType($value['product_type'])."</td>";
				echo "<td class='text-start'>".$value['product_name']."<br/>(".$value['product_name_en'].")</td>";
				echo "<td class='text-center'>".$admin->getPublisherName($value['publisher_code'])."</td>";
				echo "<td class='text-center'>".$admin->getProductPlatform($value['product_platform'])."</td>";
				echo "<td class='text-center'><button class='btn btn-outline-secondary btn-sm font-14 btn_product_add' type='button'>설정완료</button></td>";
				echo "</tr>";
			}
		break;
		case "product_add": // 관련상품설정
			$notice_idx = filter_input(INPUT_POST, 'notice_idx', FILTER_SANITIZE_STRING);
			$goods_sku = filter_input(INPUT_POST, 'goods_sku', FILTER_SANITIZE_STRING);

			$query="insert into tbl_notice_goods set notice_idx=:notice_idx,goods_sku=:goods_sku";
			$param = array(
				":notice_idx"=>$notice_idx,
				":goods_sku"=>$goods_sku,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
			
		break;
	}


}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>