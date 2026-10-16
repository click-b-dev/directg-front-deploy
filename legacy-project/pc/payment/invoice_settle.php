<?
	ini_set('display_errors', '1');
	header("Content-type: text/html; charset=utf-8");
	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

	//if(!$_SESSION['invoice']['m_id']){
	//	msg("로그인을 하셔야 이용이 가능합니다.");
	//	go("/invoice/index.html");
	//exit;
	//}
	
$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	//결제번호생성
	$payment_no = "20250919-1";
	
	$query="select * from tbl_payment_log where merchant_uid=:merchant_uid";
	$params = array(
		":merchant_uid"=>$payment_no
	);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	
	$payment_log= $stmt->fetch();
	
	//구매자 이메일
	$buyer_email = "6minju@treasurehunter.co.kr";
	
	$company_name = "TREASURE HUNTER";
	
	//구매자명
	$buyer_name = "육민주 팀장";
	
	// 구매자 연락처
	$buyer_tel = "010-5228-4078";
	
	$total_price = "2883200";

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();
	die();  
}
?>
<!DOCTYPE html>
<html lang="ko">
<head>
	<meta charset="utf-8">
	<title>물품 결제</title>
	<link rel="stylesheet" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap">
	
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
	 <link rel="stylesheet" href="invoice_style.css?t=<?=time()?>" media="all" />
</body>
</head>
<body>
<header class="clearfix mb-2">
	<div id="logo">
		<img src="h2_logo_250918.png">
	</div>
	<h1>INVOICE - <?=$payment_no?></h1>
	<div class="row mt-4">
		<div class="col-sm-4">
			<h6>Invoice To</h6>
			<address>
				<?=$company_name?><br>
				<?=$buyer_name?><br>
				<?=$buyer_tel?><br/>
				6minju@treasurehunter.co.kr<br>
			</address>
		</div>

		<div class="col-sm-4">
			<h6>Bill To</h6>
			<address>
				H2 Interactive Co., Ltd.<br>
				H2 INT Bldg., 35, Gangseo-ro 56ga-gil, Gangseo-gu, Seoul, Republic of Korea<br>
				+82 1544-2367<br>
				directg@h2int.com
			</address>
		</div>
		
		<div class="col-sm-4">
			<div class="mt-3 float-sm-end">
				<p class="font-14"><strong>주문일자: </strong> &nbsp;&nbsp;&nbsp; <?=date('Y-m-d')?></p>
				<p class="font-14"><strong>결제상태: </strong> <span class="badge bg-success float-end"><?=($payment_log['status']=="paid")?"결제완료":"결제대기"?></span></p>
				<?
					if($payment_log['status']=="paid"){
				?>
				<p class="font-14"><strong>결제완료일자: </strong> &nbsp;&nbsp;&nbsp; <?=date('Y-m-d H:i:s',$payment_log['paid_at'])?></p>
				<?
					}
				?>
				<p class="font-14"><strong>결제번호: </strong> <span class="float-end"> <?=$payment_no?></span></p>
			</div>
		</div>
	</div>
</header>
<main>
  <table class="table table-bordered">
		<thead class="table-light font-14">
		  <tr>
			<th class="text-center" scope="col">플랫폼</th>
			<th class="text-center" scope="col">상품명</th>
			<th class="text-center" scope="col">소비자가</th>
			<th class="text-center" scope="col">공급가 (-15%)</th>
			<th class="text-center" scope="col">수량</th>
			<th class="text-center" scope="col">합계</th>
		  </tr>
		</thead>
		<tbody>
		<? //foreach($order_item_data as $value){
			$consumer_price="84800";
			$price = "72080";
			$qty = "40";
		?>
		  <tr>
			<td class="text-center">Steam</td>
			<td class="desc">보더랜드 4</td>
			<td class="text-end">₩ 84,800</td>
			<td class="text-end">₩ 72,080</td>
			<td class="text-end">40</td>
			<td class="text-end">₩ <?=number_format($price*$qty)?> </td>
		  </tr>
		  <?		$total+=($price*$qty);
		//	}
		?>
		</tbody>
	</table>
	
	<div class="row">
		<div class="col-sm-6">
			<div class="clearfix pt-3">
			</div>
		</div>
		<div class="col-sm-6">
			<div class="float-end mt-3 mt-sm-0">
				<!--<p><b>Sub-total:</b> <span class="float-end">₩ <?=number_format($consumer_price*$qty)?></span></p>
				<p><b>Discount (15%):</b> <span class="float-end text-danger"> - (₩ <?=number_format($consumer_price*$qty*0.15)?>)</span></p>
				-->
				<h3>₩ <?=number_format($total)?></h3>
			</div>
			<div class="clearfix"></div>
		</div>
	</div>
	
	<div class="float-end">
	<?
		if($payment_log['status']!="paid"){
	?>
		<button type="button" class="btn btn-primary d-grid w-100"  id="btn_payment">결제</button>
	<?}?>
	</div>
</main>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
<script src="https://cdn.iamport.kr/v1/iamport.js"></script>
<script type="text/javascript">
$(document).ready(function(){
	$("#btn_payment").bind("click",function(){
		kcp_payment();
	});
});

function kcp_payment(){
	IMP.init('imp50218039');
	IMP.request_pay({
		pg : 'kcp', // version 1.1.0부터 지원.
		//escrow : true, //에스크로 결제인 경우 필요
		pay_method : 'card',
		merchant_uid : '<?=$payment_no?>',
		name : '보더랜드 4 Steam 코드 결제',
		amount : '<?=$total?>',
		buyer_email : '<?=$buyer_email?>',
		buyer_name : '<?=$buyer_name?>',
		buyer_tel : '',
		buyer_addr : '',
		buyer_postcode : '',
		language : 'ko',
		kcpProducts : '',
		custom_data : {
			settle_price:"<?=$total?>",
			settle_no:"<?=$payment_no?>"
		},
		notice_url : 'https://directg.net/payment/invoice_settle_notice.php',
		//vbank_due : '201712112200' //YYYYMMDDhhmm
		
	}, function(rsp) {
		
		if ( rsp.success ) {
			var msg = '결제가 완료되었습니다.';
			alert(msg);
			
		} else {
			var msg = '결제에 실패하였습니다.';
			msg += '에러내용 : ' + rsp.error_msg;
			alert(msg);
		}
	});
}
</script>
</body>
</html>