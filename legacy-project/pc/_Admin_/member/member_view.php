<?php
$sidebar_file = "sidebar_member.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['member'] = "active";
$page_title ="회원 상세보기";

$m_no = filter_input(INPUT_GET, 'm_no', FILTER_SANITIZE_STRING);

try {
    $pdo = new PDO($dsn, DB_USER, DB_PASSWORD);
	$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	$pdo2 = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
	$pdo2->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	$adminV1 = new AdminV1($pdo2);
	$member_info = $adminV1->getMemberInfo($m_no);
    $member_point = number_format($adminV1->getMemberPoint($m_no)['point']);
    
    $adminOrder = new AdminOrder($pdo);
    $order_list = $adminOrder->getOrderAll(1, " AND b.m_id = '{$member_info['m_id']}'", " b.order_date DESC", "");

    $adminBoard = new AdminBoard($pdo2);
    $qna_list = $adminBoard->getQnaList(1, " AND `user_id` = '{$member_info['m_id']}'", " idx DESC", "");

    // 결제완료 - 건수, 금액 (order 기준)
    $qry = "SELECT
                count(1) as total_cnt, sum(a.total_price) as total_price
            FROM `tbl_order` a
            WHERE a.`m_no` > '0' 
                AND a.step = 2
                AND a.m_id = :m_id";
	$stmt = $pdo->prepare($qry);
	$params = array(
	    ":m_id" => $member_info['m_id'],
	);
	$stmt->execute($params);
	$orderStep2 = $stmt->fetch();

    // 주문완료 - 건수, 금액
    $qry = "SELECT
                count(1) as total_cnt, sum(b.price) as total_price
            FROM `tbl_order` a
                INNER JOIN `tbl_order_item` b on a.`settle_no` = b.`settle_no`
            WHERE a.`m_no` > '0' 
                AND b.status = 2 -- 주문완료
                AND b.m_id = :m_id";
	$stmt = $pdo->prepare($qry);
	$params = array(
	    ":m_id" => $member_info['m_id'],
	);
	$stmt->execute($params);
	$orderSuccess = $stmt->fetch();

    // 취소완료 - 건수, 금액
    $qry = "SELECT
                count(1) as total_cnt, sum(b.price) as total_price
            FROM `tbl_order` a
                INNER JOIN `tbl_order_item` b on a.`settle_no` = b.`settle_no`
            WHERE a.`m_no` > '0' 
                AND b.status = 9 -- 취소완료
                AND b.m_id = :m_id";
	$stmt = $pdo->prepare($qry);
	$params = array(
	    ":m_id" => $member_info['m_id'],
	);
	$stmt->execute($params);
	$orderCancel = $stmt->fetch();

    // 회원등급 변동이력
    $qry = "SELECT
                tmlh.*
            FROM `tbl_member_level_history` tmlh
            WHERE tmlh.m_id = :m_id
            ORDER BY tmlh.idx DESC";
	$stmt = $pdo2->prepare($qry);
	$params = array(
	    ":m_id" => $member_info['m_id'],
	);
	$stmt->execute($params);
	$member_level_history = $stmt->fetchAll();
} catch (PDOException $e) {
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$member_level_arr = array(
    1 => "일반",
    2 => "정회원",
    3 => "VIP"
);

$member_type_arr = array(
    "P" => "일반",
    "R" => "리셀러",
    "S" => "휴면",
    "E" => "이벤트"
);

$sns_type_arr = array(
    "" => "<span class=\"badge bg-primary\">이메일</span>",
    "naver" => "<span class=\"badge bg-success\">네이버</span>",
    "kakao" => "<span class=\"badge bg-warning\">카카오</span>",
    "payco" => "<span class=\"badge bg-danger\">페이코</span>"
);
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
										<li class="breadcrumb-item"><a href="javascript: void(0);">회원</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">회원관리</a></li>
										<li class="breadcrumb-item active"><?=$page_title?></li>
									</ol>
								</div>
								<h4 class="page-title"><?=$page_title?></h4>
							</div>
						</div>
					</div>     
					<!-- end page title --> 
					<div class="row">
						<div class="col-xl-4">
							<!-- Personal-Information -->
							<div class="card">
								<div class="card-body">
									<!-- <h4 class="header-title mt-0 mb-3">회원 정보</h4> -->
									<!-- <hr> -->
                                    <div class="">
                                        <table class="table table-bordered" style="margin-bottom: 0px;">
                                            <colgroup>
                                                <col style="width: 30%; background-color: #f8f9fa;">
                                                <col style="width: 70%;">
                                            </colgroup>
                                            <tbody>
                                                <tr>
                                                    <th class="text-center">회원고유번호</th>
                                                    <td><?=$member_info['m_no']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="text-center">아이디<?=($member_info['email'])?"</br>(이메일)":""?></th>
                                                    <td><?=$member_info['m_id']?><?=($member_info['email'])?"</br>({$member_info['email']})":""?></td>
                                                </tr>
                                                <tr>
                                                    <th class="text-center">이름</br>(닉네임)</th>
                                                    <td><?=$member_info['name']?></br>(<?=$member_info['nickname']?>)</td>
                                                </tr>
                                                <tr>
                                                    <th class="text-center">생년월일</br>(나이)</th>
                                                    <td><?=$member_info['birth_day']?></br><?=($member_info['birth_day']!="")?"(".$adminV1->getMemberAge($member_info['birth_day']).")":""?></td>
                                                </tr>
                                                <tr>
                                                    <th class="text-center">휴대폰</th>
                                                    <td><?=$member_info['hp']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="text-center">회원등급</th>
                                                    <td><span class="badge bg-primary"><?=$member_level_arr[$member_info['mem_level']]?></span></td>
                                                </tr>
                                                <tr>
                                                    <th class="text-center">회원가입일</th>
                                                    <td><?=$member_info['reg_date']?></td>
                                                </tr>
                                                <tr>
                                                    <th class="text-center">최종로그인<br>(접속IP)</th>
                                                    <td><?=$member_info['log_date']?><br>(<?=$member_info['ip']?>)</td>
                                                </tr>
                                                <tr>
                                                    <th class="text-center">방문횟수</th>
                                                    <td><?=number_format($member_info['visited'])?> 회</td>
                                                </tr>
                                                <tr>
                                                    <th class="text-center">가입방법</th>
                                                    <td><?=$sns_type_arr[strtolower($member_info['sns_type'])]?></td>
                                                </tr>
                                                <tr>
                                                    <th class="text-center">회원분류</th>
                                                    <td><?=$member_type_arr[$member_info['mem_type']]?></td>
                                                </tr>
                                                <tr>
                                                    <th class="text-center">포인트</th>
                                                    <td>
                                                        <span class="me-2"><?=$member_point?></span>
                                                        <a class="btn btn-sm btn-primary shadow-none" href="/_Admin_/member/member_point_list.php?search_type=tm.m_id&search_value=<?=$member_info['m_id']?>&emoney_type=all" target="_blank">
                                                            내역보기
                                                        </a>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th class="text-center">본인인증</th>
                                                    <td>
                                                        <span class="me-2"><?=($member_info['is_auth']=="Y")?"인증":"미인증"?></span>
                                                    <?php if ($member_info['is_auth']=="Y") { ?>
                                                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="isAuthReset(<?=$member_info['m_no']?>)">인증 초기화</button>
                                                    <?php } ?>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
								</div>
							</div>
                            <!-- Personal-Information -->
							
							<!-- Messages-->
							<div class="card">
								<div class="card-body">
									<h4 class="header-title mb-3">회원등급 변동이력</h4>
                                    <p>총 <?=number_format(count($member_level_history))?> 건 / <small class="text-muted">최근 5건</small></p>
                                    <div class="table-responsive">
										<table class="table table-hover table-centered mb-0">
											<thead>
												<tr>
													<th class="text-center">월</th>
                                                    <th class="text-center">등급</th>
                                                    <th class="text-center">대상금액</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            <?php
                                            if ($member_level_history) {
                                                $num = 0;
                                                
                                                foreach ($member_level_history AS $value) {
                                                    if ($num >= 5) {
                                                        break;
                                                    }
                                            ?>
                                                <tr>
                                                    <th class="text-center"><?=$value['history_date']?></th>
                                                    <th class="text-center"><?=$member_level_arr[$value['mem_level']]?></th>
                                                    <th class="text-center">₩<?=number_format($value['order_price'])?></th>
                                                </tr>
                                            <?php
                                                    $num++;
                                                }
                                            }
                                            ?>
                                            </tbody>
                                        </table>
                                    </div>
								</div> <!-- end card-body-->
							</div> <!-- end card-->
						</div> <!-- end col-->
						
                        <div class="col-xl-8">
							<div class="row">
                                <div class="col-sm-3">
									<div class="card tilebox-one">
										<div class="card-body">
											<!-- <i class="dripicons-basket float-end text-muted"></i> -->
                                            <i class="dripicons-box float-end text-muted"></i>
											<h6 class="text-muted text-uppercase mt-0">결제완료 건수/금액</h6>
											<h4 class="m-b-20"><?=$orderStep2['total_cnt']?>건 / ₩<?=number_format($orderStep2['total_price'])?></h4>
											<!-- <span class="badge bg-primary"> +89% </span> <span class="text-muted">Last year</span> -->
										</div> <!-- end card-body-->
									</div> <!--end card-->
								</div><!-- end col -->

                                <div class="col-sm-3">
									<div class="card tilebox-one">
										<div class="card-body">
											<!-- <i class="dripicons-basket float-end text-muted"></i> -->
                                            <i class="dripicons-box float-end text-muted"></i>
											<h6 class="text-muted text-uppercase mt-0">주문완료 건수</h6>
											<h4 class="m-b-20"><?=$orderSuccess['total_cnt']?>건</h4>
											<!-- <span class="badge bg-primary"> +89% </span> <span class="text-muted">Last year</span> -->
										</div> <!-- end card-body-->
									</div> <!--end card-->
								</div><!-- end col -->

                                <div class="col-sm-3">
									<div class="card tilebox-one">
										<div class="card-body">
											<!-- <i class="dripicons-basket float-end text-muted"></i> -->
                                            <i class="dripicons-box float-end text-muted"></i>
											<h6 class="text-muted text-uppercase mt-0">취소완료 건수</h6>
											<h4 class="m-b-20"><?=$orderCancel['total_cnt']?>건</h4>
											<!-- <span class="badge bg-primary"> +89% </span> <span class="text-muted">Last year</span> -->
										</div> <!-- end card-body-->
									</div> <!--end card-->
								</div><!-- end col -->
                            </div>
							<!-- end row -->
							
							<div class="card">
								<div class="card-body">
									<h4 class="header-title mb-3">회원 주문내역
                                        <a href="/_Admin_/order/order_all.php?search_key=search_m_id&search_value=<?=$member_info['m_id']?>&search_year=2017" class="btn btn-primary shadow-none" target="_blank" style="margin-left: 10px;">주문내역보기</a>
                                        <a href="/_Admin_/order/order_old_list.php?search_key=search_m_id&search_value=<?=$member_info['m_id']?>&search_year=2017" class="btn btn-primary shadow-none" target="_blank">(과거)주문내역보기</a>
                                    </h4>
                                    <p>총 <?=number_format($order_list->total_results)?> 건 / <small class="text-muted">최근 5건</small></p>

									<div class="table-responsive">
										<table class="table table-hover table-centered mb-0">
											<thead>
												<tr>
													<th class="text-center">주문일자</th>
													<th class="text-center">결제번호</th>
													<th class="text-center">결제상태</th>
                                                    <th class="text-center">주문번호</th>
													<th class="text-center">상품정보</th>
                                                    <th class="text-center">주문금액</th>
                                                    <th class="text-center">주문상태</th>
												</tr>
											</thead>
											<tbody>
                                            <?php
                                                if ($order_list->success == true) {
                                                    $result = $order_list->resultset->fetchAll();
                                                    $num = 0;

                                                    foreach ($result as $value) {
                                                        if ($num >= 5) {
                                                            break;
                                                        }
                                            ?>
                                                <tr>
													<td class="text-center"><?=$value['order_date']?></td>
													<td class="text-center">
                                                        <a href="../order/order_view.php?settle_no=<?=$value['settle_no']?>" target="_blank">
                                                            <?=$value['settle_no']?>
                                                        </a>
                                                    </td>
													<td class="text-center"><?=$adminOrder->getCheckoutStatus($value['step'])?></td>
													<td class="text-center"><?=$value['ordno']?></td>
                                                    <td class="text-center"><?=$value['product_name']?></td>
                                                    <td class="text-center"><?=number_format($value['price'])?></td>
                                                    <td class="text-center"><?=$adminOrder->getOrderStatus($value['status'])?></td>
												</tr>
                                            <?php
                                                        $num++;
                                                    }
                                                }
                                            ?>
											</tbody>
										</table>
									</div> <!-- end table responsive-->
								</div> <!-- end col-->
							</div> <!-- end row-->

                            <div class="card">
								<div class="card-body">
									<h4 class="header-title mb-3">
                                        회원 문의내역
                                        <a href="/_Admin_/board/qna_list.php?searchGubun=&replyStatus=&searchType=user_id&searchTitle=<?=$member_info['m_id']?>" class="btn btn-primary shadow-none" target="_blank" style="margin-left: 10px;">전체보기</a>
                                    </h4>
                                    <p>총 <?=number_format($qna_list->total_results)?> 건 / <small class="text-muted">최근 5건</small></p>

									<div class="table-responsive">
										<table class="table table-hover table-centered mb-0">
											<thead>
												<tr>
													<th class="text-center">구분</th>
													<th class="text-center">제목</th>
													<th class="text-center">작성일</th>
													<th class="text-center">답변상태</th>
												</tr>
											</thead>
											<tbody>
                                            <?php
                                                if ($qna_list->success == true) {
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

                                                    $result = $qna_list->resultset->fetchAll();
                                                    $num = 0;

                                                    foreach ($result as $value) {
                                                        if ($num >= 5) {
                                                            break;
                                                        }
                                            ?>
                                                <tr>
													<td class="text-center"><?=$gubun_array[$value['gubun']]?></td>
													<td class="text-center">
                                                        <a href="../board/qna_view.php?<?=($q_string)?"{$q_string}&idx={$value['idx']}":"idx={$value['idx']}" ?>" target="_blank">
                                                            <?=$value['subject']?>
                                                            <?php
                                                                if ($value['file_cnt']) {
                                                                    echo '<i class="dripicons-photo"></i>';
                                                                }
                                                            ?>
                                                        </a>
                                                    </td>
													<td class="text-center"><?=$value['reg_date']?></td>
													<td class="text-center">
                                                        <?=($value['answer']!="")?"O":"X"?>
											            <?=($value['admin_id']!="")?"<br/>({$value['admin_id']})":""?>
                                                    </td>
												</tr>
                                            <?php
                                                        $num++;
                                                    }
                                                }
                                            ?>
											</tbody>
										</table>
									</div> <!-- end table responsive-->
								</div> <!-- end col-->
							</div> <!-- end row-->

						</div>
						<!-- end col -->

					</div>


				</div> <!-- container -->
	</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<!-- bundle -->
<script type="text/javascript">
    function isAuthReset(m_no) {
        if(confirm('인증 초기화시 이름, 휴대폰, 생년월일 정보가 삭제됩니다.')) {
            $.ajax({
                type: "POST",
                url: "./member_proc.php",
                data: {
                    mode: "authReset",
                    m_no: m_no
                },
                dataType: 'json',
                success: function (data) {
                    if (data.success) {
                        alert("초기화완료");
                        location.reload();
                    }
                },
                error: function (data) {
                    alert(data);
                }
            })
        }
    }
</script>
</body>
</html>
