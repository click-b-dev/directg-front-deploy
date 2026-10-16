<?
$sidebar_file = "sidebar_promotion.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['promotion'] = "active";
$page_title = "프로모션 대시보드";
$document_root = "/_Admin_";

try{
	//프로모션은 dgkrshop DB. 상태는 promotion_start/promotion_end 와 confirm(Y/N) 기준(리스트 페이지와 동일)
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	//요약 — tbl_promotion_schedule 1회 스캔. 진행중 할인율 구간은 진행중 조건을 AND 로 얹어 같은 스캔에서 계산
	$sm = $conn->query("select
			sum(confirm='N') as ready,
			sum(promotion_start < now() and promotion_end >= now()) as ing,
			sum(promotion_start >= now()) as upcoming,
			sum(promotion_start < now() and promotion_end >= now() and promotion_end < curdate() + interval 1 day) as end_today,
			sum(promotion_start < now() and promotion_end >= now() and discount_rate < 30) as disc1,
			sum(promotion_start < now() and promotion_end >= now() and discount_rate >= 30 and discount_rate < 50) as disc2,
			sum(promotion_start < now() and promotion_end >= now() and discount_rate >= 50 and discount_rate < 70) as disc3,
			sum(promotion_start < now() and promotion_end >= now() and discount_rate >= 70) as disc4,
			count(*) as total
		from tbl_promotion_schedule")->fetch();

	//진행중 그룹(퍼블리셔+기간 묶음) 수 — promotion_group.php 와 동일 기준
	$grp = $conn->query("select count(*) as cnt from (
			select 1 from tbl_promotion_schedule
			where promotion_start < now() and promotion_end > now()
			group by publisher_code, promotion_start, promotion_end
		) t")->fetch();

	//진행중 종료일별 분포 — date(promotion_end) 기준 그룹. 대상이 진행중 행뿐이라 가벼움
	$end_rows = $conn->query("select date(promotion_end) as end_date, count(*) as cnt
		from tbl_promotion_schedule
		where promotion_start < now() and promotion_end >= now()
		group by date(promotion_end)
		order by end_date asc")->fetchAll();

	//진행중 퍼블리셔별 분포 — publisher_name 조인(진행중만 대상이라 가벼움)
	$pub_rows = $conn->query("select a.publisher_code, b.publisher_name, count(*) as cnt
		from tbl_promotion_schedule a
		left join tbl_publisher b on a.publisher_code = b.publisher_code
		where a.promotion_start < now() and a.promotion_end >= now()
		group by a.publisher_code, b.publisher_name
		order by cnt desc")->fetchAll();

	//동일 product_code 기간중복 프로모션 — 아직 안 끝난(promotion_end>=now) 것끼리만 비교해 부담을 낮춤
	$overlap = $conn->query("select count(distinct a.idx) as cnt
		from tbl_promotion_schedule a
		inner join tbl_promotion_schedule b on a.product_code = b.product_code and a.idx <> b.idx
			and a.promotion_start < b.promotion_end and a.promotion_end > b.promotion_start
		where a.promotion_end >= now() and b.promotion_end >= now()")->fetch();

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}

$ing_total = (int)$sm['ing'];
$ing_d = $ing_total > 0 ? $ing_total : 1;

//진행중 할인율 구간 — 라벨=>값
$disc = array(
	'30% 미만' => (int)$sm['disc1'],
	'30~50%'   => (int)$sm['disc2'],
	'50~70%'   => (int)$sm['disc3'],
	'70% 이상' => (int)$sm['disc4'],
);
$disc_max = 1; foreach($disc as $v){ if($v > $disc_max){ $disc_max = $v; } }

//진행중 종료일별 분포 — 막대 스케일용 최대값
$end_max = 1; foreach($end_rows as $r){ if((int)$r['cnt'] > $end_max){ $end_max = (int)$r['cnt']; } }

//진행중 퍼블리셔별 분포 — 막대 스케일용 최대값
$pub_max = 1; foreach($pub_rows as $r){ if((int)$r['cnt'] > $pub_max){ $pub_max = (int)$r['cnt']; } }
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<style>
/* 분포 막대 */
.promo-dist-bar{ height:10px; border-radius:4px; background:#3b7ddd; }
</style>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<div class="wrapper">
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_start.php'); ?>
	<div class="content-page">
		<div class="content">
			<div class="container-fluid">

				<!-- start page title -->
				<div class="row">
					<div class="col-12">
						<div class="page-title-box">
							<div class="page-title-right">
								<span class="font-12 text-muted">기준 <?=date('H:i')?></span>
							</div>
							<h4 class="page-title">프로모션 대시보드</h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<!-- ============ A. 처리 필요 ============ -->
				<div class="row">
					<div class="col-12"><h5 class="mb-1"><i class="mdi mdi-bell-alert-outline"></i> 처리 필요</h5></div>

					<div class="col-lg-3 col-6">
						<a href="./promotion_ready.php" class="text-reset text-decoration-none">
							<div class="card h-100 border <?=((int)$sm['ready']>0)?'border-danger':''?>">
								<div class="card-body p-2 text-center">
									<div class="font-12 text-muted">승인대기</div>
									<h3 class="mb-0 <?=((int)$sm['ready']>0)?'text-danger':'text-muted'?>"><?=number_format($sm['ready'])?></h3>
									<div class="font-11 text-muted">등록 후 미승인 (confirm=N)</div>
								</div>
							</div>
						</a>
					</div>

					<div class="col-lg-3 col-6">
						<div class="card h-100 border <?=((int)$overlap['cnt']>0)?'border-danger':''?>">
							<div class="card-body p-2 text-center">
								<div class="font-12 text-muted">프로모션 기간 중복</div>
								<h3 class="mb-0 <?=((int)$overlap['cnt']>0)?'text-danger':'text-muted'?>"><?=number_format($overlap['cnt'])?></h3>
								<div class="font-11 text-muted">동일 상품·기간 중복</div>
							</div>
						</div>
					</div>
				</div>

				<!-- ============ B. 프로모션 현황 ============ -->
				<div class="row mt-2">
					<div class="col-12"><h5 class="mb-1"><i class="mdi mdi-tag-multiple-outline"></i> 프로모션 현황</h5></div>

					<div class="col-lg-3 col-6">
						<a href="./promotion_ing.php" class="text-reset text-decoration-none">
							<div class="card h-100 border">
								<div class="card-body p-2 text-center">
									<div class="font-12 text-muted">진행중</div>
									<h3 class="mb-0 text-info"><?=number_format($sm['ing'])?></h3>
									<div class="font-11 text-muted">현재 노출중인 세일</div>
								</div>
							</div>
						</a>
					</div>

					<div class="col-lg-3 col-6">
						<a href="./promotion_upcoming.php" class="text-reset text-decoration-none">
							<div class="card h-100 border">
								<div class="card-body p-2 text-center">
									<div class="font-12 text-muted">예정</div>
									<h3 class="mb-0"><?=number_format($sm['upcoming'])?></h3>
									<div class="font-11 text-muted">시작 예정</div>
								</div>
							</div>
						</a>
					</div>

					<div class="col-lg-3 col-6">
						<a href="./promotion_ing.php" class="text-reset text-decoration-none">
							<div class="card h-100 border <?=((int)$sm['end_today']>0)?'border-warning':''?>">
								<div class="card-body p-2 text-center">
									<div class="font-12 text-muted">오늘 종료</div>
									<h3 class="mb-0 <?=((int)$sm['end_today']>0)?'text-warning':'text-muted'?>"><?=number_format($sm['end_today'])?></h3>
									<div class="font-11 text-muted">오늘 끝남</div>
								</div>
							</div>
						</a>
					</div>

					<div class="col-lg-3 col-6">
						<div class="card h-100 border">
							<div class="card-body p-2 text-center">
								<div class="font-12 text-muted">진행중 퍼블리셔</div>
								<h3 class="mb-0 text-info"><?=number_format($grp['cnt'])?></h3>
							</div>
						</div>
					</div>
				</div>

				<!-- ============ C. 분석 (진행중 기준) ============ -->
				<div class="row mt-2">
					<div class="col-12"><h5 class="mb-1"><i class="mdi mdi-chart-box-outline"></i> 분석 <span class="font-12 text-muted fw-normal">(진행중 <?=number_format($ing_total)?>건 기준)</span></h5></div>

					<!-- 할인율 분포 -->
					<div class="col-lg-4">
						<div class="card h-100">
							<div class="card-header py-2"><h5 class="card-title mb-0">할인율 분포</h5></div>
							<div class="card-body py-2">
								<? if($ing_total > 0){ foreach($disc as $lbl=>$cnt){ $w=pct($cnt,$disc_max); ?>
								<div class="mb-2">
									<div class="d-flex justify-content-between font-13"><span><?=$lbl?></span><span class="fw-bold"><?=number_format($cnt)?> <span class="text-muted fw-normal">(<?=pct($cnt,$ing_d)?>%)</span></span></div>
									<div class="promo-dist-bar" style="width:<?=$w?>%"></div>
								</div>
								<? } }else{ ?>
								<p class="text-muted mb-0 py-2">진행중 프로모션이 없습니다.</p>
								<? } ?>
							</div>
						</div>
					</div>

					<!-- 종료일별 분포 -->
					<div class="col-lg-4">
						<div class="card h-100">
							<div class="card-header py-2"><h5 class="card-title mb-0">종료일별 분포</h5></div>
							<div class="card-body py-2">
								<? if($end_rows){ foreach($end_rows as $er){ $lbl=$er['end_date']; $cnt=(int)$er['cnt']; $w=pct($cnt,$end_max); ?>
								<div class="mb-2">
									<div class="d-flex justify-content-between font-13"><span><?=$lbl?></span><span class="fw-bold"><?=number_format($cnt)?> <span class="text-muted fw-normal">(<?=pct($cnt,$ing_d)?>%)</span></span></div>
									<div class="promo-dist-bar" style="width:<?=$w?>%"></div>
								</div>
								<? } }else{ ?>
								<p class="text-muted mb-0 py-2">진행중 프로모션이 없습니다.</p>
								<? } ?>
							</div>
						</div>
					</div>

					<!-- 진행중 퍼블리셔별 -->
					<div class="col-lg-4">
						<div class="card h-100">
							<div class="card-header py-2"><h5 class="card-title mb-0">퍼블리셔별 분포</h5></div>
							<div class="card-body py-2">
								<? if($pub_rows){ foreach($pub_rows as $pr){ $lbl=($pr['publisher_name']!=''?$pr['publisher_name']:$pr['publisher_code']); $cnt=(int)$pr['cnt']; $w=pct($cnt,$pub_max); ?>
								<div class="mb-2">
									<div class="d-flex justify-content-between font-13"><span><?=htmlspecialchars($lbl)?></span><span class="fw-bold"><?=number_format($cnt)?> <span class="text-muted fw-normal">(<?=pct($cnt,$ing_d)?>%)</span></span></div>
									<div class="promo-dist-bar" style="width:<?=$w?>%"></div>
								</div>
								<? } }else{ ?>
								<p class="text-muted mb-0 py-2">진행중 프로모션이 없습니다.</p>
								<? } ?>
							</div>
						</div>
					</div>
				</div>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>
