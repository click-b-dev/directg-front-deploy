<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['board'] = "active";
$page_title = "문의하기 목록";
$sidebar_file = "sidebar_board.php";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$searchGubun = filter_input(INPUT_GET, 'searchGubun', FILTER_SANITIZE_NUMBER_INT);
$is_answer = filter_input(INPUT_GET, 'is_answer', FILTER_SANITIZE_STRING);
$email_flag = filter_input(INPUT_GET, 'email_flag', FILTER_SANITIZE_STRING);
$replyStatus = filter_input(INPUT_GET, 'replyStatus', FILTER_SANITIZE_NUMBER_INT);
$searchType = filter_input(INPUT_GET,'searchType',FILTER_SANITIZE_STRING);
$searchTitle = trim(filter_input(INPUT_GET, 'searchTitle', FILTER_SANITIZE_STRING));


if (!$page) {
    $page = 1;
}

$where = [];

if ($searchGubun) {
    $where[] = " `gubun` like {$searchGubun}";
}

if ($is_answer != '') {
    $where[] = " `is_answer` = '{$is_answer}'";
} else {
    $is_answer = "all";
}

if ($replyStatus != '') {
    $where[] = " `replyStatus` = '{$replyStatus}'";
} else {
    $replyStatus = "all";
}

if ($email_flag != '') {
    if ($email_flag == 'Y') {
        $where[] = " `email_flag` = '{$email_flag}'";
    } else {
        $where[] = " (`email_flag` = '' OR `email_flag` IS NULL)";
    }
    
} else {
    $email_flag = "all";
}

if ($searchTitle) {
    if ($searchType) {
        $where[] = " `{$searchType}` like '%{$searchTitle}%'";
    }
}

$selected['searchGubun'][$searchGubun] = "selected";
$selected['is_answer'][$is_answer] = "checked";
$selected['replyStatus'][$replyStatus] = "checked";
$selected['email_flag'][$email_flag] = "checked";
$selected['searchType'][$searchType] = "selected";

try {
    $conn_dgkr = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);

    $conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $adminBoard= new AdminBoard($conn_dgkr);

    $add_where = "";

    foreach ($where as $value) {
        $add_where .= " and ".$value;
    }

    $orderby = "idx DESC";
    $param = "";

    $qna_list = $adminBoard->getQnaList($page, $add_where, $orderby, $param);

    $q_string = [];

    foreach ($_GET as $key => $value) {
        if ($key == "page") {
            continue;
        } else {
            $q_string[] = "{$key}={$value}";
        }
    }

    $q_string = implode("&", $q_string);

    if ($q_string) {
        $qna_list->links_html = str_replace("?page=", "?{$q_string}&page=", $qna_list->links_html);
        $q_string .= "&page={$page}";
    } else {
        $q_string = "page={$page}";
    }
} catch (PDOException $e) {
    echo 'Error!: '.$e->getMessage();
    die();
}

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
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
    tr.qna-read td { color: #888; }
    tr.qna-read a { color: #888; }
</style>
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">게시판</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">문의하기 관리</a></li>
									<li class="breadcrumb-item active">문의하기 목록</li>
								</ol>
							</div>
							<h4 class="page-title">문의하기 목록</h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">검색필터</h5>
							<div class="card-body">
								<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
                                    <div class="row mb-2">
                                        <div class="col-lg-6">
											<div class="input-group row">
												<label for="searchTitle" class="col-sm-3 col-form-label bg-light border">검색어</label>
												<div class="col-sm-3">
													<select class="form-control" name="searchType">
														<option value="subject" <?=$selected['searchType']['subject']?>> 제목</option>
														<option value="user_id" <?=$selected['searchType']['user_id']?>>작성자</option>
														<option value="contents" <?=$selected['searchType']['contents']?>>내용</option>
														<option value="subject_contents" <?=$selected['searchType']['subject_contents']?>>제목+내용</option>
													</select>
												</div>
												<div class="col-sm-6">
													<input type="text" class="form-control" id="searchTitle" name="searchTitle" placeholder="제목검색" value="<?=$searchTitle?>">
												</div>
											</div>
										</div>
                                        <div class="col-lg-6">
											<div class="input-group row">
                                                <label for="" class="col-sm-3 col-form-label bg-light border">구분</label>
												<div class="col-sm-3">
													<select name="searchGubun" class="form-control">
														<option value="" >전체</option>
													<?php
														foreach ($gubun_array as $key => $value) {
															echo "<option value=\"{$key}\" {$selected['searchGubun'][$key]}>{$value}</option>";
														}
													?>
													</select>
												</div>
											</div>
										</div>
									</div>

									<div class="row mb-2">
                                        <div class="col-lg-6">
                                            <div class="input-group row">
                                                <label for="" class="col-sm-3 col-form-label bg-light border">답변상태</label>
                                                <div class="col-sm-6 mt-1">
                                                    <div class="form-check form-check-inline">
                                                        <input type="radio" id="is_answer1" name="is_answer" class="form-check-input" value="" <?=$selected['is_answer']['all']?>>
                                                        <label class="form-check-label" for="is_answer1">전체</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input type="radio" id="is_answer2" name="is_answer" class="form-check-input" value="N" <?=$selected['is_answer']['N']?>>
                                                        <label class="form-check-label" for="is_answer2">답변대기</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input type="radio" id="is_answer3" name="is_answer" class="form-check-input" value="Y" <?=$selected['is_answer']['Y']?>>
                                                        <label class="form-check-label" for="is_answer3">답변완료</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="col-lg-6">
                                            <div class="input-group row">
                                                <label for="" class="col-sm-3 col-form-label bg-light border">고객 답변 확인 여부</label>
                                                <div class="col-sm-6 mt-1">
                                                    <div class="form-check form-check-inline">
                                                        <input type="radio" id="replyStatus1" name="replyStatus" class="form-check-input" value="" <?=$selected['replyStatus']['all']?>>
                                                        <label class="form-check-label" for="replyStatus1">전체</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input type="radio" id="replyStatus2" name="replyStatus" class="form-check-input" value="1" <?=$selected['replyStatus']['1']?>>
                                                        <label class="form-check-label" for="replyStatus2">확인</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input type="radio" id="replyStatus3" name="replyStatus" class="form-check-input" value="0" <?=$selected['replyStatus']['0']?>>
                                                        <label class="form-check-label" for="replyStatus3">미확인</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
									</div>

                                    <div class="row mb-2">
                                        <div class="col-lg-6">
                                            <div class="input-group row">
                                                <label for="" class="col-sm-3 col-form-label bg-light border">메일발송</label>
                                                <div class="col-sm-6 mt-1">
                                                    <div class="form-check form-check-inline">
                                                        <input type="radio" id="email_flag1" name="email_flag" class="form-check-input" value="" <?=$selected['email_flag']['all']?>>
                                                        <label class="form-check-label" for="email_flag1">전체</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input type="radio" id="email_flag2" name="email_flag" class="form-check-input" value="Y" <?=$selected['email_flag']['Y']?>>
                                                        <label class="form-check-label" for="email_flag2">발송</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input type="radio" id="email_flag3" name="email_flag" class="form-check-input" value="N" <?=$selected['email_flag']['N']?>>
                                                        <label class="form-check-label" for="email_flag3">미발송</label>
                                                    </div>
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

				<div class="row">
					<div class="col-12">
						<div class="d-flex flex-row justify-content-between mb-2">
							<div class="float-start"><?=number_format($qna_list->total_results)?> 개</div>
						</div>

						<div class="table-responsive">
							<form id="list-form" method="post" action="./qna_ps.php">
								<input type="hidden" name="mode" value="delete">
							<table class="table table-hover table-centered w-100 dt-responsive nowrap table-sm table-bordered" id="">
								<thead class="table-light font-13">
									<tr>
										<th class="text-center all" style="width:20px">
											<div class="form-check text-center">
												<input type="checkbox" class="form-check-input" id="customCheck1">
												<label class="form-check-label" for="customCheck1">&nbsp;</label>
											</div>
										</th>
										<th class="text-center" style="width:70px">번호</th>
										<th class="text-center" style="width:130px">구분</th>
										<th class="text-center">제목</th>
										<th class="text-center" style="width:150px">작성자</th>
										<th class="text-center" style="width:150px">작성일</th>
										<th class="text-center" style="width:90px">답변상태</th>
                                        <th class="text-center" style="width:150px">고객 답변 확인 여부</th>
                                        <th class="text-center" style="width:90px">메일발송</th>
										<th class="text-center" style="width:90px">답변</th>
									</tr>
								</thead>

								<tbody class="font-12 bg-white">
									<?php
									if ($qna_list->success === true) {
										$result = $qna_list->resultset->fetchAll();

										$num = $qna_list->total_results;

										if ($page > 1) {
											$num = $num - (($page - 1) * 30);
										}

										foreach ($result as $value) {
									?>
									<tr data-qna-idx="<?=$value['idx']?>">
										<td class="text-center">
											<div class="form-check">
												<input type="checkbox" class="form-check-input" id="<?=$value['idx']?>" name="idx[]" value="<?=$value['idx']?>">
												<label class="form-check-label" for="idx">&nbsp;</label>
											</div>
										</td>
										<td class="text-center px-1"><?=$num?></td>
										<td class="text-center px-1"><?=$gubun_array[$value['gubun']]?></td>
										<td class="text-left px-1">
											<a href="./qna_view.php?<?=($q_string)?"{$q_string}&idx={$value['idx']}":"idx={$value['idx']}" ?>">
												<?=$value['subject']?>
												<?php
													if ($value['file_cnt']) {
														echo '<i class="dripicons-photo"></i>';
													}
												?>
											</a>
										</td>
										<td class="text-center px-1"><?=$value['user_id']?></td>
										<td class="text-center px-1"><?=$value['reg_date']?></td>
										<td class="text-center">
											<?=($value['answer']!="")?"O":"X"?>
											<br/>(<?=$value['admin_id']?>)
										</td>
                                        <td class="text-center"><?=($value['replyStatus']=="1")?"확인":""?></td>
                                        <td class="text-center"><?=($value['email_flag']=="Y")?"발송":""?></td>
										<td class="text-center">
											<a class="action-icon" href="./qna_register.php?<?=($q_string)?"{$q_string}&idx={$value['idx']}":"idx={$value['idx']}"?>"><i class="mdi mdi-square-edit-outline"></i></a>
										</td>
									</tr>
									<?php
											$num--;
										}
									} else {
									?>
										<tr>
											<td colspan="10" height="50" class="no-data">게시물이 없습니다.</td>
										</tr>
									<?php
									}
									?>
									<tr>
										<td colspan="10">
											선택한 게시글 <button id="all-delete-btn" class="btn btn-warning" type="button">삭제</button>
										</td>
									</tr>
								</tbody>
							</table>
							</form>
						</div>

						<div class="text-center mt-3"><?=$qna_list->links_html?></div>
					</div>
				</div>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
    $(document).ready(function() {
        $('#customCheck1').on('click', function() {
            let isChecked = $(this).is(':checked');
            $('input[name="idx[]"]').prop('checked', isChecked);
        });

        $('#all-delete-btn').on('click', function() {
            if ($('input[name="idx[]"]:checked').length < 1) {
                alert('선택하신 글이 없습니다.');
            } else {
                if (confirm("선택한 글을 삭제하시겠습니까?\n\r영구 삭제되어 복원 불가능합니다.")) {
                    $('#list-form').submit();
                }
            }
        });

        // 읽은 글 표시 (localStorage 기반)
        const QNA_READ_KEY = 'qna_read_ids';

        // 저장된 idx 행에 .qna-read 클래스 부여
        function applyReadStyles() {
            const ids = JSON.parse(localStorage.getItem(QNA_READ_KEY) || '[]');
            ids.forEach(idx => $('tr[data-qna-idx="' + idx + '"]').addClass('qna-read'));
        }

        // 페이지 로드 시 적용
        applyReadStyles();

        // 뒤로가기로 bfcache 복원 시에도 재적용
        window.addEventListener('pageshow', function(event) {
            if (event.persisted) applyReadStyles();
        });

        // 제목 링크 클릭 시: idx를 localStorage에 저장 + 즉시 클래스 부여
        $('tr[data-qna-idx] td.text-left a').on('click', function() {
            const idx = String($(this).closest('tr').data('qna-idx'));
            const ids = JSON.parse(localStorage.getItem(QNA_READ_KEY) || '[]');
            if (!ids.includes(idx)) {
                ids.push(idx);
                if (ids.length > 2000) ids.shift();
                localStorage.setItem(QNA_READ_KEY, JSON.stringify(ids));
            }
            $(this).closest('tr').addClass('qna-read');
        });
    });
</script>
</body>
</html>
