<?php
/**
Written on 18/12/2020 by Julius Ekane.
WhatsApp  ~ +971566366808
email ~ ekanejulius7@gmail.com || julius404@outlook.com
website ~ Under construction

You can alter this file as you wish and don't forget to contact me for any clarifications
*/

function get_browser_id(){
	return trim(md5($_SERVER['REMOTE_ADDR'] . $_SERVER['HTTP_USER_AGENT']));
}

function create_cookie($properties){
	foreach ($properties as $key => $value) {
		setcookie($key, $value, time()+ 86400, "/");
	}
}
function destroy_cookie($properties){
	foreach ($properties as $key => $value) {
		setcookie($key, $value, time() + 0, "/");
	}
}

function is_file_($val){
	return ($val != '.' && $val != '..');
}

function dir_files($dir){
	$files = array();
	
	if(is_dir($dir)){
	    $get = scandir($dir);
		$files = array_filter($get, 'is_file_');
		sort($files);
	}
	return $files;
}

//In case a blog has been deleted, this is the message that would appear
function message_for_empty_blog(){
	return "Thig blog does no longer exist <br /> <a href = '../'>Go to blogs home page</a> </br /> <a href = '../../editor.php'> Add a new blog</a> <br />";
}
/*
The smallest length of a bogId should be 4 eg. 0001. 
We produce blogId from it's serial number (sn) which is the PRIMARY KEY and it auto increases on every new blog added.
 The sn starts from 1. Given that the length of the sn is less than 4, 
 the function below is used to prepend the appropriate number of 0s to make the length greater than or equal to 4.
  This is then used as blogId.
*/
function make_longer_id_from($id, $max){
$len = strlen($id);
if ($len >= $max) {
	return $id;
}else{
$number_of_iterations = $max - $len;
$final_id = '';
$start_count = 0;
while($start_count < $number_of_iterations){
	$final_id .= '0';
	$start_count++;
}
$final_id .= $id;
return trim($final_id);
}
}
/*
This function spices the date abit.
If today's date is equal to date in the agument, return 'Today'
else if year and month are the same but today's day is more than agument's day by 1, return 'Yesterday'
else return original date.
Always contact me for more explanations
*/
function good_date($date){
$now = date('d/m/y');
$then = explode(',', $date);
if ($then[0] == $now) {
	return 'Today' . $then[1];
}else {
$then_ = explode('/', $then[0]);
$now_ = explode('/', $now);
if ($then_[2] == $now_[2] &&
    $then_[1] == $now_[1] &&
    $now_[0] - $then_[0] == 1) {
	return 'Yesterday' . $then[1];
}else{
	return $date;
}
}
}
function generate_file_tag_for_post($src, $class, $style){
  $dest = '../images/posts/' . $src;
  $check = explode('.', $src); 
  if (in_array(strtolower($check[count($check) - 1]), ['jpeg', 'jpg', 'png', 'gif'])) {
  	return "<img src = '../" . $dest . "' class = '$class' style = '$style' onclick ='expandMedia(this.src, \"image\")'>";
  }else{
  	return "<video controls class = '$class' style = '$style' onclick ='expandMedia(this.firstChild.src, \"video\")'><source src = '../" . $dest . "' ></source></video>";
  }
}
function reduce_text($text, $max){
	$strlen = strlen($text);
	$text_to_go = '';
	if ($strlen <= $max) {
	 $text_to_go = $text;
	}else{
	  for($i = 0; $i<= 60; $i++){
	  	$text_to_go .= $text[$i];
	  }
	  $text_to_go .= '....';
	}
	return $text_to_go;
}

function post_ok($q){
	return isset($_POST[$q]) && trim($_POST[$q]) != '';
}

function get_ok($q){
	return isset($_GET[$q]) && trim($_GET[$q]) != '';
}
?>