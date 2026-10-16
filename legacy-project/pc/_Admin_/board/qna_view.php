<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['board'] = "active";
$page_title = "고객문의";
$sidebar_file = "sidebar_board.php";

$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);

try {
	$conn_dgkr = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);

	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	$admin = new Admin($conn_dgkr);
	$parsedown = new Parsedown();

	$qry = "SELECT
                tq.*
            FROM tbl_qna tq
            WHERE tq.idx = :idx";
	$stmt = $conn_dgkr->prepare($qry);
	$params = array(
	    ":idx" => $idx,
	);
	$stmt->execute($params);
	$data = $stmt->fetch();

    $adminV1= new AdminV1($conn_dgkr);

    $search_m_no = $adminV1->getMemberNo($data['user_id'])['m_no'];
    $member_info = $adminV1->getMemberInfo($search_m_no);

	$file_query = "SELECT * FROM tbl_file WHERE table_name = 'tbl_qna' AND puid = :notice_idx";
	$stmt = $conn_dgkr->prepare($file_query);
	$params = array(
		":notice_idx" => $idx,
	);
	$stmt->execute($params);
	$file_data = $stmt->fetchAll();

    $q_string = [];

    foreach ($_GET as $key => $value) {
        if ($key == "idx") {
            continue;
        } else {
            $q_string[] = "{$key}={$value}";
        }
    }

    $q_string = implode("&", $q_string);

    $query = "SELECT * FROM tbl_qna WHERE user_id = :user_id ORDER BY idx DESC";
    $stmt = $conn_dgkr->prepare($query);
    $params = array(
        ":user_id" => $data['user_id'],
    );
    $stmt->execute($params);
    $qna_list = $stmt->fetchAll();
} catch (PDOException $e) {
	echo 'Error!: '.$e->getMessage();
	die();
}

$gubun_array = array (
    "6"=>"계정, 회원, 인증",
    "7"=>"한글, 제공 콘텐츠",
    "1"=>"게임 설치, 플레이",
    "2"=>"주문, 결제",
    "4"=>"주문취소 및 환불",
    "3"=>"기타",
    "5"=>"제품 코드(키) 오류",
    "8"=>"할인, 가격",
    "9"=>"이용방법",
);
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
dt { font-weight: 500; }
label { font-weight: 500; }
blockquote { margin: 0 0 1rem; }
#list-table tr:hover { background-color: #FFF0F0; }
.image-group {
    position: relative;
    display: block;
    width: fit-content;
    margin: 0 0 30px 0;
}
.target-img {
    max-width: 600px;
    height: auto;
    display: block;
    transition: all 0.3s ease;
    cursor: pointer;
}
.target-img.full-size { max-width: 100% !important; }
.zoom-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
    padding: 8px 12px;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
.zoom-btn:hover { background-color: rgba(0, 0, 0, 0.8); }
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
									<li class="breadcrumb-item active">문의하기 상세</li>
								</ol>
							</div>
							<h4 class="page-title">문의하기 상세</h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<div class="col-12">
						<table class="table table-bordered table-centered table-sm" style="border: 1px solid #dbe0e5;">
							<tbody class="bg-white font-14">
								<tr>
									<th class="table-light" scope="row">작성자</th>
									<td class="">
                                        <?php
                                            echo $data['user_id'];
                                        
                                            if($member_info['email']) {
                                                echo "<br>({$member_info['email']})";
                                            } else {
                                                $member_info['email'] = $data['user_id'];
                                            }
                                        ?>
                                        
									</td>
                                    <td>
                                        <div>
                                            <a href="/_Admin_/member/member_view.php?m_no=<?=$search_m_no?>" class="btn btn-primary shadow-none" target="_blank">회원정보보기</a>
                                            <a href="/_Admin_/order/order_all.php?search_key=search_m_id&search_value=<?=urlencode($data['user_id'])?>" class="btn btn-primary shadow-none" target="_blank">주문내역보기</a>
                                            <a href="/_Admin_/order/order_old_list.php?search_key=search_m_id&search_value=<?=urlencode($data['user_id'])?>&search_year=2017" class="btn btn-primary shadow-none" target="_blank">(과거)주문내역보기</a>
                                            <a href="/_Admin_/order/order_cancel_request.php?search_key=search_m_id&search_value=<?=urlencode($data['user_id'])?>" class="btn btn-primary shadow-none" target="_blank">취소요청내역보기</a>
                                        </div>
                                    </td>
									<th class="table-light" scope="row">작성일</th>
									<td colspan="3"><?=$data['reg_date']?></td>
								</tr>
								<tr>
									<th class="table-light" scope="row">제목</th>
									<td colspan="2"><?=$data['subject']?></td>
                                    <th class="table-light" scope="row">고객 답변 확인 여부</th>
									<td><?=($data['replyStatus']=="1")?"확인":"미확인"?></td>
                                    <th class="table-light" scope="row">메일발송여부</th>
									<td><?=($data['email_flag']=="Y")?"발송":"미발송"?></td>
								</tr>
								<tr>
									<th class="table-light" scope="row">내용</th>
									<td colspan="6"><?=htmlspecialchars_decode(nl2br($data['contents']))?></td>
								</tr>
								<?php if (count($file_data)) { ?>
								<tr>
									<th class="table-light" scope="row">첨부파일</th>
									<td colspan="6">
									<?php foreach($file_data as $file) { ?>
										<div class="image-group">
											<img class="target-img" src="<?=$file['reg_date']>'2025-08-19 00:00:00'?"https://directg.net":""?>/upload/qna/<?=$file['filename']?>">
											<button class="zoom-btn">크게 보기</button>
										</div>
									<?php } ?>
									</td>
								</tr>
								<?php } ?>
								<tr>
									<th class="table-light" scope="row">답변</th>
									<td colspan="6"><?=htmlspecialchars_decode(nl2br($data['answer']))?></td>
								</tr>
							</tbody>
						</table>
					</div>

					<div style="margin-top:20px;">
						<table class="table table-bordered table-centered table-sm" id="list-table">
							<thead class="table-light font-13">
								<tr>
									<th class="text-center" style="width:70px">번호</th>
									<th class="text-center">구분</th>
									<th class="text-center">제목</th>
									<th class="text-center">작성자</th>
									<th class="text-center">작성일</th>
									<th class="text-center">답변상태</th>
								</tr>
							</thead>
							<tbody>
							<?php
							$num = count($qna_list);
							foreach ($qna_list as $list) {
							?>
								<tr>
									<td class="text-center"><?=$num?></td>
									<td class="text-center"><?=$gubun_array[$list['gubun']]?></td>
									<td class="text-left">
										<a href="./qna_view.php?<?=($q_string)?"{$q_string}&idx={$list['idx']}":"idx={$list['idx']}" ?>">
											<?=$list['subject']?>
										</a>
									</td>
									<td class="text-center"><?=$list['user_id']?></td>
									<td class="text-center"><?=$list['reg_date']?></td>
									<td class="text-center"><?=$list['is_answer']?><br/>(<?=$list['admin_id']?>)</td>
								</tr>
							<?php
								$num--;
							}
							?>
							</tbody>
						</table>
					</div>
				</div>

				<div class="text-center">
					<a href="./qna_list.php<?=($q_string)?"?{$q_string}":""?>" class="btn btn-primary">목록가기</a>
					<a class="btn btn-primary shadow-none" href="qna_register.php?<?=($q_string)?"{$q_string}&idx={$data['idx']}":"idx={$data['idx']}"?>">답변하기</a>
                <?php
                    if ($data['is_answer'] == "Y") {
                ?>
                    <button type="button" class="btn btn-warning" onclick="answer_mail_send('<?=$member_info['email']?>', <?=$data['idx']?>)">메일발송</button>
                <?php
                    }
                ?>
				</div>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<!--타이틀 검색 팝업-->
<div id="product-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="product-modalLabel" aria-hidden="true">
	<div class="modal-dialog modal-lg" style="max-width:1000px">
		<div class="modal-content">
			<div class="modal-header modal-colored-header bg-primary">
				<h4 class="modal-title" id="bundle-modalLabel">옵션상품 검색결과</h4>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
			</div>
			<div class="modal-body p-0">
				<form class="form-horizontal">
					<input type="hidden" name="notice_idx" id="notice_idx" value="">
					<table class="table table-striped table-border mb-0 table-sm" id="title_info">
					<thead class="table-dark font-14">
					<tr>
						<th class="text-center" style="width:200px">옵션상품 sku</th>
						<th class="text-center" style="width:100px">옵션상품 유형</th>
						<th class="text-center" style="width:350px">옵션상품명<br/>(영문)</th>
						<th class="text-center" style="width:150px">퍼블리셔</th>
						<th class="text-center" style="width:100px">플랫폼</th>
						<th class="text-center" style="width:100px">비고</th>
					</tr>
					</thead>
					<tbody class="font-13">
					</tbody>
					</table>
				</form>
			</div>
		</div><!-- /.modal-content -->
	</div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<script type="text/javascript">
    document.addEventListener('DOMContentLoaded', function() {
        const groups = document.querySelectorAll('.image-group');

        groups.forEach(group => {
            const btn = group.querySelector('.zoom-btn');
            const img = group.querySelector('.target-img');

            const toggleZoom = () => {
                img.classList.toggle('full-size');
                btn.textContent = img.classList.contains('full-size') ? '축소하기' : '크게 보기';
            };

            btn.onclick = (e) => {
                e.stopPropagation();
                toggleZoom();
            };

            img.onclick = () => {
                toggleZoom();
            };
        });
    });

    function answer_mail_send(email, idx) {
        if (confirm(email + " 회원 에게 문의답변 메일을 발송하시겠습니까?")) {

            $.ajax({
                type: "POST",
                url: "./qna_ps.php",
                data: {
                    mode: "mail",
                    email: email,
                    idx: idx
                },
                dataType: 'json',
                success: function (data) {
                    if (data.success) {
                        alert(data.message);
                        location.reload();
                    } else {
                        alert(data.message);
                    }
                },
                error: function (data) {
                    alert(data.message);
                }
            })
        }
    }
</script>
</body>
</html>