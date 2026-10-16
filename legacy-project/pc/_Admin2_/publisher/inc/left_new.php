<?
$folder = explode("/",$_SERVER['PHP_SELF']);
$file_name = $folder['3'];


switch($file_name){
	case 'main.php':
		$left_menu1 = "active";
	break;
	case 'title_stock_list.php':
		$left_menu2 = "active";
	break;
	case 'title_sales_list.php':
		$left_menu3 = "active";
	break;
	case 'report_list.php':
		$left_menu4 = "active";
	break;
	case 'campaings.php':
		$left_menu5 = "active";
	break;
	case 't2_short_item_code.php':
		$left_menu6 = "active";
	break;
	case 't2_short_item_code_jp.php':
		$left_menu7 = "active";
	break;
	case 'report_list_jp.php':
		$left_menu8 = "active";
	break;
	case 'title_sales_list_jp.php':
		$left_menu9 = "active";
	break;
	case 'dashboard_jp.php':
		$left_menu10 = "active";
	break;
	case 'title_stock_list_jp.php':
		$left_menu11 = "active";
	break;
}

?>
<aside class="main-sidebar">
	<!-- sidebar: style can be found in sidebar.less -->
	<section class="sidebar">
	<!-- Sidebar user panel -->
		<div class="user-panel">
			<div class="pull-left info">
				<p><?//=$_SESSION['publisher']['admin_name']?></p>
			</div>
			<ul class="sidebar-menu" data-widget="tree">
				<li class="" style='text-indent:10px;color:#ffffff;margin-top:10px'><strong>DG KR</strong></li>
				<li class="<?=$left_menu1?>">
					<a href="main.php">
						<i class="fa fa-dashboard"></i> <span>Dashboard</span>
					</a>
				</li>
				<li class="<?=$left_menu2?>">
					<a href="title_stock_list.php">
						<i class="fa fa-dashboard"></i> <span>Stock List</span>
					</a>
				</li>
				<li class="<?=$left_menu3?>">
					<a href="title_sales_list.php">
						<i class="fa fa-dashboard"></i> <span>Title Sales List</span>
					</a>
				</li>
			<?php
				if($_SESSION['publisher']['publisher']!="273" && $_SESSION['publisher']['publisher']!="229" && $_SESSION['publisher']['publisher']!="22"){
			?>
				<li class="<?=$left_menu4?>">
					<a href="report_list.php">
						<i class="fa fa-dashboard"></i> <span>Report List</span>
					</a>
				</li>
			<?php
			}
			?>
			<?php
				if($_SESSION['publisher']['publisher']=="12" || $_SESSION['publisher']['publisher']=="14" || $_SESSION['publisher']['publisher']=="321" || $_SESSION['publisher']['admin_level']=="99"){
			?>
				<li class="<?=$left_menu6?>">
					<a href="t2_short_item_code.php">
						<i class="fa fa-dashboard"></i> <span>T2 Short item code</span>
					</a>
				</li>
			<?
				}
				if($_SESSION['publisher']['jp']=="Y"|| $_SESSION['publisher']['admin_level']=="99"){
			?>
				<li class="" style='text-indent:10px;color:#ffffff;margin-top:10px'><strong>DG JP</strong></li>

				<li class="<?=$left_menu10?>">
					<a href="dashboard_jp.php">
						<i class="fa fa-dashboard"></i> <span>Dashboard</span>
					</a>
				</li>
				<li class="<?=$left_menu11?>">
					<a href="title_stock_list_jp.php">
						<i class="fa fa-dashboard"></i> <span>Stock List</span>
					</a>
				</li>

				<li class="<?=$left_menu9?>">
					<a href="title_sales_list_jp.php">
						<i class="fa fa-dashboard"></i> <span>Title Sales List</span>
					</a>
				</li>

			<?php
				$jp_report_publisher=array("12","14","317","43","94","70","112","136");
				if(in_array($_SESSION['publisher']['publisher'],$jp_report_publisher) || $_SESSION['publisher']['admin_level']=="99"){
			?>
				<li class="<?=$left_menu8?>">
					<a href="report_list_jp.php">
						<i class="fa fa-dashboard"></i> <span>Report List</span>
					</a>
				</li>
			<?php
				}
				if($_SESSION['publisher']['publisher']=="12" || $_SESSION['publisher']['publisher']=="14" || $_SESSION['publisher']['publisher']=="317" || $_SESSION['publisher']['admin_level']=="99"){
			?>
				<li class="<?=$left_menu7?>">
					<a href="t2_short_item_code_jp.php">
						<i class="fa fa-dashboard"></i> <span>T2 Short item code</span>
					</a>
				</li>
			<?
					}
				}
			$console_report_publisher=array("136");
			if(in_array($_SESSION['publisher']['publisher'],$console_report_publisher) || $_SESSION['publisher']['admin_level']=="99"){
			?>
				<li class="" style='text-indent:10px;color:#ffffff;margin-top:10px'><strong>Console</strong></li>
				<li class="<?=$left_menu8?>">
					<a href="http://report.h2int.com/login/login.html" target="_blank">
						<i class="fa fa-dashboard"></i> <span>Console</span>
					</a>
				</li>
			<?php
				}
			?>
			</ul>
		</div>
	</section>
	<!-- /.sidebar -->
</aside>