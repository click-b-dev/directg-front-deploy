<div class="leftside-menu">
	<!-- LOGO -->
	<a href="/_Admin_/main.php" class="logo text-center logo-light">
		<span class="logo-lg">
			<img src="<?=$document_root?>/assets/images/H2_DG_BI_nm_160x37.png" alt="로고" >
		</span>
		<span class="logo-sm">
			<img src="<?=$document_root?>/assets/images/H2_DG_BI_nm_160x37.png" alt="로고" >
		</span>
	</a>

	<!-- LOGO -->
	<a href="index.html" class="logo text-center logo-dark">
		<span class="logo-lg">
			<img src="../assets/images/logo-dark.png" alt="" height="16">
		</span>
		<span class="logo-sm">
			<img src="../assets/images/logo_sm_dark.png" alt="" height="16">
		</span>
	</a>

	<div class="h-100" id="leftside-menu-container" data-simplebar>
		<!--- Sidemenu -->
		<ul class="side-nav">
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarEvent" aria-expanded="false" aria-controls="sidebarEvent" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>이벤트 게시판 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarEvent">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/event/event_board_list.php">이벤트 게시판 목록</a>
						</li>
						<li>
							<a href="<?=$document_root?>/event/event_board_register.php">이벤트 게시판 작성</a>
						</li>
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarEventLottery" aria-expanded="false" aria-controls="sidebarEventLottery" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>이벤트 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarEventLottery">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/event/event_lottery_list.php">이벤트 현황</a>
						</li>
                        <li style="display:none;">
							<a href="<?=$document_root?>/event/event_lottery_success.php">이벤트 현황 상세</a>
						</li>
						<li>
							<a href="<?=$document_root?>/event/event_list_202505.php">2025 가정의달 이벤트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/event/event_list_20250626.php">2025 여름 프로모션 이벤트</a>
						</li>
						<!--<li>
							<a href="<?=$document_root?>/event/event_lottery_register.php">추첨 이벤트 등록</a>
						</li>
						-->
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarEventOrder" aria-expanded="false" aria-controls="sidebarEventOrder" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>구매 이벤트 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarEventOrder">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/event/event_fm26.php">풋볼 매니저 26 예약 구매</a>
						</li>
						<!--<li>
							<a href="<?=$document_root?>/event/event_lottery_register.php">추첨 이벤트 등록</a>
						</li>
						-->
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarEventGift" aria-expanded="false" aria-controls="sidebarEventGift" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>사은품 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarEventGift">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/event/event_gift_list.php">사은품 이벤트 진행이력</a>
						</li>
                        <li style="display:none;">
							<a href="<?=$document_root?>/event/event_gift_member.php">사은품 이벤트 진행이력 상세</a>
						</li>
						<li>
							<a href="<?=$document_root?>/event/event_gift_request.php">사은품 발송 현황</a>
						</li>
						<!-- <li>
							<a href="<?=$document_root?>/event/event_gift_end.php">[X]사은품 발송완료 현황</a>
						</li> -->
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarEventPoint" aria-expanded="false" aria-controls="sidebarEventPoint" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>추가 포인트 지급 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarEventPoint">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/event/event_point_list.php">포인트 지급 이벤트</a>
						</li>
					</ul>
				</div>
			</li>
		</ul>
	</div>
</div>