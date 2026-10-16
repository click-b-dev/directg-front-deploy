<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$title_mode = filter_input(INPUT_POST, 'title_mode', FILTER_SANITIZE_STRING);
$page = filter_input(INPUT_POST, 'page', FILTER_SANITIZE_STRING);
$search_title_name = filter_input(INPUT_POST, 'search_title_name', FILTER_SANITIZE_STRING);
$search_is_view = filter_input(INPUT_POST, 'search_is_view', FILTER_SANITIZE_STRING);
$search_publisher_code = filter_input(INPUT_POST, 'search_publisher_code', FILTER_SANITIZE_STRING);
$search_platform = filter_input(INPUT_POST, 'search_platform', FILTER_SANITIZE_STRING);
$search_age_limit = filter_input(INPUT_POST, 'search_age_limit', FILTER_SANITIZE_STRING);

$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);
$title_code = filter_input(INPUT_POST, 'title_code', FILTER_SANITIZE_STRING);
$sku = filter_input(INPUT_POST, 'sku', FILTER_SANITIZE_STRING);
$title_name = filter_input(INPUT_POST, 'title_name', FILTER_SANITIZE_SPECIAL_CHARS);
$title_name_en = filter_input(INPUT_POST, 'title_name_en', FILTER_SANITIZE_SPECIAL_CHARS);
$model_name = filter_input(INPUT_POST, 'model_name', FILTER_SANITIZE_SPECIAL_CHARS);

$is_view = filter_input(INPUT_POST, 'is_view', FILTER_SANITIZE_STRING);
$sales_status = filter_input(INPUT_POST, 'sales_status', FILTER_SANITIZE_STRING);
$release_date = filter_input(INPUT_POST, 'release_date', FILTER_SANITIZE_STRING);

$exclusive_korean = filter_input(INPUT_POST, 'exclusive_korean', FILTER_SANITIZE_STRING);
$interface_korean = filter_input(INPUT_POST, 'interface_korean', FILTER_SANITIZE_STRING);
$spoken_korean = filter_input(INPUT_POST, 'spoken_korean', FILTER_SANITIZE_STRING);
$subtitle_korean = filter_input(INPUT_POST, 'subtitle_korean', FILTER_SANITIZE_STRING);

$publisher_code = filter_input(INPUT_POST, 'publisher_code', FILTER_SANITIZE_STRING);
$genre_code = filter_input(INPUT_POST, 'genre_code', FILTER_SANITIZE_STRING);
$game_mode = filter_input(INPUT_POST, 'game_mode', FILTER_SANITIZE_STRING);


$coming_soon = filter_input(INPUT_POST, 'coming_soon', FILTER_SANITIZE_STRING);
$coming_soon_date = filter_input(INPUT_POST, 'coming_soon_date', FILTER_SANITIZE_STRING);

//개발사
$developer = filter_input(INPUT_POST, 'developer', FILTER_SANITIZE_STRING);

//퍼블리셔
$publisher = filter_input(INPUT_POST, 'publisher', FILTER_SANITIZE_STRING);

//등급분류번호
$rateno = filter_input(INPUT_POST, 'rateno', FILTER_SANITIZE_STRING);

//등급분류기관
$orgname = filter_input(INPUT_POST, 'orgname', FILTER_SANITIZE_STRING);

//결정등급
$age_limit = filter_input(INPUT_POST, 'age_limit', FILTER_SANITIZE_STRING);

//심의내용정보표기 2진수
$game_rate_text = filter_input(INPUT_POST, 'game_rate_text', FILTER_SANITIZE_STRING);

$domain = filter_input(INPUT_POST, 'domain', FILTER_SANITIZE_STRING);

$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);

$item_type = filter_input(INPUT_POST, 'item_type', FILTER_SANITIZE_STRING);
$item_name = filter_input(INPUT_POST, 'item_name', FILTER_SANITIZE_STRING);
$appid = filter_input(INPUT_POST, 'appid', FILTER_SANITIZE_STRING);

$youtube_media_id = filter_input(INPUT_POST, 'youtube_media_id', FILTER_SANITIZE_STRING);
$youtube_idx = filter_input(INPUT_POST, 'youtube_idx', FILTER_SANITIZE_STRING);

//짧은설명
$short_description = filter_input(INPUT_POST, 'short_description', FILTER_SANITIZE_STRING);
//상세설명
$description = filter_input(INPUT_POST, 'description', FILTER_SANITIZE_STRING);
//게임설명
$about_the_game = filter_input(INPUT_POST, 'about_the_game', FILTER_SANITIZE_STRING);

//독점설명
$dgkr_description = filter_input(INPUT_POST, 'dgkr_description', FILTER_SANITIZE_STRING);

//시스템요구사항
$requirements = filter_input(INPUT_POST, 'requirements', FILTER_SANITIZE_STRING);

//권리표기
$legal_text = filter_input(INPUT_POST, 'legal_text', FILTER_SANITIZE_STRING);

$steam_appid = filter_input(INPUT_POST, 'steam_appid', FILTER_SANITIZE_STRING);

$referer = filter_input(INPUT_POST, 'referer', FILTER_SANITIZE_STRING);

if($_SESSION['admin']['admin_level']=="1"){
	$product_viewer=true;
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$admin= new Admin($conn);
	$adminGoods= new AdminGoods($conn);

	switch($mode){
		//대표상품등록
		case "register":
			$query="insert into tbl_goods set title_id=:title_id,title_name=:title_name,title_name_en=:title_name_en,age_limit=:age_limit,is_view=:is_view,sales_status=:sales_status,release_date=:release_date,developer=:developer,steam_appid=:steam_appid,publisher=:publisher,game_rate=:game_rate,domain=:domain,rateno=:rateno,orgname=:orgname,sku=:sku,interface_korean=:interface_korean,spoken_korean=:spoken_korean,exclusive_korean=:exclusive_korean,subtitle_korean=:subtitle_korean,coming_soon=:coming_soon,coming_soon_date=:coming_soon_date,title_code=:title_code,reg_date=now()";
			$param = array(
				":title_id"=>$title_id,
				":title_name"=>$title_name,
				":title_name_en"=>$title_name_en,
				":age_limit"=>$age_limit,
				":is_view"=>$is_view,
				":sales_status"=>$sales_status,
				":release_date"=>$release_date,
				":developer"=>$developer,
				":steam_appid"=>$steam_appid,
				":publisher"=>$publisher,
				":game_rate"=>str_pad($game_rate_text,7,'0',STR_PAD_LEFT ),
				":domain"=>$domain,
				":rateno"=>$rateno,
				":orgname"=>$orgname,
				":sku"=>$sku,
				":interface_korean"=>$interface_korean,
				":spoken_korean"=>$spoken_korean,
				":exclusive_korean"=>$exclusive_korean,
				":subtitle_korean"=>$subtitle_korean,
				":coming_soon"=>$coming_soon,
				":coming_soon_date"=>$coming_soon_date,
				":title_code"=>$title_code,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);

			
			go("title_list.php?search_title_id=".$title_id);
		break;
		//대표상품수정
		case "modify":
			if(!$is_view){
				$is_view="N";
			}

			$query="update tbl_goods set title_name=:title_name,title_name_en=:title_name_en,is_view=:is_view,sales_status=:sales_status,release_date=:release_date,developer=:developer,steam_appid=:steam_appid,publisher=:publisher,interface_korean=:interface_korean,spoken_korean=:spoken_korean,exclusive_korean=:exclusive_korean,subtitle_korean=:subtitle_korean,coming_soon=:coming_soon,coming_soon_date=:coming_soon_date,title_code=:title_code,model_name=:model_name where title_id=:title_id";
			$param = array(
				":title_name"=>$title_name,
				":title_name_en"=>$title_name_en,
				":is_view"=>$is_view,
				":sales_status"=>$sales_status,
				":release_date"=>$release_date,
				":developer"=>$developer,
				":steam_appid"=>$steam_appid,
				":publisher"=>$publisher,
				":interface_korean"=>$interface_korean,
				":spoken_korean"=>$spoken_korean,
				":exclusive_korean"=>$exclusive_korean,
				":subtitle_korean"=>$subtitle_korean,
				":coming_soon"=>$coming_soon,
				":coming_soon_date"=>$coming_soon_date,
				":title_code"=>$title_code,
				":model_name"=>$model_name,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);

			go("title_modify.php?title_id=".$title_id);
		break;
		
		//대표상품 상품정보고시
		case "attribute_set":
			$model_name = filter_input(INPUT_POST, 'model_name', FILTER_SANITIZE_STRING);
			$product_name = filter_input(INPUT_POST, 'product_name', FILTER_SANITIZE_STRING);
			$kc_safety_infomartion = filter_input(INPUT_POST, 'kc_safety_infomartion', FILTER_SANITIZE_STRING);
			$rated_voltage = filter_input(INPUT_POST, 'rated_voltage', FILTER_SANITIZE_STRING);
			$power = filter_input(INPUT_POST, 'power', FILTER_SANITIZE_STRING);
			$manufacturing_date = filter_input(INPUT_POST, 'manufacturing_date', FILTER_SANITIZE_STRING);
			$manufacturer = filter_input(INPUT_POST, 'manufacturer', FILTER_SANITIZE_STRING);
			$manufacture_country = filter_input(INPUT_POST, 'manufacture_country', FILTER_SANITIZE_STRING);
			$size = filter_input(INPUT_POST, 'size', FILTER_SANITIZE_STRING);
			$weight = filter_input(INPUT_POST, 'weight', FILTER_SANITIZE_STRING);
			$main_requirements = filter_input(INPUT_POST, 'main_requirements', FILTER_SANITIZE_STRING);
			$warranty_service = filter_input(INPUT_POST, 'warranty_service', FILTER_SANITIZE_STRING);
			$as_information = filter_input(INPUT_POST, 'as_information', FILTER_SANITIZE_STRING);
			
			$terms_use = filter_input(INPUT_POST, 'terms_use', FILTER_SANITIZE_STRING);
			$applicable_period = filter_input(INPUT_POST, 'applicable_period', FILTER_SANITIZE_STRING);
			$product_supply_method = filter_input(INPUT_POST, 'product_supply_method', FILTER_SANITIZE_STRING);
			$cancel_right = filter_input(INPUT_POST, 'cancel_right', FILTER_SANITIZE_STRING);
			
			$query="insert into tbl_title_attribute_set set title_id=:title_id,model_name=:model_name,product_name=:product_name,kc_safety_infomartion=:kc_safety_infomartion,rated_voltage=:rated_voltage,power=:power,manufacturing_date=:manufacturing_date,manufacturer=:manufacturer,manufacture_country=:manufacture_country,size=:size,weight=:weight,main_requirements=:main_requirements,warranty_service=:warranty_service,as_information=:as_information,terms_use=:terms_use,applicable_period=:applicable_period,product_supply_method=:product_supply_method,cancel_right=:cancel_right ON DUPLICATE KEY UPDATE model_name=:model_name,product_name=:product_name,kc_safety_infomartion=:kc_safety_infomartion,rated_voltage=:rated_voltage,power=:power,manufacturing_date=:manufacturing_date,manufacturer=:manufacturer,manufacture_country=:manufacture_country,size=:size,weight=:weight,main_requirements=:main_requirements,warranty_service=:warranty_service,as_information=:as_information,terms_use=:terms_use,applicable_period=:applicable_period,product_supply_method=:product_supply_method,cancel_right=:cancel_right";
			$param = array(
				":title_id"=>$title_id,
				":model_name"=>$model_name,
				":product_name"=>$product_name,
				":kc_safety_infomartion"=>$kc_safety_infomartion,
				":rated_voltage"=>$rated_voltage,
				":power"=>$power,
				":manufacturing_date"=>$manufacturing_date,
				":manufacturer"=>$manufacturer,
				":manufacture_country"=>$manufacture_country,
				":size"=>$size,
				":weight"=>$weight,
				":main_requirements"=>$main_requirements,
				":warranty_service"=>$warranty_service,
				":as_information"=>$as_information,
				":terms_use"=>$terms_use,
				":applicable_period"=>$applicable_period,
				":product_supply_method"=>$product_supply_method,
				":cancel_right"=>$cancel_right,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
			
			go("title_attribute_set_register.php?title_id=".$title_id);
		break;
		case "attribute_set2": //거래조건에 관한 정보
			$delivery_method_info = filter_input(INPUT_POST, 'delivery_method_info', FILTER_SANITIZE_STRING);
			$as_information2 = filter_input(INPUT_POST, 'as_information2', FILTER_SANITIZE_STRING);
			
			$query="insert into tbl_title_attribute_set set title_id=:title_id,delivery_method_info=:delivery_method_info,as_information2=:as_information2 ON DUPLICATE KEY UPDATE delivery_method_info=:delivery_method_info,as_information2=:as_information2";
			$param = array(
				":title_id"=>$title_id,
				":delivery_method_info"=>$delivery_method_info,
				":as_information2"=>$as_information2,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
			go("title_attribute_set_register.php?title_id=".$title_id);
		break;
		//관련상품 기본게임 검색
		case "option_game_search":
			$search_value = filter_input(INPUT_POST, 'search_value', FILTER_SANITIZE_STRING);

			$query="select * from tbl_goods_item where product_name like :product_name and game_type='game' and display_type='basic' order by product_name asc";
			$stmt =$conn->prepare($query);
			$keyword = "%".$search_value."%"; 
			$params = array(
				":product_name"=>$keyword
			);
			$stmt->execute($params);

			$game_list = $stmt->fetchAll();

			$game_item = $adminGoods->getTitleGameList($title_id);

			if(is_array($game_list)){
				foreach($game_list as $k => $v){
					foreach($game_item as $v2){
						if($v['product_code'] == $v2['product_code']){
							unset($game_list[$k]);
						}
					}
				}
			}

			foreach($game_list as $value){
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
				echo "<td class='text-center'><input type='hidden' name='product_code[]' value=".$value['product_code'].">".$value['product_code']."</td>";
				echo "<td class='text-start'>".$value['product_name']."<br/>(".$value['product_name_en'].")</td>";
				echo "<td class='text-center'>".$adminGoods->getPlatformName($value['product_platform'])."</td>";
				echo "<td class='text-center'>".$adminGoods->getPublisherName($value['supplier_code'])."</td>";
				echo "<td class='text-center'>".$admin->getGameType($value['game_type'])."</td>";
				echo "<td class='text-center'>".$status."</td>";
if(!$product_viewer){
				echo "<td class='text-center'><button class='btn btn-sm btn-outline-secondary btn_option_add' type='button'>옵션추가</button></td>";
}
				echo "</tr>";
			}

		break;
		//관련 옵션상품 에디션 검색
		case "option_edition_search":
			$search_value = filter_input(INPUT_POST, 'search_value', FILTER_SANITIZE_STRING);
		$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);

			$query="select * from tbl_goods_item where product_name like :product_name and game_type='game' and display_type='edition' order by product_name asc";
			$stmt =$conn->prepare($query);
			$keyword = "%".$search_value."%"; 
			$params = array(
				":product_name"=>$keyword
			);
			$stmt->execute($params);

			$edition_list = $stmt->fetchAll();

			$edition_item = $adminGoods->getTitleEditionList($title_id);

			if(is_array($edition_list)){
				foreach($edition_list as $k => $v){
					foreach($edition_item as $v2){
						if($v['product_code'] == $v2['product_code']){
							unset($edition_list[$k]);
						}
					}
				}
			}

			foreach($edition_list as $value){
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
				echo "<td class='text-center'><input type='hidden' name='product_code[]' value=".$value['product_code'].">".$value['product_code']."</td>";
				echo "<td class='text-start'>".$value['product_name']."<br/>(".$value['product_name_en'].")</td>";
				echo "<td class='text-center'>".$adminGoods->getPlatformName($value['product_platform'])."</td>";
				echo "<td class='text-center'>".$adminGoods->getPublisherName($value['supplier_code'])."</td>";
				echo "<td class='text-center'>".$admin->getGameType($value['game_type'])."<br/>(".$admin->getBundleType($value['bundle_type']).")</td>";
				echo "<td class='text-center'>".$status."</td>";
if(!$product_viewer){
				echo "<td class='text-center'><button class='btn btn-sm btn-outline-secondary btn_option_edtion_add' type='button'>옵션추가</button></td>";
}
				echo "</tr>";
			}
		break;
		//관련 홀로모델 검색
		case "option_holomodels_search":
			$search_value = filter_input(INPUT_POST, 'search_value', FILTER_SANITIZE_STRING);
		$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);

			$query="select * from tbl_goods_item where product_name like :product_name and game_type='holomodels' and display_type='holomodels' order by product_name asc";
			$stmt =$conn->prepare($query);
			$keyword = "%".$search_value."%"; 
			$params = array(
				":product_name"=>$keyword
			);
			$stmt->execute($params);

			$holomodels_list = $stmt->fetchAll();

			$holomodels_item = $adminGoods->getTitleHolomodelsList($title_id);

			if(is_array($holomodels_list)){
				foreach($holomodels_list as $k => $v){
					foreach($holomodels_item as $v2){
						if($v['product_code'] == $v2['product_code']){
							unset($holomodels_list[$k]);
						}
					}
				}
			}

			foreach($holomodels_list as $value){
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
				echo "<td class='text-center'><input type='hidden' name='product_code[]' value=".$value['product_code'].">".$value['product_code']."</td>";
				echo "<td class='text-start'>".$value['product_name']."<br/>(".$value['product_name_en'].")</td>";
				echo "<td class='text-center'>".$adminGoods->getPlatformName($value['product_platform'])."</td>";
				echo "<td class='text-center'>".$adminGoods->getPublisherName($value['supplier_code'])."</td>";
				echo "<td class='text-center'>".$admin->getGameType($value['game_type'])."<br/>(".$admin->getBundleType($value['bundle_type']).")</td>";
				echo "<td class='text-center'>".$status."</td>";
if(!$product_viewer){
				echo "<td class='text-center'><button class='btn btn-sm btn-outline-secondary btn_holomodels_add' type='button'>옵션추가</button></td>";
}
				echo "</tr>";
			}
		break;
		//관련 홀로모델 DLC 검색
		case "option_holomodelsdlc_search":
			$search_value = filter_input(INPUT_POST, 'search_value', FILTER_SANITIZE_STRING);
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);

			$query="select * from tbl_goods_item where product_name like :product_name and game_type='holomodels' and display_type='holomodelsdlc' order by product_name asc";
			$stmt =$conn->prepare($query);
			$keyword = "%".$search_value."%"; 
			$params = array(
				":product_name"=>$keyword
			);
			$stmt->execute($params);

			$holomodelsdlc_list = $stmt->fetchAll();

			$holomodelsdlc_item = $adminGoods->getTitleHolomodelsDLCList($title_id);

			if(is_array($holomodelsdlc_list)){
				foreach($holomodelsdlc_list as $k => $v){
					foreach($holomodelsdlc_item as $v2){
						if($v['product_code'] == $v2['product_code']){
							unset($holomodelsdlc_list[$k]);
						}
					}
				}
			}

			foreach($holomodelsdlc_list as $value){
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
				echo "<td class='text-center'><input type='hidden' name='product_code[]' value=".$value['product_code'].">".$value['product_code']."</td>";
				echo "<td class='text-start'>".$value['product_name']."<br/>(".$value['product_name_en'].")</td>";
				echo "<td class='text-center'>".$adminGoods->getPlatformName($value['product_platform'])."</td>";
				echo "<td class='text-center'>".$adminGoods->getPublisherName($value['supplier_code'])."</td>";
				echo "<td class='text-center'>".$admin->getGameType($value['game_type'])."<br/>(".$admin->getBundleType($value['bundle_type']).")</td>";
				echo "<td class='text-center'>".$status."</td>";
if(!$product_viewer){
				echo "<td class='text-center'><button class='btn btn-sm btn-outline-secondary btn_holomodelsdlc_add' type='button'>옵션추가</button></td>";
}
				echo "</tr>";
			}
		break;
		//관련 홀로모델 에디션 검색
		case "option_holomodelsedition_search":
			$search_value = filter_input(INPUT_POST, 'search_value', FILTER_SANITIZE_STRING);
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);

			$query="select * from tbl_goods_item where product_name like :product_name and game_type='holomodels' and display_type='holomodelsedition' order by product_name asc";
			$stmt =$conn->prepare($query);
			$keyword = "%".$search_value."%"; 
			$params = array(
				":product_name"=>$keyword
			);
			$stmt->execute($params);

			$holomodelsedition_list = $stmt->fetchAll();

			$holomodelsedition_item = $adminGoods->getTitleHolomodelsEditionList($title_id);

			if(is_array($holomodelsedition_list)){
				foreach($holomodelsedition_list as $k => $v){
					foreach($holomodelsedition_item as $v2){
						if($v['product_code'] == $v2['product_code']){
							unset($holomodelsedition_list[$k]);
						}
					}
				}
			}

			foreach($holomodelsedition_list as $value){
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
				echo "<td class='text-center'><input type='hidden' name='product_code[]' value=".$value['product_code'].">".$value['product_code']."</td>";
				echo "<td class='text-start'>".$value['product_name']."<br/>(".$value['product_name_en'].")</td>";
				echo "<td class='text-center'>".$adminGoods->getPlatformName($value['product_platform'])."</td>";
				echo "<td class='text-center'>".$adminGoods->getPublisherName($value['supplier_code'])."</td>";
				echo "<td class='text-center'>".$admin->getGameType($value['game_type'])."<br/>(".$admin->getBundleType($value['bundle_type']).")</td>";
				echo "<td class='text-center'>".$status."</td>";
if(!$product_viewer){
				echo "<td class='text-center'><button class='btn btn-sm btn-outline-secondary btn_holomodelsedition_add' type='button'>옵션추가</button></td>";
}
				echo "</tr>";
			}
		break;
		//관련상품 기본게임 추가
		case "option_game_add":
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);
			
			$age_limit = $adminGoods->getTitleAgeLimit($title_id);

			$query="insert into tbl_title_option set product_code=:product_code,title_id=:title_id,age_limit=:age_limit,product_type='game'";
			$param = array(
				":product_code"=>$product_code,
				":title_id"=>$title_id,
				":age_limit"=>$age_limit,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
		
		//관련상품 에디션 추가
		case "option_edition_add":
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);
			
			$age_limit = $adminGoods->getTitleAgeLimit($title_id);

			$query="insert into  tbl_title_option set product_code=:product_code,title_id=:title_id,age_limit=:age_limit,product_type='edition'";
			$param = array(
				":product_code"=>$product_code,
				":title_id"=>$title_id,
				":age_limit"=>$age_limit,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;

		//관련상품 기본게임 삭제
		case "option_game_delete":
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);

			$query="delete from tbl_title_option where product_code=:product_code and title_id=:title_id";
			$param = array(
				":product_code"=>$product_code,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
		
		//관련상품 에디션 삭제
		case "option_edition_delete":
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);

			$query="delete from tbl_title_option where product_code=:product_code and title_id=:title_id";
			$param = array(
				":product_code"=>$product_code,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;

		//관련상품 홀로모델 삭제
		case "option_holomodels_delete":
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);

			$query="delete from tbl_title_option where product_code=:product_code and title_id=:title_id";
			$param = array(
				":product_code"=>$product_code,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;

		//관련상품 홀로모델 에디션 삭제
		case "option_holomodelsedition_delete":
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);

			$query="delete from tbl_title_option where product_code=:product_code and title_id=:title_id";
			$param = array(
				":product_code"=>$product_code,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;

		//관련 번들 검색
		case "option_bundle_search":
			$search_value = filter_input(INPUT_POST, 'search_value', FILTER_SANITIZE_STRING);

			$query="select * from tbl_goods_item where product_name like :product_name and game_type='bundle' order by product_name asc";
			$stmt =$conn->prepare($query);
			$keyword = "%".$search_value."%"; 
			$params = array(
				":product_name"=>$keyword
			);
			$stmt->execute($params);

			$bundle_list = $stmt->fetchAll();

			$bundle_item = $adminGoods->getTitleBundleList($title_id);

			if(is_array($bundle_list)){
				foreach($bundle_list as $k => $v){
					foreach($bundle_item as $v2){
						if($v['product_code'] == $v2['product_code']){
							unset($bundle_list[$k]);
						}
					}
				}
			}

			foreach($bundle_list as $value){
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
				echo "<td class='text-center'><input type='hidden' name='product_code[]' value=".$value['product_code'].">".$value['product_code']."</td>";
				echo "<td class='text-start'>".$value['product_name']."<br/>(".$value['product_name_en'].")</td>";
				echo "<td class='text-center'>".$adminGoods->getPlatformName($value['product_platform'])."</td>";
				echo "<td class='text-center'>".$adminGoods->getPublisherName($value['supplier_code'])."</td>";
				echo "<td class='text-center'>".$admin->getGameType($value['game_type'])."<br/>(".$admin->getBundleType($value['bundle_type']).")</td>";
				echo "<td class='text-center'>".$status."</td>";
if(!$product_viewer){
				echo "<td class='text-center'><button class='btn btn-sm btn-outline-secondary btn_option_add3' type='button'>옵션추가</button></td>";
}
				echo "</tr>";
			}
		break;

		//관련 번들 추가
		case "option_bundle_add":
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);

			$query="insert into tbl_title_option set product_code=:product_code,title_id=:title_id,product_type='bundle'";
			$param = array(
				":product_code"=>$product_code,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;

		//관련 번들 삭제
		case "option_bundle_delete":
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);

			$query="delete from tbl_title_option where product_code=:product_code and title_id=:title_id";
			$param = array(
				":product_code"=>$product_code,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;

		//관련상품 DLC  검색
		case "option_dlc_search":
			$search_value = filter_input(INPUT_POST, 'search_value', FILTER_SANITIZE_STRING);
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);

			$query="select * from tbl_goods_item where product_name like :product_name and find_in_set(game_type,'dlc,music') order by product_name asc";
			$stmt =$conn->prepare($query);
			$keyword = "%".$search_value."%"; 
			$params = array(
				":product_name"=>$keyword
			);
			$stmt->execute($params);

			$dlc_list = $stmt->fetchAll();

			$dlc_item = $adminGoods->getTitleDLCList($title_id);

			if(is_array($dlc_list)){
				foreach($dlc_list as $k => $v){
					foreach($dlc_item as $v2){
						if($v['product_code'] == $v2['product_code']){
							unset($dlc_list[$k]);
						}
					}
				}
			}

			foreach($dlc_list as $value){
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
				echo "<td class='text-center'><input type='hidden' name='product_code[]' value=".$value['product_code'].">".$value['product_code']."</td>";
				echo "<td class='text-start'>".$value['product_name']."<br/>(".$value['product_name_en'].")</td>";
				echo "<td class='text-center'>".$adminGoods->getPlatformName($value['product_platform'])."</td>";
				echo "<td class='text-center'>".$adminGoods->getPublisherName($value['supplier_code'])."</td>";
				echo "<td class='text-center'>".$admin->getGameType($value['game_type'])."</td>";
				echo "<td class='text-center'>".$status."</td>";
if(!$product_viewer){
				echo "<td class='text-center'><button class='btn btn-sm btn-outline-secondary btn_option_add2' type='button'>옵션추가</button></td>";
}
				echo "</tr>";
			}

			$query="select * from tbl_goods_item where product_name like :product_name and game_type='bundle' and bundle_type='4' order by product_name asc";
			$stmt =$conn->prepare($query);
			$keyword = "%".$search_value."%"; 
			$params = array(
				":product_name"=>$keyword
			);
			$stmt->execute($params);

			$bundle_option = $stmt->fetchAll();

			foreach($bundle_option as $value){
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
				echo "<td class='text-center'><input type='hidden' name='product_code[]' value=".$value['product_code'].">".$value['product_code']."</td>";
				echo "<td class='text-start'>".$value['product_name']."<br/>(".$value['product_name_en'].")</td>";
				echo "<td class='text-center'>".$adminGoods->getPlatformName($value['product_platform'])."</td>";
				echo "<td class='text-center'>".$adminGoods->getPublisherName($value['supplier_code'])."</td>";
				echo "<td class='text-center'>".$admin->getGameType($value['game_type'])."<br/>(".$admin->getBundleType($value['bundle_type']).")</td>";
				echo "<td class='text-center'>".$status."</td>";
if(!$product_viewer){
				echo "<td class='text-center'><button class='btn btn-sm btn-outline-secondary btn_option_add2' type='button'>옵션추가</button></td>";
}
				echo "</tr>";
			}
		break;

		//관련상품 DLC 추가
		case "option_dlc_add":
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);
			
			$age_limit = $adminGoods->getTitleAgeLimit($title_id);

			$query="insert into tbl_title_option set product_code=:product_code,title_id=:title_id,age_limit=:age_limit,product_type='dlc'";
			$param = array(
				":product_code"=>$product_code,
				":title_id"=>$title_id,
				":age_limit"=>$age_limit,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;

		//관련상품 DLC 삭제
		case "option_dlc_delete":
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);

			$query="delete from tbl_title_option where product_code=:product_code and title_id=:title_id";
			$param = array(
				":product_code"=>$product_code,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;

		//관련상품 홀로모델 DLC 삭제
		case "option_holomodelsdlc_delete":
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);

			$query="delete from tbl_title_option where product_code=:product_code and title_id=:title_id";
			$param = array(
				":product_code"=>$product_code,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;


		//관련상품 기타 검색
		case "option_etc_search":
			$search_value = filter_input(INPUT_POST, 'search_value', FILTER_SANITIZE_STRING);
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);

			$query="select * from tbl_goods_item where product_name like :product_name and game_type='accessories' order by product_name asc";
			$stmt =$conn->prepare($query);
			$keyword = "%".$search_value."%"; 
			$params = array(
				":product_name"=>$keyword
			);
			$stmt->execute($params);

			$etc_list = $stmt->fetchAll();

			$etc_item = $adminGoods->getTitleEtcList($title_id);

			if(is_array($etc_list)){
				foreach($etc_list as $k => $v){
					foreach($etc_item as $v2){
						if($v['product_code'] == $v2['product_code']){
							unset($etc_list[$k]);
						}
					}
				}
			}

			foreach($etc_list as $value){
				echo "<tr>";
				echo "<td class='text-center'><input type='hidden' name='product_code[]' value=".$value['product_code'].">".$value['product_code']."</td>";
				echo "<td class='text-start'>".$value['product_name']."<br/>(".$value['product_name_en'].")</td>";
				echo "<td class='text-center'>".$adminGoods->getPlatformName($value['product_platform'])."</td>";
				echo "<td class='text-center'>".$adminGoods->getPublisherName($value['supplier_code'])."</td>";
				echo "<td class='text-center'>".$admin->getGameType($value['game_type'])."</td>";
if(!$product_viewer){
				echo "<td class='text-center'><button class='btn btn-sm btn-outline-secondary btn_option_add4' type='button'>옵션추가</button></td>";
}
				echo "</tr>";
			}
		break;
		
		//관련상품 Etc 추가
		case "option_etc_add":
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);

			$query="insert into tbl_title_option set product_code=:product_code,title_id=:title_id,product_type='accessories'";
			$param = array(
				":product_code"=>$product_code,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;

		case "short_description_save":
			$query="insert into  tbl_goods_description set short_description=:short_description,title_id=:title_id ON DUPLICATE KEY UPDATE short_description=:short_description";
			$param = array(
				":short_description"=>$short_description,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;


		//관련상품 홀로모델 추가
		case "option_holomodels_add":
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);
			
			$age_limit = $adminGoods->getTitleAgeLimit($title_id);

			$query="insert into tbl_title_option set product_code=:product_code,title_id=:title_id,age_limit=:age_limit,product_type='holomodels'";
			$param = array(
				":product_code"=>$product_code,
				":title_id"=>$title_id,
				":age_limit"=>$age_limit,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
		
		//관련상품 홀로모델 에디션 추가
		case "option_holomodelsedition_add":
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);
			
			$age_limit = $adminGoods->getTitleAgeLimit($title_id);

			$query="insert into  tbl_title_option set product_code=:product_code,title_id=:title_id,age_limit=:age_limit,product_type='holomodelsedition'";
			$param = array(
				":product_code"=>$product_code,
				":title_id"=>$title_id,
				":age_limit"=>$age_limit,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;

		//관련상품 홀로모델 DLC 추가
		case "option_holomodelsdlc_add":
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);
			
			$age_limit = $adminGoods->getTitleAgeLimit($title_id);

			$query="insert into tbl_title_option set product_code=:product_code,title_id=:title_id,age_limit=:age_limit,product_type='holomodelsdlc'";
			$param = array(
				":product_code"=>$product_code,
				":title_id"=>$title_id,
				":age_limit"=>$age_limit,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;


		case "description_save":
			$query="insert into  tbl_goods_description set about_the_game=:about_the_game,title_id=:title_id ON DUPLICATE KEY UPDATE about_the_game=:about_the_game";
			$param = array(
				":about_the_game"=>$about_the_game,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;

		case "description_save2":
			$query="insert into tbl_goods_description set about_the_game=:about_the_game,description=:description,title_id=:title_id ON DUPLICATE KEY UPDATE about_the_game=:about_the_game,description=:description";
			$param = array(
				":about_the_game"=>$about_the_game,
				":description"=>$about_the_game,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);

			print_r($param);
			$stmt->execute($param);
		break;
		
		//대표상품 상세설명 스마트웹에이터 저장
		case "description_save_v2":
			$description_v2 = filter_input(INPUT_POST, 'description_v2', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
		
			$query="insert into tbl_goods_description set description_v2=:description_v2,title_id=:title_id,version='2' ON DUPLICATE KEY UPDATE description_v2=:description_v2,version='2'";
			$param = array(
				":description_v2"=>$description_v2,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);

			print_r($param);
			$stmt->execute($param);
		break;
		
		case "description_save3":
			$query="insert into  tbl_goods_description set dgkr_description=:dgkr_description,title_id=:title_id ON DUPLICATE KEY UPDATE dgkr_description=:dgkr_description";
			$param = array(
				":dgkr_description"=>$dgkr_description,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);

			print_r($param);
			$stmt->execute($param);
		break;
		
		case "description_save4":
			$query="insert into tbl_goods_description set description=:description,title_id=:title_id ON DUPLICATE KEY UPDATE description=:description";
			$param = array(
				":description"=>$description,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);

			print_r($param);
			$stmt->execute($param);
		break;

		//시스템 요구사항 저장
		case "requirements_save":
			$query="insert into  tbl_goods_description set requirements=:requirements,title_id=:title_id ON DUPLICATE KEY UPDATE requirements=:requirements";
			$param = array(
				":requirements"=>$requirements,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);

			//print_r($param);
			$stmt->execute($param);
		break;

		case "legal_text_save":
			$query="insert into  tbl_goods_description set legal_text=:legal_text,title_id=:title_id ON DUPLICATE KEY UPDATE legal_text=:legal_text";
			$param = array(
				":legal_text"=>$legal_text,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
		case "add_youtube":
			$query="insert into tbl_goods_media set media_type='video',youtube_media_id=:youtube_media_id,media_thumb=:media_thumb,media_url=:media_url,media_sort='0',title_id=:title_id";
			$param = array(
				":youtube_media_id"=>$youtube_media_id,
				":media_thumb"=>"mqdefault.jpg",
				":media_url"=>"https://www.youtube.com/embed/".$youtube_media_id,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
		case "delete_youtube":
			$query="delete from tbl_goods_media where idx=:youtube_idx";
			$param = array(
				":youtube_idx"=>$youtube_idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
	
		case "addOption":
			$goods_query = "insert into tbl_goods_option set product_code=:product_code,title_id=:title_id";
			$stmt = $conn->prepare($goods_query);
			$params = array(
				":product_code"=>$product_code,
				":title_id"=>$title_id
			);
			$stmt->execute($params);

			//옵션상품 매칭카운트
			$query="update tbl_goods_item set title_count=title_count+1 where product_code=:product_code";
			$param = array(
				":product_code"=>$product_code
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);

		break;
		case "deleteOption":
			$goods_query = "delete from tbl_goods_option where product_code=:product_code and title_id=:title_id";
			$stmt = $conn->prepare($goods_query);
			$params = array(
				":product_code"=>$product_code,
				":title_id"=>$title_id
			);
			$stmt->execute($params);

			//옵션상품 매칭카운트
			$query="update tbl_goods_item set title_count=title_count-1 where product_code=:product_code";
			$param = array(
				":product_code"=>$product_code
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
		case "addDLC":
			$goods_query = "insert into tbl_goods_option set product_code=:product_code,title_id=:title_id";
			$stmt = $conn->prepare($goods_query);
			$params = array(
				":product_code"=>$product_code,
				":title_id"=>$title_id
			);
			$stmt->execute($params);

			//옵션상품 매칭카운트
			$query="update tbl_goods_item set title_count=title_count+1 where product_code=:product_code";
			$param = array(
				":product_code"=>$product_code
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
		case "deleteDLC":
			$goods_query = "delete from tbl_goods_option where product_code=:product_code and title_id=:title_id";
			$stmt = $conn->prepare($goods_query);
			$params = array(
				":product_code"=>$product_code,
				":title_id"=>$title_id
			);
			$stmt->execute($params);

			//옵션상품 매칭카운트
			$query="update tbl_goods_item set title_count=title_count-1 where product_code=:product_code";
			$param = array(
				":product_code"=>$product_code
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
		case "bundle_info": //번들 구성보기
			$bundle_info = $admin->getGoodsOptionBundleList($product_code);
			echo "<div class='list-group'>";
			foreach($bundle_info as $value){
				echo "<div class='list-group-item'>";
				echo "<span>".$value['asset_id']."</span>";
				echo "<span class='ps-2'>".$value['asset_name']."</span>";
				echo "</div>";
			}
			echo "</div>";
		break;
		case "package_info": //패키지 구성보기
			//$steam_dlc = $admin->getSteamDLCList($steam_appid);
			$package_info = $admin->getGoodsOptionPackageList($product_code);
			
			/*foreach($steam_dlc as $value){
				echo "<div class='row g-2'>";
				echo"<div class='col-md-9'><div class='form-floating mb-3'><input type='text' class='form-control' name='item_name[]' placeholder='name@example.com' /><label for='floatingInput'>".$value['name']."</label></div></div>";
				echo"<div class='col-md-3'><div class='mt-2'><button class='btn btn-outline-secondary' type='button'>패키지 구성추가</button></div></div>";
				echo "</div>";
			}*/

			echo "<div class='list-group'>";
			foreach($package_info as $value){
				echo "<div class='list-group-item list-group-item-action'>";
				echo "<div class='d-flex'>";
				echo"<div class='form-check float-start'>";
				echo "<input class='form-check-input me-1' type='checkbox' name='package_srl[]' value='".$value['package_srl']."' id='package_srl".$value['package_srl']."'><label class='form-check-label ps-1 font-14' for='package_srl".$value['package_srl']."'>[".$value['item_type']."] ".$value['item_name']."</label>";
				echo "</div>";
				echo "<div class='ms-auto float-end'>";
				echo"<div class='dropdown card-widgets'>";
				echo"<a href='#' class='dropdown-toggle arrow-none' data-bs-toggle='dropdown' aria-expanded='false'><i class='uil uil-ellipsis-h'></i></a>";
				echo"<div class='dropdown-menu dropdown-menu-end'>";
				echo"<a href='javascript:void(0);' class='dropdown-item' data-bs-target='#package-second-modal' data-bs-toggle='modal'><i class='uil uil-edit me-1'></i>수정</a>";
				echo"<a href='javascript:void(0);' class='dropdown-item text-danger'><i class='uil uil-trash-alt me-1'></i>삭제</a>";
				echo"</div>";
				echo"</div>";
				echo "</div>";
				echo "</div>";
				if($value['item_type']=="Content"){
					if(is_array(json_decode($value['item_info']))){
						echo "<ul class='list-group mt-2 ps-3'>";
						foreach(json_decode($value['item_info']) as $sub_value){
							echo "<li class='list-group-item'><small class='text-muted'>".$sub_value->name."</small></li>";
						}
						echo "<li class='list-group-item'><div class='mb-3'><div class='input-group'><input type='text' name='item_info_list' class='form-control form-control-sm'><button class='btn btn-info btn-sm' type='button'>추가</button></div></div></li>";
						echo "</ul>";
					}else{
						echo "<ul class='list-group mt-2 ps-3'>";
						echo "<li class='list-group-item'><div class='mb-3'><div class='input-group'><input type='text' name='item_info_list' class='form-control form-control-sm'><button class='btn btn-info btn-sm btn_package_content_add' type='button'>추가</button></div></div></li>";
						echo "</ul>";
					}
				}
				echo "</div>";
			}
			echo "</div>";
		break;
		case "package_item_list": //패키지 구성추가
			$package_type = filter_input(INPUT_POST, 'package_type', FILTER_SANITIZE_STRING);
			$package_data = array();
			$package_item_list = array();
			$game_appid_array = array();
			$dlc_appid_array =array();

			//등록된 패키지 구성리스트
			$goods_item_package = $admin->getGoodsOptionPackageList($product_code);
			
			if($package_type=="1"){
				//기본게임 정보
				$steam_game = $admin->getSteamGameList($steam_appid);

				foreach($steam_game as $value){
					$package_data[] = $value;
				}
			}
			
			if($package_type=="2"){
				//DLC정보
				$steam_dlc = $admin->getSteamDLCList($steam_appid);
				foreach($steam_dlc as $value){
					$package_data[] = $value;
				}
			}

			foreach($package_data as $package_key=>$package_value){
				$package_item_list[$package_value['steam_appid']]['steam_appid'] = $package_value['steam_appid'];
				$package_item_list[$package_value['steam_appid']]['item_name'] = $admin->getPackageItemName($package_value['steam_appid']);
				$package_item_list[$package_value['steam_appid']]['item_name_en'] = $package_value['name'];
				$package_item_list[$package_value['steam_appid']]['is_free'] = $package_value['is_free'];
				switch($package_value['app_type']){
					case "game":
						$package_item_list[$package_value['steam_appid']]['item_type']="Game";
						$package_item_list[$package_value['steam_appid']]['item_type_code']="1";
					break;
					case "dlc":
						$package_item_list[$package_value['steam_appid']]['item_type']="DLC";
						$package_item_list[$package_value['steam_appid']]['item_type_code']="2";
					break;
					case "music":
						$package_item_list[$package_value['steam_appid']]['item_type']="DLC";
						$package_item_list[$package_value['steam_appid']]['item_type_code']="2";
					break;
					default:
						$package_item_list[$package_value['steam_appid']]['item_type']="DLC";
						$package_item_list[$package_value['steam_appid']]['item_type_code']="2";
					break;
				}
			}

			//이미 등록된 패키지 구성아이템 삭제
			if(count($goods_item_package)>0){
				foreach($goods_item_package as $sub_key=>$sub_value){
					//echo array_key_exists($sub_value['appid'], $package_item_list);
					//if($package_item_list[$sub_value['appid']]){
						$key = array_key_exists($sub_value['appid'], $package_item_list);
						if ($key !== false) {
							unset($package_item_list[$sub_value['appid']]);
						}
					//}
				}
			}

			if(count($package_item_list)>0){
				foreach($package_item_list as $value){
					if($value['is_free']){
						$is_free = "[무료] ";
					}else{
						$is_free = "";
					}
					echo "<div class='row g-2'>";
					echo"<div class='col-md-2'><input type='hidden' name='appid[]' value='".$value['steam_appid']."'><div class='form-floating'><select class='form-select' id='package_type2' name='item_type[]' aria-label='Floating label select example'><option value='".$value['item_type_code']."'>".$value['item_type']."</option></select><label for='package_type2' class='text-dark'>유형선택</label></div></div>";
					echo"<div class='col-md-8'><div class='form-floating mb-3 text-dark'><input type='text' class='form-control' name='item_name[]' value='".$value['item_name']."' placeholder='패키지 구성명(국문)을 입력해주세요' /><label for='floatingInput'>".$is_free.$value['item_name_en']."</label></div></div>";
					echo"<div class='col-md-2'><div class='mt-2'><button class='btn btn-outline-secondary btn_package_item_add' type='button'>구성추가</button></div></div>";
					echo "</div>";
				}
			}
			
			if($package_type=="1" || $package_type=="2"){
				echo "<div class='row g-2'>";
				echo"<div class='col-md-2'><div class='form-floating'><select class='form-select' id='package_type2' name='item_type[]' aria-label='Floating label select example'><option value='1'>Game</option><option value='2'>DLC</option></select><label for='package_type2' class='text-dark'>유형선택</label></div></div><div class='col-md-2 pt-2'><input type='text' name='appid[]' class='form-control' value='' placeholder='steam appid'></div>";
				echo"<div class='col-md-6'><div class='form-floating mb-3 text-dark'><input type='text' class='form-control' name='item_name[]' value='' placeholder='패키지 구성명(국문)을 입력해주세요' /><label for='floatingInput'></label></div></div>";
				echo"<div class='col-md-2'><div class='mt-2'><button class='btn btn-outline-secondary btn_package_item_add' type='button'>구성추가</button></div></div>";
				echo "</div>";
			}else{
				echo "<div class='row g-2'>";
				echo"<div class='col-md-2'><div class='form-floating'><select class='form-select' id='package_type2' name='item_type[]' aria-label='Floating label select example'><option value='3'>패키지</option></select><label for='package_type2' class='text-dark'>유형선택</label></div></div><div class='col-md-2 pt-2'><input type='text' name='item_code[]' class='form-control' value='' placeholder='옵션상품코드'></div>";
				echo"<div class='col-md-6'><div class='form-floating mb-3 text-dark'><input type='text' class='form-control' name='item_name[]' value='' placeholder='패키지 구성명(국문)을 입력해주세요' /><label for='floatingInput'></label></div></div>";
				echo"<div class='col-md-2'><div class='mt-2'><button class='btn btn-outline-secondary btn_package_item_add' type='button'>구성추가</button></div></div>";
				echo "</div>";
			}
		break;
		case "package_item_search":
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$package_type = filter_input(INPUT_POST, 'package_type', FILTER_SANITIZE_STRING);
			$search_package = filter_input(INPUT_POST, 'search_package', FILTER_SANITIZE_STRING);
			
			switch($package_type){
				case "1":
					$goods_item_list = $admin->getGoodsItemSearch('1',$search_package);
				break;
				case "2":
					$goods_item_list = $admin->getGoodsItemSearch('2',$search_package);
				break;
				case "3":
					$goods_item_list = $admin->getGoodsItemSearch('3',$search_package);
				break;
			}

			//등록된 패키지 구성리스트
			$goods_item_package = $admin->getGoodsOptionPackageList($product_code);

			//이미 등록된 패키지 구성아이템 삭제
			if(is_array($goods_item_package)){
				foreach($goods_item_list as $k => $v){
					foreach($goods_item_package as $v2){
						if($v['appid'] == $v2['appid']){
							unset($goods_item_list[$k]);
						}
					}
				}
			}

			foreach($goods_item_list as $value){
				switch($value['item_type']){
					case "1":
						$selected['product_type']['1'] = "selected";
						$value['product_name'] = $value['item_name'];
						$value['steam_appid'] = $value['appid'];
					break;
					case "2":
						$selected['product_type']['2'] = "selected";
						$value['product_name'] = $value['item_name'];
						$value['steam_appid'] = $value['appid'];
					break;
					case "3":
						$selected['product_type']['2'] = "selected";
						$value['product_name'] = $value['item_name'];
						$value['steam_appid'] = $value['appid'];
					break;
				}

				echo "<div class='row g-2'>";
				echo"<div class='col-md-2'><div class='form-floating'><select class='form-select' id='package_type2' name='item_type[]' aria-label='Floating label select example'><option value='1' ".$selected['product_type']['1'].">Game</option><option value='2' ".$selected['product_type']['2'].">DLC</option><option value='3' ".$selected['product_type']['3'].">패키지</option></select><label for='package_type2' class='text-dark'>유형선택</label></div></div>";
				echo"<div class='col-md-2 pt-2'><input type='text' name='appid[]' class='form-control' value='".$value['steam_appid']."' placeholder='steam appid'><input type='hidden' name='item_code[]' class='form-control' value='".$value['product_code']."' placeholder='옵션상품코드' readonly></div>";
				echo"<div class='col-md-6'><div class='form-floating mb-3 text-dark'><input type='text' class='form-control' name='item_name[]' value='".$value['product_name']."' placeholder='패키지 구성명(국문)을 입력해주세요' /><label for='floatingInput' class='font-14'>".$value['product_name_en']."</label></div></div>";
				echo"<div class='col-md-2'><div class='mt-2'><button class='btn btn-outline-secondary btn_package_item_add' type='button'>패키지추가</button></div></div>";
				echo "</div>";
			}

			echo "<div class='row g-2'>";
			echo"<div class='col-md-2'><div class='form-floating'><select class='form-select' id='package_type2' name='item_type[]' aria-label='Floating label select example'><option value=''>:::선택:::</option><option value='1'>Game</option><option value='2'>DLC</option></select><label for='package_type2' class='text-dark'>유형선택</label></div></div><div class='col-md-2 pt-2'><input type='text' name='appid[]' class='form-control' value='".$search_package."' placeholder='steam appid'></div>";
			echo"<div class='col-md-6'><div class='form-floating mb-3 text-dark'><input type='text' class='form-control' name='item_name[]' value='' placeholder='패키지 구성명(국문)을 입력해주세요' /><label for='floatingInput'></label></div></div>";
			echo"<div class='col-md-2'><div class='mt-2'><button class='btn btn-outline-secondary btn_package_item_add' type='button'>패키지추가</button></div></div>";
			echo "</div>";

		break;
		case "package_add": //패키지 구성추가
			$item_code = filter_input(INPUT_POST, 'item_code', FILTER_SANITIZE_STRING);
			$admin->setGoodsOptionPackage($product_code,$item_type,$item_name,$appid,$item_code);
		break;
		case "special_info": //특전 구성보기
			$special_info = $admin->getGoodsOptionSpecialList($product_code);

			echo "<div class='list-group'>";
			foreach($special_info as $value){
				echo "<div class='list-group-item'>";
				echo "<span>".$value['asset_id']."</span>";
				echo "<span class='ps-2'>".$value['asset_name']."</span>";
				echo "</div>";
			}
			echo "</div>";
		break;
		case "franchise_search": //프랜차이즈 검색
			$search_franchise = filter_input(INPUT_POST, 'search_franchise', FILTER_SANITIZE_STRING);
			if($search_franchise<>""){
				$result = $admin->getFranchiseSearch($search_franchise);

				if(count($result)==0){
					echo "<tr><td colspan='3' class='text-center'>검색된 결과가 없습니다.</td></tr>";
				}else{
					foreach($result as $value){
						echo "<tr>";
						echo"<td><input type='text' name='franchise_idx[]' class='form-control' value='".$value['idx']."' readonly></td>";
						echo"<td><input type='text' class='form-control' name='franchise_name[]' value='".$value['franchise_name']."' readonly /></td>";
						echo"<td><button class='btn btn-outline-secondary btn_franchise_add' type='button'>프랜차이즈 추가</button></td>";
						echo "</tr>";
					}
				}
			}
		break;
		case "franchise_save":
			$franchise_idx = filter_input(INPUT_POST, 'franchise_idx', FILTER_SANITIZE_STRING);
			$admin->setTitleFranchise($title_id,$franchise_idx);
		break;
		case "header_upload": // header (460x215) 업로드
			$header_path = $_SERVER['DOCUMENT_ROOT'].'/upload/title/'.$title_id."/header";
			
			if(!is_dir($header_path)){
				$oldumask = umask(0);
				mkdir($header_path, 0777,true);
				//chmod($image_path,0777);
				umask($oldumask);
			}

			if($_FILES['header_img']['size']>1000000){
				msg("옵션상품 이미지의 크기는 최대 1MB를 초과하실수 없습니다.",-1);
				exit;
			}

			$header_img_name = $title_id.".jpg";

			$file_path = $header_path."/".$header_img_name;

			if($header_img_name){
				move_uploaded_file($_FILES['header_img']['tmp_name'], $file_path);
			}

			$s_query = "insert into steam_image_chk set appid=:appid,is_header=:is_header,reg_date=now() ON DUPLICATE KEY UPDATE update_date=now(),is_header=:is_header";
			$stmt = $conn->prepare($s_query);
			$s_params = array(
				":appid"=>$appid,
				":is_header"=>"200",
			);
			$stmt->execute($s_params);
		break;
		
		case "capsule_upload": // capsule (616x353) 업로드
		///upload/title/'.$value['title_id']."/capsule/capsule_616x353.jpg
			$capsule_path = $_SERVER['DOCUMENT_ROOT'].'/upload/title/'.$title_id."/capsule";
			if(!file_exists($capsule_path)){
				mkdir($capsule_path, '0777',true);
			}

			if($_FILES['capsule_img']['size']>1000000){
				msg("옵션상품 이미지의 크기는 최대 1MB를 초과하실수 없습니다.",-1);
				exit;
			}

			$capsule_img_name = "capsule_616x353.jpg";

			$file_path = $capsule_path."/".$capsule_img_name;

			if($capsule_img_name){
				move_uploaded_file($_FILES['capsule_img']['tmp_name'], $file_path);
			}

			$s_query = "insert into steam_image_chk set appid=:appid,is_capsule_616=:is_capsule_616,reg_date=now() ON DUPLICATE KEY UPDATE update_date=now(),is_capsule_616=:is_capsule_616";
			$stmt = $conn->prepare($s_query);
			$s_params = array(
				":appid"=>$appid,
				":is_capsule_616"=>"200",
			);
			$stmt->execute($s_params);
		break;
		case "library_upload": // library (600x900) 업로드
			$library_path = $_SERVER['DOCUMENT_ROOT'].'/upload/title/'.$title_id."/library";
			
			if(!is_dir($library_path)){
				$oldumask = umask(0);
				mkdir($library_path, 0777,true);
				//chmod($image_path,0777);
				umask($oldumask);
			}

			if($_FILES['library_img']['size']>1000000){
				msg("옵션상품 이미지의 크기는 최대 1MB를 초과하실수 없습니다.",-1);
				exit;
			}

			$library_img_name = "library_600x900.jpg";

			$file_path = $library_path."/".$library_img_name;

			if($library_img_name){
				move_uploaded_file($_FILES['library_img']['tmp_name'], $file_path);
			}
			
			//echo $library_img_name;

			$s_query = "insert into steam_image_chk set appid=:appid,is_library=:is_library,reg_date=now() ON DUPLICATE KEY UPDATE update_date=now(),is_library=:is_library ";
			$stmt = $conn->prepare($s_query);
			$s_params = array(
				":appid"=>$appid,
				":is_library"=>"200",
			);
			$stmt->execute($s_params);
		break;
		case "hero_capsule_upload":
			$hero_capsule_path = $_SERVER['DOCUMENT_ROOT'].'/upload/title/'.$title_id."/hero";
			
			if(!is_dir($hero_capsule_path)){
				$oldumask = umask(0);
				mkdir($hero_capsule_path, 0777,true);
				//chmod($image_path,0777);
				umask($oldumask);
			}

			if($_FILES['hero_capsule_img']['size']>1000000){
				msg("옵션상품 이미지의 크기는 최대 1MB를 초과하실수 없습니다.",-1);
				exit;
			}

			$hero_capsule_img_name = "hero_capsule.jpg";

			$file_path = $hero_capsule_path."/".$hero_capsule_img_name;

			if($hero_capsule_img_name){
				move_uploaded_file($_FILES['hero_capsule_img']['tmp_name'], $file_path);
			}
			
			//echo $library_img_name;

			$s_query = "insert into steam_image_chk set appid=:appid,is_hero=:is_hero,reg_date=now() ON DUPLICATE KEY UPDATE update_date=now(),is_hero=:is_hero ";
			$stmt = $conn->prepare($s_query);
			$s_params = array(
				":appid"=>$appid,
				":is_hero"=>"200",
			);
			$stmt->execute($s_params);
		break;
		case "hero_capsule_chk":
			$s_query = "insert into steam_image_chk set appid=:appid,is_hero=:is_hero,reg_date=now() ON DUPLICATE KEY UPDATE update_date=now(),is_hero=:is_hero ";
			$stmt = $conn->prepare($s_query);
			$s_params = array(
				":appid"=>$appid,
				":is_hero"=>"200",
			);
			$stmt->execute($s_params);
		break;
		
		//sku생성
		case "make_sku":
			$sku = $admin->uuidgen4();
			$query="update tbl_goods set sku=:sku where title_id=:title_id";
			$param = array(
				":sku"=>$sku,
				":title_id"=>$title_id,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;

		case "genre_save":
		$title_genre =  implode(",",$_POST['genre']);
		
			$u_query="update tbl_goods set genre=:genre where title_id=:title_id";
			$u_param = array(
				":genre"=> $title_genre,
				":title_id"=>$title_id,
			);
			$stmt = $conn->prepare($u_query);
			$stmt->execute($u_param);
			
			if($referer){
				go($referer."?page=".$page);
			}else{
				go("title_modify.php?title_id=".$title_id);
			}
			
		break;
		case "category_save":
			$u_query="update tbl_goods set category=:category where title_id=:title_id";
			$u_param = array(
				":category"=> implode(",",$_POST['category']),
				":title_id"=>$title_id,
			);
			$stmt = $conn->prepare($u_query);
			$stmt->execute($u_param);
			//print_r($u_param);
			if($referer){
				go($referer."?page=".$page);
			}else{
				go("title_modify.php?title_id=".$title_id);
			}
		break;
		//심의정보 저장
		case "grac_save":
			$u_query="update tbl_goods set age_limit=:age_limit,game_rate=:game_rate,rateno=:rateno,orgname=:orgname where title_id=:title_id";
			$u_param = array(
				":age_limit"=>$age_limit,
				":game_rate"=>str_pad($game_rate_text,7,'0',STR_PAD_LEFT ),
				":rateno"=>$rateno,
				":orgname"=>$orgname,
				":title_id"=>$title_id,
			);
			$stmt = $conn->prepare($u_query);
			$stmt->execute($u_param);
			
			//관련 옵션상품 심의정보 업데이트
			$query="update tbl_title_option set age_limit=:age_limit where title_id=:title_id";
			$stmt = $conn->prepare($query);
			$param = array(
				":age_limit"=>$age_limit,
				":title_id"=>$title_id,
			);
			$stmt->execute($param);
			
			go("title_grac_register.php?title_id=".$title_id);
		break;
		//출시정보저장
		case "release_save":
			$u_query="update tbl_goods set release_date=:release_date,coming_soon=:coming_soon,coming_soon_date=:coming_soon_date where title_id=:title_id";
			$u_param = array(
				":release_date"=>$release_date,
				":coming_soon"=>$coming_soon,
				":coming_soon_date"=>$coming_soon_date,
				":title_id"=>$title_id,
			);
			$stmt = $conn->prepare($u_query);
			$stmt->execute($u_param);
			//print_r($u_param);
			go("title_modify.php?title_id=".$title_id);
		break;
		
		//스크린샷 저장
		case "screenshot_upload":
			$screenshot_img_name = $_FILES['screenshot_img']['name'];
			$num = filter_input(INPUT_POST, 'num', FILTER_SANITIZE_STRING);
		
			$image_path = '/home/dgkrshop/www/upload/title/'.$title_id."/screenshot/";
			$image_url = '/home/dgkrshop/www/upload/title/'.$title_id.'/screenshot/'.$screenshot_img_name;
			
			if(!is_dir($image_path)){
				$oldumask = umask(0);
				mkdir($image_path, 0777,true);
				//chmod($image_path,0777);
				umask($oldumask);
			}

			print_r($_FILES);

			if($_FILES['screenshot_img']['size']>1000000){
				msg("스크린샷 이미지의 크기는 최대 1MB를 초과하실수 없습니다.",-1);
				exit;
			}

			$file_path = $image_path."/".$screenshot_img_name;

			if($screenshot_img_name){
				move_uploaded_file($_FILES['screenshot_img']['tmp_name'], $file_path);
			}
			
			$thumbnail_path = '/home/dgkrshop/www/upload/title/'.$title_id."/screenshot/thumbnail/";
			$thumbnail_url = '/home/dgkrshop/www/upload/title/'.$title_id.'/screenshot/'.$screenshot_img_name;
			
			if(!is_dir($thumbnail_path)){
				$oldumask = umask(0);
				mkdir($thumbnail_path, 0777,true);
				umask($oldumask);
			}
			
			//스크린샷 썸네일 저장
			$admin->resizeImage('120','90','100',$thumbnail_url,$thumbnail_path,$screenshot_img_name);
			
			$query = "insert into tbl_goods_screenshot set screenshot_num=:screenshot_num,title_id=:title_id,file_name=:file_name,file_size=:file_size,file_type=:file_type,url=:url,thumbnail=:thumbnail,reg_date=now()";
			$stmt = $conn->prepare($query);
			$params = array(
				':screenshot_num'=>$num,
				':title_id'=>$title_id,
				':file_name'=>$screenshot_img_name,
				':file_size'=>filesize('/home/dgkrshop/www/upload/title/'.$title_id.'/screenshot/'.$screenshot_img_name),
				':file_type'=>$_FILES['screenshot_img']['type'],
				':url'=>'/upload/title/'.$title_id.'/screenshot/'.$screenshot_img_name,
				':thumbnail'=>'/upload/title/'.$title_id.'/screenshot/thumbnail/'.$screenshot_img_name,
			);
			$stmt->execute($params);
		break;
		
		case "region_msg_save":	//지역제한 안내문구 저장
			$region_msg = filter_input(INPUT_POST, 'region_msg', FILTER_SANITIZE_STRING);
			$query="insert into tbl_goods_description set region_msg=:region_msg,title_id=:title_id,reg_date=now() ON DUPLICATE KEY UPDATE region_msg=:region_msg";
			$param = array(
				":region_msg"=>$region_msg,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
			tmt->execute($param);
		break;
		
		case "screenshot_sort_up": //스크린샷 순서 위로
			$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_STRING);
			$query = "update tbl_goods_screenshot set sort=sort-1 where idx=:idx";
			$param = array(
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
			//print_r($param);
		break;
		case "screenshot_sort_down": //스크린샷 순서 아래로
			$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_STRING);
			
			$query = "update tbl_goods_screenshot set sort=sort+1 where idx=:idx";
			$param = array(
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
			//print_r($param);
		break;
		
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>