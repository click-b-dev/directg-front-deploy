<?
class AdminStock extends Pagination{
	private $_db;
	
	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}
	
	public function getGenbaAvaliabilityLog($page,$add_where,$orderby,$param){
		try{
			$query = "select a.*,b.product_code,b.item_name from directgames.genba_webhook_log a inner join tbl_goods_item_delivery b on a.sku=b.item_id where a.webhook_type='avaliability' ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	//클래스 소멸자
	public function __destruct() {
		$this->_db=null;
	}
}