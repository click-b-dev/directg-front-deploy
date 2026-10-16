<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['board'] = "active";
$page_title = "게시판 대시보드";
$sidebar_file = "sidebar_board.php";
$document_root = "/_Admin_";

//문의(QnA) 구분(gubun) 라벨 — qna_list.php 와 동일 매핑
$gubun_array = array(
	"1" => "게임 설치, 플레이",
	"2" => "주문, 결제",
	"5" => "제품 코드(키) 오류",
	"7" => "한글, 제공 콘텐츠",
	"6" => "계정, 회원, 인증",
	"4" => "취소, 환불",
	"8" => "할인, 가격",
	"9" => "이용방법",
	"3" => "기타"
);

try{
	//게시판 데이터는 directgames DB. tbl_qna 규모가 작아 동기 조회(캐시 없이 라이브)로 충분.
	$conn_dgkr = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	//문의 요약 — tbl_qna 1회 스캔. 답변대기·고객미확인은 최근30일(처리필요), 완료율은 전체(현황) 기준. is_answer(Y/N) 기준.
	$qna = $conn_dgkr->query("select
			count(*) as total,
			sum(is_answer='Y') as answered_all,
			sum(is_answer='N' and reg_date >= curdate() - interval 30 day) as wait,
			sum(is_answer='Y' and replyStatus='0' and reg_date >= curdate() - interval 30 day) as unread_reply,
			sum(reg_date >= curdate()) as today,
			sum(reg_date >= curdate() - interval weekday(curdate()) day) as week,
			sum(reg_date >= date_format(curdate(),'%Y-%m-01')) as month
		from directgames.tbl_qna")->fetch();

	//구분(gubun)별 접수 분포 — 전체
	$gubun_rows = $conn_dgkr->query("select gubun, count(*) as cnt
		from directgames.tbl_qna
		group by gubun
		order by cnt desc")->fetchAll();

	//공지사항(dgkrshop DB) — 작성했으나 미노출(is_view<>'Y') 건수
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$notice_hidden = $conn->query("select count(*) as cnt from tbl_notice where is_view <> 'Y' or is_view is null")->fetch();

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}

$total_cnt  = (int)$qna['total'];
$answer_rate = pct($qna['answered_all'], $total_cnt > 0 ? $total_cnt : 1);   //전체 답변 완료율

//구분 분포 막대 스케일용 최대값
$gubun_max = 1;
foreach($gubun_rows as $r){ if((int)$r['cnt'] > $gubun_max){ $gubun_max = (int)$r['cnt']; } }
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<style>
/* 구분 분포 막대 */
.board-dist-bar{ height:10px; border-radius:4px; background:#3b7ddd; }
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
							<h4 class="page-title">게시판 대시보드</h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<!-- ============ A. 처리 필요 (문의 응대) ============ -->
				<div class="row">
					<div class="col-12"><h5 class="mb-1"><i class="mdi mdi-bell-alert-outline"></i> 처리 필요</h5></div>

					<div class="col-lg-3 col-6">
						<a href="./qna_list.php?is_answer=N" class="text-reset text-decoration-none">
							<div class="card h-100 border <?=((int)$qna['wait']>0)?'border-danger':''?>">
								<div class="card-body p-2 text-center">
									<div class="font-12 text-muted">답변대기</div>
									<h3 class="mb-0 <?=((int)$qna['wait']>0)?'text-danger':'text-muted'?>"><?=number_format($qna['wait'])?></h3>
									<div class="font-11 text-muted">최근 30일 미답변</div>
								</div>
							</div>
						</a>
					</div>

					<div class="col-lg-3 col-6">
						<a href="./qna_list.php" class="text-reset text-decoration-none">
							<div class="card h-100 border">
								<div class="card-body p-2 text-center">
									<div class="font-12 text-muted">오늘 접수</div>
									<h3 class="mb-0 text-info"><?=number_format($qna['today'])?></h3>
									<div class="font-11 text-muted">오늘 들어온 문의</div>
								</div>
							</div>
						</a>
					</div>

					<div class="col-lg-3 col-6">
						<a href="./qna_list.php?is_answer=Y&replyStatus=0" class="text-reset text-decoration-none">
							<div class="card h-100 border">
								<div class="card-body p-2 text-center">
									<div class="font-12 text-muted">고객 미확인 답변</div>
									<h3 class="mb-0"><?=number_format($qna['unread_reply'])?></h3>
									<div class="font-11 text-muted">최근 30일 미열람</div>
								</div>
							</div>
						</a>
					</div>

					<div class="col-lg-3 col-6">
						<a href="./notice_list.php?search_is_view=N" class="text-reset text-decoration-none">
							<div class="card h-100 border <?=((int)$notice_hidden['cnt']>0)?'border-warning':''?>">
								<div class="card-body p-2 text-center">
									<div class="font-12 text-muted">미노출 공지</div>
									<h3 class="mb-0 <?=((int)$notice_hidden['cnt']>0)?'text-warning':'text-muted'?>"><?=number_format($notice_hidden['cnt'])?></h3>
									<div class="font-11 text-muted">작성 후 미노출</div>
								</div>
							</div>
						</a>
					</div>
				</div>

				<!-- ============ B. 문의(QnA) 현황 ============ -->
				<div class="row mt-2">
					<div class="col-12"><h5 class="mb-1"><i class="mdi mdi-chart-box-outline"></i> 문의 현황</h5></div>

					<!-- 기간별 접수 -->
					<div class="col-lg-4">
						<div class="card h-100">
							<div class="card-header py-2"><h5 class="card-title mb-0">기간별 접수</h5></div>
							<div class="card-body py-2">
								<table class="table table-sm table-bordered mb-0 text-center">
									<thead class="table-light font-12"><tr><th class="text-start">기간</th><th>접수</th></tr></thead>
									<tbody class="font-13">
										<tr><td class="text-start fw-bold">오늘</td><td><h5 class="mb-0"><?=number_format($qna['today'])?></h5></td></tr>
										<tr><td class="text-start fw-bold">이번주</td><td><h5 class="mb-0"><?=number_format($qna['week'])?></h5></td></tr>
										<tr><td class="text-start fw-bold">이번달</td><td><h5 class="mb-0"><?=number_format($qna['month'])?></h5></td></tr>
										<tr><td class="text-start fw-bold">전체</td><td class="text-muted"><?=number_format($qna['total'])?></td></tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>

					<!-- 전체 답변 완료율 -->
					<div class="col-lg-4">
						<div class="card h-100">
							<div class="card-header py-2"><h5 class="card-title mb-0">답변 완료율 <span class="font-12 text-muted fw-normal">(전체)</span></h5></div>
							<div class="card-body py-2 text-center">
								<h1 class="mb-1 <?=($answer_rate>=90)?'text-success':(($answer_rate>=70)?'text-warning':'text-danger')?>"><?=$answer_rate?>%</h1>
								<div class="row text-center g-2 mt-1">
									<div class="col-4"><div class="border rounded py-1"><div class="font-11 text-muted">접수</div><h5 class="mb-0"><?=number_format($qna['total'])?></h5></div></div>
									<div class="col-4"><div class="border rounded py-1"><div class="font-11 text-muted">답변</div><h5 class="mb-0 text-success"><?=number_format($qna['answered_all'])?></h5></div></div>
									<div class="col-4"><div class="border rounded py-1"><div class="font-11 text-muted">대기</div><h5 class="mb-0 text-danger"><?=number_format($total_cnt - (int)$qna['answered_all'])?></h5></div></div>
								</div>
							</div>
						</div>
					</div>

					<!-- 구분별 접수 분포 -->
					<div class="col-lg-4">
						<div class="card h-100">
							<div class="card-header py-2"><h5 class="card-title mb-0">구분별 접수 <span class="font-12 text-muted fw-normal">(전체)</span></h5></div>
							<div class="card-body py-2">
								<? if($gubun_rows){ foreach($gubun_rows as $g){ $cnt=(int)$g['cnt']; $lbl=isset($gubun_array[$g['gubun']])?$gubun_array[$g['gubun']]:'(미분류)'; $w=pct($cnt,$gubun_max); ?>
								<div class="mb-2">
									<div class="d-flex justify-content-between font-13"><span><?=$lbl?></span><span class="fw-bold"><?=number_format($cnt)?> <span class="text-muted fw-normal">(<?=pct($cnt,$total_cnt>0?$total_cnt:1)?>%)</span></span></div>
									<div class="board-dist-bar" style="width:<?=$w?>%"></div>
								</div>
								<? } }else{ ?>
								<p class="text-muted mb-0 py-2">접수 내역이 없습니다.</p>
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
