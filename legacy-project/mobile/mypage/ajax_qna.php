<?php
	ini_set( "display_errors", 1 );
	header("Content-Type:text/html; charset=utf-8");

	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

	$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_NUMBER_INT);
	$search_goods_name = filter_input(INPUT_GET, 'search_goods_name', FILTER_SANITIZE_STRING);

	if(empty($page)){
		$page="1";
	}

	foreach($_GET as $key=>$value){
		if($key<>"page" ){
			if($value<>""){
				$param.="&".$key."=".$value;
			}
		}
	}

	try{
		$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
		$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		$mypage = new Mypage($conn_dgkr);
		$parsedown= new Parsedown();

		$where = array();
		$where[] = "user_id='{$_SESSION['member']['m_id']}'";
		$where_query = implode(" AND ", $where);
		$orderby = "reg_date DESC";

		$qna_list = $mypage->getQnaMobileList($page,$where_query,$orderby,$param);
		$list = $qna_list->resultset->fetchAll();
	}catch (PDOException $e){
		echo 'Error!: '.$e->getMessage();
		die();
	}

	$qnaGubun = array(
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

<?php
	foreach($list as $value){
?>
	<div class="accordion-item">
		<h2 class="accordion-header">
			<button class="accordion-button collapsed justify-content-between pe-5" style="justify-content:space-between !important;" type="button" data-bs-toggle="collapse" data-bs-target="#accordion_<?=$value['idx']?>" aria-expanded="false">
				<span class="col-9 p-0"><?=$value['subject']?></span>
				<?php
					if($value['is_answer']=="Y"){
				?>
					<span class="badge badge-primary col-3 ms-1">답변완료</span>
				<?php
					} else {
				?>
					<span class="badge badge-danger col-3 ms-1">답변대기중</span>
				<?php
					}
				?>
			</button>
		</h2>
		<div id="accordion_<?=$value['idx']?>" class="accordion-collapse collapse" data-bs-parent="#accordion" style="">
			<div class="accordion-body py-0">
				<div class="card-body mb-3 p-1">
					<h4>문의내용</h4>
						<div class="p-1 shadow-none rounded-0">
							<?=htmlspecialchars_decode($parsedown->text($value['contents']))?>
						</div>
					<hr>
					<h4>답변</h4>
						<div class="p-1 shadow-none rounded-0">
					<?php
						if($value['is_answer']=="Y"){
							echo htmlspecialchars_decode($parsedown->text($value['answer']));
						} else {
							echo "답변 대기중 입니다.";
						}
					?>
						</div>
				</div>
			</div>
		</div>
	</div>
<?php
	}
	if($qna_list->total_pages==$page){
?>
<?php
	}
?>