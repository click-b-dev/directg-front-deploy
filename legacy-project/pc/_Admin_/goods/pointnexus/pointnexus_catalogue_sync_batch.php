<?
header('Content-Type: application/json; charset=UTF-8');
ini_set("display_errors", 0);
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');

$mode   = filter_input(INPUT_POST, "mode",   FILTER_SANITIZE_STRING);
$offset = (int)filter_input(INPUT_POST, "offset", FILTER_SANITIZE_NUMBER_INT);
$limit  = (int)filter_input(INPUT_POST, "limit",  FILTER_SANITIZE_NUMBER_INT);

$mode = pn_normalize_mode($mode);
if($limit < 10){ $limit = 100; }
if($limit > 100){ $limit = 100; }
if($offset < 0){ $offset = 0; }

//동기화 회차 토큰 — offset=0(회차 시작)에서 1개 생성해 세션에 저장.
//그 회차의 모든 배치가 동일한 값을 update_date에 박아, 단종 판정(update_date < MAX)을 인덱스로 처리.
if($offset === 0){
	$_SESSION['pn_sync_run_token'][$mode] = date('Y-m-d H:i:s');
}
$run_token = !empty($_SESSION['pn_sync_run_token'][$mode])
           ? $_SESSION['pn_sync_run_token'][$mode]
           : date('Y-m-d H:i:s');   //세션 유실 대비 폴백

$response = array(
	"success"     => false,
	"mode"        => $mode,
	"offset"      => $offset,
	"limit"       => $limit,
	"count"       => 0,
	"has_more"    => false,
	"synced_ok"   => 0,
	"synced_fail" => 0,
	"items"       => array(),
	"error"       => null,
);

try {
	$pointnexus = new PointNexus($mode);
	$result = $pointnexus->runProduct($offset, $limit, '');

	if(empty($result->success)){
		$response['error'] = pn_extract_error($result, 'PointNexus 상품 목록 조회 실패');
		echo json_encode($response, JSON_UNESCAPED_UNICODE);
		exit;
	}

	$products = !empty($result->data) ? (array)$result->data : array();
	$response['count']    = count($products);
	$response['has_more'] = $response['count'] >= $limit;

	if($response['count'] === 0){
		$response['success'] = true;
		echo json_encode($response, JSON_UNESCAPED_UNICODE);
		exit;
	}

	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$query = "INSERT INTO pointnexus_catalogue (
		productID, mode, genericName, edition, platform, platformSKU,
		publisher, publisherSKU, type, isPreOrder, releaseDate,
		allowedCountries, allowedCurrencies, prices, genres, copyright,
		steamAppID, shortDescription, longDescription, lastUpdatedAt,
		raw_json, batch_date, update_date
	) VALUES (
		:productID, :mode, :genericName, :edition, :platform, :platformSKU,
		:publisher, :publisherSKU, :type, :isPreOrder, :releaseDate,
		:allowedCountries, :allowedCurrencies, :prices, :genres, :copyright,
		:steamAppID, :shortDescription, :longDescription, :lastUpdatedAt,
		:raw_json, NOW(), :run_token
	) ON DUPLICATE KEY UPDATE
		update_date=VALUES(update_date),
		genericName=VALUES(genericName),
		edition=VALUES(edition),
		platform=VALUES(platform),
		platformSKU=VALUES(platformSKU),
		publisher=VALUES(publisher),
		publisherSKU=VALUES(publisherSKU),
		type=VALUES(type),
		isPreOrder=VALUES(isPreOrder),
		releaseDate=VALUES(releaseDate),
		allowedCountries=VALUES(allowedCountries),
		allowedCurrencies=VALUES(allowedCurrencies),
		prices=VALUES(prices),
		genres=VALUES(genres),
		copyright=VALUES(copyright),
		steamAppID=VALUES(steamAppID),
		shortDescription=VALUES(shortDescription),
		longDescription=VALUES(longDescription),
		lastUpdatedAt=VALUES(lastUpdatedAt),
		raw_json=VALUES(raw_json)";

	$stmt = $conn->prepare($query);

	foreach($products as $p){
		$pid = isset($p->id) ? $p->id : '';
		if($pid === ''){
			$response['synced_fail']++;
			continue;
		}

		//날짜 정규화 (ISO 8601 → MySQL DATETIME). 빈 값이면 NULL
		$releaseDate   = !empty($p->releaseDate)   ? date('Y-m-d H:i:s', strtotime($p->releaseDate))   : null;
		$lastUpdatedAt = !empty($p->lastUpdatedAt) ? date('Y-m-d H:i:s', strtotime($p->lastUpdatedAt)) : null;

		$allowedCountries  = !empty($p->allowedCountries)  ? json_encode($p->allowedCountries,  JSON_UNESCAPED_UNICODE) : null;
		$allowedCurrencies = !empty($p->allowedCurrencies) ? implode(',', (array)$p->allowedCurrencies)                  : null;
		$prices            = !empty($p->prices)            ? json_encode($p->prices,            JSON_UNESCAPED_UNICODE) : null;
		$genres            = !empty($p->genres)            ? json_encode($p->genres,            JSON_UNESCAPED_UNICODE) : null;
		$shortDescription  = !empty($p->shortDescription)  ? json_encode($p->shortDescription,  JSON_UNESCAPED_UNICODE) : null;
		$longDescription   = !empty($p->longDescription)   ? json_encode($p->longDescription,   JSON_UNESCAPED_UNICODE) : null;

		$params = array(
			':productID'         => $pid,
			':mode'              => $mode,
			':genericName'       => isset($p->genericName)  ? $p->genericName  : null,
			':edition'           => isset($p->edition)      ? $p->edition      : null,
			':platform'          => isset($p->platform)     ? $p->platform     : null,
			':platformSKU'       => isset($p->platformSKU)  ? $p->platformSKU  : null,
			':publisher'         => isset($p->publisher)    ? $p->publisher    : null,
			':publisherSKU'      => isset($p->publisherSKU) ? $p->publisherSKU : null,
			':type'              => isset($p->type)         ? $p->type         : null,
			':isPreOrder'        => !empty($p->isPreOrder) ? 1 : 0,
			':releaseDate'       => $releaseDate,
			':allowedCountries'  => $allowedCountries,
			':allowedCurrencies' => $allowedCurrencies,
			':prices'            => $prices,
			':genres'            => $genres,
			':copyright'         => isset($p->copyright)   ? $p->copyright   : null,
			':steamAppID'        => isset($p->steamAppID)  ? $p->steamAppID  : null,
			':shortDescription'  => $shortDescription,
			':longDescription'   => $longDescription,
			':lastUpdatedAt'     => $lastUpdatedAt,
			':raw_json'          => json_encode($p, JSON_UNESCAPED_UNICODE),
			':run_token'         => $run_token,
		);

		try {
			$stmt->execute($params);
			$response['synced_ok']++;
			$response['items'][] = array(
				'id'   => $pid,
				'name' => isset($p->genericName) ? $p->genericName : '',
			);
		} catch (PDOException $e) {
			$response['synced_fail']++;
			$response['items'][] = array(
				'id'    => $pid,
				'name'  => isset($p->genericName) ? $p->genericName : '',
				'error' => $e->getMessage(),
			);
		}
	}

	$response['success'] = true;
	echo json_encode($response, JSON_UNESCAPED_UNICODE);
	exit;

} catch (Exception $e) {
	$response['error'] = $e->getMessage();
	echo json_encode($response, JSON_UNESCAPED_UNICODE);
	exit;
}
?>
