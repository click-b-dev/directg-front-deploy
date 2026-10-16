<?
$sidebar_file = "sidebar_order.php";
	header('Content-Type: text/html; charset=UTF-8');
	ini_set( "display_errors", 1 );
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/order/dashboard_order_defs.php');

	$topmenu['order'] = "active";
	$page_title="주문 대시보드";

	//============================================================
	//집계는 페이지 로드 시 실행하지 않는다.
	//무거운 COUNT 를 순차 실행하면 화면 렌더가 통째로 지연되므로,
	//셸만 즉시 그리고 카드별 건수는 dashboard_order_count.php 를 통해
	//개별 AJAX 로 병렬 조회한다(느린 카드가 나머지를 막지 않음).
	//  · 처리/확인 필요 : 페이지 로드 시 자동 조회(가벼움)
	//  · 이상 감지      : 부하가 커서 각 카드의 [조회] 버튼 클릭 시에만 조회(온디맨드)
	//카드 메타/집계 SQL 정의는 dashboard_order_defs.php 에 공유.
	//============================================================
	$action_cards  = dash_action_cards($document_root);
	$check_cards   = dash_check_cards($document_root);
	$anomaly_cards = dash_anomaly_cards($document_root);
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>

<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<div class="wrapper">
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_start.php'); ?>

<div class="content-page">
			<div class="content">
<!-- Start Content-->
				<div class="container-fluid">

					<!-- start page title -->
					<div class="row">
						<div class="col-12">
							<div class="page-title-box">
								<h4 class="page-title">주문 대시보드</h4>
							</div>
						</div>
					</div>
					<!-- end page title -->

					<!-- 처리/확인 필요 (통합) -->
					<div class="row">
						<? foreach($action_cards as $card){ ?>
						<div class="col-xl-2 col-md-4 col-6 mb-2">
							<? if($card['url']<>""){ ?><a href="<?=$card['url']?>" class="text-reset text-decoration-none"><? } ?>
								<div class="card h-100 border border-secondary dash-card" data-key="<?=htmlspecialchars($card['key'])?>">
									<div class="card-body p-2 text-center">
										<h2 class="my-1 text-muted dash-count"><span class="spinner-border spinner-border-sm" role="status"></span></h2>
										<p class="mb-0 fw-bold"><?=$card['label']?></p>
										<p class="mb-0 text-muted font-12"><?=$card['desc']?></p>
									</div>
								</div>
							<? if($card['url']<>""){ ?></a><? } ?>
						</div>
						<? } ?>
						<? foreach($check_cards as $card){ ?>
						<div class="col-xl-2 col-md-4 col-6 mb-2">
							<? if($card['url']<>""){ ?><a href="<?=$card['url']?>" class="text-reset text-decoration-none"><? } ?>
								<div class="card h-100 border border-secondary dash-card" data-group="<?=htmlspecialchars($card['group'])?>" data-bucket="<?=htmlspecialchars($card['bucket'])?>">
									<div class="card-body p-2 text-center">
										<h2 class="my-1 text-muted dash-count"><span class="spinner-border spinner-border-sm" role="status"></span></h2>
										<p class="mb-0 fw-bold"><?=$card['label']?></p>
										<p class="mb-0 text-muted font-12"><?=$card['desc']?></p>
									</div>
								</div>
							<? if($card['url']<>""){ ?></a><? } ?>
						</div>
						<? } ?>
					</div>

					<!-- 이상 감지(데이터 정합성) -->
					<div class="row mt-3">
						<div class="col-12 d-flex align-items-center flex-wrap gap-2 mb-2">
							<h5 class="mb-0">이상 감지 <span class="text-muted font-12 fw-normal">(최근 30일 · 데이터 정합성 점검)</span></h5>
							<small class="text-danger">부하가 크기 때문에 각 카드의 조회 버튼으로 개별 조회합니다</small>
						</div>
					</div>
					<div class="row">
						<? foreach($anomaly_cards as $card){ ?>
						<div class="col-xl-2 col-md-4 col-6 mb-2">
							<? if($card['url']<>""){ ?><a href="<?=$card['url']?>" class="text-reset text-decoration-none"><? } ?>
								<div class="card h-100 border border-secondary dash-card dash-lazy" data-key="<?=htmlspecialchars($card['key'])?>">
									<div class="card-body p-2 text-center">
										<h2 class="my-1 text-muted dash-count">–</h2>
										<p class="mb-0 fw-bold font-13"><?=$card['label']?></p>
										<p class="mb-0 text-muted font-12"><?=$card['desc']?></p>
										<button type="button" class="btn btn-sm btn-outline-danger mt-2 dash-run">조회</button>
									</div>
								</div>
							<? if($card['url']<>""){ ?></a><? } ?>
						</div>
						<? } ?>
					</div>
					<div class="row">
						<div class="col-12">
							<p class="text-muted font-12 mt-1">※ 이상 감지는 각 카드의 [조회] 버튼 클릭 시 최근 30일 기준으로 조회됩니다. 0이 아니면 개별 점검하세요.</p>
						</div>
					</div>

				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->

	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
//카드별 건수 개별 로딩 — 각 카드를 병렬 AJAX 로 조회, 도착하는 대로 숫자/색상 갱신
//  · 처리/확인 필요(비-lazy) 카드 : 페이지 로드 시 자동 조회
//  · 이상 감지(dash-lazy) 카드    : 부하가 커서 각 카드의 [조회] 버튼 클릭 시에만 조회
(function(){
	function applyCount(card, count){
		var countEl = card.querySelector('.dash-count');
		//기존 상태 클래스 제거
		card.classList.remove('border-danger','border-light','border-warning','border-secondary');
		countEl.classList.remove('text-danger','text-muted','text-warning');

		var cls, txt;
		if(count === null || count === undefined){
			//집계 실패 → 경고색 '-'
			card.classList.add('border-warning'); cls = 'text-warning'; txt = '-';
		}else if(count > 0){
			//처리/확인 필요 있음 → 강조(빨강)
			card.classList.add('border-danger');  cls = 'text-danger';  txt = Number(count).toLocaleString();
		}else{
			//정상(0)
			card.classList.add('border-light');   cls = 'text-muted';   txt = '0';
		}
		countEl.classList.add(cls);
		countEl.textContent = txt;
	}

	function setLoading(card){
		var countEl = card.querySelector('.dash-count');
		countEl.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
	}

	function fetchCard(card){
		var key = card.getAttribute('data-key');
		return fetch('dashboard_order_count.php?key=' + encodeURIComponent(key), {credentials:'same-origin'})
			.then(function(r){ return r.json(); })
			.then(function(d){ applyCount(card, (d && typeof d.count !== 'undefined') ? d.count : null); })
			.catch(function(){ applyCount(card, null); });
	}

	//그룹 카드 분배 — 같은 data-group 카드들은 한 번의 조회(?group=)로 여러 버킷 값을 채움(스캔 1회)
	function applyGroup(group, counts){
		var cards = document.querySelectorAll('.dash-card[data-group="' + group + '"]');
		for(var k=0; k<cards.length; k++){
			var bucket = cards[k].getAttribute('data-bucket');
			//counts 가 null(조회실패)이면 '-', 아니면 해당 버킷 값(없으면 0)
			applyCount(cards[k], (counts === null || counts === undefined) ? null : (counts[bucket] || 0));
		}
	}
	function fetchGroup(group){
		return fetch('dashboard_order_count.php?group=' + encodeURIComponent(group), {credentials:'same-origin'})
			.then(function(r){ return r.json(); })
			.then(function(d){ applyGroup(group, (d && typeof d.counts !== 'undefined') ? d.counts : null); })
			.catch(function(){ applyGroup(group, null); });
	}

	//자동 조회 — 처리/확인 필요(lazy 아님) 카드
	//  · 단일 키 카드(data-group 없음) : 카드별 개별 조회
	//  · 그룹 카드(data-group 있음)     : 그룹당 1회만 조회
	var autoCards = document.querySelectorAll('.dash-card:not(.dash-lazy):not([data-group])');
	for(var i=0; i<autoCards.length; i++){ fetchCard(autoCards[i]); }

	var seenGroups = {};
	var groupCards = document.querySelectorAll('.dash-card:not(.dash-lazy)[data-group]');
	for(var g=0; g<groupCards.length; g++){
		var gname = groupCards[g].getAttribute('data-group');
		if(!seenGroups[gname]){ seenGroups[gname] = true; fetchGroup(gname); }
	}

	//온디맨드 — 이상 감지(lazy) 카드는 각 카드의 [조회] 버튼으로 개별 조회
	var runBtns = document.querySelectorAll('.dash-card.dash-lazy .dash-run');
	for(var b=0; b<runBtns.length; b++){
		(function(btn){
			btn.addEventListener('click', function(){
				var card = btn.closest('.dash-card');
				btn.disabled = true;
				btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
				setLoading(card);
				fetchCard(card).then(function(){
					btn.disabled = false;
					btn.textContent = '다시 조회';
				});
			});
		})(runBtns[b]);
	}
})();
</script>

</body>
</html>
