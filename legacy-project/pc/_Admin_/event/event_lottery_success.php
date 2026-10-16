<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['event'] = "active";
$sidebar_file = "sidebar_event.php";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$event_no = filter_input(INPUT_GET, 'event_no', FILTER_SANITIZE_NUMBER_INT);
$searchTitle = trim(filter_input(INPUT_GET, 'searchTitle', FILTER_SANITIZE_STRING));

if (!$page) {
	$page = 1;
}

$where = [];

$add_where = " teli.lottery_status='Y'";

$where[] = " teli.event_no = {$event_no}";

if ($searchTitle) {
    $where[] = " teli.m_id = '{$searchTitle}'";
}

foreach ($where as $value) {
    $add_where.= " AND {$value}";
}

$orderby = "teli.lottery_date DESC";

foreach ($_GET as $key=>$value) {
    if ($key<>"page" ) {
        if ($value<>"") {
            $param.="&".$key."=".$value;
        }
    }
}

try {
    $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $adminV1 = new AdminV1($pdo);
	$adminEvent= new AdminEvent($pdo); 

    $event_member_list = $adminEvent->getEventLotteryItemList($page, $add_where, $orderby, $param);
    $result = $event_member_list->resultset->fetchAll();
    $event_info = $result[0];
} catch (PDOException $e) {
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$page_title = "추첨 이벤트 당첨자현황 ({$event_info['event_name']})";

include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php');

$event_status_arr = [
    0 => "",
    1 => "배송지입력",
    2 => "발송완료",
    3 => "수령완료"
]
?>
<style>
    .table-centered tr:hover { background-color: #FFF0F0; }
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
                    <div class="row" style="margin: 10px 0 10px 0;">
                        <form method="get" action="<?=$_SERVER['PHP_SELF']?>" style="padding-left: 0px; display: flex; align-items: center; gap: 5px;">
                            <input type="hidden" name="event_no" value="<?=$event_no?>">
                            <input type="text" class="form-control" id="searchTitle" name="searchTitle" placeholder="회원아이디" value="<?=$searchTitle?>" style="width: 200px;display: inline-block;">
                            <button type="submit" class="btn btn-primary shadow-none">검색</button>
                        </form>
                    </div>

                    <div class="d-flex flex-row justify-content-between mb-2">
                        <div class="float-start"><?=number_format($event_member_list->total_results)?> 개</div>
                        <div class="float-end"><strong class="text-danger"><?=$event_info['event_start_dt']?> ~ <?=$event_info['event_end_dt']?></strong></div>
                    </div>

					<div class="row">
                        <div class="col-12">
                            <table class="table table-centered w-100  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
                                <thead class="table-light font-13">
                                    <tr>
                                        <th class="text-center">번호</th>
                                        <th class="text-center">사은품명</th>
                                        <th class="text-center">회원아이디</th>
                                        <th class="text-center">회원명</th>
                                        <th class="text-center">생년월일</th>
                                        <th class="text-center">휴대폰번호</th>
                                        <th class="text-center">당첨일자</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white font-12">
                                    <?php
									if (count($result) > 0) {
										$num = $event_member_list->total_results;

										if ($page > 1) {
											$num = $num - (($page - 1) * 30);
										}

										foreach ($result as $value) {
                                            $memberInfo = $adminV1->getMemberInfo($adminV1->getMemberNo($value['m_id'])[0]);

                                            
									?>
									<tr>
                                        <td class="text-center px-1"><?=$num?></td>
                                        <td class="text-center px-1"><?=$value['item_name']?></td>
                                        <td class="text-center px-1"><?=$value['m_id']?></td>
                                        <td class="text-center px-1"><?=$memberInfo['name']?></td>
                                        <td class="text-center px-1"><?=$memberInfo['birth_day']?></td>
                                        <td class="text-center px-1"><?=$memberInfo['hp']?></td>
                                        <td class="text-center px-1"><?=$value['lottery_date']?></td>
                                    </tr>
                                    <?php
                                            $num--;
                                        }
                                    }
                                    ?>
                                </tbody>
                            </table>
                        </div>

                        <div class="text-center mt-3"><?=$event_member_list->links_html?></div>

                    </div>
			</div><!-- /container-fluid -->
		</div><!-- /content -->
		<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
	</div><!-- /content-page -->
</div><!-- /wrapper -->

</body>
</html>
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