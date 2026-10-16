<?
class China extends Pagination{
	private $_db;
		
	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}
	
	//중국 주문결제 완료 리스트
	public function getChinaInvoiceList($page,$add_where,$orderby,$param){
		try{
			$query = "select ord_ymd,settle_no,name,email,settle_price,cdt,step from directgames.tbl_invoice_order where step='2' and flag='Y' ".$add_where." order by ord_ymd desc";

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
	
	//중국 주문결제 요청 리스트
	public function getChinaInvoiceRequest($page,$add_where,$orderby,$param){
		try{
			$query = "select ord_ymd,settle_no,name,email,settle_price,cdt,step from directgames.tbl_invoice_order where step='1' and (flag='N' or flag is null) ".$add_where." order by ord_ymd desc";

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
	
	//중국 결제자 리스트
	public function getChinaInvoiceMember($page,$add_where,$orderby,$param){
		try{
			$query = "select * from directgames.tbl_invoice_member where flag='Y' ".$add_where." order by idx desc";

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
	
	//중국 결제 상품 리스트
	public function getChinaInvoiceGoods($page,$add_where,$orderby,$param){
		try{
			$query = "select idx,platform,goods_nm,price from directgames.tbl_invoice_goods where idx>'0' ".$add_where." order by platform asc,goods_nm asc";

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
	
	//중국 결제번호 생성
	public function settleNo(){
		$milliseconds = round(microtime(true) * 1000);
		$settle_no = $milliseconds;

		return $settle_no;
	}
	
	// 중국 연도별 매출
	public function getSalesByYear ($target, $year) {
		try {
			$qry = "SELECT
						SUM(tioi.price * tioi.qty) AS amount
					FROM tbl_invoice_order tio
						INNER JOIN tbl_invoice_order_item tioi on tio.settle_no = tioi.settle_no
					WHERE tio.email = '{$target}'
						AND tio.step = 2
						AND tio.flag = 'Y'
						AND tio.ord_ymd BETWEEN '{$year}-01-01' AND '{$year}-12-31'";
			$stmt = $this->_db->prepare($qry);
			$stmt->execute();
			$data = $stmt->fetch(PDO::FETCH_ASSOC);

			return $data;
		} catch (paginationException $e) {
			echo $e;
			exit();
		}
	}

	// 중국 월별 매출
	public function getSalesByMonth ($target, $year, $month, $add_where = '') {
		try {
			$qry = "SELECT
						SUM(tioi.price * tioi.qty) AS amount, SUM(tioi.qty) AS qty
					FROM tbl_invoice_order tio
						INNER JOIN tbl_invoice_order_item tioi on tio.settle_no = tioi.settle_no
					WHERE tio.email = '{$target}'
						AND tio.step = 2
						AND tio.flag = 'Y'
						{$add_where}
						AND tio.ord_ymd BETWEEN '{$year}-{$month}-01' AND '{$year}-{$month}-31'";
			$stmt = $this->_db->prepare($qry);
			$stmt->execute();
			$data = $stmt->fetch(PDO::FETCH_ASSOC);

			return $data;
		} catch (paginationException $e) {
			echo $e;
			exit();
		}
	}

	// 중국 월별 주문 타이틀
	public function getOrderByMonthTitles ($year, $month) {
		try {
			$qry = "SELECT
						tioi.product_code, tioi.product_nm, tioi.platform, tioi.price
					FROM tbl_invoice_order tio
						INNER JOIN tbl_invoice_order_item tioi on tio.settle_no = tioi.settle_no
					WHERE 1
						AND tio.step = 2
						AND tio.flag = 'Y'
						AND tio.ord_ymd BETWEEN '{$year}-{$month}-01' AND '{$year}-{$month}-31'
					GROUP BY tioi.product_nm, tioi.platform, tioi.price
					ORDER BY tioi.product_nm ASC, tioi.platform ASC, tioi.price ASC";
			$stmt = $this->_db->prepare($qry);
			$stmt->execute();
			$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

			return $data;
		} catch (paginationException $e) {
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