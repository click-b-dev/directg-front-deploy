<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header('Content-Type: text/html; charset=UTF-8');

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
$sku = filter_input(INPUT_POST, 'sku', FILTER_SANITIZE_STRING);
$title_name = filter_input(INPUT_POST, 'title_name', FILTER_SANITIZE_SPECIAL_CHARS);
$title_name_en = filter_input(INPUT_POST, 'title_name_en', FILTER_SANITIZE_SPECIAL_CHARS);

$is_view = filter_input(INPUT_POST, 'is_view', FILTER_SANITIZE_STRING);
$release_date = filter_input(INPUT_POST, 'release_date', FILTER_SANITIZE_STRING);

$exclusive_korean = filter_input(INPUT_POST, 'exclusive_korean', FILTER_SANITIZE_STRING);
$interface_korean = filter_input(INPUT_POST, 'interface_korean', FILTER_SANITIZE_STRING);
$spoken_korean = filter_input(INPUT_POST, 'spoken_korean', FILTER_SANITIZE_STRING);

$publisher_code = filter_input(INPUT_POST, 'publisher_code', FILTER_SANITIZE_STRING);
$genre_code = filter_input(INPUT_POST, 'genre_code', FILTER_SANITIZE_STRING);
$game_mode = filter_input(INPUT_POST, 'game_mode', FILTER_SANITIZE_STRING);

//개발사
$developer = filter_input(INPUT_POST, 'developer', FILTER_SANITIZE_STRING);

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

//짧은설명
$short_description = filter_input(INPUT_POST, 'short_description', FILTER_SANITIZE_STRING);
//상세설명
$description = filter_input(INPUT_POST, 'description', FILTER_SANITIZE_STRING);
//게임설명
$about_the_game = filter_input(INPUT_POST, 'about_the_game', FILTER_SANITIZE_STRING);

//시스템요구사항
$requirements = filter_input(INPUT_POST, 'requirements', FILTER_SANITIZE_STRING);

//지역제한 안내문구
$region_msg = filter_input(INPUT_POST, 'region_msg', FILTER_SANITIZE_STRING);

//권리표기
$legal_text = filter_input(INPUT_POST, 'legal_text', FILTER_SANITIZE_STRING);

$steam_appid = filter_input(INPUT_POST, 'steam_appid', FILTER_SANITIZE_STRING);


try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$admin= new Admin($conn);

	switch($mode){
		case "register":
			$query="insert into tbl_goods set title_id=:title_id,title_name=:title_name,title_name_en=:title_name_en,age_limit=:age_limit,is_view=:is_view,release_date=:release_date,developer=:developer,steam_appid=:steam_appid,publisher_code=:publisher_code,game_mode=:game_mode,game_rate=:game_rate,domain=:domain,genre_code=:genre_code,rateno=:rateno,orgname=:orgname,sku=:sku,interface_korean=:interface_korean,spoken_korean=:spoken_korean,exclusive_korean=:exclusive_korean";
			$param = array(
				":title_id"=>$title_id,
				":title_name"=>$title_name,
				":title_name_en"=>$title_name_en,
				":age_limit"=>$age_limit,
				":is_view"=>$is_view,
				":release_date"=>$release_date,
				":developer"=>$developer,
				":steam_appid"=>$steam_appid,
				":publisher_code"=>$publisher_code,
				":game_mode"=>$game_mode,
				":game_rate"=>str_pad($game_rate_text,7,'0',STR_PAD_LEFT ),
				":domain"=>$domain,
				":genre_code"=>$genre_code,
				":rateno"=>$rateno,
				":orgname"=>$orgname,
				":sku"=>$sku,
				":interface_korean"=>$interface_korean,
				":spoken_korean"=>$spoken_korean,
				":exclusive_korean"=>$exclusive_korean,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);

			if($title_mode){
				//go("goods_option_list.php?search_product_type=1");
				if($is_view=="Y"){
					go("goods_list.php?search_title_id=".$title_id);
				}else{
					go("goods_list_end.php?search_title_id=".$title_id);
				}
			}else{
				if($is_view=="Y"){
					go("goods_list.php");
				}else{
					go("goods_list_end.php");
				}
				
			}
			
		break;
		case "modify":
			
			
			//capsule_img_231
			//capsule_img_616
			//library_img
			
			
			//header.jpg 이미지 저장
			if($_FILES['header_img']['tmp_name']){
				//대표상품 header이미지 폴더생성
				$header_path = $_SERVER['DOCUMENT_ROOT'].'/upload/title/'.$title_id."/header";
				if(!file_exists($header_path)){
					mkdir($header_path, '0777',true);
				}

				if($_FILES['header_img']['size']>1000000){
					msg("옵션상품 이미지의 크기는 최대 1MB를 초과하실수 없습니다.",-1);
					exit;
				}

				$header_img_name = $_FILES['header_img']['name'];
				$filename = $title_id.".jpg";

				$header_img_path = $header_path."/".$filename;

				if($header_img_name){
					move_uploaded_file($_FILES['header_img']['tmp_name'], $header_img_path);
				}
			}
			
			//capsule 231 이미지 저장
			if($_FILES['capsule_img_231']['tmp_name']){
				$capsule_img_path = $_SERVER['DOCUMENT_ROOT'].'/upload/title/'.$title_id."/capsule";
				if(!file_exists($capsule_img_path)){
					mkdir($capsule_img_path, '0777',true);
				}

				if($_FILES['capsule_img_231']['size']>1000000){
					msg("옵션상품 이미지의 크기는 최대 1MB를 초과하실수 없습니다.",-1);
					exit;
				}

				$capsule_img_231_name = $_FILES['capsule_img_231']['name'];
				$filename = $title_id.".jpg";

				$capsule_img_231_path = $capsule_img_path."/".$filename;

				if($capsule_img_231_name){
					move_uploaded_file($_FILES['capsule_img_231']['tmp_name'], $capsule_img_231_path);
				}
			}

			if(!$is_view){
				$is_view="N";
			}

			$query="update tbl_goods set title_name=:title_name,title_name_en=:title_name_en,age_limit=:age_limit,is_view=:is_view,release_date=:release_date,developer=:developer,steam_appid=:steam_appid,publisher_code=:publisher_code,game_mode=:game_mode,domain=:domain,game_rate=:game_rate,rateno=:rateno,orgname=:orgname,interface_korean=:interface_korean,spoken_korean=:spoken_korean,exclusive_korean=:exclusive_korean where title_id=:title_id";
			$param = array(
				":title_name"=>$title_name,
				":title_name_en"=>$title_name_en,
				":age_limit"=>$age_limit,
				":is_view"=>$is_view,
				":release_date"=>$release_date,
				":developer"=>$developer,
				":steam_appid"=>$steam_appid,
				":publisher_code"=>$publisher_code,
				":game_mode"=>$game_mode,
				":domain"=>$domain,
				":game_rate"=>str_pad($game_rate_text,7,'0',STR_PAD_LEFT ),
				":rateno"=>$rateno,
				":orgname"=>$orgname,
				":interface_korean"=>$interface_korean,
				":spoken_korean"=>$spoken_korean,
				":exclusive_korean"=>$exclusive_korean,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);;

			if($is_view=="E"){
				go("goods_list.php?page=".$page."&search_is_view=".$search_is_view."&search_title_name=".$search_title_name."&search_publisher_code=".$search_publisher_code."&search_platform=".$search_platform."&search_age_limit=".$search_age_limit);
			}else{
				if($page>0){
					go("goods_list.php?page=".$page."&search_is_view=".$search_is_view."&search_title_name=".$search_title_name."&search_publisher_code=".$search_publisher_code."&search_platform=".$search_platform."&search_age_limit=".$search_age_limit);
				}else{
					go("goods_list.php?page=".$page."&search_is_view=".$search_is_view."&search_title_name=".$search_title_name."&search_publisher_code=".$search_publisher_code."&search_platform=".$search_platform."&search_age_limit=".$search_age_limit);
				}
			}

			
			
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
			$query="insert into  tbl_goods_description set description=:description,title_id=:title_id ON DUPLICATE KEY UPDATE description=:description";
			$param = array(
				":description"=>$description,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
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
		
		//지역제한 안내문구
		case "region_msg_save":
			$query="insert into  tbl_goods_description set region_msg=:region_msg,title_id=:title_id ON DUPLICATE KEY UPDATE region_msg=:region_msg";
			$param = array(
				":region_msg"=>$region_msg,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
		case "add_youtube":
			$query="insert into tbl_goods_media set media_type='video',youtube_media_id=:youtube_media_id,media_thumb=:media_thumb,media_url=:media_url,media_sort='0',title_id=:title_id";
			$param = array(
				":youtube_media_id"=>$youtube_media_id,
				":media_thumb"=>"1.jpg",
				":media_url"=>"https://www.youtube.com/embed/".$youtube_media_id,
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
			
			//유튜브 동영상 썸네일 생성
			//https://img.youtube.com/vi/2VyzPR_cgXc/mqdefault.jpg
		break;
		case "delete_youtube":
			$query="delete from tbl_goods_media where youtube_media_id=:youtube_media_id";
			$param = array(
				":youtube_media_id"=>$youtube_media_id,
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
			if(!file_exists($library_path)){
				mkdir($library_path, '0777',true);
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

			$s_query = "insert into steam_image_chk set appid=:appid,is_library=:is_library,reg_date=now() ON DUPLICATE KEY UPDATE update_date=now(),is_library=:is_library";
			$stmt = $conn->prepare($s_query);
			$s_params = array(
				":appid"=>$appid,
				":is_library"=>"200",
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
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>