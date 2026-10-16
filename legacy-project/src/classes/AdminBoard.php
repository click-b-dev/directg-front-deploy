<?
class AdminBoard extends Pagination{
	private $_db;
	
	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}

	//공지사항 목록
	public function getNoticeList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_notice where 1=1 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'30',
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

	//이벤트 게시판 목록
	public function getEventList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_event where 1=1 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'10',
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

	//자주묻는질문 목록
	public function getFaqList($page,$add_where,$orderby,$param){
		try{
			$query = "select * from tbl_faq where 1=1 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'30',
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
	
	//자료실 파일현황
	public function getDataroomList($page,$add_where,$orderby,$param){
		try{
			$query = "SELECT a.idx,a.file_type,a.file_name,a.file_url,a.thumbnail,a.contents,a.is_encode,a.encode_type,a.deploy_date,a.is_free,a.patch_no,IFNULL(SUM(b.download_count), 0) AS total_download FROM tbl_dataroom a LEFT JOIN tbl_dataroom_log b ON a.idx = b.parent_idx WHERE 1=1 ".$add_where." GROUP BY a.idx ORDER BY ".$orderby;

			$options = array(
				'results_per_page' =>'30',
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

	//자료실 파일현황
	public function getDataroomDownloadList($page,$add_where,$orderby,$param){
		try{
			$query = "SELECT a.idx,a.file_type,a.file_name,a.file_url,a.thumbnail,a.contents,a.is_encode,a.encode_type,a.deploy_date,a.is_free,a.patch_no,b.m_no,b.m_id,b.download_count FROM tbl_dataroom_log b LEFT JOIN tbl_dataroom a ON a.idx = b.parent_idx WHERE 1=1 ".$add_where." ORDER BY ".$orderby;

			$options = array(
				'results_per_page' =>'30',
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
	
	//문의하기 목록
	public function getQnaList($page,$add_where,$orderby,$param){
		try{
			$query = "select *, (SELECT COUNT(1) FROM tbl_file tf WHERE tf.puid = idx AND tf.table_name = 'tbl_qna') as file_cnt from directgames.tbl_qna where 1=1 ".$add_where." order by ".$orderby;

			$options = array(
				'results_per_page' =>'30',
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

	// 설문조사 목록
	public function getSurveyList ($page, $add_where, $orderby, $param) {
		try {
			$qry = "SELECT
						ts.*
					FROM tbl_survey ts
					WHERE 1 {$add_where}
					ORDER BY {$orderby}";
			
			$options = array(
				'results_per_page' => '20',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			
			$pagination = new pagination($page, $qry, $options);

			return $pagination;
		} catch (paginationException $e) {
			echo $e;
			exit();
		}
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
					']') AS question
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

	// 설문조사 참여자수
	public function getSurveyCount ($idx) {
		try {
			$qry = "SELECT
						COUNT(DISTINCT(tsa.m_id)) AS cnt 
					FROM tbl_survey_answer tsa
				WHERE tsa.survey_idx = :idx";
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

	// 설문조사 답변수
	public function getAnswerCount ($question_idx, $answer) {
		try {
			$qry = "SELECT
						COUNT(DISTINCT(tsa.m_id)) AS cnt 
					FROM tbl_survey_answer tsa
					WHERE tsa.question_idx = :question_idx
						AND tsa.answer = :answer";
			$stmt = $this->_db->prepare($qry);
			$params = array(
				":question_idx" => $question_idx,
				":answer" => $answer
			);
			$stmt->execute($params);
			$data = $stmt->fetch(PDO::FETCH_ASSOC);

			return $data;
		} catch (paginationException $e) {
			echo $e;
			exit();
		}
	}

	// 설문조사 etc 답변리스트
	public function getEtcAnswerList ($idx, $page, $param, $excel = false) {
		try {
			$qry = "SELECT
						tsq.question, tsa.m_id, tsa.answer_text, tsa.answer
					FROM tbl_survey_question tsq
						INNER JOIN tbl_survey_answer tsa ON tsq.idx = tsa.question_idx
							AND (tsa.answer = 100 OR tsa.answer IS NULL)
							AND tsa.answer_text != ''
					WHERE tsq.idx = {$idx}
					ORDER BY tsa.reg_dt DESC";
			
			if ($excel) {
				$stmt = $this->_db->prepare($qry);
				$stmt->execute($params);
				$data = $stmt->fetchAll(PDO::FETCH_ASSOC);
				
				return $data;
			}

			$options = array(
				'results_per_page' => '50',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			
			$pagination = new pagination($page, $qry, $options);

			return $pagination;
		} catch (paginationException $e) {
			echo $e;
			exit();
		}
	}

	// 설문조사 유저별 답변리스트
	public function getUserAnswerList ($idx, $page, $param, $add_where = '') {
		try {
			$qry = "SELECT
						tsa.*
					FROM tbl_survey_answer tsa 
					WHERE tsa.survey_idx = {$idx} {$add_where}
					GROUP BY tsa.m_id
					ORDER BY tsa.idx DESC";
			$options = array(
				'results_per_page' => '50',
				'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*'.$param,  
				'db_handle'  => $this->_db  
			);
			
			$pagination = new pagination($page, $qry, $options);

			return $pagination;
		} catch (paginationException $e) {
			echo $e;
			exit();
		}
	}

	// 설문 사용자 답변정보
	public function getUserAnswerInfo ($idx, $m_id, $add_where) {
		try {
			$qry = "SELECT
						GROUP_CONCAT(IF(tsa.answer=100,'기타',tsa.answer)) AS answer, tsa.answer_text
					FROM tbl_survey_answer tsa 
					WHERE tsa.m_id = :m_id 
						AND tsa.question_idx = :question_idx
						{$add_where}
					GROUP BY tsa.question_idx";
			$stmt = $this->_db->prepare($qry);
			$params = array(
				":m_id" => $m_id,
				":question_idx" => $idx
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