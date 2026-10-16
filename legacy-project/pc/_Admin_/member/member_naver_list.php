<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['member'] = "active";
$page_title = "간편로그인 연동현황(NAVER)";

$page           = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_type    = filter_input(INPUT_GET, 'search_type', FILTER_SANITIZE_STRING);
$search_value   = trim(filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING));
$sns_flag       = filter_input(INPUT_GET, 'sns_flag', FILTER_SANITIZE_STRING);

if (!$page) {
    $page = 1;
}

if ($sns_flag == "") {
    $sns_flag = "all";
}

$where = [];

// 페이지네이션 link
foreach ($_GET as $key => $value) {
    if ($key <> "page") {
        if ($value <> "") {
            $param .= "&".$key."=".$value;
        }
    }
}

// filter
if ($search_value) {
    switch ($search_type) {
        default :
            $where[] = " {$search_type} = '{$search_value}'";
            break;
        case "m_id":
            $where[] = " {$search_type} LIKE '{$search_value}%'";
        break;
    }
}

if ($sns_flag != "all") {
    $where[] = " si.flag = '{$sns_flag}'";
}

$orderby = "si.idx DESC";

$add_where = " AND si.sns_type = 'NAVER'";

foreach($where as $value){
    $add_where.= " AND ".$value;
}

// 필터 selected
$selected['sns_flag'][$sns_flag] = "checked";
$selected['search_type'][$search_type] = "selected";

// list 쿼리
try {
    $conn_dgkr = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $adminV1 = new AdminV1($conn_dgkr);
    $member_list = $adminV1->getMemberSnsList($page, $add_where, $orderby, $param);

    $query = "SELECT COUNT(1) AS cnt FROM tbl_member tm 
            INNER JOIN sns_info si ON tm.m_no = si.m_no 
            WHERE tm.status = 0
                AND si.sns_type = 'NAVER'";
    $stmt = $conn_dgkr->prepare($query);
    $stmt->execute();
    $cnt = $stmt->fetchAll();
    $all_cnt = $cnt[0]['cnt'];
} catch (PDOException $e) {
    echo 'Error!: '.$e->getMessage();
    die();
}

$search_flag_arr = array(
    "N" => "신규 가입",
    "C" => "계정 연결"
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
    <div class="wrapper">
        <!-- ========== Left Sidebar Start ========== -->
        <?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/sidebar_member.php'); ?>
        <!-- Left Sidebar End -->

        <div class="content-page">
            <div class="content">
                <!-- Topbar Start -->
                <? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/topbar.php');?>
                <!-- end Topbar -->
                <div class="container-fluid">
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
                            <h5 class="card-header bg-secondary text-white">검색필터</h5>
                            <div class="card-body py-2">
                                <form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
                                    <div class="row mb-2">
                                        <div class="col-lg-6">
                                            <div class="input-group row">
                                                <label for="" class="col-sm-3 col-form-label bg-light border">검색어</label>
                                                <div class="col-sm-3">
                                                    <select class="form-control" name="search_type" id="search_type">
                                                        <option value="m_id" <?=$selected['search_type']['m_id']?>>아이디</option>
                                                        <option value="name" <?=$selected['search_type']['name']?>>이름</option>
                                                        <option value="nickname" <?=$selected['search_type']['nickname']?>>닉네임</option>
                                                        <option value="ip" <?=$selected['search_type']['ip']?>>접속IP</option>
                                                    </select>
                                                </div>
                                                <div class="col-sm-6">
                                                    <input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-lg-6">
                                            <div class="input-group row">
                                                <label for="" class="col-sm-3 col-form-label bg-light border">연결구분</label>
                                                <div class="col-sm-6 mt-1">
                                                    <div class="form-check form-check-inline">
                                                        <input type="radio" id="sns_flag1" name="sns_flag" class="form-check-input" value="all" <?=$selected['sns_flag']['all']?>>
                                                        <label class="form-check-label" for="sns_flag1">전체</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input type="radio" id="sns_flag2" name="sns_flag" class="form-check-input" value="N" <?=$selected['sns_flag']['N']?>>
                                                        <label class="form-check-label" for="sns_flag2">신규가입</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input type="radio" id="sns_flag3" name="sns_flag" class="form-check-input" value="C" <?=$selected['sns_flag']['C']?>>
                                                        <label class="form-check-label" for="sns_flag3">계정연결</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <div class="float-end">
                                                <button type="submit" class="btn btn-primary shadow-none">회원 검색</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex flex-row justify-content-between mb-2">
                        <div class="float-start">검색 : <?=number_format($member_list->total_results)?> 명 / 전체 : <?=number_format($all_cnt)?> 명</div>
                    </div>

                    <div class="row">
                        <div class="col-12 table-responsive">
                            <table class="table table-centered w-100  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
                                <thead class="table-light font-13">
                                <tr>
                                    <th class="text-center">번호</th>
                                    <th class="text-center">아이디<br/>(이메일)</th>
                                    <th class="text-center">이름<br/>(닉네임)</th>
                                    <th class="text-center">생년월일<br/>(나이)</th>
                                    <th class="text-center">IP<br/>(country)</th>
                                    <th class="text-center">방문횟수</th>
                                    <th class="text-center">연결구분</th>
                                    <th class="text-center">가입일</th>
                                    <th class="text-center">간편로그인 연결일자</th>
                                </tr>
                                </thead>
                                <tbody class="font-12 bg-white">
                                <?php
                                if ($member_list->success == true) {
                                    $result = $member_list->resultset->fetchAll();
                                    $num = 0;

                                    foreach ($result as $item) {
                                ?>
                                    <tr>
                                        <td class="text-center"><?=$member_list->total_results-($num+($page-1)*20)?></td>
                                        <td class="text-center"><a href="./member_view.php?m_no=<?=$item['m_no']?>"><?=$item['m_id']?></a><?if($item['email']){?><br/>(<?=$item['email']?>)<?}?></td>
                                        <td class="text-center"><?=$item['name']?><br/>(<?=$item['nickname']?>)</td>
                                        <td class="text-center"><?=$item['birth_day']?><?if($item['birth_day']){?><br/>(<?=$adminV1->getMemberAge($item['birth_day'])?>)<?}?></td>
                                        <td class="text-center"><?=$item['ip']?><br/>(<?=$item['country']?>)</td>
                                        <td class="text-center"><?=$item['visited']?></td>
                                        <td class="text-center"><?=$search_flag_arr[$item['flag']]?></td>
                                        <td class="text-center"><?=$item['reg_date']?></td>
                                        <td class="text-center"><?=$item['sns_connect_date']?></td>
                                    </tr>
                                <?php
                                    }

                                    $num++;
                                }
                                ?>
                                </tbody>
                            </table>
                            <div class="text-center mt-3"><?=$member_list->links_html?></div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</body>
</html>

<!-- bundle -->
<script src="<?=$document_root?>/assets/js/vendor.min.js"></script>
<script src="<?=$document_root?>/assets/js/app.min.js"></script>
