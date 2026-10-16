<aside class="main-sidebar">
    <!-- sidebar: style can be found in sidebar.less -->
    <section class="sidebar">
      <!-- Sidebar user panel -->
      <!--<div class="user-panel" style="height:40px">
        <div class="pull-left info" style="clear:both;padding:0">
          <p style="height:30px;line-height:30px;display:block"><?=$_SESSION['publisher']['admin_name']?></p>
        </div>
      </div>-->
      <!-- sidebar menu: : style can be found in sidebar.less -->
      <ul class="sidebar-menu" data-widget="tree">
        <li class="active">
          <a href="main.php">
            <i class="fa fa-dashboard"></i> <span>Dashboard</span>
          </a>
        </li>
		<li class="">
          <a href="title_stock_list.php">
            <i class="fa fa-dashboard"></i> <span>Stock List</span>
          </a>
        </li>
		  <!--<li class="">
          <a href="exchange_rate.php">
            <i class="fa fa-dashboard"></i> <span>Exchange Rate</span>
          </a>
        </li>-->
        </li>
		  <li class="">
          <a href="title_sales_list.php">
            <i class="fa fa-dashboard"></i> <span>Title Sales List</span>
          </a>
        </li>
		 <li class="">
          <a href="report_list.php">
            <i class="fa fa-dashboard"></i> <span>Report List</span>
          </a>
        </li>
		<? if($_SESSION['publisher']['admin_level']=="99"){ ?>
		<!--
		<li class="">
          <a href="campaings.php">
            <i class="fa fa-dashboard"></i> <span>Campaigns</span>
          </a>
        </li>
		-->
		<? }?>
      </ul>
    </section>
    <!-- /.sidebar -->
  </aside>