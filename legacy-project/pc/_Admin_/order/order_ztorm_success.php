<?php
$sidebar_file = "sidebar_order.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_ztorm_id = trim(filter_input(INPUT_GET, 'search_ztorm_id', FILTER_SANITIZE_STRING));
$search_ordno = trim(filter_input(INPUT_GET, 'search_ordno', FILTER_SANITIZE_STRING));
$search_start_date = filter_input(INPUT_GET, 'search_start_date', FILTER_SANITIZE_STRING);
$search_end_date = filter_input(INPUT_GET, 'search_end_date', FILTER_SANITIZE_STRING);
$search_m_id = trim(filter_input(INPUT_GET, 'search_m_id', FILTER_SANITIZE_STRING));
$date_label = filter_input(INPUT_GET, 'date_label', FILTER_SANITIZE_STRING);

$topmenu['order'] = "active";
$page_title="Ztorm 주문완료";


if(!$page){
    $page=1;
}

$where = [];

if($search_start_date==""){
	$d = mktime(0,0,0, date("m"), 1, date("Y"));
	//이번달 1일
	$search_start_date = date('Y-m-01',$d);
	//$search_start_date="2021-01-01";
}

if($search_end_date==""){
	$d = mktime(0,0,0, date("m"), 1, date("Y"));
	//이번달 말일
	$search_end_date = date('Y-m-t',$d);
	//$search_end_date="2021-01-31";
}

//$where[] = "ord_ymd>='2021-01-01' and ord_ymd<'2021-12-31'";

if($search_ztorm_id){
    $where[] = "ztorm_item_id ='".$search_ztorm_id."'";
}

if($search_ordno){
    $where[] = "ordno ='".$search_ordno."'";
}

if($search_m_id){
    $where[] = "m_id ='".$search_m_id."'";
}

// 결제번호 or 회원아이디 찾기 조건이 있을때 기간검색 조건은 무시처리
if ($search_ztorm_id || $search_ordno || $search_m_id) {
    $search_start_date = "";
    $search_end_date = "";
    $date_label = "전체기간"; // date라벨도 초기화
} else {
    if ($date_label == "전체기간") {
        $date_label = ""; // 검색키워드 지우고 다시 검색할때 date라벨도 기본값으로 초기화
    }

    if($search_start_date){
        $where[] = "ord_ymd >='".$search_start_date."'";
    }

    if($search_end_date){
        $where[] = "ord_ymd <='".$search_end_date."'";
    }
}


foreach($_GET as $key=>$value){
	if($key<>"page" ){
		if($value<>""){
			$param.="&".$key."=".$value;
		}
	}
}

	
$add_where = "";

foreach($where as $value){
	$add_where.= " and ".$value;
}

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$orderby = "idx desc";

	$adminOrder= new AdminOrder($conn); 
	$order_list = $adminOrder->getOrderZtormSuccess($page,$add_where,$orderby,$param,'30');

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$checked['search_pg_provider'][$search_pg_provider] = "checked";
$checked['search_payment_method'][$search_payment_method] = "checked";
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
										<li class="breadcrumb-item"><a href="javascript: void(0);">주문</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">Ztorm 주문 관리</a></li>
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
							<div class="card-body py-2">
								<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
                                    <input id="date_label" type="hidden" name="date_label" value="<?=$date_label?>">
									<div class="row mb-2">
										<div class="col-lg-3">
											<div class="row">
												<label for="search_ordno" class="col-sm-4 col-form-label bg-light border">주문번호</label>
												<div class="col-sm-8">
													<input type="text" class="form-control" id="search_ordno" name="search_ordno" placeholder="주문번호" value="<?=$search_ordno?>">
												</div>
											</div>
										</div>
										<div class="col-lg-4">
											<div class="row">
												<label for="search_ztorm_id" class="col-sm-4 col-form-label bg-light border">Ztorm Product ID</label>
												<div class="col-sm-8">
													<input type="text" class="form-control" id="search_ztorm_id" name="search_ztorm_id" placeholder="Ztorm Product ID" value="<?=$search_ztorm_id?>">
												</div>
											</div>
										</div>
										<div class="col-lg-4">
											<div class="row">
												<label for="search_m_id" class="col-sm-3 col-form-label bg-light border">회원아이디</label>
												<div class="col-sm-9">
													<input type="text" class="form-control" id="search_m_id" name="search_m_id" placeholder="회원아이디(이메일)" value="<?=$search_m_id?>">
												</div>
											</div>
										</div>
									</div>
									<div class="row mb-2">
										<div class="col-lg-12">
											<div class="row">
												<label for="search_payment_method" class="col-sm-1 col-form-label bg-light border">기간검색</label>
												<div class="col-sm-2">
													<div id="reportrange" class="form-control" data-toggle="date-picker-range" data-target-display="#reportrange"  data-cancel-class="btn-light">
														<i class="mdi mdi-calendar"></i>&nbsp;
														<span id="reportrange"></span> <i class="mdi mdi-menu-down"></i>
													</div>
												</div>
												<div class="col-sm-4">
													<div class="input-group">
														<input type="text" class="form-control" id="search_start_date" name="search_start_date" placeholder="시작일자" value="<?=$search_start_date?>" readonly onchange="endDateOpen()">
														<span class="input-group-text">~</span>
														<input type="text" class="form-control" id="search_end_date" name="search_end_date" placeholder="종료일자" value="<?=$search_end_date?>" readonly>
													</div>
												</div>
											</div>
										</div>
									</div>
									<div class="row">
										<div class="col-lg-12">
											<div class="float-end">
												<button type="submit" class="btn btn-primary shadow-none">Ztorm 주문 검색</button>
											</div>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
					
					<div class="d-flex flex-row justify-content-between mb-2">
						<div class="float-start"><?=number_format($order_list->total_results)?> 개</div>
						<div class="float-end"></div>
					</div>

					<div class="row">
						<div class="col-12">
							<table class="table table-centered w-100  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
								<thead class="table-light font-13">
									<tr>
										<th class="text-center">번호</th>
										<th class="text-center">주문일자</th>
										<th class="text-center">주문번호</th>
										<th class="text-center">회원아이디</th>
										<th class="text-center">상품정보</th>
										<th class="text-center">Ztorm 정보</th>
										<th class="text-center">customer_product_id</th>
										<th class="text-center">키확인</td>
									</tr>
								</thead>
								<tbody class="bg-white font-12">
								<?
								if($order_list->success == true){
									$result = $order_list->resultset->fetchAll();
									
									$num = 0;

									foreach($result as $value){
								?>
									<tr>
										<td class="text-center"><?=$order_list->total_results-($num+($page-1)*20)?></td>
										<td class="text-center"><?=$value['order_date']?></td>
										<td class="text-center"><?=$value['ordno']?></td>
										<td><?=$value['m_id']?></td>
										<td class="text-start">
											<?=$value['product_code']?><br/>
											<?=$value['product_name']?>
										</td>
										<td class="text-start">
											[<?=$value['ztorm_item_id']?>]<br/>
											<?=$value['ztorm_item_name']?><br/>
											<span class="badge bg-secondary text-light font-11 fw-normal"><?=$value['ztorm_publisher']?></span>
										</td>
										<td class="text-center"><?=$value['customer_product_id']?></td>
										<td class="text-center"><button type="button" class="btn btn-sm btn-info shadow-none" data-customerproductid="<?=$value['customer_product_id']?>">키확인</button></td>
									</tr>
								<?		$num++;
										}
									}
								?>
								</tbody>
							</table>
							<div class="text-center mt-3"><?=$order_list->links_html?></div>
						</div> <!-- end col -->
					</div>
				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script type="text/javascript">
    $(function() {
        const targetInput1 = $('#search_start_date');
        const targetInput2 = $('#search_end_date');
        const searchStartDate = '<?=$search_start_date?>';
        const searchEndDate = '<?=$search_end_date?>';
        const date_label = $('#date_label').val();

        function cb(start, end, label) {
            // 라벨에 현재 선택한 text를 줌
            $('#reportrange span').html(label);
            $('#date_label').val(label); // 선택한 라벨을 필터 검색후에도 유지하기 위함
            $('#search_start_date').val(start.format('YYYY-MM-DD'));
            $('#search_end_date').val(end.format('YYYY-MM-DD'));

            if (label === '직접선택') {
                targetInput1.attr('type', 'date');
                targetInput2.attr('type', 'date');
                targetInput1.prop('readonly', false);
                targetInput2.prop('readonly', false);

                // 포커스를 주어 브라우저 기본 달력 유도 (또는 값 비우기)
                const rawInput = targetInput1[0]; // jQuery 객체를 순수 DOM으로 변환

                if (typeof rawInput.showPicker === 'function') {
                    rawInput.showPicker();
                } else {
                    // showPicker를 지원하지 않는 구형 브라우저 대응 (클릭 유도)
                    targetInput1.focus().click();
                }
            } else {
                targetInput1.attr('type', 'text');
                targetInput2.attr('type', 'text');
                targetInput1.prop('readonly', true);
                targetInput2.prop('readonly', true);
            }
        }

        $('#reportrange').daterangepicker({
            startDate: moment(searchStartDate),
            endDate: moment(searchEndDate),
            showCustomRangeLabel: false,
            autoUpdateInput: false,
            autoApply: false,
            ranges: {
                '선택': [moment(searchStartDate), moment(searchEndDate)],
                '오늘': [moment(), moment()],
                '어제': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                '지난 7일': [moment().subtract(6, 'days'), moment()],
                '지난 30일': [moment().subtract(29, 'days'), moment()],
                '이번달': [moment().startOf('month'), moment().endOf('month')],
                '지난달': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                "직접선택": [null, null]
            }
        }, cb);

        // 생성될 시 현재 선택된 날짜 ranges 로 표기
        if (date_label) {
            $('#reportrange span').text('<?=$date_label?>');

            if (date_label == "직접선택") {
                targetInput1.attr('type', 'date');
                targetInput2.attr('type', 'date');
                targetInput1.prop('readonly', false);
                targetInput2.prop('readonly', false);
            }
        } else {
            $('#reportrange span').text('이번달');
        }

        // 두 input의 값이 변경될 때마다 함수 실행
        $('#search_start_date, #search_end_date').on('change', function() {
            checkDateRange(this);
        });
    });

    function endDateOpen() {
        const targetInput2 = $('#search_end_date');

        const rawInput = targetInput2[0]; // jQuery 객체를 순수 DOM으로 변환

        if (typeof rawInput.showPicker === 'function') {
            rawInput.showPicker();
        } else {
            // showPicker를 지원하지 않는 구형 브라우저 대응 (클릭 유도)
            targetInput2.focus().click();
        }
    }

    // 날짜 차이를 체크하는 공통 함수
    function checkDateRange(element) {
        const start = $('#search_start_date').val();
        const end = $('#search_end_date').val();

        // 두 값이 모두 있을 때만 계산 실행
        if (start && end) {
            const startDate = moment(start);
            const endDate = moment(end);

            // 날짜 차이 계산 (단위: 일)
            const diffDays = endDate.diff(startDate, 'days');

            if (diffDays < 0) {
                alert("종료일이 시작일보다 빠를 수 없습니다.");
                $('#search_end_date').val(''); // 잘못된 값 초기화
                return false;
            }

            if (diffDays > 93) {
                alert("조회 기간은 최대 93일을 초과할 수 없습니다.\n현재 선택 기간: " + diffDays + "일");

                // 초과 시 처리 로직 (예: 종료일을 시작일 + 93일로 강제 조정하거나 초기화)
                if (element.id == "search_start_date") {
                    $('#search_start_date').val('');
                } else {
                    $('#search_end_date').val('');
                }

                return false;
            }
        }

        return true;
    }
</script>
</body>
</html>
