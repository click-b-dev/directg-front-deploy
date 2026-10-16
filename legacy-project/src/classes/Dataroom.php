<?
class Dataroom extends Pagination{
	private $_db;
	
	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}

	public function getDataroomList($page,$add_where,$orderby,$param){
		try{
			$query = "SELECT idx,file_type,file_name,file_url,thumbnail,contents,is_encode,encode_type,deploy_date,is_free,patch_no FROM tbl_dataroom WHERE 1=1 ".$add_where." ORDER BY ".$orderby;

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
	
	public function setDataroomLog($m_no,$m_id,$parent_idx){
		$query = "INSERT INTO tbl_dataroom_log SET m_no=:m_no,m_id=:m_id,parent_idx=:parent_idx,download_count=1 ON DUPLICATE KEY UPDATE download_count=download_count+1";
		$params = array(
			":m_no"=>$m_no,
			":m_id"=>$m_id,
			":parent_idx"=>$parent_idx
		);
		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
		return $this->_db->lastInsertId();
	}

	public function getDataroomView($idx){
		$board_view = array();
		$query = "select idx,subject,deploy_date,notice_type,hit,contents from tbl_notice where idx=:idx";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':idx'=>$idx
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		$board_view['idx'] = $data['idx'];
		$board_view['subject'] = $data['subject'];
		$board_view['deploy_date'] = $data['deploy_date'];
		$board_view['notice_type'] = $data['notice_type'];
		$board_view['hit'] = $data['hit'];
		$board_view['contents'] = $this->html_print2($data['contents']);

		return $board_view;
	}

	public function html_print2($str){
		$str = str_replace("&#60;","<",$str);
		$str = str_replace("&#62;",">",$str);
		$str = str_replace("&#34;",'"',$str);
		$str = str_replace("&#38;","&",$str);
		$str = str_replace("&amp;","&",$str);
		$str = str_replace("\"","",$str);
		$str = str_replace("&lt;","<",$str);
		$str = str_replace("&gt;",">",$str);
		
		return $str;
	}

	//클래스 소멸자
	public function __destruct() {
		$this->_db=null;
	}
}
?>