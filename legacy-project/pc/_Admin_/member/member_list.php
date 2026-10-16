<?php
$sidebar_file = "sidebar_member.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['member'] = "active";
$page_title = "회원 리스트";

$page           = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_type    = filter_input(INPUT_GET, 'search_type', FILTER_SANITIZE_STRING);
$member_level   = filter_input(INPUT_GET, 'member_level', FILTER_SANITIZE_NUMBER_INT);
$old_login      = filter_input(INPUT_GET, 'old_login', FILTER_SANITIZE_NUMBER_INT);
$mailling       = filter_input(INPUT_GET, 'mailling', FILTER_SANITIZE_STRING);
$is_auth        = filter_input(INPUT_GET, 'is_auth', FILTER_SANITIZE_STRING);
$mem_type       = filter_input(INPUT_GET, 'mem_type', FILTER_SANITIZE_STRING);
$start_reg_date = filter_input(INPUT_GET, 'start_reg_date', FILTER_SANITIZE_STRING);
$end_reg_date   = filter_input(INPUT_GET, 'end_reg_date', FILTER_SANITIZE_STRING);
$start_log_date = filter_input(INPUT_GET, 'start_log_date', FILTER_SANITIZE_STRING);
$end_log_date   = filter_input(INPUT_GET, 'end_log_date', FILTER_SANITIZE_STRING);

if (!$page) {
    $page=1;
}

if ($mailling == "") {
    $mailling = "all";
}

if ($is_auth == "") {
    $is_auth = "all";
}

if ($mem_type == "") {
    $mem_type = "all";
}

$where = [];

// 필터 selected
$selected['member_level'][$member_level] = "selected";
$selected['mailling'][$mailling] = "checked";
$selected['is_auth'][$is_auth] = "checked";
$selected['mem_type'][$mem_type] = "checked";
$selected['search_type'][$search_type] = "selected";

// filter
if ($member_level) {
    $where[] = " tm.mem_level = {$member_level}";
}

if ($old_login) {
    $where[] = " DATEDIFF(NOW(), tm.log_date) >= '{$old_login}'";
}

if ($mailling != "all") {
    $where[] = " tm.mailling = '{$mailling}'";
}

if ($is_auth != "all") {
    $where[] = " tm.is_auth = '{$is_auth}'";
}

if ($mem_type != "all") {
    $where[] = " tm.mem_type = '{$mem_type}'";
}

if (!$start_reg_date || !$end_reg_date) {
    $start_reg_date = "";
    $end_reg_date = "";
} else {
    $where[] = " tm.reg_date BETWEEN '{$start_reg_date} 00:00:00' AND '{$end_reg_date} 23:59:59'";
}

if (!$start_log_date || !$end_log_date) {
    if ($start_log_date) {
        $where[] = " tm.log_date >= '{$start_log_date} 00:00:00'";
    } else if($end_log_date) {
        $where[] = " tm.log_date <= '{$end_log_date} 23:59:59'";
    }
} else {
    $where[] = " tm.log_date BETWEEN '{$start_log_date} 00:00:00' AND '{$end_log_date} 23:59:59'";
}

$search_value = "";

//정렬 — 헤더 클릭(sort/dir). 화이트리스트로 컬럼 제한(SQL injection 방지)
$sort = filter_input(INPUT_GET, 'sort', FILTER_SANITIZE_STRING);
$dir  = filter_input(INPUT_GET, 'dir', FILTER_SANITIZE_STRING);
$sort_map = array('reg_date' => 'tm.reg_date', 'log_date' => 'tm.log_date');
$dir = (strtolower($dir) === 'asc') ? 'ASC' : 'DESC';

if (isset($sort_map[$sort])) {
    //명시적 헤더 정렬
    $orderby = $sort_map[$sort]." ".$dir;
} else {
    //기본 정렬 — 가입일 최신순 (리셀러 탭은 최종로그인 최신순)
    $orderby = "tm.reg_date DESC";
    if ($mem_type == "R") {
        $orderby = "tm.log_date DESC";
    }
}

//헤더 정렬 화살표/토글 계산용 — 현재 적용중인 정렬 컬럼/방향(기본값 포함)
$eff_sort = isset($sort_map[$sort]) ? $sort : (($mem_type == "R") ? 'log_date' : 'reg_date');
$eff_dir  = isset($sort_map[$sort]) ? $dir : 'DESC';

//정렬 링크용 베이스 쿼리스트링 (page/sort/dir 제외한 현재 필터 유지)
$sort_param = "";
foreach ($_GET as $sk => $sv) {
    if ($sk == "page" || $sk == "sort" || $sk == "dir") continue;
    if ($sv === "" || $sv === null) continue;
    $sort_param .= "&".$sk."=".$sv;
}

switch ($search_type) {
    default :
        $search_value = trim(filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING));

        if ($search_value) {
            $where[] = " {$search_type} = '{$search_value}'";
        }
    break;
    case "m_id":
        $search_value = trim(filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING));

        if ($search_value) {
            $where[] = " {$search_type} LIKE '{$search_value}%'";
        }

    break;
    case "m_no":
        $search_value = trim(filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_NUMBER_INT));

        if ($search_value) {
            $where[] = " {$search_type} = {$search_value}";
        }

    break;
}

// 검색필터 페이지네이션 적용
foreach ($_GET as $key => $value) {
    if ($key <> "page") {
        if ($value <> "") {
            $param .= "&".$key."=".$value;
        }
    }
}

$add_where = "";

foreach($where as $value){
    $add_where.= " and ".$value;
}

try{
    $conn_dgkr = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $adminV1= new AdminV1($conn_dgkr);
    $member_list = $adminV1->getMemberList($page, $add_where, $orderby, $param);

    $query = "SELECT COUNT(1) AS cnt FROM tbl_member WHERE status = 0";
    $stmt = $conn_dgkr->prepare($query);
    $stmt->execute();
    $cnt = $stmt->fetchAll();
    $all_cnt = $cnt[0]['cnt'];
}catch (PDOException $e){
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
                                                    <option value="hp" <?=$selected['search_type']['hp']?>>휴대폰</option>
                                                    <option value="ip" <?=$selected['search_type']['ip']?>>접속IP</option>
                                                    <option value="m_no" <?=$selected['search_type']['m_no']?>>고유번호</option>
                                                </select>
                                            </div>
                                            <div class="col-sm-6">
                                                <input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-lg-6">
                                        <div class="input-group row">
                                            <label for="" class="col-sm-3 col-form-label bg-light border">회원등급</label>
                                            <div class="col-sm-3">
                                                <select class="form-control" name="member_level" id="member_level">
                                                    <option value="0" <?=$selected['member_level'][0]?>>전체</option>
                                                    <option value="1" <?=$selected['member_level'][1]?>>일반</option>
                                                    <option value="2" <?=$selected['member_level'][2]?>>정회원</option>
                                                    <option value="3" <?=$selected['member_level'][3]?>>VIP</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-lg-6">
                                        <div class="input-group row">
                                            <label for="" class="col-sm-3 col-form-label bg-light border">회원가입일</label>
                                            <div class="col-sm-6">
                                                <div class="input-group">
                                                    <input type="date" class="form-control" id="start_reg_date" name="start_reg_date" placeholder="시작일자" value="<?=$start_reg_date?>">
                                                    <span class="input-group-text">~</span>
                                                    <input type="date" class="form-control" id="end_reg_date" name="end_reg_date" placeholder="종료일자" value="<?=$end_reg_date?>">
                                                    <button type="button" style="border: 0;background-color: white;" onclick="$('#start_reg_date').val('');$('#end_reg_date').val('')">
                                                        <i class="mdi mdi-delete-outline" style="font-size: 20px;"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-lg-6">
                                        <div class="input-group row">
                                            <label for="" class="col-sm-3 col-form-label bg-light border">최종로그인일</label>
                                            <div class="col-sm-6">
                                                <div class="input-group">
                                                    <input type="date" class="form-control" id="start_log_date" name="start_log_date" placeholder="시작일자" value="<?=$start_log_date?>">
                                                    <span class="input-group-text">~</span>
                                                    <input type="date" class="form-control" id="end_log_date" name="end_log_date" placeholder="종료일자" value="<?=$end_log_date?>">
                                                    <button type="button" style="border: 0;background-color: white;" onclick="$('#start_log_date').val('');$('#end_log_date').val('')">
                                                        <i class="mdi mdi-delete-outline" style="font-size: 20px;"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-lg-6">
                                        <div class="input-group row">
                                            <label for="" class="col-sm-3 col-form-label bg-light border">장기 미로그인</label>
                                            <div class="col-sm-3">
                                                <input class="form-control" type="text" name="old_login" value="<?=$old_login?>">
                                            </div>
                                            <div class="col-sm-4 mt-1">
                                                일 이상 로그인하지 않은 회원
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-lg-6">
                                        <div class="input-group row">
                                            <label for="" class="col-sm-3 col-form-label bg-light border">메일수신동의</label>
                                            <div class="col-sm-6 mt-1">
                                                <div class="form-check form-check-inline">
                                                    <input type="radio" id="mailling1" name="mailling" class="form-check-input" value="all" <?=$selected['mailling']['all']?>>
                                                    <label class="form-check-label" for="mailling1">전체</label>
                                                </div>
                                                <div class="form-check form-check-inline">
                                                    <input type="radio" id="mailling2" name="mailling" class="form-check-input" value="Y" <?=$selected['mailling']['Y']?>>
                                                    <label class="form-check-label" for="mailling2">수신</label>
                                                </div>
                                                <div class="form-check form-check-inline">
                                                    <input type="radio" id="mailling3" name="mailling" class="form-check-input" value="N" <?=$selected['mailling']['N']?>>
                                                    <label class="form-check-label" for="mailling3">수신거부</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-lg-6">
                                        <div class="input-group row">
                                            <label for="" class="col-sm-3 col-form-label bg-light border">본인인증여부</label>
                                            <div class="col-sm-6 mt-1">
                                                <div class="form-check form-check-inline">
                                                    <input type="radio" id="is_auth1" name="is_auth" class="form-check-input" value="all" <?=$selected['is_auth']['all']?>>
                                                    <label class="form-check-label" for="is_auth1">전체</label>
                                                </div>
                                                <div class="form-check form-check-inline">
                                                    <input type="radio" id="is_auth2" name="is_auth" class="form-check-input" value="Y" <?=$selected['is_auth']['Y']?>>
                                                    <label class="form-check-label" for="is_auth2">인증</label>
                                                </div>
                                                <div class="form-check form-check-inline">
                                                    <input type="radio" id="is_auth3" name="is_auth" class="form-check-input" value="N" <?=$selected['is_auth']['N']?>>
                                                    <label class="form-check-label" for="is_auth3">미인증</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-lg-6">
                                        <div class="input-group row">
                                            <label for="" class="col-sm-3 col-form-label bg-light border">회원분류</label>
                                            <div class="col-sm-8 mt-1">
                                                <div class="form-check form-check-inline">
                                                    <input type="radio" id="mem_type1" name="mem_type" class="form-check-input" value="all" <?=$selected['mem_type']['all']?>>
                                                    <label class="form-check-label" for="mem_type1">전체</label>
                                                </div>
                                                <div class="form-check form-check-inline">
                                                    <input type="radio" id="mem_type2" name="mem_type" class="form-check-input" value="P" <?=$selected['mem_type']['P']?>>
                                                    <label class="form-check-label" for="mem_type2">일반</label>
                                                </div>
                                                <div class="form-check form-check-inline">
                                                    <input type="radio" id="mem_type3" name="mem_type" class="form-check-input" value="R" <?=$selected['mem_type']['R']?>>
                                                    <label class="form-check-label" for="mem_type3">리셀러</label>
                                                </div>
                                                <div class="form-check form-check-inline">
                                                    <input type="radio" id="mem_type4" name="mem_type" class="form-check-input" value="S" <?=$selected['mem_type']['S']?>>
                                                    <label class="form-check-label" for="mem_type4">휴면</label>
                                                </div>
                                                <div class="form-check form-check-inline">
                                                    <input type="radio" id="mem_type5" name="mem_type" class="form-check-input" value="E" <?=$selected['mem_type']['E']?>>
                                                    <label class="form-check-label" for="mem_type5">이벤트</label>
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
                                <th class="text-center">회원고유번호</th>
                                <th class="text-center">아이디<br/>(이메일)</th>
                                <th class="text-center">이름<br/>(닉네임)</th>
                                <th class="text-center">생년월일<br/>(나이)</th>
                                <th class="text-center">휴대폰</th>
                                <th class="text-center">회원등급</th>
                                <!--                                <th class="text-center">보유포인트</th>-->
                                <th class="text-center" style="cursor:pointer;">
                                    <a href="?sort=reg_date&dir=<?=($eff_sort=='reg_date'&&$eff_dir=='DESC')?'asc':'desc'?><?=$sort_param?>" class="text-reset text-decoration-none">회원가입일<?=($eff_sort=='reg_date')?($eff_dir=='DESC'?' ▼':' ▲'):''?></a>
                                </th>
                                <th class="text-center" style="cursor:pointer;">
                                    <a href="?sort=log_date&dir=<?=($eff_sort=='log_date'&&$eff_dir=='DESC')?'asc':'desc'?><?=$sort_param?>" class="text-reset text-decoration-none">최종로그인<?=($eff_sort=='log_date')?($eff_dir=='DESC'?' ▼':' ▲'):''?></br>(접속IP)</a>
                                </th>
                                <th class="text-center">방문횟수</th>
                                <th class="text-center">가입방법</th>
                                <th class="text-center">회원분류</th>
                                <th class="text-center"></th>
                            </tr>
                            </thead>
                            <tbody class="font-12 bg-white">
                            <?php
                            if ($member_list->success == true) {
                                $result = $member_list->resultset->fetchAll();
                                $num = 0;
                                foreach ($result as $value) {
                                    ?>
                                    <tr>
                                        <td class="text-center"><?=$member_list->total_results-($num+($page-1)*30)?></td>
                                        <td class="text-center"><?=$value['m_no']?></td>
                                        <td class="text-center"><a href="./member_view.php?m_no=<?=$value['m_no']?>"><?=$value['m_id']?></a><?if($value['email']){?><br/>(<?=$value['email']?>)<?}?></td>
                                        <td class="text-center"><?=$value['name']?><br/>(<?=$value['nickname']?>)</td>
                                        <td class="text-center"><?=$value['birth_day']?><?if($value['birth_day']){?><br/>(<?=$adminV1->getMemberAge($value['birth_day'])?>)<?}?></td>
                                        <td class="text-center"><?=$value['hp']?></td>
                                        <td class="text-center"><?=$member_level_arr[$value['mem_level']]?></td>
                                        <td class="text-center"><?=$value['reg_date']?></td>
                                        <td class="text-center"><?=$value['log_date']?><br/><?=$value['ip']?></td>
                                        <td class="text-center"><?=$value['visited']?></td>
                                        <td class="text-center"><?=strtoupper($value['sns_type'])?></td>
                                        <td class="text-center"><?=$member_type_arr[$value['mem_type']]?></td>
                                        <td class="text-center">
<!--                                            <button class="btn btn-warning shadow-none" type="button" style="font-size:10px;">휴면안내발송</button><br/>-->
                                            <button class="btn btn-danger shadow-none" type="button" style="font-size:12px;" onclick="member_proc('<?=$value['m_id']?>', <?=$value['m_no']?>)">탈퇴</button>
                                        </td>
                                    </tr>
                                    <?php
                                    $num++;
                                }
                            }
                            ?>
                            </tbody>
                        </table>
                        <div class="text-center mt-3"><?echo $member_list->links_html;?></div>
                    </div> <!-- end col -->
                </div>
            </div> <!-- container -->
	</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
    function member_proc(m_id, m_no) {
        if (confirm(`${m_id} 회원을 탈퇴처리 하시겠습니까?`)) {
            $.ajax({
                type: "POST",
                url: "./member_proc.php",
                data: {
                    mode: "leave",
                    m_no: m_no
                },
                dataType: 'json',
                success: function (data) {
                    if (data.success) {
                        alert("회원탈퇴완료");
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
