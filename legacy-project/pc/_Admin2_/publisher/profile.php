<?
include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

if($_SESSION['publisher']['admin_id']==""){
	go("./index.php");
}
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>AdminLTE 2 | General Form Elements</title>
  <!-- Tell the browser to be responsive to screen width -->
  <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
  <!-- Bootstrap 3.3.7 -->
  <link rel="stylesheet" href="./bootstrap/css/bootstrap.min.css">
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css">
  <!-- Ionicons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css">
  <!-- Theme style -->
  <link rel="stylesheet" href="./dist/css/AdminLTE.min.css">
  <!-- AdminLTE Skins. Choose a skin from the css/skins
       folder instead of downloading all of them to reduce the load. -->
  <link rel="stylesheet" href="./dist/css/skins/_all-skins.min.css">

  <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
  <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
  <!--[if lt IE 9]>
  <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
  <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
  <![endif]-->

  <!-- Google Font -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700,300italic,400italic,600italic">
</head>
<body class="hold-transition skin-blue sidebar-mini">
<div class="wrapper">

  <? include "inc/top.php"?>
  <!-- Left side column. contains the logo and sidebar -->
  <? include "inc/left.php"?>

  <!-- Content Wrapper. Contains page content -->
  <div class="content-wrapper">
    <!-- Content Header (Page header) -->
    <section class="content-header">
      <h1>
        Profile
        <small></small>
      </h1>
      <ol class="breadcrumb">
        <li><a href="#"><i class="fa fa-dashboard"></i> Home</a></li>
        <li class="active">Profile</li>
      </ol>
    </section>

    <!-- Main content -->
    <section class="content">
      <div class="row">
        <!-- left column -->
        <div class="col-md-6">
				<div class="box box-info">
            <!-- form start -->
            <form class="form-horizontal" name="frm" id="frm" method="post" action="profile_proc.php">
              <div class="box-body">
                <div class="form-group">
                  <label for="inputEmail3" class="col-sm-3 control-label">ID</label>
                  <div class="col-sm-9">
                    <p class="form-control-static"><?=$_SESSION['publisher']['admin_id']?></p>
                  </div>
                </div>
					 <div class="form-group">
                  <label for="inputEmail3" class="col-sm-3 control-label">Name</label>
                  <div class="col-sm-9">
                      <p class="form-control-static"><?=$_SESSION['publisher']['admin_name']?></p>
                  </div>
                </div>
                <div class="form-group">
                  <label for="admin_pwd" class="col-sm-3 control-label">Password</label>

                  <div class="col-sm-9">
                    <input type="password" class="form-control" id="admin_pwd" name="admin_pwd" placeholder="Password">
						  <span id="helpBlock" class="help-block" style="color:#a94442">Password must be at least 6 characters, including lower case letters, numbers and special characters.</span>
                  </div>
                </div>
					 <div class="form-group">
                  <label for="re_admin_pwd" class="col-sm-3 control-label">Retype Password</label>

                  <div class="col-sm-9">
                    <input type="password" class="form-control" id="re_admin_pwd" name="re_admin_pwd" placeholder="Retype Password">
                  </div>
                </div>
              </div>
              <!-- /.box-body -->
              <div class="box-footer">
                <button type="submit" class="btn btn-default">Cancel</button>
                <button type="submit" class="btn btn-info pull-right">Edit</button>
              </div>
              <!-- /.box-footer -->
            </form>
          </div>
          <!-- /.box -->
        </div>
        <!--/.col (left) -->
        <!-- right column -->
        <div class="col-md-6">
          <!-- Horizontal Form -->

        </div>
        <!--/.col (right) -->
      </div>
      <!-- /.row -->
    </section>
    <!-- /.content -->
  </div>
  <!-- /.content-wrapper -->
  <footer class="main-footer">
    <strong>Copyright &copy; 2017 <a href="http://h2interactive.co.kr">H2interactive</a>.</strong> All rights
    reserved.
  </footer>

  <!-- /.control-sidebar -->
  <!-- Add the sidebar's background. This div must be placed
       immediately after the control sidebar -->
  <div class="control-sidebar-bg"></div>
</div>
<!-- ./wrapper -->

<!-- jQuery 3.1.1 -->
<script src="plugins/jQuery/jquery-3.1.1.min.js"></script>
<!-- Bootstrap 3.3.7 -->
<script src="bootstrap/js/bootstrap.min.js"></script>
<!-- FastClick -->
<script src="plugins/fastclick/fastclick.js"></script>
<!-- AdminLTE App -->
<script src="dist/js/adminlte.min.js"></script>
<!-- AdminLTE for demo purposes -->
<script src="dist/js/demo.js"></script>
<script type="text/javascript">
$(document).ready(function(){
	$('#frm').submit(function() { 
		var pwd = $("#admin_pwd").val();
		var num = pwd.search(/[0-9]/g);
		var eng = pwd.search(/[a-z]/ig);
		var spe = pwd.search(/[`~!@#$%^&*|\\\'\_";:\/?]/gi);
		var spa = checkSpace(pwd);
		
		if(pwd.length<6 || pwd.length>12){
			alert("Password must be at least 6 characters, including lower case letters, numbers and special characters.");
			return false;
		}

		if(num < 0 || eng <0 || spe <0){
			alert("Password must be at least 6 characters, including lower case letters, numbers and special characters.");
			return false;
		}

		if(spa){
			alert("Please enter your password without spaces.");
			return false;
		}

		if($("#admin_pwd").val() != $("#re_admin_pwd").val()){
			alert("Password and Retype Password do not match.");
			return false;
		}

		return true;

	});

	function checkSpace(str){
		if(str.search(/\s/)!=-1){
			return true;
		}else{
			return false;
		}
	}

});
</script>
</body>
</html>
