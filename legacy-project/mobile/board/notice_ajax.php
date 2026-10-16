<?
	ini_set( "display_errors", 0 );
	header("Content-Type:text/html; charset=utf-8");

	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
	
	$page = filter_input(INPUT_POST, 'page', FILTER_SANITIZE_NUMBER_INT);
	$isApp = filter_input(INPUT_POST, 'isApp', FILTER_SANITIZE_STRING);

	$page=$page+1;

	$add_where = "";

	$where = array();

	foreach($where as $value){
		$add_where.= " and ".$value;
	}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	$board = new Board($conn);

	$orderby = " is_notice desc,deploy_date desc";

	$notice_list = $board->getNoticeList($page,$add_where,$orderby,$param);

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>

<?
	if($notice_list->success == true){
		$result = $notice_list->resultset->fetchAll();

		$count = 0;
		if($notice_list->total_results=="0"){
		}else{
			foreach($result as $value){
				if($isApp<>"Y"){
					$link_url = "/board/notice_view.html?idx=".$value['idx'];
				}else{
					$link_url = "/board/notice_view.html?isApp=Y&idx=".$value['idx'];
				}
?>
 <li>
	<a href="<?=$link_url?>" class="item">
		<div class="in">
			<div>
				<?=$value['subject']?>
				<footer><?=substr($value['deploy_date'],0,10)?></footer>
			</div>
		</div>
	 </a>
</li>
<?
			}
		}
	}
?>