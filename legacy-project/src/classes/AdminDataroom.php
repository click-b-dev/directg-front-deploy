<?
class AdminDataroom extends Pagination{
	private $_db;
	
	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}

	public function setDataroom($file_type,$file_name,$file_url,$thumbnail,$contents,$is_encode,$encode_type,$deploy_date,$is_free,$is_view){
		try{
			$query="INSERT INTO tbl_dataroom SET file_type=:file_type,file_name=:file_name,file_url=:file_url,thumbnail=:thumbnail,contents=:contents,is_encode=:is_encode,encode_type=:encode_type,deploy_date=:deploy_date,is_free=:is_free,is_view=:is_view,reg_date=NOW()";
			$params = array(
				":file_type"=>$file_type,
				":file_name"=>$file_name,
				":file_url"=>$file_url,
				":thumbnail"=>$thumbnail,
				":contents"=>$contents,
				":is_encode"=>$is_encode,
				":encode_type"=>$encode_type,
				":deploy_date"=>$deploy_date,
				":is_free"=>$is_free,
				":is_view"=>$is_view
			);
			$stmt = $this->_db->prepare($query);
			$stmt->execute($params);
			return $this->_db->lastInsertId();
		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}

	public function updateDataroom($idx,$file_type,$file_name,$file_url,$contents,$is_encode,$encode_type,$deploy_date,$is_free,$is_view){
		try{
			$query="UPDATE tbl_dataroom SET file_type=:file_type,file_name=:file_name,file_url=:file_url,contents=:contents,is_encode=:is_encode,encode_type=:encode_type,deploy_date=:deploy_date,is_free=:is_free,is_view=:is_view WHERE idx=:idx";
			$params = array(
				":file_type"=>$file_type,
				":file_name"=>$file_name,
				":file_url"=>$file_url,
				":contents"=>$contents,
				":is_encode"=>$is_encode,
				":encode_type"=>$encode_type,
				":deploy_date"=>$deploy_date,
				":is_free"=>$is_free,
				":is_view"=>$is_view,
				":idx"=>$idx
			);
			$stmt = $this->_db->prepare($query);
			$stmt->execute($params);
		}catch(paginationException $e){
			echo $e;
			exit();
		}
	}
	
	public function updateDataroomImg($idx,$thumbnail){
		try{
			$query="UPDATE tbl_dataroom SET thumbnail=:thumbnail WHERE idx=:idx";
			$params = array(
				":thumbnail"=>$thumbnail,
				":idx"=>$idx
			);
			$stmt = $this->_db->prepare($query);
			$stmt->execute($params);
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