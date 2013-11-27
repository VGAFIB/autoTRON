<html>
<body>

<form action="./upload_file.lol" method="post"
enctype="multipart/form-data">
<label for="file">Filename:</label>
<input type="file" name="file" id="file"><br>
<input type="submit" name="submit" value="Submit">
</form>

<form action="driver.lol" method="post">
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
</select>
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
<input type="submit" value="Submit">
</form>

</body>
</html>
