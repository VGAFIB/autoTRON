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

    <div class="container">
      <div class="header">
        <ul class="nav nav-pills pull-right">
        </ul>
        <h3 class="text-muted">Auto-Tron</h3>
      </div>
	<center> <h1>Improve your AI</h1>
	<p class="lead">Simulate hundreds of games against other AIs. Obtain statistics on your games. Improve your code. Win the contest.</p></center>
      <div class="container">
<div class="well row text-center">
<div class="col-xs-12 col-md-6">
	<form class="form" role="form" action="./upload_file.lol" method="post"
enctype="multipart/form-data">
<label for="file">Upload your AI*.o (64 bit Linux)</label>
<input type="file" name="file" id="file"><br><br><br>
<center><input class="btn btn-success btn-lg" type="submit" name="submit" value="Submit"></center>
</form>
</div>
<div class="col-xs-12 col-md-6">
	<form action="driver.lol" method="post">
<label>Pick players and map</label><br>
<select name="player1">
<?php
        $FILES = scandir("upload");
        foreach ($FILES as $file)
        {
                $file = htmlspecialchars($file);
                if ($file != "." && $file != "..")
                {
                        echo "<option value='$file'>$file</option>";
                }
        }
?>
</select>
<select name="player2">
<?php
        $FILES = scandir("upload");
        foreach ($FILES as $file)
        {
                $file = htmlspecialchars($file);
                if ($file != "." && $file != "..")
                {
                        echo "<option value='$file'>$file</option>";
                }
        }
?>
</select><br>
<select name="player3">
<?php
        $FILES = scandir("upload");
        foreach ($FILES as $file)
        {
                $file = htmlspecialchars($file);
                if ($file != "." && $file != "..")
                {
                        echo "<option value='$file'>$file</option>";
                }
        }
?>
</select>
<select name="player4">
<?php
        $FILES = scandir("upload");
        foreach ($FILES as $file)
        {
                $file = htmlspecialchars($file);
                if ($file != "." && $file != "..")
                {
                        echo "<option value='$file'>$file</option>";
                }
        }
?>
</select><br>
<select name="map">
<?php
        $FILES = scandir("maps");
        foreach ($FILES as $file)
        {
                $file = htmlspecialchars($file);
                if ($file != "." && $file != "..")
                {
                        echo "<option value='$file'>$file</option>";
                }
        }
?>
</select>
<br><br>
<center><input class="btn btn-success btn-lg"  type="submit" value="Submit"></center>
</form>
    </div>
</div>
	 </div>
	
	<div class="container" id="results-container"> 
        <p class="lead">Last game played</p>
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
    var run_data = <?php readfile ("last_run.json"); ?>;
    var charts = new Array();
    var data_obj = run_data.data[0];
    var id_s = "canvas-pos0-";
    $("#results-container").append("<div class='col-xs-12 col-sm-6'><canvas id='"+id_s+"scores' style='height:250;width:100%'></canvas></div>"
    +"<div class='col-xs-12 col-sm-6'><canvas id='"+id_s+"wins' style='height:250;width:100%'></canvas></div></div>");

    charts[0] = new Chart(document.getElementById(id_s+"scores").getContext("2d")).Bar(data_obj.scores, options);
    charts[1] = new Chart(document.getElementById(id_s+"wins").getContext("2d")).Bar(data_obj.wins);
    
    </script>
        <p>&copy; 2013 WTFPL – Do What the Fuck You Want to Public License. | by dirbaio -  mllobet - alessio</p>
      </div>

    </div> <!-- /container -->


    <!-- Bootstrap core JavaScript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
  </body>
</html>
