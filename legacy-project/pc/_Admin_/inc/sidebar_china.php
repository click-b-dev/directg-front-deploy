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
				<a data-bs-toggle="collapse" href="#sidebarChina" aria-expanded="true" aria-controls="sidebarChina" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>중국 결제 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarChina">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/china/invoice_member.php">중국 결제자 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/china/invoice_goods.php">중국 결제 상품리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/china/invoice_register.php">중국 결제 주문서 작성</a>
						</li>
						<li>
							<a href="<?=$document_root?>/china/invoice_request.php">중국 결제요청 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/china/invoice_list.php">중국 결제완료 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/china/sales_china_year.php">중국 누적매출 현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/china/sales_china_month.php">중국 월별매출 현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/china/order_china_month.php">중국 월별주문 현황</a>
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