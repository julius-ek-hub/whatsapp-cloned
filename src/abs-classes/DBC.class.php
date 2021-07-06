
<?php

/**
 *  
 */
class MySQLException extends Exception{}
class PreparedStatementException extends MySQLException{}
class DBC extends PreparedStatementException{ 
	protected $dbc;	
function __construct($CONN){
	$host = $CONN['HOST'];
	$dbuser = $CONN['DBUSER'];
	$dbname = $CONN['DBNAME'];
	$password = $CONN['PASSWORD'];
	$this->dbc = new mysqli($host, $dbuser, $password);
	$this->dbc->query("CREATE DATABASE IF NOT EXISTS $dbname");
	$this->dbc = new mysqli($host, $dbuser, $password, $dbname);
}
function exec($query){
	$sql = $this->dbc->query($query);
	if ($sql)
		return $sql;
	else
		throw new MySQLException();
}
function prepare($query){
	$stmt = $this->dbc->prepare($query);
	if ($stmt)
		return $stmt;
	else
		throw new PreparedStatementException();
}
function escape_string($str){
	return $this->dbc->real_escape_string($str);
}
function validate($input){
	return $this->escape_string(htmlspecialchars($input));
}

function get_last_id($table){
    try{
        return intval($this->exec("SELECT MAX(sn) FROM $table")->fetch_assoc()['MAX(sn)']);
    }catch(MYSQLException $e){
        return 0;
    }
 }

 function name_exists($table, $cell, $value){
  return $this->exec("SELECT $cell FROM $table WHERE $cell = '$value'")->num_rows >= 1;
 }
function get_connection(){
	return $this->dbc;
}

  function close(){
	$this->dbc->close();
}
function insert_statement($obj, $table){
   $to_array = (array)$obj;
   $cells = array_keys($to_array);
   $values = array_values($to_array);
   if (!function_exists('generate_values')) {
	function generate_values($val){
		return '\'' .$val . '\'';
	   }
  }
   $values = array_map('generate_values', $values);
   return ("INSERT INTO $table (" . implode(', ', $cells) . ") VALUES(" . implode(', ', $values) . ")");
}
function validate_all($obj){
	foreach ($obj as $key => $value) {
	   $obj->$key = $this->validate($value);
	}
  return $obj;
}

 function add_subscriber($em) {
	 try {
	$stmt = $this->prepare("SELECT sn FROM subscribers WHERE email = ?");
	$stmt->bind_param('s', $em); 
	$stmt->execute();

	$sql = $stmt->get_result();   
	if($sql->num_rows == 0){
	$stmt2 = $this->prepare("INSERT INTO subscribers (email) VALUES(?)");
	$stmt2->bind_param('s', $em);
	$stmt2->execute();
    $stmt2->close();
	return 1;
	 }else {
		return 2;
	 }
	 $stmt->close();
	 } catch (PreparedStatementException  $p) {
		    $this->exec("CREATE TABLE subscribers(
			sn int(10) NOT NULL AUTO_INCREMENT,
			email varchar(100) NOT NULL,
			PRIMARY KEY(sn)
		)");
		return $this->add_subscriber($em);
	 }

}

function rate_project($proj){
	$tab = $proj->table;
	$user = $proj->user;
	$rate = $proj->rate;
	$dr = $proj->date_rated;
	$cm = $this->validate($proj->comment);
	 try {
	$stmt = $this->prepare("SELECT rate FROM $tab WHERE user = ?");
	$stmt->bind_param('s', $user); 
	$stmt->execute();

	$sql = $stmt->get_result();   
	if($sql->num_rows == 0){
	$stmt = $this->prepare("INSERT INTO $tab (user, rate, comment, date_rated) VALUES(?,?,?,?)");
	$stmt->bind_param('siss', $user, $rate, $cm, $dr);
	$stmt->execute();
    $stmt->close();
	return 1;
	 }else {
		$stmt = $this->prepare("UPDATE $tab SET rate = ?, comment = ?, date_rated = ? WHERE user = ?");
		$stmt->bind_param('isss', $rate, $cm, $dr, $user);
		$stmt->execute();
		$stmt->close();
		return 1;
	 }
	 $stmt->close();
	 } catch (PreparedStatementException  $p) {
		    $this->exec("CREATE TABLE $tab(
			user varchar(10) NOT NULL,
			rate varchar(10) NOT NULL,
			comment text NOT NULL,
			date_rated varchar(50) NOT NULL
		)");
		return $this->rate_project($proj);
	 }
}
 function get_ratings($pro_id){
	 $ratings = array('total' => 0, 'average' => 0);
	 $tab = $pro_id . 'xratings';
	 $sum = 0;
	 try {
		$result = $this->exec("SELECT * FROM $tab")->fetch_all(MYSQLI_ASSOC);
		if(count($result) > 0){
			foreach ($result as $key => $value) {
				$sum += $value['rate'];
				$ratings['total']++;
		   }
		   $ratings['average'] = round($sum/$ratings['total']);
		}
	 } catch (MYSQLException $e) {}
	 return $ratings;
 }

}

?>