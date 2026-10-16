<div class="leftside-menu">
	<a href="/_Admin_/main.php" class="logo text-center logo-light">
		<span class="logo-lg">
			<img src="<?=$document_root?>/assets/images/H2_DG_BI_nm_160x37.png" alt="로고" >
		</span>
		<span class="logo-sm">
			<img src="<?=$document_root?>/assets/images/H2_DG_BI_nm_160x37.png" alt="로고" >
		</span>
	</a>

	<div class="h-100" id="leftside-menu-container" data-simplebar>
		<!--- Sidemenu -->
		<ul class="side-nav">
			<li class="side-nav-item">
				<a href="<?=$document_root?>/board/dashboard_board.php" class="side-nav-link">
					<i class="uil uil-dashboard font-22"></i>
					<span>대시보드 </span>
				</a>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarNotice" aria-expanded="false" aria-controls="sidebarNotice" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>공지사항 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarNotice">
					<ul class="side-nav-second-level">
						<!--
						<li>
							<a href="<?=$document_root?>/board/notice_list_dgkr.php">[DGKR] 공지사항 목록</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/board/notice_list.php">공지사항 목록</a>
						</li>
						<li>
							<a href="<?=$document_root?>/board/notice_register.php">공지사항 등록</a>
						</li>
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarFaq" aria-expanded="false" aria-controls="sidebarFaq" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>자주묻는질문 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarFaq">
					<ul class="side-nav-second-level">
					<!--	<li>
							<a href="<?=$document_root?>/board/faq_list_dgkr.php">[DGKR] 자주묻는질문 목록</a>
						</li>-->
						<li>
							<a href="<?=$document_root?>/board/faq_list.php">자주묻는질문 목록</a>
						</li>
						<li>
							<a href="<?=$document_root?>/board/faq_register.php">자주묻는질문 등록</a>
						</li>
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarQna" aria-expanded="false" aria-controls="sidebarQna" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>문의하기 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarQna">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/board/qna_list.php">문의하기 목록</a>
						</li>
                        <li style="display: none;">
                            <a href="<?=$document_root?>/board/qna_view.php">문의하기 상세</a>
                        </li>
                        <li style="display: none;">
                            <a href="<?=$document_root?>/board/qna_register.php">답변 작성</a>
                        </li>
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarDataroom" aria-expanded="false" aria-controls="sidebarDataroom" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>자료실 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarDataroom">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/board/dataroom_file.php">자료실 파일현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/board/dataroom_download.php">자료실 다운로드현황</a>
						</li>
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarDataroom" aria-expanded="false" aria-controls="sidebarDataroom" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>설문조사 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarDataroom">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/board/survey_list.php">설문조사 목록</a>
						</li>
						<li class="d-none">
							<a href="<?=$document_root?>/board/survey_register.php">설문조사 등록</a>
						</li>
						<li class="d-none">
							<a href="<?=$document_root?>/board/survey_result.php">설문조사 결과보기</a>
						</li>
						<li class="d-none">
							<a href="<?=$document_root?>/board/survey_result_etc.php">설문조사 결과보기</a>
						</li>
						<li class="d-none">
							<a href="<?=$document_root?>/board/survey_result_user.php">설문조사 결과보기</a>
						</li>
					</ul>
				</div>
			</li>
			
		</ul>
	</div>
</div>