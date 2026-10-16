<?
header('Content-Type: text/html; charset=utf-8');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once(__DIR__.'/_layout.php');

//API 정의 — 각 항목은 개별 파일로 동작 (폼 제출 시 target="_blank"로 새 창에서 열림)
$apis = array(
	array(
		'group'  => 'Authentication',
		'method' => 'GET',
		'path'   => '/test',
		'file'   => 'test.php',
		'name'   => '인증 상태 확인',
		'desc'   => '토큰 유효성 및 환경(sandbox) 확인',
		'fields' => array(),
	),
	array(
		'group'  => 'ProductType',
		'method' => 'GET',
		'path'   => '/productType',
		'file'   => 'product_type.php',
		'name'   => '상품 타입 목록 조회',
		'desc'   => '현재 조직에 허용된 상품 타입 목록 반환',
		'fields' => array(),
	),
	array(
		'group'  => 'Product',
		'method' => 'GET',
		'path'   => '/product',
		'file'   => 'product_list.php',
		'name'   => '상품 목록 조회',
		'desc'   => '판매 가능한 카탈로그 전체 목록 (페이지네이션)',
		'fields' => array(
			array('name'=>'offset',  'label'=>'offset',  'placeholder'=>'0',  'value'=>'0',  'col'=>'col-md-2'),
			array('name'=>'limit',   'label'=>'limit',   'placeholder'=>'50 (10~100)', 'value'=>'50', 'col'=>'col-md-2'),
			array('name'=>'filters', 'label'=>'filters', 'placeholder'=>'[{"field":"type","op":"=","value":"sale"}]', 'col'=>'col-md-8'),
		),
	),
	array(
		'group'  => 'Product',
		'method' => 'GET',
		'path'   => '/product/{id}',
		'file'   => 'product_view.php',
		'name'   => '특정 상품 조회',
		'desc'   => '상품 UUID로 단건 조회',
		'fields' => array(
			array('name'=>'id', 'label'=>'id (필수)', 'placeholder'=>'상품 UUID', 'col'=>'col-md-12', 'required'=>true),
		),
	),
	array(
		'group'  => 'Product',
		'method' => 'POST',
		'path'   => '/product/{id}/check',
		'file'   => 'product_check.php',
		'name'   => '판매 가능 여부 사전 확인',
		'desc'   => 'sell과 동일한 파라미터를 받아 규칙·재고 검증만 수행 (실제 키 발급 없음)',
		'fields' => array(
			array('name'=>'id',           'label'=>'id (필수)',          'placeholder'=>'상품 UUID', 'col'=>'col-md-6', 'required'=>true),
			array('name'=>'currency',     'label'=>'currency (필수)',    'placeholder'=>'USD',       'col'=>'col-md-2', 'required'=>true),
			array('name'=>'countryCode',  'label'=>'countryCode (필수)', 'placeholder'=>'US',        'col'=>'col-md-2', 'required'=>true),
			array('name'=>'price',        'label'=>'price (필수)',       'placeholder'=>'5990',      'col'=>'col-md-1', 'required'=>true),
			array('name'=>'vat',          'label'=>'vat (필수)',         'placeholder'=>'2000',      'col'=>'col-md-1', 'required'=>true),
			array('name'=>'IP',              'label'=>'IP',              'placeholder'=>'123.45.67.89', 'col'=>'col-md-3'),
			array('name'=>'buyerCountry',    'label'=>'buyerCountry',    'placeholder'=>'US',           'col'=>'col-md-3'),
			array('name'=>'clientRequestID', 'label'=>'clientRequestID', 'placeholder'=>'24h 내 중복 방지', 'col'=>'col-md-6'),
		),
	),
	array(
		'group'  => 'Product',
		'method' => 'POST',
		'path'   => '/product/{id}/sell',
		'file'   => 'product_sell.php',
		'name'   => '즉시 판매 (라이선스 키 발급)',
		'desc'   => 'Released SKU는 즉시 키 반환, Preorder SKU는 reveal로 나중에 조회 — operationID 저장 필수',
		'fields' => array(
			array('name'=>'id',           'label'=>'id (필수)',          'placeholder'=>'상품 UUID', 'col'=>'col-md-6', 'required'=>true),
			array('name'=>'currency',     'label'=>'currency (필수)',    'placeholder'=>'USD',       'col'=>'col-md-2', 'required'=>true),
			array('name'=>'countryCode',  'label'=>'countryCode (필수)', 'placeholder'=>'US',        'col'=>'col-md-2', 'required'=>true),
			array('name'=>'price',        'label'=>'price (필수)',       'placeholder'=>'5990',      'col'=>'col-md-1', 'required'=>true),
			array('name'=>'vat',          'label'=>'vat (필수)',         'placeholder'=>'2000',      'col'=>'col-md-1', 'required'=>true),
			array('name'=>'IP',              'label'=>'IP',              'placeholder'=>'123.45.67.89', 'col'=>'col-md-3'),
			array('name'=>'buyerCountry',    'label'=>'buyerCountry',    'placeholder'=>'US',           'col'=>'col-md-3'),
			array('name'=>'clientRequestID', 'label'=>'clientRequestID', 'placeholder'=>'24h 내 중복 방지', 'col'=>'col-md-6'),
		),
	),
	array(
		'group'  => 'Product',
		'method' => 'POST',
		'path'   => '/product/{id}/book',
		'file'   => 'product_book.php',
		'name'   => '예약 (결제 대기용 키 선점)',
		'desc'   => '결제 확인 대기 중 키 선점 (최대 14일 유효, 이후 자동 취소)',
		'fields' => array(
			array('name'=>'id',           'label'=>'id (필수)',          'placeholder'=>'상품 UUID', 'col'=>'col-md-6', 'required'=>true),
			array('name'=>'currency',     'label'=>'currency (필수)',    'placeholder'=>'USD',       'col'=>'col-md-2', 'required'=>true),
			array('name'=>'countryCode',  'label'=>'countryCode (필수)', 'placeholder'=>'US',        'col'=>'col-md-2', 'required'=>true),
			array('name'=>'price',        'label'=>'price (필수)',       'placeholder'=>'5990',      'col'=>'col-md-1', 'required'=>true),
			array('name'=>'vat',          'label'=>'vat (필수)',         'placeholder'=>'2000',      'col'=>'col-md-1', 'required'=>true),
			array('name'=>'IP',              'label'=>'IP',              'placeholder'=>'123.45.67.89', 'col'=>'col-md-3'),
			array('name'=>'buyerCountry',    'label'=>'buyerCountry',    'placeholder'=>'US',           'col'=>'col-md-3'),
			array('name'=>'clientRequestID', 'label'=>'clientRequestID', 'placeholder'=>'24h 내 중복 방지', 'col'=>'col-md-6'),
		),
	),
	array(
		'group'  => 'Operation',
		'method' => 'GET',
		'path'   => '/operation/{id}',
		'file'   => 'operation_view.php',
		'name'   => '오퍼레이션 조회',
		'desc'   => 'sell/book 시 응답된 operationID로 단건 조회',
		'fields' => array(
			array('name'=>'id', 'label'=>'id (필수)', 'placeholder'=>'오퍼레이션 UUID', 'col'=>'col-md-12', 'required'=>true),
		),
	),
	array(
		'group'  => 'Operation',
		'method' => 'POST',
		'path'   => '/operation/{id}/reveal',
		'file'   => 'operation_reveal.php',
		'name'   => '프리오더 키 공개',
		'desc'   => '프리오더 sell 후 출시 완료 시 실제 키 조회 (400 응답 시 미출시 → 재시도)',
		'fields' => array(
			array('name'=>'id', 'label'=>'id (필수)', 'placeholder'=>'프리오더 판매 operationID', 'col'=>'col-md-12', 'required'=>true),
		),
	),
	array(
		'group'  => 'Operation',
		'method' => 'POST',
		'path'   => '/operation/{id}/cancel',
		'file'   => 'operation_cancel.php',
		'name'   => '오퍼레이션 취소',
		'desc'   => '오퍼레이션 타입과 현재 상태에 따라 취소 처리',
		'fields' => array(
			array('name'=>'id', 'label'=>'id (필수)', 'placeholder'=>'취소할 operationID', 'col'=>'col-md-12', 'required'=>true),
		),
	),
	array(
		'group'  => 'Book',
		'method' => 'POST',
		'path'   => '/book/{id}/confirm',
		'file'   => 'book_confirm.php',
		'name'   => '예약 확정 (키 공개)',
		'desc'   => '결제 완료 후 호출 — 예약된 키 최종 반환 및 판매 완료 처리',
		'fields' => array(
			array('name'=>'id', 'label'=>'id (필수)', 'placeholder'=>'예약 operationID', 'col'=>'col-md-12', 'required'=>true),
		),
	),
	array(
		'group'  => 'Book',
		'method' => 'POST',
		'path'   => '/book/{id}/cancel',
		'file'   => 'book_cancel.php',
		'name'   => '예약 취소 (키 반납)',
		'desc'   => '예약 취소 시 키를 재고로 반납',
		'fields' => array(
			array('name'=>'id', 'label'=>'id (필수)', 'placeholder'=>'취소할 예약 operationID', 'col'=>'col-md-12', 'required'=>true),
		),
	),
	array(
		'group'  => 'Promo',
		'method' => 'GET',
		'path'   => '/promo',
		'file'   => 'promo_list.php',
		'name'   => '진행 중/예정 프로모션 캠페인 목록',
		'desc'   => '전체 캠페인 목록 반환',
		'fields' => array(),
	),
	array(
		'group'  => 'Promo',
		'method' => 'POST',
		'path'   => '/promo',
		'file'   => 'promo_filter.php',
		'name'   => '필터링된 프로모션 캠페인 목록',
		'desc'   => '기간·상품·발행자 기준 필터링',
		'fields' => array(
			array('name'=>'startDate',  'label'=>'startDate',  'placeholder'=>'2025-01-29T23:00:00+0000', 'col'=>'col-md-3'),
			array('name'=>'endDate',    'label'=>'endDate',    'placeholder'=>'2025-01-30T23:00:00+0000', 'col'=>'col-md-3'),
			array('name'=>'productIDs', 'label'=>'productIDs (콤마구분)', 'placeholder'=>'uuid1, uuid2', 'col'=>'col-md-3'),
			array('name'=>'issuerIDs',  'label'=>'issuerIDs (콤마구분)',  'placeholder'=>'uuid1, uuid2', 'col'=>'col-md-3'),
		),
	),
	array(
		'group'  => 'Promo',
		'method' => 'GET',
		'path'   => '/promo/{id}',
		'file'   => 'promo_view.php',
		'name'   => '특정 프로모션 캠페인 조회',
		'desc'   => '캠페인 UUID로 단건 조회',
		'fields' => array(
			array('name'=>'id', 'label'=>'id (필수)', 'placeholder'=>'캠페인 UUID', 'col'=>'col-md-12', 'required'=>true),
		),
	),
	array(
		'group'  => 'Partners',
		'method' => 'GET',
		'path'   => '/partner',
		'file'   => 'partner_list.php',
		'name'   => '파트너 목록 조회',
		'desc'   => 'persona로 필터링 가능 (publisher | manufacturer | distributor | store | influencer | platform | trader)',
		'fields' => array(
			array('name'=>'persona', 'label'=>'persona', 'placeholder'=>'publisher', 'col'=>'col-md-12', 'type'=>'select',
				'options'=>array(''=>'(전체)','publisher'=>'publisher','manufacturer'=>'manufacturer','distributor'=>'distributor','store'=>'store','influencer'=>'influencer','platform'=>'platform','trader'=>'trader')),
		),
	),
	array(
		'group'  => 'Partners',
		'method' => 'GET',
		'path'   => '/partner/{partnerID}',
		'file'   => 'partner_view.php',
		'name'   => '특정 파트너 조회',
		'desc'   => '파트너 UUID로 단건 조회',
		'fields' => array(
			array('name'=>'partnerID', 'label'=>'partnerID (필수)', 'placeholder'=>'파트너 UUID', 'col'=>'col-md-12', 'required'=>true),
		),
	),
	array(
		'group'  => 'Capsule',
		'method' => 'GET',
		'path'   => '/capsule/{id}',
		'file'   => 'capsule_view.php',
		'name'   => '캡슐 조회',
		'desc'   => '캡슐 hex ID로 단건 조회',
		'fields' => array(
			array('name'=>'id', 'label'=>'id (필수)', 'placeholder'=>'캡슐 hex ID', 'col'=>'col-md-12', 'required'=>true),
		),
	),
	array(
		'group'  => 'ActivityLog',
		'method' => 'GET',
		'path'   => '/activitylog',
		'file'   => 'activitylog_list.php',
		'name'   => '활동 로그 목록 조회',
		'desc'   => '판매·취소·수익배분 등 전체 네트워크 이벤트 로그 (BI 연동용)',
		'fields' => array(
			array('name'=>'offset',        'label'=>'offset',        'placeholder'=>'0',  'value'=>'0',  'col'=>'col-md-2'),
			array('name'=>'limit',         'label'=>'limit',         'placeholder'=>'50', 'value'=>'50', 'col'=>'col-md-2'),
			array('name'=>'sort',          'label'=>'sort',          'value'=>'createdAt', 'col'=>'col-md-2', 'type'=>'select',
				'options'=>array('createdAt'=>'createdAt','productID'=>'productID','type'=>'type')),
			array('name'=>'sortDirection', 'label'=>'sortDirection', 'value'=>'DESC', 'col'=>'col-md-2', 'type'=>'select',
				'options'=>array('DESC'=>'DESC','ASC'=>'ASC')),
			array('name'=>'filters',       'label'=>'filters',       'placeholder'=>'[{"field":"type","op":"=","value":"sale"}]', 'col'=>'col-md-4'),
		),
	),
	array(
		'group'  => 'ActivityLog',
		'method' => 'GET',
		'path'   => '/activitylog/{id}',
		'file'   => 'activitylog_view.php',
		'name'   => '특정 활동 로그 조회',
		'desc'   => '로그 UUID로 단건 조회',
		'fields' => array(
			array('name'=>'id', 'label'=>'id (필수)', 'placeholder'=>'로그 UUID', 'col'=>'col-md-12', 'required'=>true),
		),
	),
);

$groups = array();
foreach ($apis as $api) {
	$groups[$api['group']][] = $api;
}
?>
<!DOCTYPE html>
<html lang="ko" data-bs-theme="dark">
<head>
<meta charset="utf-8">
<title>Point Nexus — API 목록</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="shortcut icon" href="/favicon.ico">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
<style>
body { font-family: 'Noto Sans KR', sans-serif; font-size: 14px; background: #1a1a2e; }
.page-header { background: linear-gradient(135deg, #16213e, #0f3460); border-bottom: 1px solid #0f3460; }
.api-card { background: #12122a; border: 1px solid #2a2a4a; }
.api-card .card-body { padding: 14px 16px; }
.method-badge { font-family: monospace; font-size: 11px; min-width: 50px; font-weight: 700; }
.method-GET    { background: #0d6efd; }
.method-POST   { background: #198754; }
.api-path { font-family: monospace; font-size: 13px; color: #e0e0e0; }
.api-name { font-size: 13px; color: #adb5bd; }
.api-desc { font-size: 12px; color: #6c757d; }
.group-header { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #6c757d; border-bottom: 1px solid #2a2a4a; padding-bottom: 6px; margin: 24px 0 12px; }
.field-label { font-size: 11px; color: #6c757d; margin-bottom: 2px; }
.form-control-sm, .form-select-sm { font-size: 12px; background: #0d0d20; border-color: #2a2a4a; color: #e0e0e0; }
.form-control-sm:focus, .form-select-sm:focus { background: #0d0d20; border-color: #0d6efd; color: #e0e0e0; box-shadow: none; }
.btn-run { font-size: 12px; }
.jump-nav a { color: #adb5bd; text-decoration: none; font-size: 12px; padding: 2px 8px; border-radius: 4px; }
.jump-nav a:hover { background: #2a2a4a; color: #fff; }
</style>
</head>
<body>

<div class="page-header py-3 px-4 mb-3">
	<div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
		<div>
			<h5 class="mb-0 text-white"><i class="fas fa-plug me-2 text-info"></i>Point Nexus — API 목록</h5>
			<small class="text-secondary">Base URL: https://api.point.nexus/v1 · Mode: <span class="badge bg-warning text-dark"><?=htmlspecialchars($mode)?></span> · 실행 시 새 창에서 결과가 열립니다</small>
		</div>
	</div>
</div>

<div class="container-fluid px-4">

<!-- 점프 메뉴 -->
<div class="jump-nav d-flex flex-wrap gap-1 mb-3">
	<?foreach (array_keys($groups) as $g):?>
	<a href="#group-<?=htmlspecialchars($g)?>"><i class="fas fa-angle-right"></i> <?=htmlspecialchars($g)?></a>
	<?endforeach?>
</div>

<!-- API 카드 목록 -->
<?foreach ($groups as $group_name => $group_apis):?>
<div class="group-header" id="group-<?=htmlspecialchars($group_name)?>"><?=htmlspecialchars($group_name)?></div>

<?foreach ($group_apis as $api):?>
<div class="card api-card mb-2">
	<div class="card-body">
		<form method="<?=$api['method']?>" action="<?=htmlspecialchars($api['file'])?>" target="_blank" class="row g-2 align-items-end">

			<div class="col-md-12 d-flex align-items-center flex-wrap gap-2 mb-1">
				<span class="badge method-badge method-<?=$api['method']?>"><?=$api['method']?></span>
				<span class="api-path"><?=htmlspecialchars($api['path'])?></span>
				<span class="api-name">— <?=htmlspecialchars($api['name'])?></span>
			</div>

			<div class="col-md-12">
				<div class="api-desc mb-1"><?=htmlspecialchars($api['desc'])?></div>
			</div>

			<?foreach ($api['fields'] as $field):?>
			<div class="<?=$field['col']?>">
				<div class="field-label"><?=htmlspecialchars($field['label'])?></div>
				<?if (!empty($field['type']) && $field['type']==='select'):?>
				<select name="<?=htmlspecialchars($field['name'])?>" class="form-select form-select-sm">
					<?foreach ($field['options'] as $val => $disp):?>
					<option value="<?=htmlspecialchars($val)?>" <?=(!empty($field['value']) && $field['value']===$val)?'selected':''?>><?=htmlspecialchars($disp)?></option>
					<?endforeach?>
				</select>
				<?else:?>
				<input type="text"
				       name="<?=htmlspecialchars($field['name'])?>"
				       class="form-control form-control-sm"
				       placeholder="<?=htmlspecialchars($field['placeholder'] ?? '')?>"
				       value="<?=htmlspecialchars($field['value'] ?? '')?>"
				       <?=!empty($field['required'])?'required':''?>>
				<?endif?>
			</div>
			<?endforeach?>

			<div class="col-md-12 text-end">
				<button type="submit" class="btn btn-sm btn-primary btn-run">
					<i class="fas fa-up-right-from-square me-1"></i>새 창에서 실행
				</button>
			</div>
		</form>
	</div>
</div>
<?endforeach?>

<?endforeach?>

<div class="text-center text-secondary small py-4">
	총 <?=count($apis)?>개 엔드포인트
</div>

</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
</body>
</html>
