<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$page         = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_type  = filter_input(INPUT_GET, 'search_type', FILTER_SANITIZE_STRING);
$search_value = trim(filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING));
$status       = filter_input(INPUT_GET, 'status', FILTER_SANITIZE_NUMBER_INT);
$event_gift_idx = filter_input(INPUT_GET, 'event_gift_idx', FILTER_SANITIZE_NUMBER_INT);

$topmenu['event'] = "active";
$page_title = "사은품 발송 현황";
$sidebar_file = "sidebar_event.php";

// 검색필터 페이지네이션 적용
foreach ($_GET as $key => $value) {
    if ($key <> "page") {
        if ($value <> "") {
            $param .= "&".$key."=".$value;
        }
    }
}

if (!$page) {
    $page = 1;
}

if ($status == '') {
    $status = "all";
}

$where = [];
$add_where = "1";

$where[] = " teg.is_delivery = 'Y'";

if ($search_value) {
    $where[] = " {$search_type} = '{$search_value}'";
}

if ($status != "all") {
    $where[] = " tegm.status = '{$status}'";
}

if ($event_gift_idx) {
    $where[] = " tegm.parent_idx = '{$event_gift_idx}'";
}

foreach ($where as $value) {
	$add_where .= " AND {$value}";
}

$orderby = " tegm.reg_date DESC";

try {
    $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $adminV1 = new AdminV1($pdo);
	$adminEvent= new AdminEvent($pdo); 
	
	$event_member_list = $adminEvent->getEventMemberList($page, $add_where, $orderby, $param);
    $event_gift_list = $adminEvent->getEventGiftList2();
} catch (PDOException $e) {
	echo 'Error!: '.$e->getMessage();
	die();  
}

$selected['search_type'][$search_type] = "selected";
$selected['event_gift_idx'][$event_gift_idx] = "selected";
$selected['status'][$status] = "checked";

$event_status_arr = [
    0 => "",
    1 => "배송지입력",
    2 => "발송완료",
    3 => "수령완료"
];

include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php');
?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
	<!-- Begin page -->
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
									<ol class="breadcrumb m-0">
										<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">이벤트</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">사은품 관리</a></li>
										<li class="breadcrumb-item active"><?=$page_title?></li>
									</ol>
								</div>
								<h4 class="page-title"><?=$page_title?></h4>
							</div>
						</div>
					</div>     
					<!-- end page title -->
					
					<!-- 검색필터 start -->
                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <h5 class="card-header bg-secondary text-white">검색필터</h5>
                                <div class="card-body">
                                    <form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
                                        <div class="row mb-2">
                                            <div class="col-lg-6">
                                                <div class="input-group row">
                                                    <label for="" class="col-sm-3 col-form-label bg-light border">검색어</label>
                                                    <div class="col-sm-3">
                                                        <select class="form-control" name="search_type" id="search_type">
                                                            <option value="tegm.m_id" <?=$selected['search_type']['tegm.m_id']?>>회원아이디</option>
                                                            <option value="tegm.tracking_no" <?=$selected['search_type']['tegm.tracking_no']?>>송장번호</option>
                                                            <option value="tegm.receiver" <?=$selected['search_type']['tegm.receiver']?>>수신인</option>
                                                        </select>
                                                    </div>
                                                    <div class="col-sm-6 ps-0">
                                                        <input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-lg-6">
                                                <div class="input-group row">
                                                    <label for="" class="col-sm-3 col-form-label bg-light border">상태</label>
                                                    <div class="col-sm-6 mt-1">
                                                        <div class="form-check form-check-inline">
                                                            <input type="radio" id="status1" name="status" class="form-check-input" value="all" <?=$selected['status']['all']?>>
                                                            <label class="form-check-label" for="status1">전체</label>
                                                        </div>
                                                        <div class="form-check form-check-inline">
                                                            <input type="radio" id="status2" name="status" class="form-check-input" value="1" <?=$selected['status']['1']?>>
                                                            <label class="form-check-label" for="status2">배송지입력</label>
                                                        </div>
                                                        <div class="form-check form-check-inline">
                                                            <input type="radio" id="status3" name="status" class="form-check-input" value="2" <?=$selected['status']['2']?>>
                                                            <label class="form-check-label" for="status3">발송완료</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row mb-2">
                                            <div class="col-lg-6">
                                                <div class="input-group row">
                                                    <label for="event_gift_idx" class="col-sm-3 col-form-label bg-light border">이벤트/사은품 명</label>
                                                    <div class="col-sm-9">
                                                        <select id="event_gift_idx" name="event_gift_idx" class="form-select select2" data-toggle="select2">
                                                            <option value="">:::선택:::</option>
                                                            <?
                                                                foreach($event_gift_list as $value){
                                                            ?>
                                                            <option value="<?=$value['idx']?>" <?=$selected['event_gift_idx'][$value['idx']]?>>
                                                                <?=$value['title']?> / <?=$value['gift_nm']?>
                                                            </option>
                                                            <?
                                                                }
                                                            ?>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="row">
                                            <div class="col-lg-12">
                                                <div class="float-end">
                                                    <button type="submit" class="btn btn-primary shadow-none">검색</button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 검색필터 end -->

					<div class="d-flex flex-row justify-content-between mb-2 align-items-center">
                        <div class="float-start text-center"><?=number_format($event_member_list->total_results)?> 개</div>
                    </div>

					<div class="row">
						<div class="col-12 table-responsive">
							<table class="table table-hover table-centered w-100 nowrap table-sm table-bordered border-light">
                                <colgroup>
                                    <col style="width: 3%;">
                                    <col style="width: 16%;">
                                    <col style="width: 16%;">
                                    <col style="width: 5%;">
                                    <col style="width: 5%;">
                                    <col style="width: 5%;">
                                    <col style="width: 5%;">
                                    <col style="width: 5%;">
                                    <col style="width: 20%;">
                                    <col style="width: 10%;">
                                    <col style="width: 5%;">
                                    <col style="width: 5%;">
                                </colgroup>
								<thead class="table-light font-13">
									<tr>
										<th class="text-center">번호</th>
                                        <th class="text-center">이벤트명</th>
										<th class="text-center">사은품명</th>
										<th class="text-center">회원아이디</th>
										<th class="text-center">회원명</th>
										<th class="text-center">생년월일</th>
										<th class="text-center">휴대폰번호</th>
                                        <th class="text-center">수신인</th>
										<th class="text-center">주소</th>
                                        <th class="text-center">배송지입력일자</th>
                                        <th class="text-center">상태</th>
                                        <th class="text-center">송장번호</th>
									</tr>
								</thead>
								<tbody class="font-12 bg-white">
								<?php
									if ($event_member_list->success == true) {
										$result = $event_member_list->resultset->fetchAll();
										$num=0;

										foreach ($result as $value) {
                                            $memberInfo = $adminV1->getMemberInfo($adminV1->getMemberNo($value['m_id'])[0]);
								?>
									<tr>
										<td class="text-center"><?=$event_member_list->total_results-($page-1)*30-$num?></td>
                                        <td class="text-center px-1"><?=$value['title']?></td>
										<td class="text-center px-1"><?=$value['gift_nm']?></td>
                                        <td class="text-center px-1"><?=$value['m_id']?></td>
                                        <td class="text-center px-1"><?=$memberInfo['name']?></td>
                                        <td class="text-center px-1"><?=$memberInfo['birth_day']?></td>
                                        <td class="text-center px-1"><?=$value['tel']?></td>
                                        <td class="text-center px-1"><?=$value['receiver']?></td>
                                        <td class="text-center px-1">(<?=$value['zipcode']?>) <?=$value['address']?> <?=$value['address_detail']?></td>
                                        <td class="text-center px-1"><?=$value['reg_date']?></td>
                                        <td class="text-center px-1"><?=$event_status_arr[$value['status']]?></td>
                                        <td class="text-center">
                                        <?php if($value['tracking_no']) { ?>
                                            <p class="mb-1"><?=$value['tracking_no']?></p>
                                            <button type='button' class='btn btn-sm btn-outline-secondary shadow-none font-12 btn_delivery_search' data-trackingno='<?=str_replace("-","",$value['tracking_no'])?>' data-deliverycode="<?=$value['delivery_code']?>">배송조회</button>
                                        <?php } ?>
                                        </td>
									</tr>
								<?php
											$num++;
										}
									}
								?>
								</tbody>
							</table>
							<div class="text-center mt-3"><?echo $event_member_list->links_html;?></div>
						</div>
						<!-- end col -->
					</div>
					<!-- end row -->   
				</div><!-- /container-fluid -->
			</div><!-- /content -->
		</div><!-- /content-page -->
	</div><!-- /wrapper -->

    <?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
<script src="<?=$document_root?>/assets/js/vendor/responsive.bootstrap5.min.js"></script>
<script type="text/javascript">
    $(document).ready(function(){
        $('.btn_delivery_search').bind("click",function(){
            var index = $('.btn_delivery_search').index(this);
            var tracking_no = $('.btn_delivery_search').eq(index).attr("data-trackingno");
            var delivery_code = $('.btn_delivery_search').eq(index).attr("data-deliverycode");
            var $form = $('<form></form>');

            if(delivery_code=="002"){
                $form.attr('action', 'https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm');
                $form.attr('method', 'post');
                $form.attr('target', '_blank');
                $form.appendTo('body');

                var sid1 = $('<input type="hidden" value="'+tracking_no+'" name="sid1">');
                $form.append(sid1);
            }else{
                $form.attr('action', 'https://trace.cjlogistics.com/web/detail.jsp');
                $form.attr('method', 'post');
                $form.attr('target', '_blank');
                $form.appendTo('body');

                //var fsp_action = $('<input type="hidden" value="PARC_ACT_002" name="fsp_action">');
                //var fsp_cmd = $('<input type="hidden" value="retrieveInvNoACT2" name="fsp_cmd">');
                var invc_no = $('<input type="hidden" value="'+tracking_no+'" name="slipno">');
                $form.append(invc_no);
            }
            $form.submit();
        });
    });
</script>