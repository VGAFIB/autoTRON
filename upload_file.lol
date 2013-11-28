<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="shortcut icon" href="../../docs-assets/ico/favicon.png">
    <script type="text/javascript"  src="./Chart.js/Chart.js"></script>
    <title>Autotron</title>
    <script type="text/javascript" src="./dist/js/jquery-1.9.1.js"></script>
    <script type="text/javascript" src="./dist/js/bootstrap.min.js"></script>
    <!-- Bootstrap core CSS -->
    <link href="./dist/css/bootstrap.css" rel="stylesheet">

    <!-- Custom styles for this template -->
    <link href="./dist/css/jumbotron-narrow.css" rel="stylesheet">

    <!-- Just for debugging purposes. Don't actually copy this line! -->
    <!--[if lt IE 9]><script src="../../docs-assets/js/ie8-responsive-file-warning.js"></script><![endif]-->

    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
    <![endif]-->
  </head>
  <a href="https://github.com/VGAFIB/autoTRON"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png" alt="Fork me on GitHub"></a>
  <body>

    <div class="container">
      <div class="header">
        <ul class="nav nav-pills pull-right">
          <li><a href="/tron/">Home</a></li>
        </ul>
        <h3 class="text-muted">Auto-Tron</h3>
      </div>
<?php

function check_AI($a)
{
	return strlen($a) >= 2 && $a[0]	== 'A' && $a[1] == 'I';

}

function is_LIN64_executable($in) {
	$a = 'upload/'.$in.': '.'ELF 64-bit LSB relocatable, x86-64, version 1 (SYSV), not stripped';
	$b = shell_exec('file '.'upload/'.$in);
	$a = trim($a);
        $b = trim($b);
	
	return strcmp($a,$b);
}

	$allowedExts = array("o");
$temp = explode(".", $_FILES["file"]["name"]);
$extension = end($temp);
if (in_array($extension, $allowedExts) && mb_detect_encoding($_FILES["file"]["name"], 'ASCII', true) && strlen($_FILES["file"]["name"]) >= 3 && strlen($_FILES["file"]["name"]) <= 12 && check_AI($_FILES["file"]["name"]) && $_FILES["file"]["size"] <= 2097152)
  {
  if ($_FILES["file"]["error"] > 0)
    {
    echo "Return Code: " . $_FILES["file"]["error"] . "<br>";
    }
  else
    {
    echo "Upload: " . $_FILES["file"]["name"] . "<br>";
    echo "Type: " . $_FILES["file"]["type"] . "<br>";
    echo "Size: " . ($_FILES["file"]["size"] / 1024) . " kB<br>";
    echo "Temp file: " . $_FILES["file"]["tmp_name"] . "<br>";

    if (file_exists("upload/" . $_FILES["file"]["name"]))
     {
	#unlink("upload/" . $_FILES["file"]["name"]);
	echo "FILE ALREADY EXISTS <br>";
     }
else
{
      move_uploaded_file($_FILES["file"]["tmp_name"],
      "upload/" . $_FILES["file"]["name"]);
	if (is_LIN64_executable($_FILES["file"]["name"]) != 0)
	{
		unlink('upload/'.$_FILES["file"]["name"]);
		echo "YOUR FILE IS NOT EXECUTABLE -.-";
	}
      else echo "Stored in: " . "upload/" . $_FILES["file"]["name"];
}
?>
<center>Èxit! redireccionant en 3 segons...</center>
<script type="text/javascript">
setTimeout(function(){window.location.href = "index.lol";}, 3000);
</script>
<?php
  }
}
else
  {
  echo "Invalid file";
  }
?>
<div class="row">
<div class="col-xs-12 text-center" style="margin-top:30px;border-top:1px solid rgb(229, 229, 229);padding-top:20px;">
        <p>&copy; 2013 WTFPL – Do What the Fuck You Want to Public License. | by <a href="https://github.com/Dirbaio">dirbaio</a> - <a href="https://twitter.com/intent/user?screen_name=mllobet">mllobet</a> - <a href="https://github.com/Galbar">alessio</a></p>
</div>
</div>
    </div> <!-- /container -->


    <!-- Bootstrap core JavaScript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
  </body>
</html>
