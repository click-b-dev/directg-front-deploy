<?
class AdminEvent extends Pagination{
	private $_db;
	
	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}

	public function getEventList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_event where 1=1 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'30',
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

    public function getEventMemberList($page, $add_where, $orderby, $param){
        try {
            $sql = "SELECT 
                       teg.title, teg.is_delivery, teg.start_dt, teg.end_dt,
                       tegm.*
	                FROM `tbl_event_gift_member` tegm
                        INNER JOIN `tbl_event_gift` teg ON tegm.parent_idx = teg.idx
	                WHERE {$add_where}
	                ORDER BY {$orderby}";

            $options = array(
                'results_per_page' =>'30',
                'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,
                'db_handle'  => $this->_db
            );

            $pagination = new pagination($page, $sql, $options);

            return $pagination;
        } catch (paginationException $e) {
            echo $e;
            exit();
        }
    }
	
	public function getEventLotteryList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_event_lottery_config where 1=1 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'30',
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

    public function getEventLotteryItemList($page, $add_where, $orderby, $param){
        try {
            $sql = "SELECT 
                       teli.*, telc.event_name, telc.event_start_dt, telc.event_end_dt
	                FROM `tbl_event_lottery_item` teli
                        INNER JOIN `tbl_event_lottery_config` telc ON teli.event_no = telc.idx
	                WHERE {$add_where}
	                ORDER BY {$orderby}";

            $options = array(
                'results_per_page' =>'30',
                'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,
                'db_handle'  => $this->_db
            );

            $pagination = new pagination($page, $sql, $options);

            return $pagination;
        } catch (paginationException $e) {
            echo $e;
            exit();
        }
    }
	
	//적립금 추첨 이벤트 대상자 정보
	public function getEventLotteryMemberCount($event_no,$event_per_price){
		$query = "select count(*)as member_count,sum(t.event_price)as total from (select m_no,sum(event_price)as event_price from tbl_event_lottery_member where event_no=:event_no group by m_no having sum(event_price)>=:event_per_price)as t";
		$stmt = $this->_db->prepare($query);
		$params = array(
			":event_no"=>$event_no,
			":event_per_price"=>$event_per_price
		);
		$stmt->execute($params);
		$event_member_data=  $stmt->fetch();
		return $event_member_data;
	}
	
	//적립금 추첨 이벤트 참여자 정보
	public function getEventLotteryJoinCount($event_no){
		$query="select count(*)as event_member,sum(t.cc)as event_count from (select m_id,count(*)cc from tbl_event_lottery_log where event_no=:event_no group by m_id)as t";
		$stmt = $this->_db->prepare($query);
		$params = array(
			":event_no"=>$event_no,
		);
		$stmt->execute($params);
		$event_join_data=  $stmt->fetch();

		return $event_join_data;
	}

	//적립금 추첨 이벤트 사은품 정보 (당첨된 사은품)
	public function getEventLotteryItem($event_no){
		$query="select count(*) from tbl_event_lottery_item where event_no=:event_no and lottery_status='Y'";
		$stmt = $this->_db->prepare($query);
		$params = array(
			":event_no"=>$event_no,
		);
		$stmt->execute($params);
		$lottery_item_data=  $stmt->fetch();
		return $lottery_item_data;
	}
	
	//가정의달 이벤트 참여자 현황
	public function getEventMemberCount($event_no){
		$query="select count(*) from tbl_event_log where event_no=:event_no";
		$stmt = $this->_db->prepare($query);
		$params = array(
			":event_no"=>$event_no,
		);
		$stmt->execute($params);
		$event_member_data=  $stmt->fetch();

		return $event_member_data;
	}
	
	//이벤트에 등록된 옵션상품 조회
	public function getEventGoodsOption($event_no){
		$query="select product_code from tbl_event_goods where event_no=:event_no";
		$stmt = $this->_db->prepare($query);
		$params = array(
			":event_no"=>$event_no,
		);
		$stmt->execute($params);
		$event_goods_data=  $stmt->fetchAll();

		return $event_goods_data;
	}
	
	//사은품 이벤트 진행이력
	public function getEventGiftList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_event_gift where 1=1 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'30',
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
	
	//추가 포인트 지급 이벤트 진행이력
	public function getEventPointList($page,$add_where,$orderby,$param){
		try{
			$query = "select a.*,b.product_name from tbl_add_repay a inner join tbl_goods_item b on a.product_code=b.product_code where 1=1 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'30',
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

	public function getEventGiftList2() {
		try {
			$qry = "SELECT
						teg.idx, teg.title, teg.gift_nm 
					FROM tbl_event_gift teg
					WHERE teg.is_delivery = 'Y'
					ORDER BY teg.idx DESC";
			$stmt = $this->_db->prepare($qry);
			$stmt->execute();
			$event_gift_list = $stmt->fetchAll();

			return $event_gift_list;
		} catch(paginationException $e) {
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