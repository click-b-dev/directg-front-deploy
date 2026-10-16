<style>
.nav-item{
	width:100px;
}

.fw-500{
	font-weight:500 !important;
}

.nav-pills>li>a{
	font-weight:500;
}


.navbar-custom{
	background-color: #313a46;
	color:#ffffff;
}

.content-page{
	padding-top:88px;
}


</style>
<?php
	if($_SESSION['admin']['admin_level']=="1"){
		$product_viewer=true;
	} else {
		$product_viewer=false;
	}
?>
<div class="navbar-custom px-2">
	<header class="p-0">
		<div class="container-fluid">
			<div class="d-flex flex-wrap align-items-center justify-content-start justify-content-lg-start">
				<ul class="nav nav-pills col-12 col-lg-auto me-lg-auto justify-content-start border border-secondary mh-100" id="topmenu">
				<?php
					if($product_viewer){
				?>
					<li class="nav-item border-end border-secondary">
						<a href="<?=$document_root?>/goods/dashboard_goods.php" class="nav-link px-2 rounded-0 <?=$topmenu['goods'] ?? ''?>">
							<div class="d-flex flex-column text-center">
								<i class="uil-store font-22"></i>
								<span class="">상품</span>
							</div>
						</a>
					</li>

				<?php
					} else {
				?>
					<li class="nav-item border-end border-secondary">
						<a href="<?=$document_root?>/main.php" class="nav-link px-2 rounded-0 <?=$topmenu['dashboard'] ?? ''?>">
							<div class="d-flex flex-column text-center">
								<i class="uil uil-dashboard font-22"></i>
								<span class="">대시보드</span>
							</div>
						</a>
					</li>

					<li class="nav-item border-end border-secondary">
						<a href="<?=$document_root?>/site/banner_list.php" class="nav-link px-2 rounded-0 <?=$topmenu['site'] ?? ''?>">
							<div class="d-flex flex-column text-center">
								<i class="dripicons-gear noti-icon font-22"></i>
								<span class="">사이트</span>
							</div>
						</a>
					</li>

					<li class="nav-item border-end border-secondary">
						<a href="<?=$document_root?>/goods/dashboard_goods.php" class="nav-link px-2 rounded-0 <?=$topmenu['goods'] ?? ''?>">
							<div class="d-flex flex-column text-center">
								<i class="uil-store font-22"></i>
								<span class="">상품</span>
							</div>
						</a>
					</li>
					<li class="nav-item border-end border-secondary">
						<a href="<?=$document_root?>/goods/stock/dashboard_stock.php" class="nav-link px-2 rounded-0 <?=$topmenu['stock'] ?? ''?>">
							<div class="d-flex flex-column text-center">
								<i class="mdi mdi-warehouse font-22"></i>
								<span class="">재고</span>
							</div>
						</a>
					</li>
					<li class="nav-item border-end border-secondary">
						<a href="<?=$document_root?>/member/dashboard_crm.php" class="nav-link px-2 rounded-0 <?=$topmenu['member'] ?? ''?>">
							<div class="d-flex flex-column text-center">
								<i class="dripicons-user font-22"></i>
								<span class="">회원</span>
							</div>
						</a>
					</li>
					<li class="nav-item border-end border-secondary">
						<a href="<?=$document_root?>/order/dashboard_order.php" class="nav-link px-2 rounded-0 <?=$topmenu['order'] ?? ''?>">
							<div class="d-flex flex-column text-center">
								<i class="uil uil-notes font-22"></i>
								<span class="">주문</span>
							</div>
						</a>
					</li>
					<li class="nav-item border-end border-secondary">
						<a href="<?=$document_root?>/promotion/dashboard_promotion.php" class="nav-link px-2 rounded-0 <?=$topmenu['promotion'] ?? ''?>">
							<div class="d-flex flex-column text-center">
								<i class="uil-calender font-22"></i>
								<span class="">프로모션</span>
							</div>
						</a>
					</li>
					
					<li class="nav-item border-end border-secondary">
						<a href="<?=$document_root?>/event/event_board_list.php" class="nav-link px-2 rounded-0 <?=$topmenu['event'] ?? ''?>">
							<div class="d-flex flex-column text-center">
								<i class="uil uil-document font-22"></i>
								<span>이벤트</span>
							</div>
						</a>
					</li>
					
					<li class="nav-item border-end border-secondary">
						<a href="<?=$document_root?>/board/dashboard_board.php" class="nav-link px-2 rounded-0 <?=$topmenu['board'] ?? ''?>">
							<div class="d-flex flex-column text-center">
								<i class="uil uil-document font-22"></i>
								<span>게시판</span>
							</div>
						</a>
					</li>
					<!--
					<li class="nav-item border-end border-secondary">
						<a href="#" class="nav-link px-2 rounded-0 <?=$topmenu['jehu'] ?? ''?>">
							<div class="d-flex flex-column text-center">
								<i class="uil-calender font-22"></i>
								<span class="">제휴</span>
							</div>
						</a>
					</li>
					-->

					<li class="nav-item border-end border-secondary">
						<a href="<?=$document_root?>/statistics/order/order_day_count.php" class="nav-link px-2 rounded-0 <?=$topmenu['statistics'] ?? ''?>">
							<div class="d-flex flex-column text-center">
								<i class="uil-chart font-22"></i>
								<span class="">통계</span>
							</div>
						</a>
					</li>
					<li class="nav-item">
						<a href="<?=$document_root?>/china/invoice_list.php" class="nav-link h-100 px-2 rounded-0 border-end border-secondary <?=$topmenu['china'] ?? ''?>">
							<div class="d-flex flex-column text-center">
								<i class="uil uil-invoice font-22"></i>
								<span class="">중국결제</span>
							</div>
						</a>
					</li>
					<li class="nav-item">
						<a href="<?=$document_root?>/partner/partner_list.php" class="nav-link px-2 rounded-0 <?=$topmenu['partner'] ?? ''?>">
							<div class="d-flex flex-column text-center">
								<i class="dripicons-article font-22"></i>
								<span class="">파트너</span>
							</div>
						</a>
					</li>
				</ul>
				<?php
					}
				?>
				<div class="dropdown text-end">
					<a class="nav-link dropdown-toggle arrow-none me-0" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
						<div class="avatar-md">
							<span class="avatar-title bg-success rounded-circle">
								<?=$_SESSION['admin']["admin_name"]?>
							</span>
						</div>
					</a>
					<div class="dropdown-menu dropdown-menu-end dropdown-menu-animated topbar-dropdown-menu profile-dropdown">
						<!-- item-->
						<a href="javascript:void(0);" class="dropdown-item notify-item">
							<i class="mdi mdi-account-circle me-1"></i>
							<span>프로필 관리</span>
						</a>

						<!-- item-->
						<a href="javascript:void(0);" class="dropdown-item notify-item">
							<i class="mdi mdi-account-edit me-1"></i>
							<span>설정</span>
						</a>

						<!-- item-->
						<a href="javascript:void(0);" class="dropdown-item notify-item">
							<i class="mdi mdi-lifebuoy me-1"></i>
							<span>활동이력</span>
						</a>

						<!-- item-->
						<a href="<?=$document_root?>/logout.php" class="dropdown-item notify-item">
							<i class="mdi mdi-logout me-1"></i>
							<span>로그아웃</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	</header>
</div>