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

	<div class="h-100" id="leftside-menu-container" data-simplebar>
		<!--- Sidemenu -->
		<ul class="side-nav">
			<li class="side-nav-item">
				<a href="<?=$document_root?>/member/dashboard_crm.php" class="side-nav-link">
					<i class="uil-comments-alt"></i>
					<span>회원 대시보드</span>
				</a>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarMember" aria-expanded="false" aria-controls="sidebarMember" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>회원 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarMember">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/member/member_list.php">회원 리스트</a>
						</li>
                        <li style="display: none;">
                            <a href="<?=$document_root?>/member/member_view.php">회원 상세</a>
                        </li>
						<li>
							<a href="<?=$document_root?>/member/member_list_ready.php">승인대기 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/member/member_naver_list.php">간편로그인 연동현황(NAVER)</a>
						</li>
						<li>
							<a href="<?=$document_root?>/member/member_kakao_list.php">간편로그인 연동현황(KAKAO)</a>
						</li>
						<li>
							<a href="<?=$document_root?>/member/member_payco_list.php">간편로그인 연동현황(PAYCO)</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/member/member_leave_list.php">[x] 탈퇴완료 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/member/member_sleep_ready.php">[x] 휴면회원 예정</a>
						</li>
						<li>
							<a href="<?=$document_root?>/member/member_sleep_list.php">[x] 휴면회원 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/member/member_emoney_list.php">[x] 회원별 보유포인트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/member/member_coupon_list.php">회원별 보유쿠폰 현황</a>
						</li>-->
					<!--	<li>
							<a href="<?=$document_root?>/member/member_black_list.php">[x] 블랙리스트 관리</a>
						</li>-->
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarEmoney" aria-expanded="false" aria-controls="sidebarEmoney" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>포인트 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarEmoney">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/member/member_point_list.php">포인트 지급/차감 내역</a>
						</li>
						<li>
							<a href="<?=$document_root?>/member/member_point_form.php">포인트 지급/차감</a>
						</li>
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarAutoEmail" aria-expanded="false" aria-controls="sidebarAutoEmail" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>자동메일 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarAutoEmail">
					<ul class="side-nav-second-level">
					<!--
						<li>
							<a href="<?=$document_root?>/member/mail_join.php">[x] 회원가입 인증</a>
						</li>
						<li>
							<a href="<?=$document_root?>/member/mail_password_auto.php">[x] 비밀번호찾기 인증</a>
						</li>
						
						<li>
							<a href="<?=$document_root?>/member/mail_member_leave_auto.php">[x] 회원탈퇴</a>
						</li>
						<li>
							<a href="<?=$document_root?>/member/mail_password_reset_auto.php">[x] 비밀번호변경 알림</a>
						</li>
						<li>
							<a href="<?=$document_root?>/member/mail_member_level_auto.php">[x] 회원등급변경 알림</a>
						</li>
						<li>
							<a href="<?=$document_root?>/member/mail_unsubscribe_auto.php">[x] 이메일 수신거부</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/member/directsend_remaining_emoney.php">자동메일 잔액조회</a>
						</li>
						<li>
							<a href="<?=$document_root?>/member/directsend_mail_log.php">자동메일발송 로그</a>
						</li>
					</ul>
				</div>
			</li>
		</ul>

		<!-- End Sidebar -->

		<div class="clearfix"></div>

	</div>
	<!-- Sidebar -left -->

</div>