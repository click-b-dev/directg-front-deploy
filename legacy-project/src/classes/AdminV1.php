<?
class AdminV1 extends Pagination{
	private $_db;
	
	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}
	
	public function getOrderItemGenba($ordno){
		$query = "select * from tbl_order_item_genba where ordno=:ordno order by idx asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':ordno'=>$ordno
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		return $data;
	}
	
	public function getMemberList($page,$add_where,$orderby,$param){
		try{
			$query = "SELECT
                        tm.*
                    FROM tbl_member tm  
                    WHERE tm.status = 0 {$add_where} ORDER BY {$orderby}";

			$options = array(
				'results_per_page' => '30',
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

    public function getMemberReadyList($page, $add_where, $orderby, $param){
        try{
            $query = "SELECT
                        tm.*
                    FROM tbl_member tm  
                    WHERE tm.status = 5 {$add_where} ORDER BY {$orderby}";

            $options = array(
                'results_per_page' => '30',
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

	public function getMemberInfo($m_no){
		$query = "select * from tbl_member where m_no=:m_no";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':m_no'=>$m_no
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

    public function getMemberNo($m_id) {
        $qry = "SELECT tm.m_no FROM tbl_member tm WHERE tm.m_id = :m_id";
        $stmt = $this->_db->prepare($qry);
        $params = array(
            ":m_id" => $m_id
        );
        $stmt->execute($params);
        $data = $stmt->fetch();

        return $data;
    }

	public function getMemberAge($birth_day){
		if(strlen($birth_day)=="6"){
			if(date('y')>substr($birth_day,0,2)){
				$age = date('Y') - ("20".substr($birth_day,0,2));
			}else{
				$age = date('Y') - ("19".substr($birth_day,0,2));
			}
		}else{
			$age = date('Y') - substr($birth_day,0,4);
		}

		if(substr($birth_day,4,4)-date('md')>0){
			//$age = $age-1;
		}
	

		return ($age);
	}
	
	public function getOrderNaverPayLog($settle_no){
		$query = "select * from tbl_kcp_npay_log where merchant_uid=:merchant_uid order by idx asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':merchant_uid'=>$settle_no
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	public function getOrderNaverPayLog2($settle_no){
		$query = "select * from naverpay_log where merchantPayKey=:merchantPayKey order by idx asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':merchantPayKey'=>$settle_no
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	public function getOrderNaverPayLog3($settle_no){
		$query = "select * from retail_naverpay_log where merchantPayKey=:merchantPayKey order by idx asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':merchantPayKey'=>$settle_no
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	public function getOrderKcpLog($settle_no){
		$query = "select * from tbl_kcp_log where merchant_uid=:merchant_uid order by idx asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':merchant_uid'=>$settle_no
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	public function getOrderKcpLog2($settle_no){
		$query = "select * from retail_kcp_log where settle_no=:settle_no order by idx asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':settle_no'=>$settle_no
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	public function getOrderPaycoLog($settle_no){
		$query = "select * from payco_log where sellerOrderReferenceKey=:sellerOrderReferenceKey order by idx asc";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':sellerOrderReferenceKey'=>$settle_no
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}

    public function getMemberSnsList($page, $add_where, $orderby, $param) {
        try{
            $query = "SELECT tm.*, si.sns_type, si.flag, si.sns_connect_date
                        FROM tbl_member tm 
                        INNER JOIN sns_info si ON tm.m_no = si.m_no
                        WHERE tm.status = 0 {$add_where}
                        ORDER BY {$orderby}";

            $options = array(
                'results_per_page' => '30',
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

    public function getMemberPointList($page, $add_where, $orderby, $param) {
        try{
            $qry = "SELECT tel.*
                    FROM tbl_emoney_log tel 
                    WHERE tel.m_no IS NOT NULL {$add_where}
                    ORDER BY {$orderby}";

            $options = array(
                'results_per_page' => '50',
                'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,
                'db_handle'  => $this->_db
            );

            $pagination = new pagination($page, $qry, $options);

            return $pagination;
        }catch(paginationException $e){
            echo $e;
            exit();
        }
    }

    public function getMemberPoint($m_no) {
        $qry = "SELECT SUM(tel.amt_delta) AS point FROM tbl_emoney_log tel WHERE tel.m_no = :m_no";
        $stmt = $this->_db->prepare($qry);
        $params = array(
            ":m_no" => $m_no
        );
        $stmt->execute($params);
        $data = $stmt->fetch();

        return $data;
    }

	public function getDirectSendMailLog($page, $add_where, $orderby, $param) {
        try{
            $qry = "SELECT
						tea.*
                    FROM tbl_email_api tea 
                    WHERE 1 {$add_where}
                    ORDER BY {$orderby}";

            $options = array(
                'results_per_page' => '50',
                'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,
                'db_handle'  => $this->_db
            );

            $pagination = new pagination($page, $qry, $options);

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