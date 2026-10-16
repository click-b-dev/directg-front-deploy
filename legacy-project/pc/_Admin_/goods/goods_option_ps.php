<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_admin.xml');
$logger = Logger::getLogger("goods");

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
$product_name = filter_input(INPUT_POST, 'product_name', FILTER_SANITIZE_STRING);
$product_name_en = filter_input(INPUT_POST, 'product_name_en', FILTER_SANITIZE_STRING);
$keyword = filter_input(INPUT_POST, 'keyword', FILTER_SANITIZE_STRING);
$model_code = filter_input(INPUT_POST, 'model_code', FILTER_SANITIZE_STRING);
$model_name = filter_input(INPUT_POST, 'model_name', FILTER_SANITIZE_STRING);
$publisher = filter_input(INPUT_POST, 'publisher', FILTER_SANITIZE_STRING);

$goods_sku = filter_input(INPUT_POST, 'goods_sku', FILTER_SANITIZE_STRING);
$product_platform = filter_input(INPUT_POST, 'product_platform', FILTER_SANITIZE_STRING);
$option_type = filter_input(INPUT_POST, 'option_type', FILTER_SANITIZE_STRING);
$game_type = filter_input(INPUT_POST, 'game_type', FILTER_SANITIZE_STRING);
$bundle_type = filter_input(INPUT_POST, 'bundle_type', FILTER_SANITIZE_STRING);
$display_type = filter_input(INPUT_POST, 'display_type', FILTER_SANITIZE_STRING);

$steam_appid = filter_input(INPUT_POST, 'steam_appid', FILTER_SANITIZE_NUMBER_INT);
$packageid = filter_input(INPUT_POST, 'packageid', FILTER_SANITIZE_NUMBER_INT);
$bundleid = filter_input(INPUT_POST, 'bundleid', FILTER_SANITIZE_NUMBER_INT);
$release_date = filter_input(INPUT_POST, 'release_date', FILTER_SANITIZE_STRING);

$asset_id = filter_input(INPUT_POST, 'asset_id', FILTER_SANITIZE_NUMBER_INT);
$zt_item_id = filter_input(INPUT_POST, 'zt_item_id', FILTER_SANITIZE_NUMBER_INT);
$genba_sku = filter_input(INPUT_POST, 'genba_sku', FILTER_SANITIZE_STRING);


$publisher_code = filter_input(INPUT_POST, 'publisher_code', FILTER_SANITIZE_STRING);
$is_view = filter_input(INPUT_POST, 'is_view', FILTER_SANITIZE_STRING);

$domain = filter_input(INPUT_POST, 'domain', FILTER_SANITIZE_STRING);


$item_type = filter_input(INPUT_POST, 'item_type', FILTER_SANITIZE_STRING);
$item_name = filter_input(INPUT_POST, 'item_name', FILTER_SANITIZE_STRING);

$page = filter_input(INPUT_POST, 'page', FILTER_SANITIZE_STRING);
$search_product_name = filter_input(INPUT_POST, 'search_product_name', FILTER_SANITIZE_STRING);
$search_product_name_en = filter_input(INPUT_POST, 'search_product_name_en', FILTER_SANITIZE_STRING);
$search_product_type = filter_input(INPUT_POST, 'search_product_type', FILTER_SANITIZE_STRING);
$search_status = filter_input(INPUT_POST, 'search_status', FILTER_SANITIZE_STRING);
$search_is_view = filter_input(INPUT_POST, 'search_is_view', FILTER_SANITIZE_STRING);
$search_product_platform = filter_input(INPUT_POST, 'search_product_platform', FILTER_SANITIZE_STRING);
$search_order_system = filter_input(INPUT_POST, 'search_order_system', FILTER_SANITIZE_STRING);
$search_is_bonus = filter_input(INPUT_POST, 'search_is_bonus', FILTER_SANITIZE_STRING);


$spoken_korean = filter_input(INPUT_POST, 'spoken_korean', FILTER_SANITIZE_STRING);
$interface_korean = filter_input(INPUT_POST, 'interface_korean', FILTER_SANITIZE_STRING);
$exclusive_korean = filter_input(INPUT_POST, 'exclusive_korean', FILTER_SANITIZE_STRING);
$subtitle_korean = filter_input(INPUT_POST, 'subtitle_korean', FILTER_SANITIZE_STRING);

if($steam_appid==""){
	$steam_appid=0;
}

if($packageid==""){
	$packageid=0;
}

if($bundleid==""){
	$bundleid=0;
}

if($option_type==""){
	$option_type="digital";
}

if($_SESSION['admin']['admin_level']=="1"){
	$product_viewer=true;
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$admin= new Admin($conn);
	$adminGoods= new AdminGoods($conn);
	$adminAsset= new AdminAsset($conn);

	switch($mode){
		case "register":
			//$goods_sku = $admin->uuidgen4();

			$query="insert into tbl_goods_item set product_code=:product_code,product_name=:product_name,product_name_en=:product_name_en,product_platform=:product_platform,steam_appid=:steam_appid,packageid=:packageid,bundleid=:bundleid,goods_sku=:goods_sku,option_type=:option_type,game_type=:game_type,display_type=:display_type,bundle_type=:bundle_type,spoken_korean=:spoken_korean,interface_korean=:interface_korean,exclusive_korean=:exclusive_korean,subtitle_korean=:subtitle_korean";
			$param = array(
				":product_code"=>$product_code,
				":product_name"=>$product_name,
				":product_name_en"=>$product_name_en,
				":product_platform"=>$product_platform,
				":steam_appid"=>$steam_appid,
				":packageid"=>$packageid,
				":bundleid"=>$bundleid,
				":goods_sku"=>$goods_sku,
				":option_type"=>$option_type,
				":game_type"=>$game_type,
				":display_type"=>$display_type,
				":bundle_type"=>$bundle_type,
				":spoken_korean"=>$spoken_korean,
				":interface_korean"=>$interface_korean,
				":exclusive_korean"=>$exclusive_korean,
				":subtitle_korean"=>$subtitle_korean,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);

			if($steam_appid>0){
				$query = "insert into tbl_goods_item_description set product_code=:product_code,steam_appid=:steam_appid";
				$param = array(
					":product_code"=>$product_code,
					":steam_appid"=>$steam_appid,
				);
				$stmt = $conn->prepare($query);
				$stmt->execute($param);
			}

			//print_r($param);

			switch($game_type){
				case "game":
					go("goods_option_list.php?search_product_name=".$product_name."&search_product_name_en=".$search_product_name_en."&search_product_type=".$search_product_type."&search_status=".$search_status."&page=".$page."&search_product_platform=".$search_product_platform);
				break;
				case "dlc":
					go("goods_option_list.php?search_product_name=".$product_name."&search_product_name_en=".$search_product_name_en."&search_product_type=".$search_product_type."&search_status=".$search_status."&page=".$page."&search_product_platform=".$search_product_platform);
				break;
				case "music":
					go("goods_option_list.php?search_product_name=".$product_name."&search_product_name_en=".$search_product_name_en."&search_product_type=".$search_product_type."&search_status=".$search_status."&page=".$page."&search_product_platform=".$search_product_platform);
				break;
				case "bundle":
					go("goods_option_list.php?search_product_name=".$product_name."&search_product_name_en=".$search_product_name_en."&search_product_type=".$search_product_type."&search_status=".$search_status."&page=".$page."&search_product_platform=".$search_product_platform);
				break;
				case "randombox":
					go("goods_randombox_list.php?search_product_name=".$product_name."&search_product_name_en=".$search_product_name_en."&search_product_type=".$search_product_type."&search_status=".$search_status."&page=".$page."&search_product_platform=".$search_product_platform);
				break;
				case "accessories":
					go("goods_etc_list.php");
				break;
				case "timedeal":
					go("goods_timedeal_list.php?search_product_name=".$product_name."&search_product_name_en=".$search_product_name_en."&search_product_type=".$search_product_type."&search_status=".$search_status."&page=".$page."&search_product_platform=".$search_product_platform);
				break;
				case "holomodels":
				case "holomodelsdlc":
				case "holomodelsedition":
					go("goods_holomodels_list.php?search_product_name=".$product_name."&search_product_name_en=".$search_product_name_en."&search_product_type=".$search_product_type."&search_status=".$search_status."&page=".$page."&search_product_platform=".$search_product_platform);
				break;
			}
		break;
		case "modify":
			$age_limit = filter_input(INPUT_POST, 'age_limit', FILTER_SANITIZE_STRING);
			$game_rate_text = filter_input(INPUT_POST, 'game_rate_text', FILTER_SANITIZE_STRING);
		
			$query="update tbl_goods_item set product_name=:product_name,product_name_en=:product_name_en,keyword=:keyword,product_platform=:product_platform,steam_appid=:steam_appid,packageid=:packageid,bundleid=:bundleid,option_type=:option_type,game_type=:game_type,display_type=:display_type,bundle_type=:bundle_type,spoken_korean=:spoken_korean,interface_korean=:interface_korean,exclusive_korean=:exclusive_korean,subtitle_korean=:subtitle_korean,goods_sku=:goods_sku,model_code=:model_code,model_name=:model_name,publisher=:publisher,age_limit=:age_limit,game_rate=:game_rate,update_date=now() where product_code=:product_code";
			$param = array(
				":product_name"=>$product_name,
				":product_name_en"=>$product_name_en,
				":keyword"=>$keyword,
				":product_platform"=>$product_platform,
				":steam_appid"=>$steam_appid,
				":packageid"=>$packageid,
				":bundleid"=>$bundleid,
				":option_type"=>$option_type,
				":game_type"=>$game_type,
				":display_type"=>$display_type,
				":bundle_type"=>$bundle_type,
				":spoken_korean"=>$spoken_korean,
				":interface_korean"=>$interface_korean,
				":exclusive_korean"=>$exclusive_korean,
				":subtitle_korean"=>$subtitle_korean,
				":goods_sku"=>$goods_sku,
				":model_code"=>$model_code,
				":model_name"=>$model_name,
				":publisher"=>$publisher,
				":age_limit"=>$age_limit,
				":game_rate"=>str_pad($game_rate_text,7,'0',STR_PAD_LEFT ),
				":product_code"=>$product_code,
			);
			$stmt = $conn->prepare($query);
			//print_r($param);
			$stmt->execute($param);
			
			go("goods_option_modify.php?product_code=".$product_code);
		break;
		case "sales_config":
			$search_supplier_code = filter_input(INPUT_POST, 'search_supplier_code', FILTER_SANITIZE_STRING);
			$status = filter_input(INPUT_POST, 'status', FILTER_SANITIZE_STRING);
			$purchase_limit_yn = filter_input(INPUT_POST, 'purchase_limit_yn', FILTER_SANITIZE_STRING);
			$purchase_limit = filter_input(INPUT_POST, 'purchase_limit', FILTER_SANITIZE_STRING);
			$start_date = filter_input(INPUT_POST, 'start_date', FILTER_SANITIZE_STRING);
			$end_date = filter_input(INPUT_POST, 'end_date', FILTER_SANITIZE_STRING);
			$release_date = filter_input(INPUT_POST, 'release_date', FILTER_SANITIZE_STRING);
			$delivery_date = filter_input(INPUT_POST, 'delivery_date', FILTER_SANITIZE_STRING);
			$delivery_type = filter_input(INPUT_POST, 'delivery_type', FILTER_SANITIZE_STRING);
			$is_bonus = filter_input(INPUT_POST, 'is_bonus', FILTER_SANITIZE_STRING);
			$is_preorder = filter_input(INPUT_POST, 'is_preorder', FILTER_SANITIZE_STRING);

			$soldout = filter_input(INPUT_POST, 'soldout', FILTER_SANITIZE_STRING);
			$is_naverpay_coupon = filter_input(INPUT_POST, 'is_naverpay_coupon', FILTER_SANITIZE_STRING);
			$is_auth = filter_input(INPUT_POST, 'is_auth', FILTER_SANITIZE_STRING);

			$referer = filter_input(INPUT_POST, 'referer', FILTER_SANITIZE_STRING);

			if($status=="3"){
				$is_view='N';
			}

			if($status=="0"){
				$is_view='Y';
			}

			if($start_date==""){
				$start_date="0000-00-00 00:00:00";
			}

			if($end_date==""){
				$end_date="0000-00-00 00:00:00";
			}

			if($preorder_start==""){
				$preorder_start="0000-00-00 00:00:00";
			}

			if($preorder_end==""){
				$preorder_end="0000-00-00 00:00:00";
			}
			

			$query="update tbl_goods_item set is_view=:is_view,status=:status,purchase_limit_yn=:purchase_limit_yn,purchase_limit=:purchase_limit,start_date=:start_date,end_date=:end_date,soldout=:soldout,release_date=:release_date,delivery_date=:delivery_date ,is_bonus=:is_bonus,delivery_type=:delivery_type,is_preorder=:is_preorder,is_naverpay_coupon=:is_naverpay_coupon,is_auth=:is_auth where product_code=:product_code";
			$param = array(
				":is_view"=>$is_view,
				":status"=>$status,
				":purchase_limit_yn"=>$purchase_limit_yn,
				":purchase_limit"=>$purchase_limit,
				":release_date"=>$release_date,
				":start_date"=>strtotime($start_date),
				":end_date"=>strtotime($end_date),
				":soldout"=>$soldout,
				":delivery_date"=>strtotime($delivery_date),
				":is_bonus"=>$is_bonus,
				":delivery_type"=>$delivery_type,
				":is_preorder"=>$is_preorder,
				":is_naverpay_coupon"=>$is_naverpay_coupon,
				":is_auth"=>$is_auth,
				":product_code"=>$product_code,
			);
			$stmt = $conn->prepare($query);
			print_r($param);
			$stmt->execute($param);
			
			//if($soldout=="Y"){
				$logger->info($_SESSION['admin']["admin_id"]);
				$logger->info($params);
			//}

			go("goods_option_sales_register.php?product_code=".$product_code);
		break;
		case "description_save": //옵션상품 상세설명 저장
			$description = filter_input(INPUT_POST, 'description', FILTER_SANITIZE_STRING);

			$adminGoods->setGoodsItemDescription($product_code, 'description', $description);
			print_r(array(":description"=>$description, ":product_code"=>$product_code));
		break;
		case "description_save2": //옵션상품 게임정보 저장 (스마트에디터)
			$description_v2 = filter_input(INPUT_POST, 'description_v2', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

			$adminGoods->setGoodsItemDescription($product_code, 'description_v2', $description_v2);
			print_r(array(":description_v2"=>$description_v2, ":product_code"=>$product_code));
		break;
		case "short_description_save": //옵션상품 짧은설명 저장
			$short_description = filter_input(INPUT_POST, 'short_description', FILTER_SANITIZE_STRING);
			$adminGoods->setGoodsItemDescription($product_code, 'short_description', $short_description);
			print_r(array(":short_description"=>$short_description, ":product_code"=>$product_code));
		break;
		
		case "region_msg_save": //옵션상품 지역제한 안내문구 저장
			$region_msg = filter_input(INPUT_POST, 'region_msg', FILTER_SANITIZE_STRING);
			$adminGoods->setGoodsItemDescription($product_code, 'region_msg', $region_msg);
			print_r(array(":region_msg"=>$region_msg, ":product_code"=>$product_code));
		break;

		case "requirements_save": //시스템 요구사항 저장
			$requirements = filter_input(INPUT_POST, 'requirements', FILTER_SANITIZE_STRING);
			$adminGoods->setGoodsItemDescription($product_code, 'requirements', $requirements);
			print_r(array(":requirements"=>$requirements, ":product_code"=>$product_code));
		break;

		case "legal_text_save": //법적문구 저장
			$legal_text = filter_input(INPUT_POST, 'legal_text', FILTER_SANITIZE_STRING);
			$adminGoods->setGoodsItemDescription($product_code, 'legal_text', $legal_text);
			print_r(array(":legal_text"=>$legal_text, ":product_code"=>$product_code));
		break;

		//구매특전 검색
		case "special_search":
			$special_type = filter_input(INPUT_POST, 'special_type', FILTER_SANITIZE_STRING);
			$search_special = filter_input(INPUT_POST, 'search_special', FILTER_SANITIZE_STRING);

			switch($special_type){
				case "1": //별도key 제공
					if($search_special<>""){
						$asset= new Asset($conn);
						$result = $asset->runAssetDetail($search_special);

						$data = json_decode($result);

						switch($data->productType){
							case "기본게임":
								$asset_type="Game";
							break;
							case "DLC":
								$asset_type="DLC";
							break;
							case "스탠드얼론":
								$asset_type="DLC";
							break;
							case "번들":
								$asset_type="Package";
							break;
							case "특전":
								$asset_type="구매특전";
							break;
						}

						if($data->id==""){
							echo "<tr><td colspan='5' class='text-center'>검색된 결과가 없습니다.</td></tr>";
						}else{
							echo "<tr>";
							echo "<td><input type='text' name='special_type[]' class='form-control' value='".$special_type."' placeholder=''></td>";
							echo "<td><input type='text' name='asset_id[]' class='form-control' value='".$data->id."' placeholder=''></td>";
							echo "<td><input type='text' class='form-control' name='asset_paltform[]' value='".$data->platform."' placeholder='' /></td>";
							echo '<td><input type="text" class="form-control" name="asset_name[]" value="'.$data->name.'"/></td>';
							echo "<td><button class='btn btn-outline-secondary btn_special_add' type='button'>구매특전 추가</button></td>";
							echo "</tr>";
						}
					}
				break;
				case "2"://특전key 포함
					$data = $admin->getGoodsSpecialSearch($search_special);
					print_r($data);
					echo "<tr>";
					echo "<td><input type='text' name='special_type[]' class='form-control' value='".$data['special_type']."' placeholder=''></td>";
					echo "<td><input type='text' name='asset_id[]' class='form-control' value='".$data['asset_id']."' placeholder=''></td>";
					echo "<td><input type='text' class='form-control' name='asset_paltform[]' value='".$data['asset_id']."' placeholder='' /></td>";
					echo '<td><input type="text" class="form-control" name="asset_name[]" value="'.$data['asset_id'].'"/></td>';
					echo "<td><button class='btn btn-outline-secondary btn_special_add' type='button'>구매특전 추가</button></td>";
					echo "</tr>";
				break;
				case "3"://다운로드컨텐츠
					$special_type = filter_input(INPUT_POST, 'special_type', FILTER_SANITIZE_STRING);
					$search_special = filter_input(INPUT_POST, 'search_special', FILTER_SANITIZE_STRING);
				break;
			}
		break;
		//Asset구성 검색
		case "asset_search":
			$order_system = filter_input(INPUT_POST, 'order_system', FILTER_SANITIZE_STRING);
			$search_value = filter_input(INPUT_POST, 'search_value', FILTER_SANITIZE_STRING);

			if($search_value<>""){
				$asset= new Asset($conn);
				$result = $asset->runAssetDetail($search_value);

				$data = json_decode($result);
				
				//상세 응답 이름 필드는 title (asset.md 1.5), name 폴백
				$asset_name_val = isset($data->title) ? $data->title : ($data->name ?? '');
				//tbl_asset 동기화는 검색이 아니라 'Asset 추가'(case asset_add) 시점에 수행

				switch($data->productType){
					case "기본게임":
						$asset_type="기본게임";
					break;
					case "DLC":
						$asset_type="DLC";
					break;
					case "스탠드얼론":
						$asset_type="스탠드얼론";
					break;
					case "번들":
						$asset_type="번들";
					break;
					case "특전":
						$asset_type="특전";
					break;
				}
				
				if($data->id==""){
					echo "<tr><td colspan='3' class='text-center'>검색된 결과가 없습니다.</td></tr>";
				}else{
					echo "<tr>";
					echo "<td><input type='text' class='form-control form-control-sm' name='asset_platform[]' value='".$data->platform."'  /></td>";
					echo "<td><input type='text' class='form-control form-control-sm' name='asset_type[]' value='".$data->productType."'/></td>";
					echo "<td><input type='text' class='form-control form-control-sm' name='asset_id[]' value='".$data->id."' ></td>";
					echo '<td><input type="text" class="form-control form-control-sm" name="asset_name[]" value="'.$asset_name_val.'"/></td>';
					echo '<td><input type="text" class="form-control form-control-sm" name="asset_publisher[]" value="'.$data->publisher.'"/></td>';
if(!$product_viewer){
					echo "<td><button class='btn btn-sm btn-outline-secondary btn_asset_add' type='button'>Asset 추가</button></td>";
}
					echo "</tr>";
				}
			}
		break;
		
		//Asset구성 추가
		case "asset_add":
			$asset_id = filter_input(INPUT_POST, 'asset_id', FILTER_SANITIZE_STRING);
			$asset_name = filter_input(INPUT_POST, 'asset_name', FILTER_SANITIZE_STRING);
			$asset_type = filter_input(INPUT_POST, 'asset_type', FILTER_SANITIZE_STRING);
			$asset_platform = filter_input(INPUT_POST, 'asset_platform', FILTER_SANITIZE_STRING);
			$order_system = filter_input(INPUT_POST, 'order_system', FILTER_SANITIZE_STRING);
			$asset_publisher = filter_input(INPUT_POST, 'asset_publisher', FILTER_SANITIZE_STRING);

			print_r($_POST);

			//Asset 추가 시점에 tbl_asset 동기화 — 서버 상세(runAssetDetail) 기준 권위 데이터로 INSERT/갱신
			$asset = new Asset($conn);
			$asset_detail = json_decode($asset->runAssetDetail($asset_id));
			$adminAsset->upsertAsset($asset_detail);

			$adminGoods->setGoodsOptionDeliveryItem($product_code,$asset_platform,$asset_id,$asset_name,$asset_publisher,$order_system,$asset_type);
			
			
		break;
		
		//배송아이템 삭제
		case "delivery_item_delete":
			$item_id = filter_input(INPUT_POST, 'item_id', FILTER_SANITIZE_STRING);
			$order_system = filter_input(INPUT_POST, 'order_system', FILTER_SANITIZE_STRING);
			
			$query="delete from tbl_goods_item_delivery where product_code=:product_code and item_id=:item_id and order_system=:order_system";
			$param = array(
				":product_code"=>$product_code,
				":item_id"=>$item_id,
				":order_system"=>$order_system,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;

		//Ztorm 카탈로그 조회
		case "ztorm_search":
			$order_system = filter_input(INPUT_POST, 'order_system', FILTER_SANITIZE_STRING);
			$search_value = filter_input(INPUT_POST, 'search_value', FILTER_SANITIZE_STRING);

			if($search_value<>""){
				$ztorm = new Ztorm();

				$params = array(
					"ProductID"=>$search_value
				);
				
				$result = $ztorm->runGetProduct($params);

				//print_r($result->Value->Product);
				//exit;
				
				if($result->Value->Product->ID==""){
					echo "<tr><td colspan='3' class='text-center'>검색된 결과가 없습니다.</td></tr>";
				}else{
					echo "<tr>";
					echo "<td><input type='text' class='form-control form-control-sm' name='item_platform[]' value='".$result->Value->Product->Providers->Provider->Name."'  /></td>";
					echo "<td><input type='text' class='form-control form-control-sm' name='item_type[]' value='".$result->Value->Product->CategoryName."'/></td>";
					echo "<td><input type='text' class='form-control form-control-sm' name='item_id[]' value='".$result->Value->Product->ID."' ></td>";
					echo '<td><input type="text" class="form-control form-control-sm" name="item_name[]" value="'.$result->Value->Product->Name.'"/></td>';
					echo '<td><input type="hidden" class="form-control form-control-sm" name="item_publisher[]" value="'.$result->Value->Product->PublisherName.'"><input type="text" class="form-control form-control-sm" name="providers_channel[]" value="'.$result->Value->Product->Providers->Provider->Channel.'"/></td>';
if(!$product_viewer){
					echo "<td><button class='btn btn-sm btn-outline-secondary btn_ztorm_add' type='button'>Ztorm 추가</button></td>";
}
					echo "</tr>";
				}
			}
		break;

		//Ztorm구성 추가
		case "ztorm_add":
			$item_platform = filter_input(INPUT_POST, 'item_platform', FILTER_SANITIZE_STRING);
			$item_type = filter_input(INPUT_POST, 'item_type', FILTER_SANITIZE_STRING);
			$item_id = filter_input(INPUT_POST, 'item_id', FILTER_SANITIZE_STRING);
			$item_name = filter_input(INPUT_POST, 'item_name', FILTER_SANITIZE_STRING);
			$providers_channel = filter_input(INPUT_POST, 'providers_channel', FILTER_SANITIZE_STRING);
			$item_publisher = filter_input(INPUT_POST, 'item_publisher', FILTER_SANITIZE_STRING);
			$order_system = filter_input(INPUT_POST, 'order_system', FILTER_SANITIZE_STRING);

			print_r($_POST);

			//$admin->setGoodsOptionDeliveryZtorm($product_code,$item_platform,$item_type,$item_id,$item_name,$providers_channel,$order_system);
			$adminGoods->setGoodsOptionDeliveryItem($product_code,$item_platform,$item_id,$item_name,$item_publisher,$order_system,$item_type);
		break;

		//Genba 카탈로그 조회
		case "genba_search":
			$sku = filter_input(INPUT_POST, 'sku', FILTER_SANITIZE_STRING);
			$genba_product = $adminGoods->searchGenbaProduct($sku);
			echo "<tr>";
			echo "<td><input type='text' class='form-control form-control-sm' name='item_platform[]' value='".$genba_product['ProtectionSystem']."'  /></td>";
			echo "<td><input type='text' class='form-control form-control-sm' name='item_id[]' value='".$genba_product['Sku']."' ></td>";
			echo '<td><input type="text" class="form-control form-control-sm" name="item_name[]" value="'.$genba_product['Name'].'"/></td>';
			echo '<td><input type="text" class="form-control form-control-sm" name="item_publisher[]" value="'.$genba_product['Publisher'].'"/></td>';
if(!$product_viewer){
			echo "<td><button class='btn btn-sm btn-outline-secondary btn_genba_add' type='button'>Genba 추가</button></td>";
}
			echo "</tr>";
		break;
		
		//Genba 구성추가
		case "genba_add":
			$item_platform = filter_input(INPUT_POST, 'item_platform', FILTER_SANITIZE_STRING);
			$item_id = filter_input(INPUT_POST, 'item_id', FILTER_SANITIZE_STRING);
			$item_name = filter_input(INPUT_POST, 'item_name', FILTER_SANITIZE_STRING);
			$item_publisher = filter_input(INPUT_POST, 'item_publisher', FILTER_SANITIZE_STRING);
			$order_system = filter_input(INPUT_POST, 'order_system', FILTER_SANITIZE_STRING);
			print_r($_POST);
			
			$adminGoods->setGoodsOptionDeliveryItem($product_code,$item_platform,$item_id,$item_name,$item_publisher,$order_system,$item_type);
		break;
		
		//Vaultn 카탈로그 조회
		case "vaultn_search":
			$sku = filter_input(INPUT_POST, 'sku', FILTER_SANITIZE_STRING);
			$vaultn_product = $adminGoods->searchVaultnProduct($sku);
			echo "<tr>";
			echo "<td><input type='hidden' class='form-control form-control-sm' name='item_type[]' value='".$vaultn_product['productType']."'><input type='text' class='form-control form-control-sm' name='item_platform[]' value='".$vaultn_product['provider']."'  /></td>";
			echo "<td><input type='text' class='form-control form-control-sm' name='item_id[]' value='".$vaultn_product['sku']."' ></td>";
			echo '<td><input type="text" class="form-control form-control-sm" name="item_name[]" value="'.$vaultn_product['title'].'"/></td>';
			echo '<td><input type="text" class="form-control form-control-sm" name="item_publisher[]" value="'.$vaultn_product['publisher'].'"/></td>';
if(!$product_viewer){
			echo "<td><button class='btn btn-sm btn-outline-secondary btn_vaultn_add' type='button'>Vaultn 추가</button></td>";
}
			echo "</tr>";
		break;
		
		case "vaultn_add":
			$item_platform = filter_input(INPUT_POST, 'item_platform', FILTER_SANITIZE_STRING);
			$item_id = filter_input(INPUT_POST, 'item_id', FILTER_SANITIZE_STRING);
			$item_name = filter_input(INPUT_POST, 'item_name', FILTER_SANITIZE_STRING);
			$item_publisher = filter_input(INPUT_POST, 'item_publisher', FILTER_SANITIZE_STRING);
			$item_type = filter_input(INPUT_POST, 'item_type', FILTER_SANITIZE_STRING);
			$order_system = filter_input(INPUT_POST, 'order_system', FILTER_SANITIZE_STRING);
			print_r($_POST);

			$adminGoods->setGoodsOptionDeliveryItem($product_code,$item_platform,$item_id,$item_name,$item_publisher,$order_system,$item_type);
		break;

		//PointNexus 카탈로그 조회
		case "pointnexus_search":
			$productID = filter_input(INPUT_POST, 'productID', FILTER_SANITIZE_STRING);
			$pn_mode   = filter_input(INPUT_POST, 'pn_mode', FILTER_SANITIZE_STRING);
			$pn_product = $adminGoods->searchPointNexusProduct($productID, $pn_mode);

			if(!$pn_product){
				echo "<tr><td colspan='6' class='text-center text-muted'>해당 productID를 ".htmlspecialchars($pn_mode)." 모드 카탈로그에서 찾을 수 없습니다. (먼저 동기화가 필요할 수 있습니다)</td></tr>";
				break;
			}

			echo "<tr>";
			echo "<td><input type='hidden' class='form-control form-control-sm' name='item_type[]' value='".htmlspecialchars($pn_product['type'])."'><input type='text' class='form-control form-control-sm' name='item_platform[]' value='".htmlspecialchars($pn_product['platform'])."' /></td>";
			echo "<td><input type='text' class='form-control form-control-sm' name='item_id[]' value='".htmlspecialchars($pn_product['productID'])."' ></td>";
			echo "<td><input type='text' class='form-control form-control-sm' name='item_name[]' value=\"".htmlspecialchars($pn_product['genericName'], ENT_QUOTES)."\"/></td>";
			echo "<td><input type='text' class='form-control form-control-sm' name='item_publisher[]' value=\"".htmlspecialchars($pn_product['publisher'], ENT_QUOTES)."\"/></td>";
			echo "<td class='text-center'>".htmlspecialchars($pn_product['type'])."</td>";
if(!$product_viewer){
			echo "<td><button class='btn btn-sm btn-outline-secondary btn_pointnexus_add' type='button'>PointNexus 추가</button></td>";
}
			echo "</tr>";
		break;

		//PointNexus 구성추가
		case "pointnexus_add":
			$item_platform  = filter_input(INPUT_POST, 'item_platform', FILTER_SANITIZE_STRING);
			$item_id        = filter_input(INPUT_POST, 'item_id', FILTER_SANITIZE_STRING);
			$item_name      = filter_input(INPUT_POST, 'item_name', FILTER_SANITIZE_STRING);
			$item_publisher = filter_input(INPUT_POST, 'item_publisher', FILTER_SANITIZE_STRING);
			$item_type      = filter_input(INPUT_POST, 'item_type', FILTER_SANITIZE_STRING);
			$order_system   = filter_input(INPUT_POST, 'order_system', FILTER_SANITIZE_STRING);
			print_r($_POST);

			$adminGoods->setGoodsOptionDeliveryItem($product_code,$item_platform,$item_id,$item_name,$item_publisher,$order_system,$item_type);
		break;

		//번들구성 삭제
		case "bundle_delete":
			$bndl_no = filter_input(INPUT_POST, 'bndl_no', FILTER_SANITIZE_STRING);
			$admin->setGoodsItemBundleDelete($bndl_no);
		break;

		//대표상품검색
		case "title_search":
			$search_value = filter_input(INPUT_POST, 'search_value', FILTER_SANITIZE_STRING);
			$title_list = $adminGoods->getTitlteSearch($search_value);

			foreach($title_list as $value){
				echo "<tr class='font-13'>";
				echo "<td class='text-center'><input type='hidden' name='title_id[]' value=".$value['title_id'].">".$value['title_id']."</td>";
				echo "<td class='text-start'>".$value['title_name']."<br/>(".$value['title_name_en'].")</td>";
				echo "<td class='text-center'>".$value['publisher']."</td>";
				echo "<td class='text-center'><button class='btn btn-outline-secondary btn_title_add' type='button'>설정완료</button></td>";
				echo "</tr>";
			}
		break;

		//대표상품설정
		case "title_add":
			$title_id = filter_input(INPUT_POST, 'title_id', FILTER_SANITIZE_STRING);
			$game_type = filter_input(INPUT_POST, 'game_type', FILTER_SANITIZE_STRING);
			$bundle_type = filter_input(INPUT_POST, 'bundle_type', FILTER_SANITIZE_STRING);
			$adminGoods->setTitleAdd($product_code,$title_id,$game_type,$bundle_type);
		break;

		//패키지 구성 삭제
		case "package_delete":
			$package_no = filter_input(INPUT_POST, 'package_no', FILTER_SANITIZE_STRING);
			$admin->setGoodsItemPackageDelete($package_no);
		break;

		//패키지목록조회
		case "package_list":
			$package_list = $admin->getGoodsOptionPackageList($product_code);
			foreach($package_list as $value){
				switch($value['item_type']){
					case "1":
						$item_type="Game";
					break;
					case "2":
						$item_type="DLC";
					break;
				}
				echo "<tr>";
				echo "<td class='text-center'>".$value['appid']."</td>";
				echo "<td class='text-center'>".$item_type."</td>";
				echo "<td>".$value['item_name']."</td>";
				echo "</tr>";
			}
		break;

		//번들목록조회
		case "bundle_list":
			$bundle_list = $admin->getGoodsItemBundle($product_code);
			foreach($bundle_list as $value){
				switch($value['asset_type']){
					case "1":
						$asset_type="Game";
					break;
					case "2":
						$asset_type="DLC";
					break;
					case "3":
						$asset_type="Package";
					break;
				}
				echo "<tr>";
				echo "<td class='text-center'>".$value['asset_id']."</td>";
				echo "<td class='text-center'>".$asset_type."</td>";
				echo "<td class='text-center'>".$value['asset_platform']."</td>";
				echo "<td>".$value['asset_name']."</td>";
				echo "</tr>";
			}
		break;
		
		//가격정보 저장
		case "price_save":
			$consumer_price = filter_input(INPUT_POST, 'consumer_price', FILTER_SANITIZE_STRING);
			$price = filter_input(INPUT_POST, 'price', FILTER_SANITIZE_STRING);
			$product_ppr = filter_input(INPUT_POST, 'product_ppr', FILTER_SANITIZE_STRING);
			$discount = round(($consumer_price-$price)/$consumer_price*100);
			$query="update tbl_goods_item set consumer_price=:consumer_price,price=:price,discount=:discount where product_code=:product_code";
			$param = array(
				":consumer_price"=>$consumer_price,
				":price"=>$price,
				":discount"=>$discount,
				":product_code"=>$product_code,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);

			go("goods_option_sales_register.php?product_code=".$product_code);
		break;

		//공급처정보 저장
		case "supplier_save":
			$supplier_code = filter_input(INPUT_POST, 'supplier_code', FILTER_SANITIZE_STRING);
			$product_srp = filter_input(INPUT_POST, 'product_srp', FILTER_SANITIZE_STRING);
			$product_ppr = filter_input(INPUT_POST, 'product_ppr', FILTER_SANITIZE_STRING);
			$product_rs = filter_input(INPUT_POST, 'product_rs', FILTER_SANITIZE_STRING);

			$query="update tbl_goods_item set supplier_code=:supplier_code,product_srp=:product_srp,product_ppr=:product_ppr,product_rs=:product_rs where product_code=:product_code";
			$param = array(
				":supplier_code"=>$supplier_code,
				":product_srp"=>$product_srp,
				":product_ppr"=>$product_ppr,
				":product_rs"=>$product_rs,
				":product_code"=>$product_code,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);

			go("goods_option_sales_register.php?product_code=".$product_code);
		break;

		//sku생성
		case "make_sku":
			$goods_sku = $admin->uuidgen4();
			$query="update tbl_goods_item set goods_sku=:goods_sku where product_code=:product_code";
			$param = array(
				":goods_sku"=>$goods_sku,
				":product_code"=>$product_code,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
		case "header_upload": // header (460x215) 업로드

			$header_path = $_SERVER['DOCUMENT_ROOT'].'/upload/product/'.$product_code."/header";
			
			if(!is_dir($header_path)){
				$oldumask = umask(0);
				mkdir($header_path, 0777,true);
				//chmod($header_path,0777);
				umask($oldumask);
			}

			if($_FILES['header_img']['size']>1000000){
				msg("옵션상품 이미지의 크기는 최대 1MB를 초과하실수 없습니다.",-1);
				exit;
			}

			$header_img_name = "header.jpg";

			$file_path = $header_path."/".$header_img_name;

			if($header_img_name){
				move_uploaded_file($_FILES['header_img']['tmp_name'], $file_path);
			}
			
			if($appid>0){
				$adminGoods->setSteamImageChk($appid, 'is_header', '200');
			}
		break;
		case "capsule_upload": // capsule (231x87) 업로드
		///upload/title/'.$value['title_id']."/capsule/capsule_231x87.jpg
			$capsule_path = $_SERVER['DOCUMENT_ROOT'].'/upload/product/'.$product_code.'/capsule/';
			if(!file_exists($capsule_path)){
				mkdir($capsule_path, '0777',true);
			}

			print_r($_FILES);

			if($_FILES['capsule_img']['size']>1000000){
				msg("옵션상품 이미지의 크기는 최대 1MB를 초과하실수 없습니다.",-1);
				exit;
			}

			$capsule_img_name = "capsule_231x87.jpg";

			$file_path = $capsule_path."/".$capsule_img_name;

			if($capsule_img_name){
				move_uploaded_file($_FILES['capsule_img']['tmp_name'], $file_path);
			}

			if($appid>0){
				$adminGoods->setSteamImageChk($appid, 'is_capsule_231', '200');
			}
		break;
		case "preorder_config": //예약구매설정
			$preorder_start_date = filter_input(INPUT_POST, 'preorder_start_date', FILTER_SANITIZE_STRING);
			$preorder_end_date = filter_input(INPUT_POST, 'preorder_end_date', FILTER_SANITIZE_STRING);

			$query="update tbl_goods_item set preorder_start=:preorder_start,preorder_end=:preorder_end where product_code=:product_code";
			$param = array(
				":preorder_start"=>strtotime($preorder_start_date),
				":preorder_end"=>strtotime($preorder_end_date),
				":product_code"=>$product_code,
			);
			$stmt = $conn->prepare($query);
			print_r($param);
			$stmt->execute($param);

			go("goods_option_sales_register.php?product_code=".$product_code);
		break;
		
		case "bonus_search"://특전정보 검색
			$search_value = filter_input(INPUT_POST, 'search_value', FILTER_SANITIZE_STRING);
			$bonus_list = $adminGoods->getBonusSearch($search_value);

			foreach($bonus_list as $value){
				switch($value['bonus_delivery_type']){
					case "1":
						$bonus_delivery_type = "특전키 포함";
					break;
					case "2":
						$bonus_delivery_type = "별도키 제공";
					break;
				}
				echo "<tr class='font-13'>";
				echo "<td class='text-start'><input type='hidden' name='bonus_no[]' value=".$value['bonus_no'].">".$value['bonus_name']."</td>";
				echo "<td class='text-center'>".$bonus_delivery_type."</td>";
				echo "<td class='text-center'>".$value['is_bonus']."</td>";
				echo "<td class='text-center'><button class='btn btn-sm btn-outline-secondary btn_goods_bonus_add' type='button'>특전제공 설정완료</button></td>";
				echo "</tr>";
			}
		break;
		case "bonus_config": //특전제공설정
			$is_bonus = filter_input(INPUT_POST, 'is_bonus', FILTER_SANITIZE_STRING);
			$bonus_no = filter_input(INPUT_POST, 'bonus_no', FILTER_SANITIZE_STRING);
			$goods_sku = filter_input(INPUT_POST, 'goods_sku', FILTER_SANITIZE_STRING);
			$bonus_start_date = filter_input(INPUT_POST, 'bonus_start_date', FILTER_SANITIZE_STRING);
			$bonus_end_date = filter_input(INPUT_POST, 'bonus_end_date', FILTER_SANITIZE_STRING);
			$pre_delivery = filter_input(INPUT_POST, 'pre_delivery', FILTER_SANITIZE_STRING);
			$pre_delivery_date = filter_input(INPUT_POST, 'pre_delivery_date', FILTER_SANITIZE_STRING);

			if($pre_delivery_date==""){
				$pre_delivery_date = 0;
			}

			$query = "insert into tbl_goods_bonus set product_code=:product_code,product_sku=:product_sku,bonus_no=:bonus_no,bonus_start_date=:bonus_start_date,bonus_end_date=:bonus_end_date,pre_delivery=:pre_delivery,pre_delivery_date=:pre_delivery_date ON DUPLICATE KEY UPDATE bonus_start_date=:bonus_start_date,bonus_end_date=:bonus_end_date,pre_delivery=:pre_delivery,pre_delivery_date=:pre_delivery_date";
			$stmt = $conn->prepare($query);
			$param = array(
				":product_code"=>$product_code,
				":product_sku"=>$goods_sku,
				":bonus_no"=>$bonus_no,
				":bonus_start_date"=>strtotime($bonus_start_date),
				":bonus_end_date"=>strtotime($bonus_end_date),
				":pre_delivery"=>$pre_delivery,
				":pre_delivery_date"=>$pre_delivery_date,
			);
			$stmt->execute($param);

			//특전 제공기간이 유효할경우 is_bonus Y

			go("goods_option_sales_register.php?product_code=".$product_code);
		break;

		//특전제공설정 삭제
		case "bonus_delete":
			$query="delete from tbl_goods_bonus where product_code=:product_code";
			$stmt = $conn->prepare($query);
			$param = array(
				":product_code"=>$product_code,
			);
			$stmt->execute($param);
		break;
		
		case "timedeal_config": //옵션상품 타임딜 설정
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$timedeal_status = filter_input(INPUT_POST, 'timedeal_status', FILTER_SANITIZE_STRING);
			$timedeal_start = filter_input(INPUT_POST, 'timedeal_start_date', FILTER_SANITIZE_STRING);
			$timedeal_end = filter_input(INPUT_POST, 'timedeal_end_date', FILTER_SANITIZE_STRING);
			$timedeal_stock = filter_input(INPUT_POST, 'timedeal_stock', FILTER_SANITIZE_STRING);
			$timedeal_srp = filter_input(INPUT_POST, 'product_srp', FILTER_SANITIZE_STRING);
			$timedeal_ppr = filter_input(INPUT_POST, 'product_ppr', FILTER_SANITIZE_STRING);
			$timedeal_price = filter_input(INPUT_POST, 'timedeal_price', FILTER_SANITIZE_STRING);

			$query = "insert into tbl_timedeal set product_code=:product_code,timedeal_status=:timedeal_status,timedeal_start=:timedeal_start,timedeal_end=:timedeal_end,timedeal_stock=:timedeal_stock,timedeal_srp=:timedeal_srp,timedeal_ppr=:timedeal_ppr,timedeal_price=:timedeal_price";
			$stmt = $conn->prepare($query);
			$param = array(
				":product_code"=>$product_code,
				":timedeal_status"=>$timedeal_status,
				":timedeal_start"=>strtotime($timedeal_start),
				":timedeal_end"=>strtotime($timedeal_end),
				":timedeal_stock"=>$timedeal_stock,
				":timedeal_srp"=>$timedeal_srp,
				":timedeal_ppr"=>$timedeal_ppr,
				":timedeal_price"=>$timedeal_price,
			);

			$stmt->execute($param);
			go("timedeal_register.php?product_code=".$product_code);
		break;
		
		//구매시 포인트 지급여부 설정
		case "repay_config":
			$is_repay = filter_input(INPUT_POST, 'is_repay', FILTER_SANITIZE_STRING);
			$query="update tbl_goods_item set is_repay=:is_repay where product_code=:product_code";
			$stmt = $conn->prepare($query);
			$param = array(
				":is_repay"=>$is_repay,
				":product_code"=>$product_code,
			);
			$stmt->execute($param);
			
			go("goods_option_repay_register.php?product_code=".$product_code);
		break;

		//추가 적립금 설정
		case "add_repay_config":
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$start_dt = filter_input(INPUT_POST, 'start_dt', FILTER_SANITIZE_STRING);
			$end_dt = filter_input(INPUT_POST, 'end_dt', FILTER_SANITIZE_STRING);
			$add_repay = filter_input(INPUT_POST, 'add_repay', FILTER_SANITIZE_STRING);
			$repay_type = filter_input(INPUT_POST, 'repay_type', FILTER_SANITIZE_STRING);

			$query = "insert into tbl_add_repay set product_code=:product_code,start_dt=:start_dt,end_dt=:end_dt,repay_point=:repay_point,repay_type=:repay_type,reg_date=now()";
			$stmt = $conn->prepare($query);
			$param = array(
				":product_code"=>$product_code,
				":start_dt"=>date('Y-m-d H:i:s',strtotime($start_dt)),
				":end_dt"=>date('Y-m-d H:i:s',strtotime($end_dt)),
				":repay_point"=>$add_repay,
				":repay_type"=>$repay_type,
			);
			
			//print_r($param);

			$stmt->execute($param);
			go("goods_option_repay_register.php?product_code=".$product_code);
		break;
		
		//옵션상품 구성상세 조회
		case "goods_option_search":
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$search_option_code = filter_input(INPUT_POST, 'search_option_code', FILTER_SANITIZE_STRING);
			$option_list = $adminGoods->getGoodsOptionSearch($search_option_code);
			
			switch($option_list['game_type']){
				case "game":
					$unit_type ="1";
				break;
				case "dlc":
					$unit_type ="2";
				break;
				case "music":
					$unit_type ="3";
				break;
			}
			
			switch($option_list['product_platform']){
				case "1":
					$product_name = $option_list['product_name']. " (스팀)";
				break;
				case "34":
					$product_name = $option_list['product_name']. " (에픽게임즈)";
				break;
				default:
					$product_name = $option_list['product_name'];
				break;
			}
			
			echo "<tr>";
			echo "<td class='text-center'><input type='hidden' name='unit_code' value='".$option_list['product_code']."'>".$option_list['product_code']."</td>";
			echo "<td class='text-center'><input type='hidden' name='unit_type' value='".$unit_type."'>".$option_list['game_type']."</td>";
			echo "<td><input type='hidden' name='unit_name' value='".$product_name."'>".$product_name."</td>";
if(!$product_viewer){
			echo "<td class='text-center'><button class='btn btn-sm btn-secondary shadow-none font-12 btn_unit_add' type='button'>구성추가</button></td>";
}
			echo "</tr>";
		break;
		//옵션상품 구성상세 추가
		case "goods_option_unit_add":
			$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
			$unit_type = filter_input(INPUT_POST, 'unit_type', FILTER_SANITIZE_STRING);
			$unit_code = filter_input(INPUT_POST, 'unit_code', FILTER_SANITIZE_STRING);
			$unit_name = filter_input(INPUT_POST, 'unit_name', FILTER_SANITIZE_STRING);

			$query = "insert into tbl_goods_option_bundle set product_code=:product_code,unit_type=:unit_type,unit_code=:unit_code,unit_name=:unit_name";
			$stmt = $conn->prepare($query);
			$param = array(
				":product_code"=>$product_code,
				":unit_type"=>$unit_type,
				":unit_code"=>$unit_code,
				":unit_name"=>$unit_name,
			);

			$stmt->execute($param);
		break;
		//옵션상품 구성상세 삭제
		case "goods_option_unit_delete":
			$unit_idx = filter_input(INPUT_POST, 'unit_idx', FILTER_SANITIZE_STRING);
		
			$query = "delete from tbl_goods_option_bundle where idx=:idx";
			$stmt = $conn->prepare($query);
			$param = array(
				":idx"=>$unit_idx,
			);

			$stmt->execute($param);
		break;
		
		//옵션상품 구성정보 사용여부
		case "package_view_config":
			$is_package_view = filter_input(INPUT_POST, 'is_package_view', FILTER_SANITIZE_STRING);
			$query="update tbl_goods_item set is_package_view=:is_package_view where product_code=:product_code";
			$stmt = $conn->prepare($query);
			$param = array(
				":is_package_view"=>$is_package_view,
				":product_code"=>$product_code,
			);
			$stmt->execute($param);
		break;
		
		//옵션상품 구성정보 특전설명
		case "bonus_description_save":
			$bonus_description = filter_input(INPUT_POST, 'bonus_description', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
			$adminGoods->setGoodsItemDescription($product_code, 'bonus_description', $bonus_description);
		break;
		case "diskn_upload_chk":
			$query="update tbl_goods_item set domain='https://image.directg.net' where product_code=:product_code";
			$stmt = $conn->prepare($query);
			$param = array(
				":product_code"=>$product_code,
			);
			$stmt->execute($param);
			print_r($param);
		break;
		//스크린샷 저장
		case "screenshot_upload":
			$screenshot_img_name = $_FILES['screenshot_img']['name'];
			$num = filter_input(INPUT_POST, 'num', FILTER_SANITIZE_STRING);
		
			$image_path = '/home/dgkrshop/www/upload/screenshot/'.$product_code."/";
			$image_url = '/home/dgkrshop/www/upload/screenshot/'.$product_code.'/'.$screenshot_img_name;
			
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
			
			$thumbnail_path = '/home/dgkrshop/www/upload/screenshot/'.$product_code."/thumbnail/";
			$thumbnail_url = '/home/dgkrshop/www/upload/screenshot/'.$product_code.'/'.$screenshot_img_name;
			
			if(!is_dir($thumbnail_path)){
				$oldumask = umask(0);
				mkdir($thumbnail_path, 0777,true);
				umask($oldumask);
			}
			
			//스크린샷 썸네일 저장
			$admin->resizeImage('120','90','100',$thumbnail_url,$thumbnail_path,$screenshot_img_name);
			
			$query = "insert into tbl_goods_item_screenshot set screenshot_num=:screenshot_num,product_code=:product_code,file_name=:file_name,file_size=:file_size,file_type=:file_type,url=:url,thumbnail=:thumbnail,reg_date=now()";
			$stmt = $conn->prepare($query);
			$params = array(
				':screenshot_num'=>$num,
				':product_code'=>$product_code,
				':file_name'=>$screenshot_img_name,
				':file_size'=>filesize('/home/dgkrshop/www/upload/screenshot/'.$product_code.'/'.$screenshot_img_name),
				':file_type'=>$_FILES['screenshot_img']['type'],
				':url'=>'/upload/screenshot/'.$product_code.'/'.$screenshot_img_name,
				':thumbnail'=>'/upload/screenshot/'.$product_code.'/thumbnail/'.$screenshot_img_name,
			);
			$stmt->execute($params);
		break;
		case "screenshot_sort_up": //스크린샷 순서 위로
			$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_STRING);
			$adminGoods->setScreenshotSort($idx, 'up');
		break;
		case "screenshot_sort_down": //스크린샷 순서 아래로
			$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_STRING);
			
			$adminGoods->setScreenshotSort($idx, 'down');
		break;
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>