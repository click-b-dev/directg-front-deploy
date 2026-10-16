<?
class Partner extends Pagination{
	private $_db;
	
	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}
	
	//sales data 동기화
	public function setPartnerSalesDataBatch($publisher_code,$start_date,$end_date){
		$query="call sp_sales_publisher_insert_batch(:publisher_code,:start_date,:end_date,@Result)";
		$params = array(
			":publisher_code" => $publisher_code,
			":start_date" => $start_date,
			":end_date" => $end_date
		);
		
		//print_r($params);

		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}
	
	//refund data 동기화
	
	public function setPartnerRefundDataBatch($publisher_code,$start_date,$end_date){
		$query="call sp_sales_publisher_refund_batch(:publisher_code,:start_date,:end_date,@Result)";
		$params = array(
			":publisher_code"=>$publisher_code,
			":start_date"=>$start_date." 00:00:00",
			":end_date"=>$end_date." 23:59:59"
		);
		
		//print_r($params);

		$stmt = $this->_db->prepare($query);
		$stmt->execute($params);
	}
	
	//클래스 소멸자
	public function __destruct() {
		$this->_db=null;
	}
}
?>