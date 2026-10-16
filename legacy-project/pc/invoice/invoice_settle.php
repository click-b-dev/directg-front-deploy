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
	
	$order = new Order($conn);
	
	//결제번호생성
	$payment_no = date('Ymd')."-1";
	
	//구매자 이메일
	$buyer_email = "6minju@treasurehunter.co.kr";
	
	$company_name = "TREASURE HUNTER";
	
	//구매자명
	$buyer_name = "육민주";
	
	// 구매자 연락처
	$buyer_tel = "010-5228-4078";

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();
	die();  
}
?>
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <title>Example 1</title>
	<link rel="stylesheet" type="text/css" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
	<link rel="stylesheet" type="text/css" href="css/ionicons.min.css">

	<link rel="stylesheet" href="//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.min.css">
	 <link rel="stylesheet" href="invoice_style.css?3" media="all" />

	<script type="text/javascript" src="js/jquery-1.10.1.min.js"></script>
	<script type="text/javascript" src="js/bootstrap.min.js"></script>
	<script type="text/javascript" src="//code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script>
  </head>
  <body>
    <header class="clearfix">
      <div id="logo">
        <img src="images/h2_logo.png">
      </div>
      <h1>INVOICE - <?=$payment_no?></h1>
      <div id="company" class="clearfix">
        <div>(주)에이치투 인터렉티브</div>
        <div>서울시 강서구 강서로56가길 35 에이치투 아이앤티 빌딩</div>
        <div>1544-2367</div>
        <div><a href="mailto:directg@h2interactive.co.kr">directg@h2int.com</a></div>
      </div>
      <div id="project">
        <div><span>PRODUCT</span> 보더랜드 4 Steam 코드 결제</div>
        <div><span>CLIENT</span> <?=$company_name?></div>
        <!--<div><span>ADDRESS</span> 796 Silver Harbour, TX 79273, US</div>-->
        <div><span>EMAIL</span> <?=$buyer_email?></div>
        <div><span>DATE</span> <?=date('Y-m-d')?></div>
        <!--<div><span>DUE DATE</span> September 17, 2015</div>-->
      </div>
    </header>
    <main>
      <table border="1">
        <thead>
          <tr>
            <th class="service">플랫폼</th>
            <th class="desc">상품명</th>
            <th>공급가</th>
            <th>수량</th>
            <th>합계</th>
          </tr>
        </thead>
        <tbody>
		<? //foreach($order_item_data as $value){
			
			$price = "72080";
			$qty = "40";
		?>
          <tr>
            <td class="service">Steam</td>
            <td class="desc">보더랜드 4</td>
            <td class="unit">₩ 72,080</td>
            <td class="qty">40</td>
            <td class="total">₩ <?=number_format($price*$qty)?> </td>
          </tr>
		  <?		$total+=($price*$qty);
		//	}
		?>
		   <tr>
            <td colspan="4" class="total"> 합계</td>
            <td class="total">₩ <?=number_format($total)?></td>
          </tr>
		</tbody>
		</table>
		
		<?//if($total-$payment_total>0){?>
		<div class="pull-right">
			<button type="button" class="btn btn-danger" id="btn_payment">결제</button>
		</div>
		<?//}?>
      <div id="notices">
       <!-- <div>NOTICE:</div>
        <div class="notice">A finance charge of 1.5% will be made on unpaid balances after 30 days.</div>-->
      </div>

    </main>
    <footer>
      Invoice was created on a computer and is valid without the signature and seal.
    </footer>
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
		name : 'INVOICE <?=date('Y')?>-1',
		amount : '2883200',
		buyer_email : 'test@h2int.com',
		buyer_name : '테스트',
		buyer_tel : '',
		buyer_addr : '',
		buyer_postcode : '',
		language : 'ko',
		kcpProducts : '',
		custom_data : {
			settle_price:"3000",
			settle_no:"20250904"
		},
		notice_url : 'https://directg.net/payment/invoice_settle_notice.php',
		//vbank_due : '201712112200' //YYYYMMDDhhmm
		
	}, function(rsp) {
		
		if ( rsp.success ) {
			if(pay_method=="vbank"){
				var msg = '결제가 요청되었습니다.';
			}else{
				var msg = '결제가 완료되었습니다.';
			}
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