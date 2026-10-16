<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_admin_asset.xml');
$logger = Logger::getLogger("pc");


$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$page = filter_input(INPUT_POST, 'page', FILTER_SANITIZE_NUMBER_INT);
$asset_id = filter_input(INPUT_POST, 'asset_id', FILTER_SANITIZE_NUMBER_INT);
$title = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
$size = filter_input(INPUT_POST, 'size', FILTER_SANITIZE_NUMBER_INT);
$productTypeCd = filter_input(INPUT_POST, 'productTypeCd', FILTER_SANITIZE_STRING);
$assetTypeCd = filter_input(INPUT_POST, 'assetTypeCd', FILTER_SANITIZE_STRING);
$platformCd = filter_input(INPUT_POST, 'platformCd', FILTER_SANITIZE_STRING);
$publisherCd = filter_input(INPUT_POST, 'publisherCd', FILTER_SANITIZE_STRING);
$asset_name = filter_input(INPUT_POST, 'asset_name', FILTER_SANITIZE_STRING);

$owner=$_POST['owner'] ?? '';
$ordno=$_POST['ordno'] ?? '';
$cancelled=$_POST['cancelled'] ?? '';

if(!$page){
	$page =1;
}

$title = urlencode($title);

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$asset= new Asset($conn);
	$admin= new Admin($conn);
	$adminAsset= new AdminAsset($conn);

	switch($mode){
		case "asset_list":
			header("Content-Type: application/json; charset=UTF-8"); 
			$asset_list = $asset->runAssetList($page,$size,$title,$productTypeCd,$assetTypeCd,$platformCd,$publisherCd);
			$asset_data = json_decode($asset_list);

			// is_registered 플래그만 추가해서 넘김
			foreach ($asset_data->content as $value) {
				$chk_asset = $admin->getAssetInfo($value->id);
				$value->is_registered = !empty($chk_asset['asset_id']);
			}
			unset($value);

			echo json_encode([
				"content"       => $asset_data->content,
				"totalElements" => $asset_data->totalElements,
				"totalPages"    => $asset_data->totalPages,
			]);

/*
			header("Content-Type: application/json; charset=UTF-8"); 
			$asset_list = $asset->runAssetList($page,$size,$title,$productTypeCd,$assetTypeCd,$platformCd,$publisherCd);
			//print $asset_list;
			$asset_data = json_decode($asset_list);
			foreach($asset_data->content as $value){
				$chk_asset = $admin->getAssetInfo($value->id);



				//26-04-07(화) 12:06 [이종석] 에셋서버에 에셋 추가했을 경우 DG 테이블에도 동기화 해주기 위해 사용
				$query = "insert into tbl_asset set asset_id=:asset_id,asset_name=:asset_name,productType=:productType,assetType=:assetType,platform=:platform,publisher=:publisher,reg_date=:reg_date ON DUPLICATE KEY UPDATE productType=:productType,assetType=:assetType,platform=:platform,publisher=:publisher,reg_date=:reg_date,update_dt=now()";
				$stmt = $conn->prepare($query);
				$params = array(
					":asset_id"=>$value->id,
					":asset_name"=>$value->title,
					":productType"=>$value->productType,
					":assetType"=>$value->assetType,
					":platform"=>$value->platform,
					":publisher"=>$value->publisher,
					":reg_date"=>$value->regDt,
				);
				$stmt->execute($params);



				$addHtml.= "<tr>";
				$addHtml.= "<td class='text-center'><a href='#' target='_blank'>".$value->id."</a></td>";
				$addHtml.= "<td class='text-start'><span class='eng font-12'>".$value->title."</span></td>"; 
				$addHtml.= "<td class='text-center'>".$value->productType."</td>";
				$addHtml.= "<td class='text-center'>".$value->assetType."</td>";
				$addHtml.= "<td class='text-center'><span class='eng font-12'>".$value->platform."</span></td>";
				$addHtml.= "<td class='text-center'><span class='eng font-12'>".$value->publisher."</span></td>";
				//$addHtml.= "<td class='text-center'>".str_replace('A/','',$value->regId)."<br/><span class='num'>(".$value->regDt.")</span></td>";
				$addHtml.= "<td class='text-center'><button type='button' class='btn btn-outline-warning btn-sm btn_asset_modify' data-idx='".$value->id."'>Asset 수정</button></td>";
				$addHtml.= "<td class='text-center'><button type='button' class='btn btn-outline-danger btn-sm btn_asset_delete' data-idx='".$value->id."'>Asset 삭제</button></td>";
				$addHtml.= "<td class='text-center'><button type='button' class='btn btn-outline-info btn-sm btn_asset_item' data-idx='".$value->id."' >키 사용현황</button></td>";

				$addHtml.= "<td class='text-center'><button type='button' class='btn btn-outline-warning btn-sm btn_asset_item_register' data-bs-toggle='modal' data-bs-target='#exampleModal' data-bs-whatever='@mdo' data-idx='".$value->id."' data-title='".$value->title."'>키 등록</button></td>";
				if($chk_asset['asset_id']){
					$addHtml.= "<td class='text-center'>등록완료</td>";
				}else{
					$addHtml.= "<td class='text-center'><button type='button' class='btn btn-outline-dark btn-sm btn_stock_basic' data-idx='".$value->id."' data-regdt='".$value->regDt."'>기초정보등록</button></td>";
				}
				$addHtml.= "</tr>";
			}

			$json_data = array(
				"content" =>$addHtml,
				"totalElements"=>$asset_data->totalElements,
				"totalPages"=>$asset_data->totalPages,
			);
			echo json_encode($json_data);
*/

		break;
		case "asset_search":
			header("Content-Type: application/json; charset=UTF-8");
			$raw    = $asset->runAssetDetail($asset_id);
			$result = json_decode($raw);

			//상세 응답이 배열로 오는 경우 첫 요소 사용
			if(is_array($result)){ $result = $result[0] ?? null; }

			//유효한 Asset(id 존재)일 때만 1건, 아니면 빈 결과(정직한 '결과 없음' — get()은 비200 시 null 반환)
			if(!empty($result) && !empty($result->id)){
				$chk_asset = $admin->getAssetInfo($result->id);
				//이름 필드는 목록과 동일하게 title (asset.md 1.5). 혹시 name으로 오는 환경 대비 폴백
				$asset_title = isset($result->title) ? $result->title : (isset($result->name) ? $result->name : '');

				$item = array(
					"id"            => $result->id,
					"title"         => $asset_title,
					"productType"   => $result->productType ?? '',
					"assetType"     => $result->assetType ?? '',
					"platform"      => $result->platform ?? '',
					"publisher"     => $result->publisher ?? '',
					"is_registered" => !empty($chk_asset['asset_id']),
					"regDt"         => $result->regDt ?? '',
				);
				$content = array($item);
				$total   = 1;
			}else{
				$content = array();
				$total   = 0;
			}

			echo json_encode(array(
				"content"       => $content,
				"totalElements" => $total,
				"totalPages"    => $total > 0 ? 1 : 0,
			));
			/*
			header("Content-Type: application/json; charset=UTF-8"); 
			$result = $asset->runAssetDetail($asset_id);
			$result=json_decode($result);
			$chk_asset = $admin->getAssetInfo($asset_id);
			
			$addHtml.= "<tr>";
			$addHtml.= "<td class='text-center'><a href='#' target='_blank'>".$result->id."</a></td>";
			$addHtml.= "<td class='text-start'><span class='eng font-12'>".$result->name."</span></td>"; 
			$addHtml.= "<td class='text-center'>".$result->productType."</td>";
			$addHtml.= "<td class='text-center'>".$result->assetType."</td>";
			$addHtml.= "<td class='text-center'><span class='eng font-12'>".$result->platform."</span></td>";
			$addHtml.= "<td class='text-center'><span class='eng font-12'>".$result->publisher."</span></td>";
			$addHtml.= "<td class='text-center'><button type='button' class='btn btn-outline-warning btn-sm btn_asset_modify' data-idx='".$result->id."'>Asset 수정</button></td>";
			$addHtml.= "<td class='text-center'><button type='button' class='btn btn-outline-danger btn-sm btn_asset_delete' data-idx='".$result->id."'>Asset 삭제</button></td>";
			$addHtml.= "<td class='text-center'><button type='button' class='btn btn-outline-info btn-sm btn_asset_item' data-idx='".$result->id."' >키 사용현황</button></td>";

			$addHtml.= "<td class='text-center'><button type='button' class='btn btn-outline-warning btn-sm btn_asset_item_register' data-bs-toggle='modal' data-bs-target='#exampleModal' data-bs-whatever='@mdo' data-idx='".$result->id."' data-title='".$result->title."'>키 등록</button></td>";
			if($chk_asset['asset_id']){
				$addHtml.= "<td class='text-center'>등록완료</td>";
			}else{
				$addHtml.= "<td class='text-center'><button type='button' class='btn btn-outline-dark btn-sm btn_stock_basic' data-idx='".$result->id."' data-regdt='".$result->regDt."'>기초정보등록</button></td>";
			}
			$addHtml.= "</tr>";

			$json_data = array(
				"content" =>$addHtml,
				"totalElements"=>$result->totalElements,
				"totalPages"=>$result->totalPages,
			);

			echo json_encode($json_data);
			*/
		break;
		case "asset_item_list":
			header("Content-Type: application/json; charset=UTF-8");
			$logger->info("asset_item_list");
			$asset_item_list = $asset->runAssetItemListFilter($asset_id,$page,$size);
			$logger->info($asset_item_list);
			$asset_item_data = json_decode($asset_item_list);
			/*
			foreach($asset_item_json->content as $value){
				$query = "insert into tbl_asset_item set item_id=:item_id,asset_id=:asset_id,asset_name=:asset_name,regId=:regId,regDt=:regDt,reserved=:reserved,reserveId=:reserveId,reserveDt=:reserveDt,owner=:owner,po=:po,activated=:activated,activatedDt=:activatedDt ON DUPLICATE KEY UPDATE reserved=:reserved,reserveId=:reserveId,reserveDt=:reserveDt,owner=:owner,po=:po,activated=:activated,activatedDt=:activatedDt";
				$stmt = $conn->prepare($query);
				$params = array(
					":item_id"=>$value->id,
					":asset_id"=>$value->assetId,
					":asset_name"=>$value->title,
					":regId"=>$value->regId,
					":regDt"=>$value->regDt,
					":reserved"=>$value->reserved,
					":reserveId"=>$value->reserveId,
					":reserveDt"=>$value->reserveDt,
					":owner"=>$value->owner,
					":po"=>$value->po,
					":activated"=>$value->activated,
					":activatedDt"=>$value->activatedDt,
				);
				$stmt->execute($params);
			}
			*/

			echo json_encode([
				"content"       => $asset_item_data->content,
				"totalElements" => $asset_item_data->totalElements,
				"totalPages"    => $asset_item_data->totalPages,
				"isFirst"       => $asset_item_data->isFirst,
				"isLast"        => $asset_item_data->isLast,
			]);
	/*
			foreach($asset_item_data->content as $value){
				$addHtml.= "<tr>";
				$addHtml.= "<td class='text-center'><a href='#' target='_blank'>".$value->id."</a></td>";
				$addHtml.= "<td class='text-start'><span class='eng font-14'>".$value->title."</span></td>"; 
				
				$addHtml.= "</tr>";
			}
				
			$json_data = array(
				"content" =>$addHtml,
				"totalElements"=>$asset_item_data->totalElements,
				"totalPages"=>$asset_item_data->totalPages,
			);
			echo json_encode($asset_item_data);
*/
		break;
		case "asset_inventory_qty": //등록전체수량
			$reg_date = filter_input(INPUT_POST, 'reg_date', FILTER_SANITIZE_STRING);

			header("Content-Type: application/json; charset=UTF-8");
			$asset_info = $asset->runAssetDetail($asset_id);

			//$asset_item_list = $asset->runAssetItemListFilter($asset_id,"1","1");
			
			$asset_info_data = json_decode($asset_info);
			//$inventory_qty = json_decode($asset_item_list);

			//print_r($asset_info_data);
			//echo $inventory_qty->totalElements;

			$query = "insert into tbl_asset set asset_id=:asset_id,asset_name=:asset_name,productType=:productType,assetType=:assetType,platform=:platform,publisher=:publisher,reg_date=:reg_date ON DUPLICATE KEY UPDATE productType=:productType,assetType=:assetType,platform=:platform,publisher=:publisher,reg_date=:reg_date,update_dt=now()";
			$stmt = $conn->prepare($query);
			$params = array(
				":asset_id"=>$asset_info_data->id,
				":asset_name"=>(isset($asset_info_data->title) ? $asset_info_data->title : ($asset_info_data->name ?? '')), //상세 응답 이름 필드는 title (asset.md 1.5), name 폴백
				":productType"=>$asset_info_data->productType,
				":assetType"=>$asset_info_data->assetType,
				":platform"=>$asset_info_data->platform,
				":publisher"=>$asset_info_data->publisher,
				":reg_date"=>$reg_date,
			);
			$stmt->execute($params);
			//print_r($params);
		break;
		case "asset_register":		//Asset 등록
			$title = filter_input(INPUT_POST, 'asset_name', FILTER_SANITIZE_STRING);
			$productTypeCd = filter_input(INPUT_POST, 'productTypeCd', FILTER_SANITIZE_STRING);
			$assetTypeCd = filter_input(INPUT_POST, 'assetTypeCd', FILTER_SANITIZE_STRING);
			$platformCd = filter_input(INPUT_POST, 'platformCd', FILTER_SANITIZE_STRING);
			$publisherCd = filter_input(INPUT_POST, 'publisherCd', FILTER_SANITIZE_STRING);
			$admin_id = $_SESSION['admin']["admin_id"];

			if(!$admin_id){
				msg("로그인이 필요합니다.", -1);
				exit;
			}

			$result = $asset->runAssetRegister($title,$productTypeCd,$assetTypeCd,$platformCd,$publisherCd,$admin_id);
			$res = json_decode($result);

			if(!empty($res->id)){
				//등록 성공 — asset.md 1.1 응답에 신규 id
				msg("Asset 등록 완료 (ID: ".$res->id.")", "asset_list.php");
			}else{
				//실패 — title 중복(유일해야 함)·필수값 누락 등. 응답 message 노출 후 이전 폼으로
				$err = isset($res->message) ? $res->message : "등록에 실패했습니다. (이름 중복 또는 필수값 누락 확인)";
				msg("Asset 등록 실패: ".$err, -1);
			}
		break;
		
		//asset 수정
		case "asset_modify":
			$admin_id = $_SESSION['admin']["admin_id"];
			$title = filter_input(INPUT_POST, 'asset_name', FILTER_SANITIZE_STRING);
			$logger->info("asset_modify id=".$asset_id);

			if(!$admin_id){
				msg("로그인이 필요합니다.", -1);
				exit;
			}

			//1) Asset 서버(원천) 먼저 수정
			$result = $asset->runAssetModify($asset_id,$title,$productTypeCd,$assetTypeCd,$platformCd,$publisherCd,$admin_id);
			$res = json_decode($result);

			if(empty($res->id)){
				//API 수정 실패 — 로컬은 건드리지 않음(서버가 원천, 불일치 방지)
				$err = isset($res->message) ? $res->message : "수정에 실패했습니다.";
				msg("Asset 수정 실패: ".$err, -1);
				exit;
			}

			//2) API 성공 → 로컬 tbl_asset 을 API에 맞춰 동기화(없으면 insert). 코드→이름 변환 저장
			$query = "insert into tbl_asset set asset_id=:asset_id,asset_name=:asset_name,productType=:productType,assetType=:assetType,platform=:platform,publisher=:publisher,reg_date=now()
				ON DUPLICATE KEY UPDATE asset_name=:asset_name,productType=:productType,assetType=:assetType,platform=:platform,publisher=:publisher,update_dt=now()";
			$stmt = $conn->prepare($query);
			$stmt->execute(array(
				":asset_id"    => $asset_id,
				":asset_name"  => $title,
				":productType" => $admin->getAssetCodeInfo($productTypeCd),
				":assetType"   => $admin->getAssetCodeInfo($assetTypeCd),
				":platform"    => $admin->getAssetCodeInfo($platformCd),
				":publisher"   => $admin->getAssetCodeInfo($publisherCd),
			));

			msg("Asset 수정 완료", "asset_list.php");
		break;
		
		//asset key 등록
		case "asset_item_register":
			$logger->info("asset_item_register");
			$logger->info($_SESSION['admin']["admin_id"]);
			$logger->info($asset_id);
			$logger->info($_POST['asset_item']);
			$key = trim($_POST['asset_item'] ?? '');
			if($key){
				$result = $asset->runAssetItemRegister($asset_id,$key);
			}
			$result=json_decode($result);
			echo $result->count;
		break;

		//예약(키 할당) 취소 — PUT /reserves/{reserveId}/cancel (활성화된 키는 취소 불가)
		case "asset_reserve_cancel":
			header("Content-Type: application/json; charset=UTF-8");
			$reserve_id = filter_input(INPUT_POST, 'reserve_id', FILTER_SANITIZE_NUMBER_INT);
			if(!$_SESSION['admin']["admin_id"] || !$reserve_id){
				echo json_encode(array("message"=>"권한 또는 reserve_id 누락")); exit;
			}
			echo json_encode(json_decode($asset->runReserveCancel($reserve_id)));
		break;

		//asset 삭제
		case "assets_delete":
			$logger->info("assets_delete");
			$logger->info($_SESSION['admin']["admin_id"]);
			$logger->info($asset_id);
			if($_SESSION['admin']["admin_id"]){
				$result = $asset->runAssetDelete($asset_id,$_SESSION['admin']["admin_id"]);
				$logger->info($result);
				$result=json_decode($result);
				echo $result->message;
			}
		break;
		
		//Asset Code 목록 (그룹별) — Asset 서버 /codes 원천 실시간 조회 (asset.md 4.4)
		case "asset_code_list":
			header("Content-Type: application/json; charset=UTF-8");
			$group_id = filter_input(INPUT_POST, 'group_id', FILTER_SANITIZE_STRING);

			//그룹은 PDTP/ASTP/PLFM/PUBL 만 허용
			if(!in_array($group_id, array('PDTP','ASTP','PLFM','PUBL'), true)){
				echo json_encode(array("content"=>array())); exit;
			}

			$code = json_decode($asset->runAssetCodeList($group_id));
			echo json_encode(array(
				"content" => (isset($code->content) && is_array($code->content)) ? $code->content : array(),
			));
		break;

		//Asset Code 등록 (asset.md 4.1 POST /codes) — groupId + name
		case "asset_code_register":
			$group_id  = filter_input(INPUT_POST, 'group_id', FILTER_SANITIZE_STRING);
			$code_name = trim(filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING));

			if(!$_SESSION['admin']["admin_id"]){
				msg("로그인이 필요합니다.", -1);
				exit;
			}
			//그룹은 PDTP/ASTP/PLFM/PUBL 만 허용
			if(!in_array($group_id, array('PDTP','ASTP','PLFM','PUBL'), true)){
				msg("코드 그룹을 선택하세요.", -1);
				exit;
			}
			if($code_name === ""){
				msg("코드명을 입력하세요.", -1);
				exit;
			}

			$result = $asset->runAssetCodeRegister($group_id, $code_name);
			$res = json_decode($result);

			if(!empty($res->id)){
				msg("코드 등록 완료 (".$res->id.")", "asset_code_list.php");
			}else{
				$err = isset($res->message) ? $res->message : "등록에 실패했습니다.";
				msg("코드 등록 실패: ".$err, -1);
			}
		break;

		//Asset Code 수정 — 이름만 변경 (asset.md 4.2 PUT /codes/{codeId})
		case "asset_code_modify":
			header("Content-Type: application/json; charset=UTF-8");
			$code_id  = filter_input(INPUT_POST, 'code_id', FILTER_SANITIZE_STRING);
			$code_name = trim(filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING));
			if(!$_SESSION['admin']["admin_id"] || !$code_id || $code_name===""){
				echo json_encode(array("message"=>"권한 또는 입력값(코드/이름) 누락")); exit;
			}
			echo json_encode(json_decode($asset->runAssetCodeModify($code_id, $code_name)));
		break;

		//Asset Code 삭제 (asset.md 4.3 DELETE /codes/{codeId})
		case "asset_code_delete":
			header("Content-Type: application/json; charset=UTF-8");
			$code_id = filter_input(INPUT_POST, 'code_id', FILTER_SANITIZE_STRING);
			if(!$_SESSION['admin']["admin_id"] || !$code_id){
				echo json_encode(array("message"=>"권한 또는 코드 누락")); exit;
			}
			echo json_encode(json_decode($asset->runAssetCodeDelete($code_id)));
		break;

		//다운로드용 Reserve 등록 (asset.md 3.6, RETURN 반품출고) — 성공 시 로컬 tbl_asset_download 기록
		case "asset_download_register":
			$admin_id = $_SESSION['admin']["admin_id"];
			$dl_asset_id = filter_input(INPUT_POST, 'asset_id', FILTER_SANITIZE_NUMBER_INT);
			$dl_owner    = trim(filter_input(INPUT_POST, 'owner', FILTER_SANITIZE_STRING));
			$dl_qty      = filter_input(INPUT_POST, 'qty', FILTER_SANITIZE_NUMBER_INT);
			$dl_pin      = trim(filter_input(INPUT_POST, 'pin', FILTER_SANITIZE_STRING));
			$dl_limit    = filter_input(INPUT_POST, 'download_limit', FILTER_SANITIZE_NUMBER_INT);
			$dl_expday   = filter_input(INPUT_POST, 'download_expired_day', FILTER_SANITIZE_NUMBER_INT);

			if(!$admin_id){ msg("로그인이 필요합니다.", -1); exit; }
			if(!$dl_asset_id){ msg("Asset을 선택하세요.", -1); exit; }
			if($dl_owner===""){ msg("소유자(owner)를 입력하세요.", -1); exit; }
			if(!$dl_qty || (int)$dl_qty < 1){ msg("수량을 1 이상 입력하세요.", -1); exit; }
			if((int)$dl_qty > 1000){ msg("1회 1000개를 초과할 수 없습니다. (asset.md 3.6)", -1); exit; } //asset.md 3.6 제한
			if($dl_pin===""){ msg("PIN을 입력하세요.", -1); exit; }
			if(!$dl_limit || (int)$dl_limit < 1){ msg("다운로드 제한횟수를 입력하세요.", -1); exit; }
			if(!$dl_expday || (int)$dl_expday < 1){ msg("다운로드 만료일(일수)을 입력하세요.", -1); exit; }

			//RETURN 고정
			$result = $asset->runDownloadReserveRegister($dl_asset_id, "RETURN", $dl_owner, $dl_qty, $dl_pin, $dl_limit, $dl_expday);
			$res = json_decode($result);

			if(empty($res->po)){
				$err = isset($res->message) ? $res->message : "등록에 실패했습니다. (재고부족 등 확인)";
				msg("다운로드 등록 실패: ".$err, -1);
				exit;
			}

			//응답 count 우선(없으면 입력값 폴백)
			$dl_count = isset($res->count) ? (int)$res->count : (int)$dl_qty;

			//기존 레거시 테이블 재사용 (directgames.tbl_asset_download_log). 만료는 일수(downloadExpiredDay) 저장, owner=가져간 관리자 입력
			$adminAsset->setAssetDownloadRegister($res->po, $dl_asset_id, $dl_owner, $dl_count, $dl_pin, $dl_limit, $dl_expday);

			msg("다운로드 등록 완료 (".$dl_count."개, PO: ".$res->po.")", "asset_download_list.php");
		break;

		//다운로드 Reserve finish (asset.md 3.8) — RETURN 다운로드 이력 키 삭제 후 로컬 finish 표시
		case "asset_download_finish":
			header("Content-Type: application/json; charset=UTF-8");
			$dl_po = filter_input(INPUT_POST, 'po', FILTER_SANITIZE_STRING);
			if(!$_SESSION['admin']["admin_id"] || !$dl_po){
				echo json_encode(array("message"=>"권한 또는 PO 누락")); exit;
			}
			$res = json_decode($asset->runDownloadReserveFinish($dl_po));
			if(!empty($res->id)){
				//Asset 키 삭제(finish) 성공 → 로컬은 삭제완료 상태로 표시(행 유지, 목록에 이력 남김)
				$adminAsset->setAssetDownloadFinish($dl_po);
			}
			echo json_encode($res);
		break;

		//다운로드 Reserve 목록 (directgames.tbl_asset_download_log + dgkrshop.tbl_asset 조인으로 이름)
		case "asset_download_list":
			header("Content-Type: application/json; charset=UTF-8");
			$dl_owner_q = trim($_POST['owner'] ?? '');

			echo json_encode($adminAsset->getAssetDownloadList($dl_owner_q, $page, $size));
		break;

		//asset 키 할당(예약) 현황
		case "assets_reserve_list":
			header("Content-Type: application/json; charset=UTF-8");

			//취소여부: all(또는 빈값)=전체 → cancelled 미전달
			if($cancelled == "all"){ $cancelled = ""; }

			//소유자(owner)는 M/{m_id} 형식 — 접두어 없으면 보정
			$owner = trim($owner);
			if($owner && !preg_match("/^M\//i",$owner)){
				$owner = "M/".$owner;
			}

			//asset.md 3.2: owner 슬래시는 %2F로 인코딩 → po/owner urlencode 후 전달
			$reserve = json_decode($asset->runReserveList($page,$size,urlencode($ordno),urlencode($owner),$cancelled));
			$reserve_content = isset($reserve->content) ? $reserve->content : array();

			//po(=tbl_order_item.ordno)로 settle_no·m_no 일괄 조회 → order_view / member_view 링크용
			//(payco 등 settle_no≠ordno 케이스도 ordno 정확매칭이라 안전)
			if(!empty($reserve_content)){
				$po_keys = array();
				foreach($reserve_content as $r){
					if(!empty($r->po)){ $po_keys[$r->po] = true; }
				}
				$po_keys = array_keys($po_keys);

				$oi_map = array();
				if(!empty($po_keys)){
					$ph = implode(',', array_fill(0, count($po_keys), '?'));
					$oi_stmt = $conn->prepare("SELECT ordno, settle_no, m_no FROM tbl_order_item WHERE ordno IN ($ph)");
					$oi_stmt->execute($po_keys);
					foreach($oi_stmt->fetchAll(PDO::FETCH_ASSOC) as $oi){
						$oi_map[$oi['ordno']] = $oi;
					}
				}

				foreach($reserve_content as $r){
					$r->settle_no = (!empty($r->po) && isset($oi_map[$r->po])) ? $oi_map[$r->po]['settle_no'] : '';
					$r->m_no      = (!empty($r->po) && isset($oi_map[$r->po])) ? $oi_map[$r->po]['m_no']      : '';
				}
			}

			echo json_encode(array(
				"content"       => $reserve_content,
				"totalElements" => isset($reserve->totalElements) ? $reserve->totalElements : 0,
				"totalPages"    => isset($reserve->totalPages)    ? $reserve->totalPages    : 0,
			));
		break;
	}

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>