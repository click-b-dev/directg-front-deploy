<?
header('Content-Type: text/html; charset=UTF-8');
ini_set("display_errors", 1);
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['order'] = "active";
$sidebar_file = "sidebar_order.php";

$page_title = "PointNexus Operation 조회";

$operationID = filter_input(INPUT_GET, "operationID", FILTER_SANITIZE_STRING);
$mode        = filter_input(INPUT_GET, "mode",        FILTER_SANITIZE_STRING);

if($mode != "prod"){ $mode = "test"; }

$response = null;
$error    = "";

if($operationID){
	try {
		$pointnexus = new PointNexus($mode);
		$response   = $pointnexus->runOperation($operationID);
	} catch (Exception $e) {
		$error = $e->getMessage();
	}
}

$data = null;
if(isset($response->data)){
	if(is_array($response->data) && count($response->data) > 0){
		$data = $response->data[0]; //PointNexus는 단일 조회도 data 배열로 반환
	}else if(is_object($response->data)){
		$data = $response->data;
	}
}
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
.kv-table th { width: 200px; background:#f8f9fa; font-weight:600; }
.kv-table td { word-break: break-all; }
.raw-json { background:#1e1e1e; color:#dcdcdc; padding:15px; border-radius:4px; font-family:monospace; font-size:12px; max-height:500px; overflow:auto; }
.badge-mode-test { background:#ffc107; color:#000; }
.badge-mode-prod { background:#dc3545; color:#fff; }
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">주문관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?> <small class="text-muted">GET /operation/{id} 실시간 호출</small></h4>
						</div>
					</div>
				</div>

				<div class="row g-0">
					<div class="card">
						<div class="card-body">
							<form method="get" class="row g-2 mb-3">
								<div class="col-md-2">
									<select name="mode" class="form-select form-select-sm">
										<option value="test" <?=($mode=="test")?"selected":""?>>test</option>
										<option value="prod" <?=($mode=="prod")?"selected":""?>>prod</option>
									</select>
								</div>
								<div class="col-md-6">
									<input type="text" name="operationID" class="form-control form-control-sm" placeholder="operationID" value="<?=htmlspecialchars($operationID)?>">
								</div>
								<div class="col-md-2">
									<button type="submit" class="btn btn-sm btn-primary">조회</button>
								</div>
							</form>

							<?php if($error){ ?>
								<div class="alert alert-danger">에러: <?=htmlspecialchars($error)?></div>
							<?php } ?>

							<?php if($operationID && !$response){ ?>
								<div class="alert alert-warning">응답을 받지 못했습니다.</div>
							<?php } ?>

							<?php if($response){ ?>
								<div class="mb-3">
									<span class="badge badge-mode-<?=$mode?>"><?=strtoupper($mode)?></span>
									<?php if(!empty($response->success)){ ?>
										<span class="badge bg-success">success</span>
									<?php }else{ ?>
										<span class="badge bg-danger">failed</span>
									<?php } ?>
								</div>

								<?php if($data){ $d = $data; ?>
									<h5 class="mt-3">기본 정보</h5>
									<table class="table table-bordered table-sm kv-table">
										<tr><th>operationID (요청값)</th><td><?=htmlspecialchars($operationID)?></td></tr>
										<tr><th>type</th><td><?=htmlspecialchars(isset($d->type)?$d->type:'')?></td></tr>
										<tr><th>state</th><td><?=htmlspecialchars(isset($d->state)?$d->state:'')?></td></tr>
										<tr><th>qtyToProcess</th><td><?=htmlspecialchars(isset($d->qtyToProcess)?$d->qtyToProcess:'')?></td></tr>
										<tr><th>qtyProcessed</th><td><?=htmlspecialchars(isset($d->qtyProcessed)?$d->qtyProcessed:'')?></td></tr>
										<tr><th>qtyInError</th><td><?=htmlspecialchars(isset($d->qtyInError)?$d->qtyInError:'')?></td></tr>
										<tr><th>createdAt</th><td><?=htmlspecialchars(isset($d->createdAt)?$d->createdAt:'')?></td></tr>
										<tr><th>lastUpdatedAt</th><td><?=htmlspecialchars(isset($d->lastUpdatedAt)?$d->lastUpdatedAt:'')?></td></tr>
										<tr><th>buildID</th><td><?=htmlspecialchars(isset($d->buildID)?$d->buildID:'')?></td></tr>
									</table>

									<?php if(isset($d->productVariant)){ $pv = $d->productVariant; ?>
										<h5 class="mt-3">상품 변형</h5>
										<table class="table table-bordered table-sm kv-table">
											<tr><th>productVariant.countryCodes</th><td><?=htmlspecialchars(isset($pv->countryCodes)?$pv->countryCodes:'')?></td></tr>
										</table>
									<?php } ?>

									<?php if(isset($d->capsule)){ $c = $d->capsule; ?>
										<h5 class="mt-3">캡슐 / 라이선스 키</h5>
										<table class="table table-bordered table-sm kv-table">
											<tr><th>capsule.id</th><td><?=htmlspecialchars(isset($c->id)?$c->id:'')?></td></tr>
											<tr><th>capsule.item.platform</th><td><?=htmlspecialchars(isset($c->item->platform)?$c->item->platform:'')?></td></tr>
											<tr><th>capsule.item.key</th><td><strong><?=htmlspecialchars(isset($c->item->key)?$c->item->key:'')?></strong></td></tr>
										</table>
									<?php } ?>

									<?php if(isset($d->details)){ $dt = $d->details; ?>
										<h5 class="mt-3">결제/금액</h5>
										<table class="table table-bordered table-sm kv-table">
											<tr><th>sellPrice</th><td><?=htmlspecialchars(isset($dt->sellPrice)?number_format($dt->sellPrice):'')?> <?=htmlspecialchars(isset($dt->sellCurrencyCode)?$dt->sellCurrencyCode:'')?></td></tr>
											<tr><th>VAT</th><td><?=htmlspecialchars(isset($dt->VAT)?$dt->VAT:'')?> (×100, 1000=10%)</td></tr>
											<tr><th>sellPriceConverted</th><td><?=htmlspecialchars(isset($dt->sellPriceConverted)?number_format($dt->sellPriceConverted):'')?> <?=htmlspecialchars(isset($dt->convertedCurrencyCode)?$dt->convertedCurrencyCode:'')?></td></tr>
											<tr><th>conversionRate</th><td><?=htmlspecialchars(isset($dt->conversionRate)?$dt->conversionRate:'')?></td></tr>
											<tr><th>SRP / SRPBeforePromo</th><td><?=htmlspecialchars(isset($dt->SRP)?number_format($dt->SRP):'')?> / <?=htmlspecialchars(isset($dt->SRPBeforePromo)?number_format($dt->SRPBeforePromo):'')?></td></tr>
											<tr><th>promoName</th><td><?=htmlspecialchars(isset($dt->promoName)?$dt->promoName:'')?></td></tr>
											<tr><th>promoDiscountPct</th><td><?=htmlspecialchars(isset($dt->promoDiscountPct)?$dt->promoDiscountPct:'')?></td></tr>
										</table>

										<h5 class="mt-3">수익 배분 (공급가)</h5>
										<table class="table table-bordered table-sm kv-table">
											<tr><th>revSharePct</th><td><?=htmlspecialchars(isset($dt->revSharePct)?$dt->revSharePct:'')?> %</td></tr>
											<tr><th>publisherShareAmount</th><td><?=htmlspecialchars(isset($dt->publisherShareAmount)?number_format($dt->publisherShareAmount):'')?> <?=htmlspecialchars(isset($dt->publisherCurrencyCode)?$dt->publisherCurrencyCode:'')?> (변환: <?=htmlspecialchars(isset($dt->publisherShareAmountConverted)?number_format($dt->publisherShareAmountConverted):'')?>)</td></tr>
											<tr><th>sellerShareAmount</th><td><?=htmlspecialchars(isset($dt->sellerShareAmount)?number_format($dt->sellerShareAmount):'')?> <?=htmlspecialchars(isset($dt->sellerCurrencyCode)?$dt->sellerCurrencyCode:'')?> (변환: <?=htmlspecialchars(isset($dt->sellerShareAmountConverted)?number_format($dt->sellerShareAmountConverted):'')?>)</td></tr>
										</table>
									<?php } ?>
								<?php } ?>

								<h5 class="mt-3">Raw Response</h5>
								<pre class="raw-json"><?=htmlspecialchars(json_encode($response, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES))?></pre>
							<?php } ?>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</div>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_foot.php'); ?>
</body>
</html>
