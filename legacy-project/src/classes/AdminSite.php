<?
class AdminSite extends Pagination{
	private $_db;
	
	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}

	//메인배너 목록
	public function getMainbannerList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_main_banner where 1=1 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db,
				'text_prev'  => '&laquo; Prev',
				'text_next'  => 'Next &raquo;',
				'text_first' => '&laquo; First',
				'text_last'  => 'Last &raquo;'
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}

	//추천 및 특집 목록
	public function getMainRecommandList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_main_recommand where 1=1 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db,
				'text_prev'  => '&laquo; Prev',
				'text_next'  => 'Next &raquo;',
				'text_first' => '&laquo; First',
				'text_last'  => 'Last &raquo;'
			);
			$pagination = new pagination($page, $query, $options);

			return $pagination;

		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}

	//추천검색어 목록 (어드민)
	public function getSearchRecommandList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_search_recommand where 1=1 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,
				'db_handle'  => $this->_db,
				'text_prev'  => '&laquo; Prev',
				'text_next'  => 'Next &raquo;',
				'text_first' => '&laquo; First',
				'text_last'  => 'Last &raquo;'
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
?>