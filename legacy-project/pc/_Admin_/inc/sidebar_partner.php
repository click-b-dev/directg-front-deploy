<link rel="stylesheet" href="https://icons.getbootstrap.kr/assets/font/bootstrap-icons.css">
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
				<a data-bs-toggle="collapse" href="#sidebarPartner" aria-expanded="true" aria-controls="sidebarPartner" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>파트너 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarPartner">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/partner/partner_code.php">파트너 현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/partner/partner_list.php">파트너 계정 관리</a>
						</li>
						<li>
							<a href="<?=$document_root?>/partner/partner_pg_fee.php">파트너 PG수수료 관리</a>
						</li>
						<li>
							<a href="<?=$document_root?>/partner/partner_email.php">파트너 알림 주소록 관리</a>
						</li>
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarPartnerReport" aria-expanded="true" aria-controls="sidebarPartnerReport" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>리포트 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarPartnerReport">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/partner/sales_list.php">Sales list 동기화</a>
						</li>
						<li>
							<a href="<?=$document_root?>/partner/refund_list.php">Refund list 동기화</a>
						</li>
						<li>
							<a href="<?=$document_root?>/partner/report_register.php">리포트 생성</a>
						</li>
						<li>
							<a href="<?=$document_root?>/partner/report_list.php">리포트 내역</a>
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