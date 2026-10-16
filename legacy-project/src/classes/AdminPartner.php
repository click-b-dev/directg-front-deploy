<?
class AdminPartner extends Pagination{
	private $_db;
	
	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}
	
	//공급처 목록
	public function getSupplierList(){
		$query = "select a.publisher_code,a.publisher_name from tbl_publisher a where NOT EXISTS (select b.publisher_code from tbl_partner b where a.publisher_code=b.publisher_code) order by a.publisher_name asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//등록된 파트너 전체 목록
	public function getPartnerListAll($is_system){
		if($is_system){
			$query = "select publisher_code,publisher_name,report_term from tbl_partner where is_system=:is_system order by publisher_name asc";
			$stmt = $this->_db->prepare($query);
			$params = array(
				":is_system"=>$is_system,
			);
			$stmt->execute($params);
			$data = $stmt->fetchAll();
		}else{
			$query = "select publisher_code,publisher_name,report_term from tbl_partner order by publisher_name asc";
			$stmt = $this->_db->prepare($query);
			$stmt->execute();
			$data = $stmt->fetchAll();
		}
		
		return $data;
	}
	
	//PG수수료 미등록 파트너
	public function getNonPgfeePartner(){
		$query = "select a.publisher_code,a.publisher_name from tbl_partner a where NOT EXISTS (select b.publisher_code from directgames.tbl_pg_fee b where a.publisher_code=b.publisher_code) order by a.publisher_name asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//알림 주소록 미등록 파트너
	public function getNonEmailPartner(){
		$query = "select a.publisher_code,a.publisher_name from tbl_partner a where NOT EXISTS (select b.publisher_code from directgames.tbl_publisher_email b where a.publisher_code=b.publisher_code) order by a.publisher_name asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		return $data;
	}
	
	//파트너 이름조회
	public function getPartnerName($publisher_code){
		$query = "select publisher_name from tbl_partner where publisher_code=:publisher_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			":publisher_code"=>$publisher_code,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		return $data['publisher_name'];
	}
	
	//파트너 현황
	public function getPartnerList($page,$add_where,$orderby,$param,$per_page="50"){
		try{
			$query = "select * from tbl_partner where publisher_code>0 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>$per_page,
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
	
	//파트너 계정 현황
	public function getPartnerMemberList($page,$add_where,$orderby,$param,$per_page="50"){
		try{
			$query = "select a.idx,a.id,a.name,a.flag,a.publisher_code,b.publisher_name from directgames.tbl_admin_publisher a inner join tbl_partner b on a.publisher_code=b.publisher_code where b.publisher_code>0 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>$per_page,
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
	
	//파트너 계정 정보보기
	public function getPartnerMemberView($idx){
		$query = "select * from directgames.tbl_admin_publisher where idx=:idx";
		$stmt = $this->_db->prepare($query);
		$params = array(
			":idx"=>$idx,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		return $data;
	}
	
	//파트너 PG수수료 현황
	public function getPartnerPGFeeList($page,$add_where,$orderby,$param,$per_page="50"){
		try{
			$query = "select a.*,b.publisher_name from directgames.tbl_pg_fee a inner join tbl_partner b on a.publisher_code=b.publisher_code where b.publisher_code>0 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>$per_page,
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
	
	public function getPartnerPGFee($publisher_code){
		$query = "select * from directgames.tbl_pg_fee where publisher_code=:publisher_code";
		$stmt = $this->_db->prepare($query);
		$params = array(
			":publisher_code"=>$publisher_code,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		return $data;
	}
	
	//파트너 알림 주소록 현황
	public function getPartnerNotificationEmail($page,$add_where,$orderby,$param,$per_page="50"){
		try{
			$query = "select a.*,b.publisher_name from directgames.tbl_publisher_email a inner join tbl_partner b on a.publisher_code=b.publisher_code where b.publisher_code>0 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>$per_page,
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
	
	
	//Sales list 동기화
	public function getPartnerSalesList($search_publisher_code,$start_date,$end_date){
		$query = "select ord_ymd,publisher_code,product_code,product_nm,order_srp,count(*)as cc,sum(qty*order_srp)as sum_settleprice
		from tbl_sales_publisher where publisher_code=:publisher_code and ord_ymd between :start_date and :end_date and cdt<>'1970-01-01 09:00:00' group by product_code,order_srp order by count(*) desc ";
		$stmt = $this->_db->prepare($query);
		$params = array(
			":publisher_code"=>$search_publisher_code,
			":start_date"=>$start_date,
			":end_date"=>$end_date,
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		
		return $data;
	}
	
	//Refund list 동기화
	public function getPartnerRefundList($search_publisher_code,$search_date){
		$query = "select ord_ymd,publisher_code,product_code,product_nm,order_srp,count(*)as cc,sum(qty*order_srp)as sum_settleprice
		from tbl_sales_publisher where publisher_code=:publisher_code and date_format(canceldt,'%Y-%m')=:search_date and cdt<>'1970-01-01 09:00:00' and status='9' group by product_code,order_srp order by count(*) desc ";
		$stmt = $this->_db->prepare($query);
		$params = array(
			":publisher_code"=>$search_publisher_code,
			":search_date"=>$search_date,
		);
		$stmt->execute($params);
		$data = $stmt->fetchAll();
		
		return $data;
	}
	
	//리포트 내역
	public function getPartnerReportList($search_publisher_code,$search_report_term,$search_year,$search_month,$is_system){
		if($search_publisher_code){
			if($search_month){
				$query = "select a.idx,a.report_year,a.report_month,b.publisher_name,a.total,a.royalty,a.currency_converter,a.total_sold,a.report_term,
					case when a.status='ready' then '대기'
					when a.status='notice' then '통보'
					when a.status='approval' then '확인'
					when a.status='transfer' then '송금완료'
					end as status
				 from directgames.tbl_report_config a inner join tbl_partner b on a.publisher_code=b.publisher_code
				 where a.report_term=:report_term and a.report_year=:report_year and a.report_month=:report_month  and a.publisher_code=:publisher_code
				 order by a.report_year desc,a.report_month desc,a.reg_date desc";
				$stmt = $this->_db->prepare($query);
				$params = array(
					":report_term"=>$search_report_term,
					":report_year"=>$search_year,
					":report_month"=>$search_month,
					":publisher_code"=>$search_publisher_code,
				);
				$stmt->execute($params);
				$data = $stmt->fetchAll();
			}else{
				$query = "select a.idx,a.report_year,a.report_month,b.publisher_name,a.total,a.royalty,a.currency_converter,a.total_sold,a.report_term,
					case when a.status='ready' then '대기'
					when a.status='notice' then '통보'
					when a.status='approval' then '확인'
					when a.status='transfer' then '송금완료'
					end as status
				 from directgames.tbl_report_config a inner join tbl_partner b on a.publisher_code=b.publisher_code
				 where a.report_term=:report_term and a.report_year=:report_year  and a.publisher_code=:publisher_code
				 order by a.report_year desc,a.report_month desc,a.reg_date desc";
				$stmt = $this->_db->prepare($query);
				$params = array(
					":report_term"=>$search_report_term,
					":report_year"=>$search_year,
					":publisher_code"=>$search_publisher_code,
				);
				$stmt->execute($params);
				$data = $stmt->fetchAll();
			}
		}else{
			if($search_month){
				$query = "select a.idx,a.report_year,a.report_month,b.publisher_name,a.total,a.royalty,a.currency_converter,a.total_sold,a.report_term,
					case when a.status='ready' then '대기'
					when a.status='notice' then '통보'
					when a.status='approval' then '확인'
					when a.status='transfer' then '송금완료'
					end as status
				 from directgames.tbl_report_config a inner join tbl_partner b on a.publisher_code=b.publisher_code
				 where a.report_term=:report_term and a.report_year=:report_year and a.report_month=:report_month 
				 order by a.report_year desc,a.report_month desc,a.reg_date desc";
				$stmt = $this->_db->prepare($query);
				$params = array(
					":report_term"=>$search_report_term,
					":report_year"=>$search_year,
					":report_month"=>$search_month,
				);
				$stmt->execute($params);
				$data = $stmt->fetchAll();
			}else{
				$query = "select a.idx,a.report_year,a.report_month,b.publisher_name,a.total,a.royalty,a.currency_converter,a.total_sold,a.report_term,
					case when a.status='ready' then '대기'
					when a.status='notice' then '통보'
					when a.status='approval' then '확인'
					when a.status='transfer' then '송금완료'
					end as status
				 from directgames.tbl_report_config a inner join tbl_partner b on a.publisher_code=b.publisher_code
				 where a.report_term=:report_term and a.report_year=:report_year 
				 order by a.report_year desc,a.report_month desc,a.reg_date desc";
				$stmt = $this->_db->prepare($query);
				$params = array(
					":report_term"=>$search_report_term,
					":report_year"=>$search_year,
				);
				$stmt->execute($params);
				$data = $stmt->fetchAll();
			}
		}
		return $data;
	}
	
	//리포트 요약정보 조회
	public function getPartnerReportInfo($report_no){
		$query = "select a.publisher_code,a.currency_converter,a.account_fee,a.card_fee,a.mobile_fee,a.report_year,a.report_month,a.royalty,a.royalty_info,b.publisher,a.reg_date,a.update_date,a.status,a.idx,a.notice_date,a.approval_date,a.report_term from directgames.tbl_report_config a inner join directgames.tbl_publisher b on a.publisher_code=b.idx where a.idx=:idx";
		$stmt = $this->_db->prepare($query);
		$params = array(
			":idx"=>$report_no,
		);
		$stmt->execute($params);
		$report_config = $stmt->fetch();
		
		return $report_config;
	}
	
	//리포트 통계정보 조회
	public function getPartnerReportData($report_no){
		$query= "SELECT a.product_code,a.product_nm_en,a.publisher_srp,a.rate,a.publisher_price,a.product_cost,sum(a.gross_units_sold)as gross_units_sold,sum(a.gross_sales_ex_vat)as gross_sales_ex_vat,sum(a.payment_gateway_fee)as payment_gateway_fee,sum(a.net_sales)as net_sales,sum(a.revenue_share)as revenue_share,c.platform,a.payment_gateway FROM directgames.tbl_report a inner join tbl_goods_item b on a.product_code=b.product_code inner join directgames.tbl_platform c on b.product_platform=c.idx WHERE a.parent_idx=:idx group by a.product_code,a.publisher_price,a.payment_gateway order by a.product_nm_en asc,a.publisher_price desc,a.payment_gateway desc";
		$params = array(
			":idx" => $report_no,
		);

		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);

		$report_data = $stmt->fetchAll();
		
		return $report_data;
	}
	
	//리포트 생성
	public function setPartnerReport($search_publisher_code,$search_report_term,$sales_where,$refund_where){
		if($search_publisher_code=="12" || $search_publisher_code=="14" || $search_publisher_code=="86"){
			$query = "select t2.*,g.product_name_en,g.product_srp,g.product_ppr,g.product_rs,t3.platform,g.product_platform from (
								select t.product_code,t.product_nm,t.order_srp,t.publisher_code,t.settlekind,t.price,t.ord_ymd,'2'as status,sum(t.qty)as cc,sum(t.qty*t.order_srp)as sum_settleprice from (
								SELECT ordno,product_code,product_nm,order_srp,publisher_code,price,ord_ymd,'2'as status,qty,
									case when settlekind='SC0010' then 'Credit'
									when settlekind='SC0030' then 'Account'
									when settlekind='SC0040' then 'Account'
									when settlekind='SC0060' then 'Mobile'
									when settlekind='DG0000' then 'Account'
									when settlekind='POINT' then 'Credit'
									when settlekind='SC0000' then 'Account'
									when settlekind='000000' then 'Account'
									when settlekind='PAYCO' then 'Credit'
									when settlekind='samsung' then 'Mobile'
									when settlekind='toss_bank' then 'Account'
									when settlekind='toss_pay' then 'Account'
									end as settlekind
								FROM tbl_sales_publisher
								WHERE publisher_code=:publisher_code $sales_where and cdt<>'1970-01-01 09:00:00' 
								)as t
								group by t.product_code,t.settlekind,t.order_srp

								union all

								select t.product_code,t.product_nm,t.order_srp,t.publisher_code,t.settlekind,t.price,t.ord_ymd,status,sum(t.qty)as cc,
                                sum(t.qty*t.order_srp)as sum_settleprice from (
								SELECT ordno,product_code,product_nm,order_srp,publisher_code,price,ord_ymd,status,-(qty)as qty,
									case when settlekind='SC0010' then 'Credit'
									when settlekind='SC0030' then 'Account'
									when settlekind='SC0040' then 'Account'
									when settlekind='SC0060' then 'Mobile'
									when settlekind='DG0000' then 'Account'
									when settlekind='POINT' then 'Credit'
									when settlekind='SC0000' then 'Account'
									when settlekind='000000' then 'Account'
									when settlekind='PAYCO' then 'Credit'
									when settlekind='samsung' then 'Mobile'
									when settlekind='toss_bank' then 'Account'
									when settlekind='toss_pay' then 'Account'
									end as settlekind
								FROM tbl_sales_publisher
								WHERE publisher_code=:publisher_code $refund_where and status='9' and cdt<>'1970-01-01 09:00:00' 
								)as t
								
								group by t.product_code,t.settlekind,t.order_srp

								) as t2 inner join tbl_goods_item g on t2.product_code=g.product_code inner join directgames.tbl_platform t3 on g.product_platform=t3.idx

								ORDER BY g.product_name_en asc,t2.order_srp desc,t2.settlekind asc,t2.status asc
							
							";
		}else{
			if($search_report_term=="M"){ //월별
				$query = "select t2.*,g.product_name_en,g.product_srp,g.product_ppr,g.product_rs,t3.platform,g.product_platform from (
								select t.product_code,t.product_nm,t.order_srp,t.publisher_code,t.settlekind,t.price,t.ord_ymd,'2'as status,sum(t.qty)as cc,sum(t.qty*t.order_srp)as sum_settleprice from (
								SELECT ordno,product_code,product_nm,order_srp,publisher_code,price,ord_ymd,'2'as status,qty,
									case when settlekind='SC0010' then 'Credit'
									when settlekind='SC0030' then 'Account'
									when settlekind='SC0040' then 'Account'
									when settlekind='SC0060' then 'Mobile'
									when settlekind='DG0000' then 'Account'
									when settlekind='SC0000' then 'Account'
									when settlekind='000000' then 'Account'
									when settlekind='POINT' then 'Credit'
									when settlekind='PAYCO' then 'Credit'
									when settlekind='samsung' then 'Mobile'
									when settlekind='toss_bank' then 'Account'
									when settlekind='toss_pay' then 'Account'
									end as settlekind
								FROM dgkrshop.tbl_sales_publisher
								WHERE publisher_code=:publisher_code $sales_where and cdt<>'1970-01-01 09:00:00' 
								)as t
								group by t.product_code,t.settlekind,t.order_srp

								union all

								select t.product_code,t.product_nm,t.order_srp,t.publisher_code,t.settlekind,t.price,t.ord_ymd,status,sum(t.qty)as cc,
                                sum(t.qty*t.order_srp)as sum_settleprice from (
								SELECT ordno,product_code,product_nm,order_srp,publisher_code,price,ord_ymd,status,-(qty)as qty,
									case when settlekind='SC0010' then 'Credit'
									when settlekind='SC0030' then 'Account'
									when settlekind='SC0040' then 'Account'
									when settlekind='SC0060' then 'Mobile'
									when settlekind='DG0000' then 'Account'
									when settlekind='SC0000' then 'Account'
									when settlekind='000000' then 'Account'
									when settlekind='POINT' then 'Credit'
									when settlekind='PAYCO' then 'Credit'
									when settlekind='samsung' then 'Mobile'
									when settlekind='toss_bank' then 'Account'
									when settlekind='toss_pay' then 'Account'
									end as settlekind
								FROM dgkrshop.tbl_sales_publisher
								WHERE publisher_code=:publisher_code $refund_where and status='9' and cdt<>'1970-01-01 09:00:00' 
								)as t
								
								group by t.product_code,t.settlekind,t.order_srp

								) as t2 inner join dgkrshop.tbl_goods_item g on t2.product_code=g.product_code inner join directgames.tbl_platform t3 on g.product_platform=t3.idx

								ORDER BY g.product_name_en asc,t2.order_srp desc,t2.settlekind asc,t2.status asc
							";
			}else{ //분기별
				$query = "select t2.*,g.product_name_en,g.product_srp,g.product_ppr,g.product_rs,t3.platform,g.product_platform from (
								select t.product_code,t.product_nm,t.order_srp,t.publisher_code,t.settlekind,t.price,t.ord_ymd,'2'as status,sum(t.qty)as cc,sum(t.qty*t.order_srp)as sum_settleprice from (
								SELECT ordno,product_code,product_nm,order_srp,publisher_code,price,ord_ymd,'2'as status,qty,
									case when settlekind='SC0010' then 'Credit'
									when settlekind='SC0030' then 'Account'
									when settlekind='SC0040' then 'Account'
									when settlekind='SC0060' then 'Mobile'
									when settlekind='DG0000' then 'Account'
									when settlekind='SC0000' then 'Account'
									when settlekind='000000' then 'Account'
									when settlekind='POINT' then 'Credit'
									when settlekind='PAYCO' then 'Credit'
									when settlekind='samsung' then 'Mobile'
									when settlekind='toss_bank' then 'Account'
									when settlekind='toss_pay' then 'Account'
									end as settlekind
								FROM dgkrshop.tbl_sales_publisher
								WHERE publisher_code=:publisher_code $sales_where and cdt<>'1970-01-01 09:00:00' 
								)as t
								group by t.product_code,t.settlekind,t.order_srp

								union all

								select t.product_code,t.product_nm,t.order_srp,t.publisher_code,t.settlekind,t.price,t.ord_ymd,status,sum(t.qty)as cc,
                                sum(t.qty*t.order_srp)as sum_settleprice from (
								SELECT ordno,product_code,product_nm,order_srp,publisher_code,price,ord_ymd,status,-(qty)as qty,
									case when settlekind='SC0010' then 'Credit'
									when settlekind='SC0030' then 'Account'
									when settlekind='SC0040' then 'Account'
									when settlekind='SC0060' then 'Mobile'
									when settlekind='DG0000' then 'Account'
									when settlekind='SC0000' then 'Account'
									when settlekind='000000' then 'Account'
									when settlekind='POINT' then 'Credit'
									when settlekind='PAYCO' then 'Credit'
									when settlekind='samsung' then 'Mobile'
									when settlekind='toss_bank' then 'Account'
									when settlekind='toss_pay' then 'Account'
									end as settlekind
								FROM dgkrshop.tbl_sales_publisher
								WHERE publisher_code=:publisher_code $refund_where and status='9' and cdt<>'1970-01-01 09:00:00' 
								)as t
								
								group by t.product_code,t.settlekind,t.order_srp

								) as t2 inner join dgkrshop.tbl_goods_item g on t2.product_code=g.product_code inner join directgames.tbl_platform t3 on g.product_platform=t3.idx

								ORDER BY g.product_name_en asc,t2.order_srp desc,t2.settlekind asc,t2.status asc
							";
			}
			
		}
		
		$stmt = $this->_db->prepare($query);
		$params = array(
			":publisher_code"=>$search_publisher_code
		);
		$stmt->execute($params);
		
		$data = $stmt->fetchAll();
		
		return $data;
		
	}
	
	//클래스 소멸자
	public function __destruct() {
		$this->_db=null;
	}
}
?>