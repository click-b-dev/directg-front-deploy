<?
//다운로드 Reserve 키 다운로드 프록시 (asset.md 3.7)
//- 다운로드는 소유자(P/{owner})만 가능 → 로컬 tbl_asset_download 에서 po로 owner 조회 후 서버에 P/{owner} 로 요청
//- 응답은 PIN 으로 암호화된 zip. 그대로 브라우저에 스트리밍
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$po = filter_input(INPUT_GET, 'po', FILTER_SANITIZE_STRING);

if(!$_SESSION['admin']["admin_id"]){
	msg("로그인이 필요합니다.", -1);
	exit;
}
if(!$po){
	msg("PO가 없습니다.", -1);
	exit;
}

try{
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$adminAsset = new AdminAsset($conn);

	$row = $adminAsset->getAssetDownloadLog($po);

	if(!$row){
		msg("등록되지 않은 다운로드 건입니다.", -1);
		exit;
	}
	if($row['is_finish'] === 'Y'){
		msg("이미 삭제(finish) 처리된 건입니다.", -1);
		exit;
	}
	if((int)$row['downloadLimit'] <= 0){
		msg("다운로드 가능 횟수를 모두 소진했습니다.", -1);
		exit;
	}

	$asset = new Asset($conn);
	$dl = $asset->runDownloadReserveFile($po, $row['owner']);

	//asset.md 3.7: 만료/횟수초과 등은 404 권장. 비200은 다운로드 불가 안내
	if($dl['httpCode'] != 200 || $dl['body'] === false || $dl['body'] === ""){
		msg("다운로드할 수 없습니다. (만료·횟수초과 또는 권한 문제) httpCode: ".$dl['httpCode'], -1);
		exit;
	}

	//다운로드 성공 → 남은 횟수 차감 + 다운로드 일시 갱신(마지막 다운로드 시각). 동시성 대비 downloadLimit>0 조건
	$adminAsset->setAssetDownloadDecrease($po);

	//암호화 zip 스트리밍
	header("Content-Type: application/zip");
	header('Content-Disposition: attachment; filename="asset_'.$po.'.zip"');
	header("Content-Transfer-Encoding: binary");
	header("Content-Length: ".strlen($dl['body']));
	echo $dl['body'];
	exit;

}catch(PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>
