<?php
/**
 * permission to add and/or remove stuffs granted
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

/**
* Longer Ids are produced from serial number (sn) which is the PRIMARY KEY and it auto increases on every new record added.
* The sn starts from 1. Given that the length of the sn is less than 4, 
* the function below is used to prepend the appropriate number of 0s to make the length greater than or equal to 4.
* This is a better.
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

function post_ok($q){
	return isset($_POST[$q]) && trim($_POST[$q]) != '';
}

function get_ok($q){
	return isset($_GET[$q]) && trim($_GET[$q]) != '';
}
?>