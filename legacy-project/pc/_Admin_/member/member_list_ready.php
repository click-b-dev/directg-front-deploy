<?php
$sidebar_file = "sidebar_member.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['member'] = "active";
$page_title = "승인대기 리스트";

$page           = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_type    = filter_input(INPUT_GET, 'search_type', FILTER_SANITIZE_STRING);
$search_value   = trim(filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING));

if (!$page) {
    $page=1;
}

// 필터 selected
$selected['search_type'][$search_type] = "selected";

// filter
$where = [];

switch ($search_type) {
    default :
        if ($search_value) {
            $where[] = " {$search_type} = '{$search_value}'";
        }
        break;
    case "m_id":
        if ($search_value) {
            $where[] = " {$search_type} LIKE '{$search_value}%'";
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

foreach ($where as $value) {
    $add_where .= " and {$value}";
}

$orderby = "tm.reg_date DESC";

try {
    $conn_dgkr = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $adminV1= new AdminV1($conn_dgkr);
    $member_list = $adminV1->getMemberReadyList($page, $add_where, $orderby, $param);

    $query = "SELECT COUNT(1) AS cnt FROM tbl_member WHERE status = 5";
    $stmt = $conn_dgkr->prepare($query);
    $stmt->execute();
    $cnt = $stmt->fetchAll();
    $all_cnt = $cnt[0]['cnt'];
} catch (PDOException $e) {
    echo 'Error!: '.$e->getMessage();
    die();
}
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
                                                    </select>
                                                </div>
                                                <div class="col-sm-6">
                                                    <input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
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

                    <div style="border-bottom: 1px solid #dee2e6;margin-bottom: 10px;">
                        <p>
                            <strong class="text-danger">* 다이렉트게임즈 로그인 불가능 국가 : <br/>
                                RU(러시아),RO(루마니아),BR(브라질),FR(프랑스),VN(베트남),DE(덴마크),PH(필리핀),AT(오스트리아),NZ(뉴질랜드),MY(말레이시아),NL(네덜란드),PL(폴란드),GB(영국),AE(아랍에미리트),IT(이탈리아),SG(싱가포르)</strong></br>
                            - 금지된 사유는 지난 2016년 12월 15일 ~ 23일까지 발생된 계정도용사건으로 인해서 그기간내 사용된 ip 국가들은 더이상 로그인 할 수 없도록 조치함.
                        </p>
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
                                    <th class="text-center">아이디</th>
                                    <th class="text-center">이름<br/>(닉네임)</th>
                                    <th class="text-center">IP</th>
                                    <th class="text-center">country</th>
                                    <th class="text-center">회원가입일</th>
                                    <th class="text-center">가입채널</th>
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
                                            <td class="text-center"><a href="./member_view.php?m_no=<?=$value['m_no']?>"><?=$value['m_id']?></a></td>
                                            <td class="text-center"><?=$value['name']?><br/>(<?=$value['nickname']?>)</td>
                                            <td class="text-center"><?=$value['ip']?></td>
                                            <td class="text-center"><?=$value['country']?></td>
                                            <td class="text-center"><?=$value['reg_date']?></td>
                                            <td class="text-center"><?=$value['channel']?></td>
                                            <td class="text-center">
                                                <button class="btn btn-primary shadow-none" type="button" style="font-size:12px;" onclick="member_proc('<?=$value['m_id']?>', <?=$value['m_no']?>, 'apply')">가입승인</button>
                                                <button class="btn btn-danger shadow-none" type="button" style="font-size:12px;" onclick="member_proc('<?=$value['m_id']?>', <?=$value['m_no']?>, 'delete')">삭제</button>
                                            </td>
                                        </tr>
                                        <?php
                                        $num++;
                                    }
                                }
                                ?>
                                </tbody>
                            </table>
                            <div class="text-center mt-3"><?=$member_list->links_html?></div>
						</div>
						<!-- end col -->
					</div>
				</div> <!-- container -->
	</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
    function member_proc(m_id, m_no, mode) {
        let msg = "";

        if (mode == "delete") {
            msg = "삭제";
        } else if (mode == "apply") {
            msg = "가입승인";
        }

        if (confirm(`${m_id} 회원을 ${msg}처리 하시겠습니까?`)) {
            $.ajax({
                type: "POST",
                url: "./member_proc.php",
                data: {
                    mode: mode,
                    m_no: m_no
                },
                dataType: 'json',
                success: function (data) {
                    if (data.success) {
                        alert(`회원${msg}완료`);
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
