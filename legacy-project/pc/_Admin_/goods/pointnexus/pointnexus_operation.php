<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "PointNexus 오퍼레이션 조회";

$mode = filter_input(INPUT_GET, "mode", FILTER_SANITIZE_STRING);
$id   = filter_input(INPUT_GET, "id", FILTER_SANITIZE_STRING);
$mode = pn_normalize_mode($mode);

$result = null;
$error  = "";
$op     = null;
if($id){
	try{
		$pointnexus = new PointNexus($mode);
		$result = $pointnexus->runOperation($id);
		if (!empty($result->success) && !empty($result->data)) {
			$op = is_array($result->data) ? $result->data[0] : $result->data;
		} else {
			$error = pn_extract_error($result);
		}
	}catch(Exception $e){
		$error = $e->getMessage();
	}
}

$state_colors = array(
	'done'=>'success', 'pending'=>'warning', 'failed'=>'danger',
	'cancelled'=>'secondary', 'cancelling'=>'secondary', 'error'=>'danger'
);
$type_colors = array(
	'sale'=>'primary', 'book'=>'warning', 'reveal'=>'info',
	'cancel'=>'danger', 'refund'=>'danger'
);

//통화 기호 변환 (KRW→₩, JPY→¥, USD→$)
function pn_currency_amount($amount, $currency_code) {
	$symbols = array('KRW'=>'₩','JPY'=>'¥','USD'=>'$','EUR'=>'€','GBP'=>'£');
	$sym = isset($symbols[$currency_code]) ? $symbols[$currency_code] : '';
	if($amount === null || $amount === '') return '';
	//0원 단위 통화(KRW/JPY)는 정수 그대로, 그 외(EUR/USD/GBP 등)는 최소단위(×100)이므로 100으로 나눠 소수 2자리
	$zero_decimal = array('KRW','JPY');
	if(in_array($currency_code, $zero_decimal, true)){
		$val = number_format((int)$amount);
	} else {
		$val = number_format($amount/100, 2);
	}
	return ($sym ? $sym.' ' : '') . $val;
}
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
.uuid { font-family: monospace; font-size: 11px; color: #6c757d; word-break: break-all; }
.section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6c757d; border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; margin-bottom: 14px; }
.label-col { width: 130px; font-size: 12px; color: #6c757d; white-space: nowrap; }
.key-display { font-family: monospace; font-size: 22px; font-weight: 700; color: #c47e0a; background: #fff8e6; padding: 14px 20px; border-radius: 8px; border: 1px solid #f3d27f; letter-spacing: 2px; user-select: all; display: inline-block; }
.opid-display { font-family: monospace; font-size: 14px; color: #0a8a8a; background: #e8fafa; padding: 8px 14px; border-radius: 6px; border: 1px solid #b6e6e6; user-select: all; display: inline-block; }
</style>
<div class="wrapper">
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_start.php'); ?>
	<div class="content-page">
		<div class="content">
			<div class="container-fluid">
				<div class="row">
					<div class="col-12">
						<div class="page-title-box">
							<div class="page-title-right">
								<ol class="breadcrumb m-0">
									<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">PointNexus 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?> <small class="text-muted">GET /operation/{id}</small></h4>
						</div>
					</div>
				</div>

				<div class="row g-0">
					<div class="card">
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row g-2">
									<div class="col-2">
										<div class="row g-2">
											<label for="mode" class="col-3 col-form-label col-form-label-sm bg-light border">환경</label>
											<div class="col-9"><? pn_mode_select($mode, false); ?></div>
										</div>
									</div>
									<div class="col-8">
										<div class="row g-2">
											<label for="id" class="col-2 col-form-label col-form-label-sm bg-light border">operation UUID</label>
											<div class="col-10">
												<input type="text" class="form-control form-control-sm" id="id" name="id" value="<?=htmlspecialchars($id)?>" placeholder="예: dd2d9ecb-118f-4e07-9f7a-1a1e68ce00f3">
											</div>
										</div>
									</div>
									<div class="col-2 text-end">
										<button type="submit" class="btn btn-primary btn-sm shadow-none">조회</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<? if(!$id){ ?>
					<div class="alert alert-info">operationID 를 입력하세요. (sell / book 응답에 포함된 ID)</div>
				<? } else if($error){ ?>
					<div class="alert alert-danger"><i class="mdi mdi-alert"></i> <?=htmlspecialchars($error)?></div>
				<? } else if($op){
					$opArr        = (array)$op;
					$state        = isset($opArr['state'])         ? $opArr['state']         : '';
					$type         = isset($opArr['type'])          ? $opArr['type']          : '';
					$qtyToProcess = isset($opArr['qtyToProcess'])  ? $opArr['qtyToProcess']  : null;
					$qtyProcessed = isset($opArr['qtyProcessed'])  ? $opArr['qtyProcessed']  : null;
					$qtyInError   = isset($opArr['qtyInError'])    ? $opArr['qtyInError']    : null;
					$createdAt    = isset($opArr['createdAt'])     ? $opArr['createdAt']     : '';
					$lastUpdated  = isset($opArr['lastUpdatedAt']) ? $opArr['lastUpdatedAt'] : '';
					$buildID      = isset($opArr['buildID'])       ? $opArr['buildID']       : '';
					$variant      = isset($opArr['productVariant']) ? $opArr['productVariant'] : null;
					$countryCodes = '';
					if ($variant) {
						$vArr = (array)$variant;
						$countryCodes = isset($vArr['countryCodes']) ? $vArr['countryCodes'] : '';
					}
					$capsule      = isset($opArr['capsule']) ? $opArr['capsule'] : null;
					$capsuleID    = isset($capsule->id) ? $capsule->id : '';
					$item         = isset($capsule->item) ? $capsule->item : null;
					$key          = isset($item->key) ? $item->key : '';
					$platform     = isset($item->platform) ? $item->platform : '';
					$details      = isset($opArr['details']) ? $opArr['details'] : null;
					$stateColor   = isset($state_colors[$state]) ? $state_colors[$state] : 'info';
					$typeColor    = isset($type_colors[$type])   ? $type_colors[$type]   : 'secondary';
				?>

				<!-- 상태/타입 헤더 -->
				<div class="card mb-3">
					<div class="card-body">
						<div class="d-flex flex-wrap gap-3 align-items-center">
							<div>
								<div class="text-muted small">상태 (state)</div>
								<span class="badge bg-<?=$stateColor?>" style="font-size:14px; padding:6px 12px;"><?=htmlspecialchars($state ? $state : '—')?></span>
							</div>
							<div>
								<div class="text-muted small">타입 (type)</div>
								<span class="badge bg-<?=$typeColor?>" style="font-size:14px; padding:6px 12px;"><?=htmlspecialchars($type ? $type : '—')?></span>
							</div>
							<div class="ms-auto text-end">
								<div class="text-muted small">operationID</div>
								<span class="opid-display"><?=htmlspecialchars($id)?></span>
							</div>
						</div>
					</div>
				</div>

				<!-- 라이선스 키 (capsule이 있을 때만) -->
				<? if($key){ ?>
				<div class="card mb-3">
					<div class="card-body text-center py-4">
						<div class="section-title">라이선스 키</div>
						<span class="key-display"><?=htmlspecialchars($key)?></span>
						<div class="mt-3 text-muted small">
							<i class="mdi mdi-cube-outline"></i> 플랫폼: <strong><?=htmlspecialchars($platform)?></strong>
						</div>
					</div>
				</div>
				<? } ?>

				<div class="row g-3 mb-3">
					<div class="col-md-4">
						<div class="card h-100">
							<div class="card-body">
								<div class="section-title">처리량 (Quantity)</div>
								<table class="table table-sm table-borderless mb-0">
									<tbody>
										<? if($qtyToProcess !== null){ ?>
										<tr><td class="label-col">qtyToProcess</td><td><?=htmlspecialchars($qtyToProcess)?></td></tr>
										<? } ?>
										<? if($qtyProcessed !== null){ ?>
										<tr><td class="label-col">qtyProcessed</td><td><span class="badge bg-success"><?=(int)$qtyProcessed?></span></td></tr>
										<? } ?>
										<? if($qtyInError !== null){ ?>
										<tr><td class="label-col">qtyInError</td><td>
											<? if((int)$qtyInError > 0){ ?>
											<span class="badge bg-danger"><?=(int)$qtyInError?></span>
											<? } else { ?>
											<span class="badge bg-secondary">0</span>
											<? } ?>
										</td></tr>
										<? } ?>
									</tbody>
								</table>
							</div>
						</div>
					</div>

					<div class="col-md-4">
						<div class="card h-100">
							<div class="card-body">
								<div class="section-title">시각</div>
								<table class="table table-sm table-borderless mb-0">
									<tbody>
										<tr><td class="label-col">createdAt</td><td><?=htmlspecialchars(pn_fmt_date($createdAt))?></td></tr>
										<tr><td class="label-col">lastUpdatedAt</td><td><?=htmlspecialchars(pn_fmt_date($lastUpdated))?></td></tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>

					<div class="col-md-4">
						<div class="card h-100">
							<div class="card-body">
								<div class="section-title">상품 / 빌드</div>
								<table class="table table-sm table-borderless mb-0">
									<tbody>
										<? if($buildID){ ?>
										<tr><td class="label-col">buildID</td><td class="uuid">
											<a href="pointnexus_product_view.php?mode=<?=urlencode($mode)?>&id=<?=urlencode($buildID)?>" class="text-info text-decoration-none">
												<?=htmlspecialchars($buildID)?> <i class="mdi mdi-open-in-new"></i>
											</a>
										</td></tr>
										<? } ?>
										<? if($countryCodes){ ?>
										<tr><td class="label-col">countryCodes</td><td><?=htmlspecialchars($countryCodes)?></td></tr>
										<? } ?>
										<? if($capsuleID){ ?>
										<tr><td class="label-col">capsule</td><td class="uuid">
											<a href="pointnexus_capsule.php?mode=<?=urlencode($mode)?>&id=<?=urlencode($capsuleID)?>" class="text-info text-decoration-none">
												<?=htmlspecialchars(substr($capsuleID, 0, 16))?>… <i class="mdi mdi-open-in-new"></i>
											</a>
										</td></tr>
										<? } ?>
										<? if(!$buildID && !$countryCodes && !$capsuleID){ ?>
										<tr><td colspan="2" class="text-muted text-center">아직 처리 정보 없음</td></tr>
										<? } ?>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				<!-- 결제·수익 배분 (details) -->
				<? if($details){
					$dArr = (array)$details;
					$sellPrice          = isset($dArr['sellPrice'])                     ? $dArr['sellPrice']                     : null;
					$sellCurr           = isset($dArr['sellCurrencyCode'])              ? $dArr['sellCurrencyCode']              : '';
					$vat                = isset($dArr['VAT'])                           ? $dArr['VAT']                           : null;
					$convCurr           = isset($dArr['convertedCurrencyCode'])         ? $dArr['convertedCurrencyCode']         : '';
					$sellPriceConv      = isset($dArr['sellPriceConverted'])            ? $dArr['sellPriceConverted']            : null;
					$conversionRate     = isset($dArr['conversionRate'])                ? $dArr['conversionRate']                : '';
					$srpBefore          = isset($dArr['SRPBeforePromo'])                ? $dArr['SRPBeforePromo']                : null;
					$srp                = isset($dArr['SRP'])                           ? $dArr['SRP']                           : null;
					$promoName          = isset($dArr['promoName'])                     ? $dArr['promoName']                     : null;
					$promoPct           = isset($dArr['promoDiscountPct'])              ? $dArr['promoDiscountPct']              : 0;
					$revSharePct        = isset($dArr['revSharePct'])                   ? $dArr['revSharePct']                   : null;
					$pubAmount          = isset($dArr['publisherShareAmount'])          ? $dArr['publisherShareAmount']          : null;
					$pubCurr            = isset($dArr['publisherCurrencyCode'])         ? $dArr['publisherCurrencyCode']         : '';
					$sellerAmount       = isset($dArr['sellerShareAmount'])             ? $dArr['sellerShareAmount']             : null;
					$sellerCurr         = isset($dArr['sellerCurrencyCode'])            ? $dArr['sellerCurrencyCode']            : '';
				?>
				<div class="row g-3 mb-3">
					<div class="col-lg-4">
						<div class="card h-100">
							<div class="card-body">
								<div class="section-title">판매 가격</div>
								<table class="table table-sm table-borderless mb-0">
									<tbody>
										<? if($sellPrice !== null){ ?>
										<tr><td class="label-col">sellPrice</td><td class="fw-semibold"><?=htmlspecialchars(pn_currency_amount($sellPrice, $sellCurr))?></td></tr>
										<? } ?>
										<? if($vat !== null){ ?>
										<tr><td class="label-col">VAT (세율)</td><td><?=number_format($vat/100, 2)?> %</td></tr>
										<? } ?>
										<? if($sellPriceConv !== null){ ?>
										<tr><td class="label-col">환산 가격</td><td><?=htmlspecialchars(pn_currency_amount($sellPriceConv, $convCurr))?></td></tr>
										<? } ?>
										<? if($conversionRate){ ?>
										<tr><td class="label-col">환율</td><td><?=htmlspecialchars($conversionRate)?></td></tr>
										<? } ?>
									</tbody>
								</table>
							</div>
						</div>
					</div>

					<div class="col-lg-4">
						<div class="card h-100">
							<div class="card-body">
								<div class="section-title">정가 / 프로모션</div>
								<table class="table table-sm table-borderless mb-0">
									<tbody>
										<? if($srpBefore !== null){ ?>
										<tr><td class="label-col">SRP (할인 전)</td><td><?=htmlspecialchars(pn_currency_amount($srpBefore, $convCurr))?></td></tr>
										<? } ?>
										<? if($srp !== null){ ?>
										<tr><td class="label-col">SRP</td><td class="fw-semibold"><?=htmlspecialchars(pn_currency_amount($srp, $convCurr))?></td></tr>
										<? } ?>
										<tr><td class="label-col">프로모션</td><td>
											<? if($promoName){ ?>
											<span class="badge bg-warning text-dark"><?=htmlspecialchars($promoName)?></span>
											<small class="ms-2 text-warning"><?=number_format((float)$promoPct, 1)?>% 할인</small>
											<? } else { ?>
											<span class="text-muted">없음</span>
											<? } ?>
										</td></tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>

					<div class="col-lg-4">
						<div class="card h-100">
							<div class="card-body">
								<div class="section-title">수익 배분</div>
								<table class="table table-sm table-borderless mb-0">
									<tbody>
										<? if($revSharePct !== null){ ?>
										<tr><td class="label-col">revSharePct</td><td><span class="badge bg-info"><?=htmlspecialchars($revSharePct)?>%</span></td></tr>
										<? } ?>
										<? if($pubAmount !== null){ ?>
										<tr><td class="label-col">퍼블리셔</td><td class="fw-semibold text-success"><?=htmlspecialchars(pn_currency_amount($pubAmount, $pubCurr))?></td></tr>
										<? } ?>
										<? if($sellerAmount !== null){ ?>
										<tr><td class="label-col">셀러</td><td class="fw-semibold text-info"><?=htmlspecialchars(pn_currency_amount($sellerAmount, $sellerCurr))?></td></tr>
										<? } ?>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
				<? } ?>

				<? if($capsuleID){ ?>
				<div class="card mb-3">
					<div class="card-body">
						<div class="section-title">관련 페이지</div>
						<div class="d-flex gap-2 flex-wrap">
							<a href="pointnexus_capsule.php?mode=<?=urlencode($mode)?>&id=<?=urlencode($capsuleID)?>" class="btn btn-sm btn-outline-info">
								<i class="mdi mdi-cube-outline"></i> 캡슐 상세
							</a>
						</div>
					</div>
				</div>
				<? } ?>

				<? pn_json_box($result); ?>
				<? } else { ?>
					<div class="alert alert-warning">데이터 없음</div>
				<? } ?>
			</div>
			<!-- /container-fluid -->
		</div>
		<!-- /content -->
	</div>
	<!-- /content-page -->
</div>
<!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
