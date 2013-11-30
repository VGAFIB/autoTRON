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

  <body>

    <div class="container" id="results-container">
      <div class="header">
        <ul class="nav nav-pills pull-right">
        	<li><a href="/tron/">Home</a></li>
        </ul>
        <h3 class="text-muted">Auto-Tron</h3>
      </div>
<?php
#removes the AI prefix
function clean_AI($a)
{
	$a = substr($a,2);
	$a = substr($a,0,-2);
	return $a;
}

#recursively copies a directory (the directory must exist beforehand)
function recursive_copy($src,$dst) { 
    $dir = opendir($src); 
    @mkdir($dst); 
    while(false !== ( $file = readdir($dir)) ) { 
        if (( $file != '.' ) && ( $file != '..' )) { 
            if ( is_dir($src . '/' . $file) ) { 
                recursive_copy($src . '/' . $file,$dst . '/' . $file); 
            } 
            else { 
                copy($src . '/' . $file,$dst . '/' . $file); 
            } 
        } 
    } 
    closedir($dir); 
} 


$player1 = escapeshellcmd(htmlspecialchars($_POST["player1"]));
$player2 = escapeshellcmd(htmlspecialchars($_POST["player2"]));
$player3 = escapeshellcmd(htmlspecialchars($_POST["player3"]));
$player4 = escapeshellcmd(htmlspecialchars($_POST["player4"]));
$map = escapeshellcmd(htmlspecialchars($_POST["map"]));
$strlength = strlen($player1)
* strlen($player2)
* strlen($player3)
* strlen($player4)
* strlen($map);
if ( $strlength != 0 )
{
#the folder where all the execution will be done
$tmp_folder = uniqid();

shell_exec('mkdir '.$tmp_folder);
recursive_copy('multitron',$tmp_folder);

$lineToReplace = 'Game: BackTrace.o Utils.o Board.o Action.o Player.o Registry.o Game.o Main.o $(PLAYERS_OBJ)';
shell_exec('sed -i \'/'.$lineToReplace.'/ c\ '.$lineToReplace.' '.$player1.' '.$player2.' '.$player3.' '.$player4.'\''.' '.$tmp_folder.'/Makefile_autotron');

copy('upload/'.$player1,$tmp_folder.'/'.$player1);
copy('upload/'.$player2,$tmp_folder.'/'.$player2);
copy('upload/'.$player3,$tmp_folder.'/'.$player3);
copy('upload/'.$player4,$tmp_folder.'/'.$player4);
shell_exec('./make.sh '.$tmp_folder.'/'.' 2>&1');

$out = shell_exec('(cd '.$tmp_folder.'; timeout 10s ../hackme/hackme ./Game '.clean_AI($player1).' '.clean_AI($player2).' '.clean_AI($player3).' '.clean_AI($player4).' -i ../maps/'.$map.' -o '.$tmp_folder.'/error.out)');
echo $out;
$err = "";
#$err = file_get_contents($tmp_folder.'/error.out');
#$err = trim($err);

if($err)
{
	echo "SOMETHING WENT WRONG?";
	echo '<button id="showcerr">Show stderr output</button>';
	echo '<p id="cerr" style="display: none">'.nl2br(htmlspecialchars($err)).'</p>';
	echo '<script> $("#showcerr").click(function() { $("#cerr").toggle(); }); </script>';
}

if ($out != "{data : [")
    file_put_contents('./last_run.json',$out);

if (file_exists('./sent_counter.json'))
{
	$count = json_decode(file_get_contents('./sent_counter.json'));
	$count++;
	file_put_contents('./sent_counter.json',json_encode($count));
}
else
{
	file_put_contents('./sent_counter.json',json_encode($count));
}

# delete the temp folder
shell_exec('rm -rf '.$tmp_folder);
?>
<h1>Results</h1>
<div class="row">
	<div class="col-xs-12">
		<h3>Info</h3>
		<p>Map: <?php echo $map; ?></p>
	</div>
</div>
<script>
	var options = {
		//Boolean - If we want to override with a hard coded scale
		scaleOverride : true,
		
		//** Required if scaleOverride is true **
		//Number - The number of steps in a hard coded scale
		scaleSteps : 6,
		//Number - The value jump in the hard coded scale
		scaleStepWidth : 20000,
		//Number - The scale starting value
		scaleStartValue : 0
	}
	var run_data = <?php echo $out; ?>;
	var charts = new Array();
	for (var i = 0; i < run_data.data.length; i++) {
		var data_obj = run_data.data[i];
		var id_s = "canvas-pos"+i+"-";
		$("#results-container").append("<div class='row'><div class='col-xs-12 text-center'><p class='lead'>Position "+i+"</p></div>"
	+"<div class='col-xs-12 col-sm-6 text-center'><h4>Score</h4><canvas id='"+id_s+"scores' style='height:250;width:100%'></canvas></div>"
		+"<div class='col-xs-12 col-sm-6 text-center'><h4>Number of wins</h4><canvas id='"+id_s+"wins' style='height:250;width:100%'></canvas></div></div>");

		charts[2*i] = new Chart(document.getElementById(id_s+"scores").getContext("2d")).Bar(data_obj.scores, options);
		charts[2*i+1] = new Chart(document.getElementById(id_s+"wins").getContext("2d")).Bar(data_obj.wins);
	}
</script>
<?php
}
else
{
echo "Something went wrong! redirecting...";
?>
<script type="text/javascript">
setTimeout(function(){window.location.href = "index.lol";}, 3000);
</script>
<?php
}
?>
<div class="row">
<div class="col-xs-12 text-center" style="margin-top:30px;border-top:1px solid rgb(229, 229, 229);padding-top:20px;">
        <p>&copy; 2013 WTFPL – Do What the Fuck You Want to Public License. | by <a href="https://github.com/Dirbaio">dirbaio</a> - <a href="https://twitter.com/intent/user?screen_name=mllobet">mllobet</a> - <a href="https://github.com/Galbar">alessio</a></p>
</div>
</div>
    </div> <!-- /container -->
  </body>
</html>
