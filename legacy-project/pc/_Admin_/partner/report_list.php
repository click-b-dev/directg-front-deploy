<?
$sidebar_file = "sidebar_partner.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['partner'] = "active";

$page_title="리포트 내역";

$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_STRING);
$search_month = filter_input(INPUT_GET, 'search_month', FILTER_SANITIZE_STRING);
$search_publisher_code = filter_input(INPUT_GET, 'search_publisher_code', FILTER_SANITIZE_STRING);

$search_report_term = filter_input(INPUT_GET, 'search_report_term', FILTER_SANITIZE_STRING);
$search_month_term = filter_input(INPUT_GET, 'search_month_term', FILTER_SANITIZE_STRING);

if($search_year==""){
	$search_year = date("Y");
	$search_flag=false;
}else{
	$search_flag=true;
}

if(!$search_month && !$search_month_term){
	$search_month = date('m',strtotime('-1 month'));
	if($search_month=="12" && !$search_flag){
		$search_year=$search_year-1;
	}
}

if(!$search_report_term){
	$search_report_term = "M"; //기본값 월별검색
}

if($search_report_term=="T"){
	$search_month = $search_month_term;
}

if($search_publisher_code){
	$search_month="";
}

//파트너 통계시스템 사용여부

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$adminPartner= new AdminPartner($conn);
	
	$report_list = $adminPartner->getPartnerReportList($search_publisher_code,$search_report_term,$search_year,$search_month,'');
	
	$publisher_data= $adminPartner->getPartnerListAll('');

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$selected['search_year'][$search_year] = "selected";
$selected['search_publisher_code'][$search_publisher_code] = "selected";

$checked['search_month'][$search_month] = "checked";
$checked['search_report_term'][$search_report_term] = "checked";
$checked['search_month_term'][$search_month_term] = "checked";
	
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
							<div class="page-title-right">
								<ol class="breadcrumb m-0">
									<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">파트너</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">리포트 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>
				<!-- end page title -->
				
				<div class="row g-2">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">검색필터</h5>
						<div class="card-body p-2">
							<form class="form-horizontal" method="GET" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row gx-3 gy-2 mb-2">
									<div class="col-2">
										<div class="row">
											<label for="search_report_term" class="col-sm-4 col-form-label-sm bg-light border font-14 px-1">리포트 주기</label>
											<div class="col-sm-8">
												<div class="form-check form-check-inline mt-1">
													<input type="radio" id="search_report_term_m" name="search_report_term" class="form-check-input" value="M" <?=$checked['search_report_term']['M']?>>
													<label class="form-check-label font-14" for="search_report_term_m">월별</label>
												</div>
												<div class="form-check form-check-inline mt-1">
													<input type="radio" id="search_report_term_t" name="search_report_term" class="form-check-input" value="T" <?=$checked['search_report_term']['T']?>>
													<label class="form-check-label font-14" for="search_report_term_t">분기별</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-2">
										<div class="row">
											<label for="reportrange" class="col-sm-4 col-form-label-sm bg-light border font-14 px-1">기간</label>
											<div class="col-sm-8">
												<select class="form-select form-select-sm" id="search_year" name="search_year">
													<option value="">:::년도:::</option>
													<?
														for($i=2013;$i<=date('Y');$i++){
													?>
													<option value="<?=$i?>" <?=$selected['search_year'][$i]?>><?=$i?>년</option>
													<?
														}
													?>
												</select>
											</div>
										</div>
									</div>
									<div class="col-5">
										<div class="row">
											<div class="col-sm-12 px-0">
												<div class="input-group" id="choice_month">
												<?
													for($i=1;$i<=12;$i++){
												?>
													<input type="radio" class="btn-check" name="search_month" id="search_month_<?=$i?>" value="<?=sprintf('%02d',$i)?>" autocomplete="off" <?=$checked['search_month'][sprintf('%02d',$i)]?>>
													<label class="btn btn-sm btn-outline-secondary shadow-none font-14" for="search_month_<?=$i?>"><?=sprintf('%02d',$i)?>월</label>
												<?
													}
												?>
												</div>
												<div class="input-group" id="choice_month_term" style="display:none">
													<?
														for($i=1;$i<=4;$i++){
													?>
													<input type="radio" class="btn-check" name="search_month_term" id="search_month_term_<?=$i?>" value="<?=$i?>" autocomplete="off" <?=$checked['search_month_term'][$i]?>>
													<label class="btn btn-sm btn-outline-secondary shadow-none font-14" for="search_month_term_<?=$i?>"><?=$i?>분기</label>
													<?
														}
													?>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="row gx-3 gy-2 mb-2">
									<div class="col-3">
										<div class="row">
											<label for="search_publisher_code" class="col-sm-3 col-form-label-sm bg-light border font-14 px-1">파트너</label>
											<div class="col-sm-9">
												<select id="search_publisher_code" name="search_publisher_code" class="form-select-sm select2" data-toggle="select2">
													<option value="">:::파트너 선택:::</option>
													<?
														foreach($publisher_data as $value){
													?>
													<option value="<?=$value['publisher_code']?>" <?=$selected['search_publisher_code'][$value['publisher_code']]?>><?=$value['publisher_name']?></option>
													<?
														}
													?>
												</select>
											</div>
										</div>
									</div>
									<div class="col-9">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none" id="btn_search">리포트 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
				
				<div class="d-flex flex-row justify-content-between mb-2">
					<div class="float-start"><? echo number_format(count($report_list))?> 개</div>
				</div>
				
				<div class="row">
					<div class="col-12">
						<table class="table table-centered w-100  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
							<colgroup>
								<col width="20%" />
								<col width="*"/>
								<col width="6%"/>
								<col width="10%"/>
								<col width="10%"/>
								<col width="6%"/>
								<col width="8%"/>
								<col width="10%"/>
							</colgroup>
							<thead class="table-light">
								<tr>
									<th class="text-center">파트너</th>
									<th class="text-center">리포트 제목</th>
									<th class="text-center">수량</th>
									<th class="text-center">합계 (KRW)</th>
									<th class="text-center">Royalty Payable</th>
									<th class="text-center">상태</th>
									<th class="text-center">상세보기</th>
									<th class="text-center">리포트 다운로드</th>
								</tr>
							</thead>
							<tbody class="bg-white font-12">
							<?

								$num = 0;

								foreach($report_list as $report){
							?>
								<tr>
									<td class="text-start"><?=$report['publisher_name']?></td>
									<td class="text-start"><?=$report['report_year']?>년 
									<? if($report['report_term']=="T"){
											echo $report['report_month']."분기";
										}else{
											echo $report['report_month']."월";
										}
									?>
									리포트 내역입니다.</td>
									<td class="text-end"><?=number_format($report['total_sold'],0)?></td>
									<td class="text-end"><?=number_format($report['total'],0)?> 원</td>
									<td class="text-end"><?=$report['currency_converter']?> <?=number_format($report['total']*$report['royalty'],2)?></td>
									<td class="text-center"><?=$report['status']?></td>
									<td class="text-center"><a href="report_view.php?idx=<?=$report['idx']?>" class="btn btn-sm btn-outline-secondary">상세보기</a></td>
									<td class="text-center"><button type="button" class="btn btn-sm btn-outline-success btn_report_download" data-idx="<?=$report['idx']?>"><i class="mdi mdi-download me-2 text-success vertical-middle font-14"></i> 엑셀 다운로드</button></td>
								</tr>
							<?		
									$num++;
									
									$total_sold +=$report['total_sold'];
									$total_price +=$report['total'];
								}
							?>
							</tbody>
							<tfoot class="table-light">
							<tr>
								<th class="text-center" colspan="2"><?=$search_year?>년 <?=$search_month?>월 합계</th>
								<th class="text-end"><?=number_format($total_sold,0)?></th>
								<th class="text-end"><?=number_format($total_price,0)?> 원</th>
								<th></th>
								<th></th>
								<th></th>
								<th></th>
							</tr>
							</tfoot>
						</table>
						<div class="text-center mt-3 fs-5"><?echo $partner_member_list->links_html;?></div>
					</div> 
				</div>
				
			</div> <!-- container -->
		</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	var report_term = "<?=$search_report_term?>";
	if(report_term=="M"){
		$("#choice_month_term").hide();
		$("#choice_month").show();
	}else{
		$("#choice_month_term").show();
		$("#choice_month").hide();
	}
	
	$("input[name='search_report_term']").bind("click",function(){
		 var search_report_term = $('input:radio[name="search_report_term"]:checked').val();
		 if(search_report_term=="M"){
			$("#choice_month_term").hide();
			$("#choice_month").show();
		 }else{
			$("#choice_month_term").show();
			$("#choice_month").hide();
		 }
	 });
	 
	 $(function(){
		 $(".btn_report_download").bind("click",function(){
				var index = $(".btn_report_download").index(this);
				var idx = $(".btn_report_download").eq(index).attr("data-idx");

				var $form = $('<form></form>');
				$form.attr('action', 'report_download.php');
				$form.attr('method', 'post');
				$form.appendTo('body');
				var idx = $('<input type="hidden" name="idx" value="'+idx+'">');
				$form.append(idx);
				$form.submit();
		 });
	});
});
</script>
</body>
</html>