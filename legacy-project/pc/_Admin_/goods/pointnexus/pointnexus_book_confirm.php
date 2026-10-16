<?
header('Content-Type: text/html; charset=UTF-8');
ini_set("display_errors", 1);
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "PointNexus Book Confirm";

//필터
$mode    = filter_input(INPUT_GET, "mode",  FILTER_SANITIZE_STRING);
$f_ordno = filter_input(INPUT_GET, "ordno", FILTER_SANITIZE_STRING);
$f_m_id  = filter_input(INPUT_GET, "m_id",  FILTER_SANITIZE_STRING);
$page    = (int)filter_input(INPUT_GET, "page", FILTER_SANITIZE_NUMBER_INT);
if($page < 1) $page = 1;
$page_size = 30;

//flash 처리 (URL에서 받음)
$flash      = filter_input(INPUT_GET, "flash",      FILTER_SANITIZE_STRING);
$flash_type = filter_input(INPUT_GET, "flash_type", FILTER_SANITIZE_STRING);

//목록 조회
$rows  = array();
$total = 0;
$db_error = "";

try {
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	//(ordno, productID)별 최신 row가 action='book' AND status='booked' 인 것만 — 이미 confirm/cancel 된 chain은 latest 가 달라서 제외됨
	$where  = " WHERE a.action='book' AND a.status='booked' ";
	$params = array();
	if($mode == 'test' || $mode == 'prod'){
		$where .= " AND a.mode=:mode ";
		$params[':mode'] = $mode;
	}
	if($f_ordno){
		$where .= " AND a.ordno LIKE :ordno ";
		$params[':ordno'] = '%'.$f_ordno.'%';
	}
	if($f_m_id){
		$where .= " AND a.m_id LIKE :m_id ";
		$params[':m_id'] = '%'.$f_m_id.'%';
	}

	//latest row per (ordno, productID) — append-only 모델에서 "현재 상태" 산출
	$base_from = "FROM tbl_order_item_pointnexus a
	              INNER JOIN (
	                  SELECT ordno, productID, MAX(idx) AS max_idx
	                  FROM tbl_order_item_pointnexus
	                  GROUP BY ordno, productID
	              ) c ON c.ordno = a.ordno AND c.productID = a.productID AND c.max_idx = a.idx
	              LEFT JOIN tbl_order_item b ON b.ordno = a.ordno";

	//total
	$stmt = $conn->prepare("SELECT COUNT(*) ".$base_from.$where);
	$stmt->execute($params);
	$total = (int)$stmt->fetchColumn();

	$total_pages = $total > 0 ? (int)ceil($total / $page_size) : 1;
	if($page > $total_pages) $page = $total_pages;
	$offset = ($page - 1) * $page_size;

	$sql = "SELECT a.idx, a.m_no, a.m_id, a.ordno, a.productID, a.operationID, a.action, a.license_platform,
	               a.currency, a.countryCode, a.price, a.vat, a.clientRequestID,
	               a.status, a.mode, a.reg_date, a.update_date,
	               b.settle_no
	        ".$base_from
	        .$where
	        ." ORDER BY a.idx DESC
	        LIMIT ".(int)$page_size." OFFSET ".(int)$offset;
	$stmt = $conn->prepare($sql);
	$stmt->execute($params);
	$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
	$db_error = $e->getMessage();
}

$base_params = array('mode'=>$mode, 'ordno'=>$f_ordno, 'm_id'=>$f_m_id);
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
.uuid { font-family: monospace; font-size: 11px; color: #6c757d; word-break: break-all; }
.opid { font-family: monospace; font-size: 11px; color: #0a8a8a; word-break: break-all; }
.ordno { font-family: monospace; font-size: 11px; word-break: break-all; }
.tbl-bc th { background: #f8f9fa; font-size: 12px; white-space: nowrap; }
.tbl-bc td { font-size: 12px; vertical-align: middle; }
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
							<h4 class="page-title"><?=$page_title?> <small class="text-muted">tbl_order_item_pointnexus where status='booked' / POST /book/{id}/confirm · /book/{id}/cancel</small></h4>
						</div>
					</div>
				</div>

				<? if($flash){ ?>
				<div class="alert alert-<?=htmlspecialchars($flash_type ?: 'info')?> alert-dismissible py-2">
					<?=htmlspecialchars($flash)?>
					<button type="button" class="btn-close" data-bs-dismiss="alert"></button>
				</div>
				<? } ?>


				<? if($db_error){ ?>
				<div class="alert alert-danger"><i class="mdi mdi-alert"></i> <?=htmlspecialchars($db_error)?></div>
				<? } ?>

				<div class="row g-0">
					<div class="card">
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row g-2">
									<div class="col-2">
										<div class="row g-2">
											<label for="mode" class="col-3 col-form-label col-form-label-sm bg-light border">환경</label>
											<div class="col-9">
												<select class="form-control form-control-sm" id="mode" name="mode">
													<option value="" <?=$mode==""?"selected":""?>>전체</option>
													<option value="test" <?=$mode=="test"?"selected":""?>>Sandbox(test)</option>
													<option value="prod" <?=$mode=="prod"?"selected":""?>>Production(prod)</option>
												</select>
											</div>
										</div>
									</div>
									<div class="col-3">
										<div class="row g-2">
											<label for="ordno" class="col-3 col-form-label col-form-label-sm bg-light border">ordno</label>
											<div class="col-9"><input type="text" class="form-control form-control-sm" id="ordno" name="ordno" value="<?=htmlspecialchars($f_ordno)?>"></div>
										</div>
									</div>
									<div class="col-3">
										<div class="row g-2">
											<label for="m_id" class="col-3 col-form-label col-form-label-sm bg-light border">m_id</label>
											<div class="col-9"><input type="text" class="form-control form-control-sm" id="m_id" name="m_id" value="<?=htmlspecialchars($f_m_id)?>"></div>
										</div>
									</div>
									<div class="col-2 text-end">
										<button type="submit" class="btn btn-primary btn-sm shadow-none">검색</button>
										<a href="<?=$_SERVER['PHP_SELF']?>" class="btn btn-secondary btn-sm shadow-none">초기화</a>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="card mt-2">
					<div class="card-body">
						<div class="d-flex align-items-center mb-2">
							<div>
								<strong>booked 상태 <?=number_format($total)?>건</strong>
								<small class="text-muted ms-2">(KCP 가상계좌 입금대기·미통보 분 + 기타 book 미확정)</small>
							</div>
							<div class="ms-auto">
								<small class="text-muted">page <?=number_format($page)?> / <?=number_format(max(1,(int)ceil($total/$page_size)))?></small>
							</div>
						</div>

						<? if(empty($rows)){ ?>
						<div class="text-muted py-3 text-center">조회된 booked 행이 없습니다.</div>
						<? } else { ?>
						<div class="table-responsive">
							<table class="table table-sm table-bordered table-hover mb-0 tbl-bc">
								<thead>
									<tr>
										<th class="text-center" style="width:60px;">idx</th>
										<th style="width:140px;">m_no / m_id</th>
										<th style="width:170px;">ordno</th>
										<th>productID</th>
										<th>operationID</th>
										<th class="text-end" style="width:90px;">price</th>
										<th class="text-center" style="width:70px;">mode</th>
										<th style="width:140px;">reg_date</th>
										<th class="text-center" style="width:170px;">처리</th>
									</tr>
								</thead>
								<tbody>
								<? foreach($rows as $r){
									$row_mode = ($r['mode'] == 'prod') ? 'prod' : 'test';
								?>
									<tr>
										<td class="text-center"><?=(int)$r['idx']?></td>
										<td>
											<div><?=htmlspecialchars($r['m_id'])?></div>
											<small class="text-muted">no.<?=(int)$r['m_no']?></small>
										</td>
										<td class="ordno">
											<? if(!empty($r['settle_no'])){ ?>
											<a href="/_Admin_/order/order_view.php?settle_no=<?=urlencode($r['settle_no'])?>" target="_blank" class="text-decoration-none">
												<?=htmlspecialchars($r['ordno'])?> <i class="mdi mdi-open-in-new"></i>
											</a>
											<? } else { ?>
												<?=htmlspecialchars($r['ordno'])?>
												<div class="text-muted" style="font-size:10px;">tbl_order_item 매칭 없음</div>
											<? } ?>
										</td>
										<td class="uuid">
											<a href="pointnexus_product_view.php?mode=<?=urlencode($row_mode)?>&id=<?=urlencode($r['productID'])?>" target="_blank" class="text-info text-decoration-none">
												<?=htmlspecialchars($r['productID'])?>
											</a>
											<? if($r['license_platform']){ ?>
											<span class="badge bg-light text-dark border ms-1"><?=htmlspecialchars($r['license_platform'])?></span>
											<? } ?>
										</td>
										<td class="opid">
											<a href="pointnexus_operation.php?mode=<?=urlencode($row_mode)?>&id=<?=urlencode($r['operationID'])?>" target="_blank" class="text-decoration-none">
												<?=htmlspecialchars($r['operationID'])?>
											</a>
											<? if($r['clientRequestID']){ ?>
											<div class="text-muted" style="font-size:10px;">req: <?=htmlspecialchars($r['clientRequestID'])?></div>
											<? } ?>
										</td>
										<td class="text-end">
											<?=number_format((int)$r['price'])?>
											<small class="text-muted"><?=htmlspecialchars($r['currency'])?></small>
										</td>
										<td class="text-center">
											<? if($r['mode']=='prod'){ ?>
												<span class="badge bg-danger">prod</span>
											<? } else { ?>
												<span class="badge bg-warning text-dark">test</span>
											<? } ?>
										</td>
										<td><?=htmlspecialchars($r['reg_date'])?></td>
										<td class="text-center">
											<form method="post" action="pointnexus_book_confirm_ps.php?<?=http_build_query(array_merge($base_params, array('page'=>$page)))?>" style="display:inline;" onsubmit="return confirm('이 주문 행을 Confirm 하시겠습니까?\nidx=<?=(int)$r['idx']?>\nordno=<?=htmlspecialchars(addslashes($r['ordno']))?>\nmode=<?=htmlspecialchars($row_mode)?>');">
												<input type="hidden" name="action" value="confirm">
												<input type="hidden" name="idx" value="<?=(int)$r['idx']?>">
												<button type="submit" class="btn btn-sm btn-success shadow-none">
													<i class="mdi mdi-check"></i> Confirm
												</button>
											</form>
											<form method="post" action="pointnexus_book_confirm_ps.php?<?=http_build_query(array_merge($base_params, array('page'=>$page)))?>" style="display:inline;" onsubmit="return confirm('이 예약을 취소(Cancel) 하시겠습니까?\nidx=<?=(int)$r['idx']?>\nordno=<?=htmlspecialchars(addslashes($r['ordno']))?>\n키 재고가 PointNexus 측으로 반납됩니다.');">
												<input type="hidden" name="action" value="cancel">
												<input type="hidden" name="idx" value="<?=(int)$r['idx']?>">
												<button type="submit" class="btn btn-sm btn-outline-danger shadow-none">
													<i class="mdi mdi-close"></i> Cancel
												</button>
											</form>
										</td>
									</tr>
								<? } ?>
								</tbody>
							</table>
						</div>

						<div class="mt-3 d-flex justify-content-center">
							<?=pn_pagination_html($page, max(1,(int)ceil($total/$page_size)), $base_params)?>
						</div>
						<? } ?>
					</div>
				</div>

				<div class="card mt-2">
					<div class="card-body py-2">
						<small class="text-muted">
							<i class="mdi mdi-information-outline"></i>
							일반적인 KCP 가상계좌 흐름은 입금완료 webhook(<code>pc/order/kcp/webhook.php</code>)에서 자동으로 confirm 됩니다.
							이 화면은 <strong>webhook 누락·실패·테스트 등으로 booked 가 잔존하는 경우의 수동 처리용</strong>입니다.
							Confirm 성공 시 라이선스 키가 발급되고 새 confirm row (action='confirm', status='confirmed') 가 추가됩니다.
							Cancel 시 키 재고가 반납되며 새 bookCancel row (action='bookCancel', status='canceled') 가 추가됩니다.
						</small>
					</div>
				</div>
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
