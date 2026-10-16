<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_STRING);
$gubun = filter_input(INPUT_POST, 'gubun', FILTER_SANITIZE_STRING);
$subject = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_SPECIAL_CHARS);
//$contents = filter_input(INPUT_POST, 'contents', FILTER_SANITIZE_STRING);
$start_date = filter_input(INPUT_POST, 'start_date', FILTER_SANITIZE_STRING);
$end_date = filter_input(INPUT_POST, 'end_date', FILTER_SANITIZE_STRING);
$event_banner = filter_input(INPUT_POST, 'event_banner', FILTER_SANITIZE_STRING);
$is_view = filter_input(INPUT_POST, 'is_view', FILTER_SANITIZE_STRING);
$show_promotion = filter_input(INPUT_POST, 'show_promotion', FILTER_SANITIZE_STRING);

$event_link_target = filter_input(INPUT_POST, 'event_link_target', FILTER_SANITIZE_STRING);
$event_link_url = filter_input(INPUT_POST, 'event_link_url', FILTER_SANITIZE_STRING);

$contents = str_replace("<","&lt;",$_POST['contents']);
$contents = str_replace(">","&gt;",$contents);
$contents = str_replace("&","&amp;",$contents);

$event_notes = str_replace("<","&lt;",$_POST['event_notes']);
$event_notes = str_replace(">","&gt;",$event_notes);
$event_notes = str_replace("&","&amp;",$event_notes);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	switch($mode){
		case "register":
			$i_query="insert into tbl_event set event_gubun=:event_gubun,subject=:subject,contents=:contents,reg_date=now(),start_date=:start_date,end_date=:end_date,event_banner=:event_banner,is_view=:is_view,show_promotion=:show_promotion,event_link_target=:event_link_target,event_link_url=:event_link_url,event_notes=:event_notes,admin_id=:admin_id";
			$param = array(
				":event_gubun"=>$gubun,
				":subject"=>$subject,
				":contents"=>$contents,
				":start_date"=>strtotime($start_date),
				":end_date"=>strtotime($end_date),
				":event_banner"=>$event_banner,
				":is_view"=>$is_view,
				":show_promotion"=>$show_promotion,
				":event_link_target"=>$event_link_target,
				":event_link_url"=>$event_link_url,
				":event_notes"=>$event_notes,
				":admin_id"=>"admin@h2int.com"
			);
			$stmt = $conn->prepare($i_query);
			$stmt->execute($param);
			go("event_board_list.php");
		break;
		case "modify":
			$query="update tbl_event set event_gubun=:event_gubun,subject=:subject,contents=:contents,start_date=:start_date,end_date=:end_date,event_banner=:event_banner,is_view=:is_view,show_promotion=:show_promotion,event_link_target=:event_link_target,event_link_url=:event_link_url,event_notes=:event_notes where idx=:idx";
			$param = array(
				":event_gubun"=>$gubun,
				":subject"=>$subject,
				":contents"=>$contents,
				":start_date"=>strtotime($start_date),
				":end_date"=>strtotime($end_date),
				":event_banner"=>$event_banner,
				":is_view"=>$is_view,
				":show_promotion"=>$show_promotion,
				":event_link_target"=>$event_link_target,
				":event_link_url"=>$event_link_url,
				":event_notes"=>$event_notes,
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
			
			//print_r($param);
			go("event_board_list.php");
		break;
		case "delete":
			$query="delete from tbl_event where idx=:idx";
			$param = array(
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
		case "goods_option_search": //옵션상품 검색
			$search_value = filter_input(INPUT_POST, 'search_value', FILTER_SANITIZE_STRING);
			$event_no = filter_input(INPUT_POST, 'event_no', FILTER_SANITIZE_STRING);
			
			$adminEvent = new AdminEvent($conn);
			$adminGoods = new AdminGoods($conn);
			$admin = new Admin($conn);

			$query="select * from tbl_goods_item where (product_name like :product_name OR product_code=:product_code) and status<>'3' order by product_name asc";
			$stmt =$conn->prepare($query);
			$keyword = "%".$search_value."%"; 
			$params = array(
				":product_name"=>$keyword,
				":product_code"=>$search_value
			);
			$stmt->execute($params);

			$goods_option_list = $stmt->fetchAll();

			//이미 등록된 옵션상품은 제외
			$event_goods = $adminEvent->getEventGoodsOption($event_no);

			if(is_array($goods_option_list)){
				foreach($goods_option_list as $k => $v){
					foreach($event_goods as $v2){
						if($v['product_code'] == $v2['product_code']){
							unset($goods_option_list[$k]);
						}
					}
				}
			}
			
			$count="0";
			foreach($goods_option_list as $value){
				switch($value['status']){
					case "0":
						$status = "판매중";
						$tr_color="bg-white";
					break;
					case "1":
						$status = "판매중지";
						$tr_color="bg-white";
					break;
					case "3":
						$status = "판매종료";
						$tr_color="bg-danger bg-opacity-50";
					break;
					case "9":
						$status = "승인대기";
						$tr_color="bg-white";
					break;
				}
				echo "<tr class='".$tr_color."'>";
				echo "<td class='text-center'>
				<input type='hidden' name='product_code[]' value='".$value['product_code']."'>
				<input type='hidden' name='product_name[]' value='".$value['product_name']."'>".$value['product_code']."</td>";
				echo "<td class='text-start'>".$value['product_name']."<br/>(".$value['product_name_en'].")</td>";
				echo "<td class='text-center'>".$adminGoods->getPlatformName($value['product_platform'])."</td>";
				echo "<td class='text-center'>".$adminGoods->getPublisherName($value['supplier_code'])."</td>";
				echo "<td class='text-center'>".$admin->getGameType($value['game_type'])."</td>";
				echo "<td class='text-center'>".$status."</td>";
				echo "<td class='text-center'><button class='btn btn-sm btn-outline-secondary btn_option_add' type='button'>옵션추가</button></td>";
				echo "</tr>";
				$count++;
			}
			
			
			if($count=="0"){
				echo "<tr>";
				echo "<td colspan='7' class='text-center'>검색된 옵션상품이 없습니다</td>";
				echo "</tr>";
			}
			
		break;
		case "event_goods_add": //이벤트 옵션상품 추가
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$product_name = filter_input(INPUT_POST, 'product_name', FILTER_SANITIZE_STRING);
			$event_no = filter_input(INPUT_POST, 'event_no', FILTER_SANITIZE_STRING);

			$query="insert into tbl_event_goods set event_no=:event_no,product_code=:product_code,product_name=:product_name";
			$param = array(
				":event_no"=>$event_no,
				":product_code"=>$product_code,
				":product_name"=>$product_name,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
		case "event_goods_delete": //이벤트 옵션상품 삭제
			$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_STRING);
			$query="delete from tbl_event_goods where idx=:idx";
			$param = array(
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
		case "group_search": //그룹코드로 검색
			$search_value = filter_input(INPUT_POST, 'search_value', FILTER_SANITIZE_STRING);
			$event_no = filter_input(INPUT_POST, 'event_no', FILTER_SANITIZE_STRING);
			
			$adminEvent = new AdminEvent($conn);
			$adminGoods = new AdminGoods($conn);
			$admin = new Admin($conn);

			$goods_option_list = $adminGoods->getGroupItemList($search_value);

			//이미 등록된 옵션상품은 제외
			$event_goods = $adminEvent->getEventGoodsOption($event_no);

			if(is_array($goods_option_list)){
				foreach($goods_option_list as $k => $v){
					foreach($event_goods as $v2){
						if($v['product_code'] == $v2['product_code']){
							unset($goods_option_list[$k]);
						}
					}
				}
			}
			
			$count="0";
			echo "<tr>";
			echo "<td colspan='6'>";
			echo "</td>";
			echo "<td class='text-center'>";
			echo "<button class='btn btn-sm btn-outline-primary btn_option_add_all' type='button' data-group-code='".$search_value."'>전체추가</button>";
			echo "</td>";
			foreach($goods_option_list as $value){
				switch($value['status']){
					case "0":
						$status = "판매중";
						$tr_color="bg-white";
					break;
					case "1":
						$status = "판매중지";
						$tr_color="bg-white";
					break;
					case "3":
						$status = "판매종료";
						$tr_color="bg-danger bg-opacity-50";
					break;
					case "9":
						$status = "승인대기";
						$tr_color="bg-white";
					break;
				}
				echo "<tr class='".$tr_color."'>";
				echo "<td class='text-center'>
				<input type='hidden' name='product_code[]' value='".$value['product_code']."'>
				<input type='hidden' name='product_name[]' value='".$value['product_name']."'>".$value['product_code']."</td>";
				echo "<td class='text-start'>".$value['product_name']."<br/>(".$value['product_name_en'].")</td>";
				echo "<td class='text-center'>".$adminGoods->getPlatformName($value['product_platform'])."</td>";
				echo "<td class='text-center'>".$adminGoods->getPublisherName($value['supplier_code'])."</td>";
				echo "<td class='text-center'>".$admin->getGameType($value['game_type'])."</td>";
				echo "<td class='text-center'>".$status."</td>";
				echo "<td class='text-center'><button class='btn btn-sm btn-outline-secondary btn_option_add' type='button'>옵션추가</button></td>";
				echo "</tr>";
				$count++;
			}
			
			
			if($count=="0"){
				echo "<tr>";
				echo "<td colspan='7' class='text-center'>검색된 옵션상품이 없습니다</td>";
				echo "</tr>";
			}
		break;
		case "group_item_add": //그룹 상품 전체 추가
			$group_code = filter_input(INPUT_POST, 'group_code', FILTER_SANITIZE_STRING);
			$event_no = filter_input(INPUT_POST, 'event_no', FILTER_SANITIZE_STRING);

			$adminGoods = new AdminGoods($conn);
			$adminEvent = new AdminEvent($conn);

			$goods_option_list = $adminGoods->getGroupItemList($group_code);

			//이미 등록된 옵션상품은 제외
			$event_goods = $adminEvent->getEventGoodsOption($event_no);

			if(is_array($goods_option_list)){
				foreach($goods_option_list as $k => $v){
					foreach($event_goods as $v2){
						if($v['product_code'] == $v2['product_code']){
							unset($goods_option_list[$k]);
						}
					}
				}
			}
			
			$placeholders = [];
			$param = [];

			foreach ($goods_option_list as $i => $value) {
				$placeholders[] = "(:event_no_{$i}, :product_code_{$i}, :product_name_{$i})";
				$param[":event_no_{$i}"]      = $event_no;
				$param[":product_code_{$i}"]  = $value['product_code'];
				$param[":product_name_{$i}"]  = $value['product_name'];
			}
			$query = "INSERT INTO tbl_event_goods (event_no, product_code, product_name) VALUES " . implode(', ', $placeholders);
			$stmt  = $conn->prepare($query);
			$stmt->execute($param);
		break;
	}
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>