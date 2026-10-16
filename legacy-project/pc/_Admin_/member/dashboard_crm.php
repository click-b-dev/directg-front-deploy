<?
$sidebar_file = "sidebar_member.php";
$page_title = "회원 대시보드";
	header('Content-Type: text/html; charset=UTF-8');
	ini_set( "display_errors", 1 );
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	$topmenu['member'] = "active";

	$document_root = "/_Admin_";

	$refresh = filter_input(INPUT_GET, 'refresh', FILTER_SANITIZE_STRING);

try{
	//회원: directgames.tbl_member / sns_info (크로스DB — dgkrshop 연결에서 조회). 주문: dgkrshop.tbl_order
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	//성능: 무거운 집계(회원 200만 전체 스캔 등)를 세션에 10분 캐시. ?refresh=1 이면 강제 갱신
	$cache_ttl = 600;
	if(!$refresh && isset($_SESSION['crm_dash']) && (time() - $_SESSION['crm_dash']['ts'] < $cache_ttl)){
		$c = $_SESSION['crm_dash'];
		$summary=$c['summary']; $sns_rows=$c['sns_rows']; $sns_total=$c['sns_total'];
		$mail_rows=$c['mail_rows'];
		$cached_at=$c['ts'];
	}else{
		//---------------------------------------------------------------
		// 회원 지표 — tbl_member 1회 스캔(전체회원 분포). 커버링 인덱스 (status, mem_type, mem_level, reg_date) 로 인덱스-only 스캔 유도. 활동성(log_date)은 인덱스 유지비용 커서 제외
		// status: 0=회원, 5=승인대기, 1=탈퇴
		//---------------------------------------------------------------
		$summary = $conn->query("select
				count(*) as total,
				sum(status=0) as active_all,
				sum(status=5) as pending,
				sum(status=1) as leave_cnt,
				sum(mem_type='R') as type_r,
				sum(mem_type='P') as type_p,
				sum(mem_type='S') as type_s,
				sum(mem_level=1) as lv1,
				sum(mem_level=2) as lv2,
				sum(mem_level=3) as lv3,
				sum(reg_date >= curdate()) as join_today,
				sum(reg_date >= curdate() - interval weekday(curdate()) day) as join_week,
				sum(reg_date >= date_format(curdate(),'%Y-%m-01')) as join_month,
				sum(reg_date >= curdate() and status=5) as pending_today,
				sum(reg_date >= curdate() - interval weekday(curdate()) day and status=5) as pending_week,
				sum(reg_date >= date_format(curdate(),'%Y-%m-01') and status=5) as pending_month
			from directgames.tbl_member")->fetch();

		//SNS 연동 회원 — sns_type(KAKAO/NAVER/PAYCO 등)별 연동 회원수
		$sns_rows  = $conn->query("select sns_type, count(distinct m_no) as cnt from directgames.sns_info group by sns_type order by cnt desc")->fetchAll();
		$sns_total = $conn->query("select count(distinct m_no) as cnt from directgames.sns_info")->fetch();

		//자동메일(tbl_email_api) 어제부터 발송현황 — 구분(gubun)별 발송/실패(failed IN(1,4))
		$mail_rows = $conn->query("select gubun, count(*) as cnt, sum(failed in (1,4)) as fail
			from directgames.tbl_email_api
			where reg_date >= curdate() - interval 1 day
			group by gubun
			order by cnt desc")->fetchAll();

		$cached_at = time();
		$_SESSION['crm_dash'] = array('ts'=>$cached_at,'summary'=>$summary,'sns_rows'=>$sns_rows,'sns_total'=>$sns_total,'mail_rows'=>$mail_rows);
	}

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}

$total_d = ((int)$summary['total'] > 0) ? (int)$summary['total'] : 1;   //분포 분모 = 전체회원
$active  = (int)$summary['active_all'];
$active_d= $active > 0 ? $active : 1;

//SNS 막대 스케일용 최대값
$sns_max = 1;
foreach($sns_rows as $r){ if((int)$r['cnt'] > $sns_max){ $sns_max = (int)$r['cnt']; } }

?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<style>
/* 분포 막대 */
.crm-dist-bar{ height:10px; border-radius:4px; background:#3b7ddd; }
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
								<span class="font-12 text-muted me-2">기준 <?=date('H:i', $cached_at)?></span>							</div>
							<h4 class="page-title">회원 대시보드</h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<!-- ============ 1. 회원 현황 ============ -->
				<div class="row">
					<div class="col-12"><h5 class="mb-1"><i class="mdi mdi-account-group"></i> 회원 현황</h5></div>
					<div class="col-lg-3 col-6">
						<div class="card border">
							<div class="card-body py-2 text-center">
								<div class="font-12 text-muted">총 회원</div>
								<h3 class="mb-0"><?=number_format($summary['total'])?></h3>
							</div>
						</div>
					</div>
					<div class="col-lg-3 col-6">
						<div class="card border-success">
							<div class="card-body py-2 text-center">
								<div class="font-12 text-muted">회원</div>
								<h3 class="mb-0 text-success"><?=number_format($summary['active_all'])?></h3>
							</div>
						</div>
					</div>
					<div class="col-lg-3 col-6">
						<div class="card border-info">
							<div class="card-body py-2 text-center">
								<div class="font-12 text-muted">리셀러</div>
								<h3 class="mb-0 text-info"><?=number_format($summary['type_r'])?></h3>
							</div>
						</div>
					</div>
					<div class="col-lg-3 col-6">
						<div class="card border-warning">
							<div class="card-body py-2 text-center">
								<div class="font-12 text-muted">승인대기</div>
								<h3 class="mb-0 text-warning"><?=number_format($summary['pending'])?></h3>
							</div>
						</div>
					</div>
				</div>

				<!-- ============ 2. 신규가입 / 분포 / SNS ============ -->
				<div class="row">
					<div class="col-lg-4">
						<div class="card h-100">
							<div class="card-header bg-primary text-white py-2"><h5 class="card-title mb-0">신규가입</h5></div>
							<div class="card-body py-2">
								<table class="table table-sm table-bordered mb-0 text-center">
									<thead class="table-light font-12"><tr><th class="text-start">기간</th><th>신규가입</th><th>승인대기</th></tr></thead>
									<tbody class="font-13">
										<tr><td class="text-start fw-bold">오늘</td><td><h5 class="mb-0"><?=number_format($summary['join_today'])?></h5></td><td class="text-warning fw-bold"><?=number_format($summary['pending_today'])?></td></tr>
										<tr><td class="text-start fw-bold">이번주</td><td><h5 class="mb-0"><?=number_format($summary['join_week'])?></h5></td><td class="text-warning fw-bold"><?=number_format($summary['pending_week'])?></td></tr>
										<tr><td class="text-start fw-bold">이번달</td><td><h5 class="mb-0"><?=number_format($summary['join_month'])?></h5></td><td class="text-warning fw-bold"><?=number_format($summary['pending_month'])?></td></tr>
									</tbody>
								</table>
								<p class="font-11 text-muted mb-0 mt-2">승인대기 = 해당 기간 가입자 중 status=5</p>
							</div>
						</div>
					</div>
					<div class="col-lg-8">
						<div class="row g-2">
							<div class="col-lg-6">
								<div class="card h-100 mb-0">
									<div class="card-header py-2"><h5 class="card-title mb-0">회원 등급 분포 <span class="font-12 text-muted fw-normal">(전체회원 기준)</span></h5></div>
									<div class="card-body py-2">
										<?
											$level_labels = array('lv1'=>'일반','lv2'=>'정회원','lv3'=>'VIP');
											foreach($level_labels as $k=>$lbl){ $cnt=(int)$summary[$k]; $p=pct($cnt,$total_d); ?>
										<div class="mb-2">
											<div class="d-flex justify-content-between font-13"><span><?=$lbl?></span><span class="fw-bold"><?=number_format($cnt)?> <span class="text-muted fw-normal">(<?=$p?>%)</span></span></div>
											<div class="crm-dist-bar" style="width:<?=$p?>%"></div>
										</div>
										<? } ?>
									</div>
								</div>
							</div>
							<div class="col-lg-6">
								<div class="card h-100 mb-0">
									<div class="card-header py-2"><h5 class="card-title mb-0">회원 유형 분포 <span class="font-12 text-muted fw-normal">(전체회원 기준)</span></h5></div>
									<div class="card-body py-2">
										<?
											$types = array('type_p'=>'일반(P)','type_r'=>'리셀러(R)','type_s'=>'휴면(S)');
											foreach($types as $k=>$lbl){ $cnt=(int)$summary[$k]; $p=pct($cnt,$total_d); ?>
										<div class="mb-2">
											<div class="d-flex justify-content-between font-13"><span><?=$lbl?></span><span class="fw-bold"><?=number_format($cnt)?> <span class="text-muted fw-normal">(<?=$p?>%)</span></span></div>
											<div class="crm-dist-bar" style="width:<?=$p?>%"></div>
										</div>
										<? } ?>
									</div>
								</div>
							</div>
							<div class="col-12">
								<div class="card mb-0">
									<div class="card-header py-2 d-flex justify-content-between align-items-center">
										<h5 class="card-title mb-0">SNS 연동 회원</h5>
										<span class="font-12">연동 회원 <b><?=number_format($sns_total['cnt'])?></b>명 <span class="text-muted">(전체의 <?=pct($sns_total['cnt'],$total_d)?>%)</span></span>
									</div>
									<div class="card-body py-2">
										<? if($sns_rows){ foreach($sns_rows as $s){ $cnt=(int)$s['cnt']; $w=pct($cnt,$sns_max); ?>
										<div class="mb-2">
											<div class="d-flex justify-content-between font-13"><span><?=htmlspecialchars($s['sns_type'])?></span><span class="fw-bold"><?=number_format($cnt)?> <span class="text-muted fw-normal">(전체 <?=pct($cnt,$total_d)?>%)</span></span></div>
											<div class="crm-dist-bar" style="width:<?=$w?>%"></div>
										</div>
										<? } }else{ ?>
										<p class="text-muted mb-0 py-2">SNS 연동 데이터가 없습니다.</p>
										<? } ?>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- ============ 6. 자동메일 현황 (최근 30일) ============ -->
				<div class="row">
					<div class="col-12"><h5 class="mb-1"><i class="mdi mdi-email-outline"></i> 자동메일 현황 <span class="font-12 text-muted fw-normal">(어제부터 · tbl_email_api)</span></h5></div>
					<?
						$mail_total=0; $mail_fail=0;
						foreach($mail_rows as $m){ $mail_total+=(int)$m['cnt']; $mail_fail+=(int)$m['fail']; }
						$gubun_label = array('join'=>'가입','password'=>'비밀번호','qna'=>'문의');
					?>
					<div class="col-lg-4">
						<div class="card h-100">
							<div class="card-body py-2">
								<div class="row text-center g-2">
									<div class="col-4"><div class="border rounded py-2"><div class="font-12 text-muted">발송</div><h4 class="mb-0"><?=number_format($mail_total)?></h4></div></div>
									<div class="col-4"><div class="border rounded py-2"><div class="font-12 text-muted">성공</div><h4 class="mb-0 text-success"><?=number_format($mail_total-$mail_fail)?></h4></div></div>
									<div class="col-4"><div class="border rounded py-2"><div class="font-12 text-muted">실패</div><h4 class="mb-0 text-danger"><?=number_format($mail_fail)?></h4></div></div>
								</div>
								<p class="font-11 text-muted mb-0 mt-2">실패율 <?=pct($mail_fail,$mail_total>0?$mail_total:1)?>% (failed IN 1,4)</p>
							</div>
						</div>
					</div>
					<div class="col-lg-8">
						<div class="card h-100">
							<div class="card-header py-2 d-flex justify-content-between align-items-center">
								<h5 class="card-title mb-0">구분별 발송</h5>
								<a href="<?=$document_root?>/member/directsend_mail_log.php" class="btn btn-sm btn-outline-secondary shadow-none">발송로그</a>
							</div>
							<div class="card-body p-1">
								<table class="table table-sm table-bordered mb-0">
									<thead class="table-light font-12"><tr><th>구분</th><th class="text-end">발송</th><th class="text-end">성공</th><th class="text-end">실패</th><th class="text-end">실패율</th></tr></thead>
									<tbody class="font-12">
									<? if($mail_rows){ foreach($mail_rows as $m){ $cnt=(int)$m['cnt']; $fail=(int)$m['fail']; $lbl=isset($gubun_label[$m['gubun']])?$gubun_label[$m['gubun']]:(($m['gubun']!==''&&$m['gubun']!==null)?$m['gubun']:'(미분류)'); ?>
										<tr>
											<td><?=htmlspecialchars($lbl)?></td>
											<td class="text-end"><?=number_format($cnt)?></td>
											<td class="text-end text-success"><?=number_format($cnt-$fail)?></td>
											<td class="text-end text-danger"><?=number_format($fail)?></td>
											<td class="text-end"><?=pct($fail,$cnt>0?$cnt:1)?>%</td>
										</tr>
									<? } }else{ ?>
										<tr><td colspan="5" class="text-center text-muted py-2">최근 30일 발송 내역 없음</td></tr>
									<? } ?>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

			</div> <!-- container -->
		</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>
