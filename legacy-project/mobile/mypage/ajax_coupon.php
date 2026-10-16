<?php
	ini_set( "display_errors", 0);
	header("Content-Type:text/html; charset=utf-8");

	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

	$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_NUMBER_INT);

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
		
		$where = array();
		$where[]="m_no='{$_SESSION['member']['m_no']}'";
		$where_query = implode(" AND ", $where);
		$orderby = "regdt DESC";

		$coupon_list = $mypage->getCouponList($page,$where_query,$orderby,$param);

		$list = $coupon_list->resultset->fetchAll();
	}catch (PDOException $e){
		echo 'Error!: '.$e->getMessage();
		die();
	}
?>

<?php
	foreach($list as $value){
?>
		<tr>
			<td><?=$value['regdt']?></td>
			<td class="text-start"><?=$value['coupon_name']?></td>
			<td>
				<div class="d-flex justify-content-between">
					<span class="won"></span>
					<span class="amount text-nowrap"><?=number_format($value['coupon_price'])?></span>
				</div>
			</td>
		</tr>
<?php
	}
	if($coupon_list->total_pages==$page){
?>
<?php
	}
?>