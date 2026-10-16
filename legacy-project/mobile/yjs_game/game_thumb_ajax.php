<?php
	ini_set( "display_errors", 0 );

	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
	include_once('filter_include.php');

	$result_per_page = 60;

	$page = $page+1;
	$page_type="thumb";
	$page_name="game";

	try{
		$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

		$goods= new Goods($conn);
		$promotion = new Promotion($conn);
		$mypage = new Mypage2($conn);

		$page_title = "모든게임";
		
		include_once('filter_include.php');

		$goods_list = $goods->getGoodsList2($page,$add_where,$orderby,$param,$result_per_page);
	}catch (PDOException $e){
		echo 'Error!: '.$e->getMessage();
		die();
	}
?>
<? include_once('thumb_inc.php');?>