<?
class Board extends Pagination{
	private $_db;
	
	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}

	public function getNoticeList($page,$add_where,$orderby,$param){
		try{
			$query = "select idx,notice_type,subject,deploy_date,hit from tbl_notice where is_view='Y' ".$add_where." order by ".$orderby;

			//echo $query;

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

	public function getNoticeView($idx){
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
	
	public function getFaqList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_faq where 1=1 ".$add_where." order by ".$orderby;

			//echo $query;

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
	
	//이벤트 게시판 목록
	
	public function getEvenBoardtList(){
		$query="select subject,contents,start_date,end_date,event_banner,event_link_url,event_link_target from tbl_event where is_view='Y' and start_date<'".time()."' and end_date>'".time()."' order by end_date asc,start_date asc,-(idx) asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		
		return $data;
	}

	// 설문조사 상세
	public function getSurveyInfo ($idx) {
		try {
			$this->_db->query("SET SESSION group_concat_max_len = 1048576");

			$qry = <<<SQL
				SELECT 
					ts.*,
					CONCAT('[', 
						IFNULL(
							GROUP_CONCAT(
								CONCAT(
									'{',
									'"idx":', tsq.idx, ',',
									'"survey_idx":', tsq.survey_idx, ',',
									'"number":', tsq.number, ',',
									'"question":"', REPLACE(tsq.question, '"', '\\\\\\"'), '",',
									'"type":"', tsq.type, '",',
									'"required":"', tsq.required, '",',
									'"etc":', tsq.etc, ',',
									'"nothing":', tsq.nothing, ',',
									'"flag":"', tsq.flag, '",',
									'"item": ', 
									IFNULL(
										(
											SELECT CONCAT('[', GROUP_CONCAT(
												CONCAT(
													'{',
													'"item_idx":', tsqi.idx, ',',
													'"item":"', REPLACE(tsqi.item, '"', '\\\\\\"'), '",',
													'"number":', tsqi.number, ',',
													'"flag":"', tsqi.flag, '",',
													'"nothing":"', tsqi.nothing, '"',
													'}'
												)
												ORDER BY tsqi.`number` ASC
												SEPARATOR ','
											), ']')
											FROM tbl_survey_question_item tsqi
											WHERE tsqi.question_idx = tsq.idx
										),
										'[]'
									),
									'}'
								)
								ORDER BY tsq.`number` ASC
								SEPARATOR ','
							), 
							''
						), 
					']') AS question,
					(SELECT COUNT(DISTINCT(tsa.m_id)) AS cnt FROM tbl_survey_answer tsa WHERE tsa.survey_idx = ts.idx) AS answer_cnt
				FROM tbl_survey ts 
					LEFT JOIN tbl_survey_question tsq ON ts.idx = tsq.survey_idx 
				WHERE ts.idx = :idx
				GROUP BY ts.idx
			SQL;
			$stmt = $this->_db->prepare($qry);
			$params = array(
				":idx" => $idx
			);
			$stmt->execute($params);
			$data = $stmt->fetch(PDO::FETCH_ASSOC);

			return $data;
		} catch (paginationException $e) {
			echo $e;
			exit();
		}
	}

	// 설문 사용자 답변정보
	public function getUserAnswerInfo ($m_id, $idx) {
		try {
			$qry = "SELECT
						tsa.*
					FROM tbl_survey_answer tsa 
					WHERE tsa.m_id = :m_id 
						AND tsa.survey_idx = :survey_idx
					ORDER BY tsa.question_idx ASC";
			$stmt = $this->_db->prepare($qry);
			$params = array(
				":m_id" => $m_id,
				":survey_idx" => $idx
			);
			$stmt->execute($params);
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