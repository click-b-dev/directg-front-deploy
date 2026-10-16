<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['member'] = "active";
$page_title = "포인트 지급/차감";

$search_type    = filter_input(INPUT_GET, 'search_type', FILTER_SANITIZE_STRING);
$search_value   = trim(filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING));

// 필터 selected
$selected['search_type'][$search_type] = "selected";

// filter
$where = [];

if ($search_value) {
    $where[] = " {$search_type} = '{$search_value}'";
}

$add_where = "";

foreach ($where as $value) {
    $add_where .= " and {$value}";
}

$orderby = "tm.m_no DESC";

// 검색이 있을 경우에만 가져옴
if ($search_value) {
    try {
        $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
        $adminV1= new AdminV1($pdo);

        $search_m_no = $adminV1->getMemberNo($search_value)['m_no'];
        $member_info = $adminV1->getMemberInfo($search_m_no);
        $member_point = $adminV1->getMemberPoint($search_m_no)['point'];
    } catch (PDOException $e) {
        echo 'Error!: '.$e->getMessage();
        die();
    }
}

$member_level_arr = array(
    1 => "일반",
    2 => "정회원",
    3 => "VIP"
);
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8" />
    <title><?=$page_title?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta content="" name="description" />
    <meta content="" name="author" />
    <!-- App favicon -->
    <link rel="shortcut icon" href="/favicon.ico">

    <!-- App css -->
    <link href="<?=$document_root?>/assets/css/icons.min.css" rel="stylesheet" type="text/css" />
    <link href="<?=$document_root?>/assets/css/app.min.css?<?=time()?>" rel="stylesheet" type="text/css" id="light-style" />
    <link href="<?=$document_root?>/assets/css/app-dark.min.css" rel="stylesheet" type="text/css" id="dark-style" />

    <style>
        .table-responsive table tr:hover{
            background-color:#FFF0F0;
        }
    </style>
</head>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
    <!-- Begin page -->
    <div class="wrapper">
        <!-- ========== Left Sidebar Start ========== -->
        <? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/sidebar_member.php');?>
        <!-- Left Sidebar End -->

        <div class="content-page">
            <div class="content">
                <!-- Topbar Start -->
                <? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/topbar.php');?>
                <!-- end Topbar -->

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

                    <div class="row g-2">
                        <div class="card">
                            <h5 class="card-header bg-secondary text-white">대상회원 검색</h5>
                            <div class="card-body py-2">
                                <form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
                                    <div class="row mb-2">
                                        <div class="col-lg-6">
                                            <div class="input-group row">
                                                <label for="" class="col-sm-3 col-form-label bg-light border">검색어</label>
                                                <div class="col-sm-3">
                                                    <select class="form-control" name="search_type" id="search_type">
                                                        <option value="tm.m_id" <?=$selected['search_type']['tm.m_id']?>>아이디</option>
                                                    </select>
                                                </div>
                                                <div class="col-sm-6">
                                                    <input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-12 table-responsive">
                            <table class="table table-centered w-100  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
                                <thead class="table-light font-13">
                                    <tr>
                                        <th class="text-center">아이디</th>
                                        <th class="text-center">닉네임</th>
                                        <th class="text-center">이름</th>
                                        <th class="text-center">회원등급</th>
<!--                                        <th class="text-center">구매횟수</th>-->
<!--                                        <th class="text-center">구매금액</th>-->
                                        <th class="text-center">포인트</th>
                                        <th class="text-center">회원가입일</th>
                                        <th class="text-center">최종로그인</th>
                                    </tr>
                                </thead>
                                <tbody class="font-12 bg-white">
                                <?php
                                if ($member_info['m_id']) {
                                ?>
                                    <tr>
                                        <td class="text-center">
                                            <a href="/_Admin_/member/member_view.php?m_no=<?=$member_info['m_no']?>"><?=$member_info['m_id']?></a>
                                        </td>
                                        <td class="text-center"><?=$member_info['nickname']?></td>
                                        <td class="text-center"><?=$member_info['name']?></td>
                                        <td class="text-center"><?=$member_level_arr[$member_info['mem_level']]?></td>
<!--                                        <td class="text-center"></td>-->
<!--                                        <td class="text-center"></td>-->
                                        <td class="text-center"><?=$member_point?></td>
                                        <td class="text-center"><?=$member_info['reg_date']?></td>
                                        <td class="text-center"><?=$member_info['log_date']?></td>
                                    </tr>
                                <?php
                                } else {
                                ?>
                                    <tr>
                                        <td class="text-center" colspan="8">대상회원을 검색 후 이용해주세요.</td>
                                    </tr>
                                <?php
                                }
                                ?>
                                </tbody>
                            </table>
                        </div>
                        <?php
                        if ($member_info['m_id']) {
                        ?>
                        <form id="point_form" method="post" action="./">
                            <input type="hidden" name="m_no" value="<?=$member_info['m_no']?>">
                            <input type="hidden" name="member_point" value="<?=$member_point?>">
                            <div class="card">
                                <div class="card-body py-2">
                                    <div class="row mb-2">
                                        <div class="col-lg-6">
                                            <div class="input-group row">
                                                <label for="" class="col-sm-2 col-form-label bg-light border">대상회원</label>
                                                <div class="col-sm-5">
                                                    <input class="form-control" type="text" readonly value="<?=$member_info['m_id']?>">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row mb-2">
                                        <div class="col-lg-6">
                                            <div class="input-group row">
                                                <label for="" class="col-sm-2 col-form-label bg-light border">지급/차감 여부</label>
                                                <div class="col-sm-6 mt-1">
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input" id="point_type1" type="radio" name="point_type" value="add">
                                                        <label class="form-check-label" for="point_type1">지급</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input" id="point_type2" type="radio" name="point_type" value="sub">
                                                        <label class="form-check-label" for="point_type2">차감</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row mb-2">
                                        <div class="col-lg-6">
                                            <div class="input-group row">
                                                <label for="" class="col-sm-2 col-form-label bg-light border">금액</label>
                                                <div class="col-sm-3">
                                                    <input class="form-control" type="number" name="point" value="" min="1" style="width: 80%;display: inline-block;">
                                                    <span> 원</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row mb-2">
                                        <div class="col-lg-6">
                                            <div class="input-group row">
                                                <label for="" class="col-sm-2 col-form-label bg-light border">지급/차감사유</label>
                                                <div class="col-sm-5">
                                                    <select class="form-control " id="memo_type" name="memo_type" onchange="if(this.value == 'etc'){$('#etc_text').show()}else{$('#etc_text').hide()}">
                                                        <option value="">=지급/차감사유 선택=</option>
                                                        <option value="discount">상품구매 시 포인트 사용</option>
                                                        <option value="repay">상품구매 시 포인트 지급</option>
                                                        <option value="refound">상품주문 취소시 사용포인트 환불</option>
                                                        <option value="add_member_level">회원등급에 따른 추가포인트 지급</option>
                                                        <option value="renewal">리뉴얼 기념 포인트 지급</option>
                                                        <option value="change">차액보정</option>
                                                        <option value="reward">스펠포스 3 소울 하베스트 출시 기념</option>
                                                        <option value="reward2">시스템 장애로 인한 주문 오류 보상 지급</option>
                                                        <option value="reward3">이스 9: 몬스트룸 녹스 차액 보정</option>
                                                        <option value="mobile_refund1">휴대폰결제 부분취소</option>
                                                        <option value="mobile_refund2">휴대폰결제 익월취소</option>
                                                        <option value="etc">기타</option>
                                                    </select>
                                                </div>
                                                <div class="col-sm-3">
                                                    <input id="etc_text" class="form-control" name="memo" value="기타" style="display:none;">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <button type="button" class="btn btn-primary shadow-none" onclick="member_point_proc()">포인트 지급/차감</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                        <?php
                        }
                        ?>
                    </div>
                </div>
            </div>
        </div>
    </div>

<!-- bundle -->
<script src="<?=$document_root?>/assets/js/vendor.min.js"></script>
<script src="<?=$document_root?>/assets/js/app.min.js"></script>
<script>
    function member_point_proc() {
        if (!$('input[name="point_type"]').is(':checked')) {
            alert('지급/차감 여부를 체크해주세요.');

            return false;
        }

        if (!$('input[name="point"]').val()) {
            alert('금액을 입력해주세요.');
            $('input[name="point"]').focus();

            return false;
        }

        if ($('input[name="point_type"]:checked').val() == "sub" && (parseInt($('input[name="member_point"]').val()) < parseInt($('input[name="point"]').val()))) {
            alert('대상회원의 포인트보다 차감할 금액이 큽니다.');

            return false;
        }

        if (!$('select[name="memo_type"]').val()) {
            alert('지급/차감사유를 선택해주세요.');

            return false;
        } else {
            if ($('select[name="memo_type"]').val() == "etc" && !$('input[name="memo"]').val()) {
                alert('기타 사유를 작성해주세요.');
                $('input[name="memo"]').focus();

                return false;
            }
        }

        const formData = $('#point_form').serialize();
        
        $.ajax({
            type: "POST",
            url: "./member_point_proc.php",
            data: formData,
            dataType: 'json',
            success: function (data) {
                if (data.success) {
                    alert(data.message);
                    location.reload();
                }
            },
            error: function (data) {
                alert(data);
            }
        })
    }
</script>
</body>
</html>

