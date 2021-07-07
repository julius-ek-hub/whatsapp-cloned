<?php

date_default_timezone_set('Asia/Dubai');

require 'Config.php';
require 'functions.php';
require 'abs-classes/DBC.class.php';
require 'abs-classes/File.class.php';
require 'rel-classes/db.class.php';
require 'rel-classes/file.class.php';
$db = new WC(CONN);
if(isset($_GET['countries'])){
	$result = array();
	$sql = $db->exec("SELECT * FROM countries");
	while($row = $sql->fetch_assoc()){
		$result[$row['iso']] = $row;
	}
	echo json_encode($result);
}elseif(isset($_POST['chat_ids'])){
	$id = $_POST['chat_ids'];
	echo json_encode($db->chats_for($id));
}
elseif (isset($_POST['chat_info']) && isset($_POST['visitor_id'])) {
	$v_id = $_POST['visitor_id'];
	$c_id = $_POST['chat_info'];
	echo $db->chats_info($c_id, $v_id, $_POST['date']);
}
elseif(isset($_POST['bring_messages_for']) && isset($_POST['date']) && isset($_POST['otherInfo'])){
	$chat_id = $_POST['bring_messages_for'];
	$now = $_POST['date'];
	$visitor_id = $_POST['visitor'];
	$oi = json_decode($_POST['otherInfo']);
	$max = $oi->max;
	$max = trim($max) == '' ? $db->get_last_id($chat_id) : $max;
	$min =  trim($oi->refreshing) == '' ? $max - 9 : $oi->refreshing;
    $result = array();
	try {
	 $messages = $db->exec("SELECT * FROM $chat_id  WHERE sn <= $max AND sn >= $min")->fetch_all(MYSQLI_ASSOC);
	foreach ($messages as $key => $message) {
		$userid = $message['senderId'];
		$mid = $message['messageId'];
		$rt = $message['replyingTo'];
		$message['senderInfo'] = $db->exec("SELECT id, username, dp, tel, country, name_col FROM visitors WHERE id = '$userid'")->fetch_assoc();
		if($rt != '0'){
			$message['replyingTo'] = $db->exec("SELECT * FROM $chat_id  WHERE messageId = '$rt'")->fetch_assoc();
			$senderIdR = $message['replyingTo']['senderId'];
			$message['replyingTo']['senderInfo'] = $db->exec("SELECT id, username, dp, tel, country, name_col FROM visitors WHERE id = '$senderIdR'")->fetch_assoc();
		}
		if(explode('_', $chat_id)[0] == 'chat' && $message['dateReceived'] == '0' && $userid != $visitor_id){
			$db->exec("UPDATE $chat_id SET dateReceived = '$now' WHERE messageId = '$mid'");
		}else if(explode('_', $chat_id)[0] == 'group'){
			$message['deleteInfo'] = json_encode(array('deleted' => $db->group_delete($mid, $userid)));
			if($userid != $visitor_id){
			  $db->group_message_update($chat_id, $visitor_id, $mid, 'received', $now);
		}
		}
		$result[] = $message;
	}
	} catch (MYSQLException $e) {}
	echo json_encode($result);
}

elseif (isset($_POST['user_info']) && isset($_POST['invitation_code'])) {
	$id = $_POST['user_info'];
	$ls = $_POST['date'];
	try {
	$ik = $_POST['invitation_code'];
	if($ik !== 0){
		$db->create_chat($ik, $id);
		
	}
	$db->exec("UPDATE visitors SET lastseen = '$ls' WHERE id = '$id'");
	$userInfo = $db->exec("SELECT id, username, dp, tel, name_col, email, email_confirmed, mail_confirmation_code, about, country, account_type, read_receipt, public_last_seen, date_joined, notification_sound, other_sounds, enter_button, wallpaper, invitation_key, removed FROM visitors WHERE id = '$id'")->fetch_assoc();
	$userInfo['blocked_chats'] = $db->blocked_or_muted_chats('block', $id);
	$userInfo['muted_chats'] = $db->blocked_or_muted_chats('mute', $id);
	$userInfo['blocked_by'] = $db->blocked_or_muted_chats('blocked_by', $id);

	$dir_wp = '../visitors/' . $id . '/wallpapers';
	$dir_dp = '../visitors/' . $id . '/dp';
	$userInfo['wallpapers'] = dir_files($dir_wp);
	$userInfo['dps'] = dir_files($dir_dp);
	echo json_encode($userInfo);
	} catch (MYSQLException $e) {
		echo 0;
	}
	
}
elseif (isset($_POST['login'])){
	$details = json_decode($_POST['login']);
	$res = $db->exec("SELECT id, removed, pin FROM visitors WHERE  tel = '$details->tel'");
	
	if($res->num_rows == 1){

		$rw = $res->fetch_assoc();
		$id =  $rw['id'];
		if($rw['removed'] == '0' && password_verify($details->pin, $rw['pin'])){
		create_cookie(array('uid' => $id));
		echo 1;
	}else{
		echo 0;
		}
	}else{
		echo 0;
	}
}
elseif(isset($_POST['logout'])){
	destroy_cookie(array(
		'uid' => $_POST['logout'],
		'informed_ed' => false,
		'em_1'  => false,
		'em_2' => false
	));
	echo 1;
}
elseif (isset($_POST['user_exists'])){
	$tel = $_POST['user_exists'];
	try{
	$res = $db->exec("SELECT id, username, dp, tel, country, removed FROM visitors WHERE tel = '$tel' OR email = '$tel'");
	if($res->num_rows == 1){
		echo json_encode($res->fetch_assoc());
	}else{
		echo 0;
	}
  }catch(MYSQLException $e){
   echo 0;
  }
}

elseif (isset($_POST['verified_email'])) {
	$tel = $_POST['verified_email'];
	$res = $db->exec("SELECT email FROM visitors WHERE tel = '$tel' AND email != '' AND email_confirmed = 1");
	if($res->num_rows == 1)
		echo $res->fetch_assoc()['email'];
	else 
	    echo 0;
}

elseif (isset($_POST['reset_pin'])) {
	$det = json_decode($_POST['reset_pin']);
	$pin = password_hash($det->pin, PASSWORD_DEFAULT);
	$res = $db->exec("UPDATE visitors SET pin = '$pin' WHERE email = '$det->email'");
	echo 1;
}

elseif (isset($_GET['new_visitor_dp']) && isset($_FILES['file'])){
	$_FILES['file']['name'] = $_GET['new_visitor_dp'];
	$f = new File($_FILES['file']);
	$user_id = make_longer_id_from($db->get_last_id('visitors') + 1, 4);
	echo json_encode(array('dp' => $f->save_to('../visitors/' . $user_id . '/dp'),
	'id' => $user_id, 'name' => $_FILES['file']['name']));
}

elseif (isset($_GET['update_dp']) && isset($_GET['user_id']) && isset($_FILES['file'])){
	$_FILES['file']['name'] = $_GET['update_dp'];
	$user_id = $_GET['user_id'];
	$f = new File($_FILES['file']);
	$file = $f->save_to('../visitors/' . $user_id . '/dp');
	$db->exec("UPDATE visitors SET dp = '$file' WHERE id = '$user_id'");
	echo $file;
}

elseif (isset($_POST['delete_dp'])){
	$det = json_decode($_POST['delete_dp']);
	foreach ($det->dps as $key => $value) {
		unlink('../visitors/' . $det->user . '/dp/' . $value);
	}
	if($det->reset == 1){
	   $db->exec("UPDATE visitors SET dp = '' WHERE id = '$det->user'");
	}
	echo 1;
}

elseif (isset($_POST['delete_wp'])){
	$det = json_decode($_POST['delete_wp']);
	foreach ($det->dps as $key => $value) {
		unlink('../visitors/' . $det->user . '/wallpapers/' . $value);
	}
	if($det->reset == 1){
	   $db->exec("UPDATE visitors SET wallpaper = 'default' WHERE id = '$det->user'");
	}
	echo 1;
}

elseif(isset($_POST['new_visitor']) && isset($_POST['invitation_code'])){
	$details = json_decode($_POST['new_visitor']);
	$details->pin = password_hash($details->pin, PASSWORD_DEFAULT);
	$details->id = $details->id != null ? $details->id :  make_longer_id_from($db->get_last_id('visitors') + 1, 4);
	$details->invitation_key = md5($details->id . $details->pin);
	$db->add_visitor($details);
	create_cookie(array('uid' => $details->id));
	
	$ik = $_POST['invitation_code'];
	if($ik != 0){
			$db->create_chat($ik, $details->id);	
	}
	try {
		$db->create_table('all_chats', 'all_chats');
	} catch (\Throwable $th) {
		// all_chats already created
	}

	if($details->id != '0001'){
		$db->add_chat('chat_0001x' . $details->id);
	}
	echo json_encode($details);
}
elseif(isset($_POST['new_message'])){
	$details = json_decode($_POST['new_message']);
	$file = 0;
	if(($details->fileInfo != '0' || $details->fileInfo != 0) && $details->forwarded > 0 && $details->senderInfo->id != $details->senderId){
	   $file = $details->fileInfo;
	   $folder;
	   switch ($file->type) {
		   case 'picture':
			   $folder = 'Pictures';
			   break;
		   case 'record':
			   $folder = 'Recordings';
			   break;
		   default:
			   $folder = 'Documents';
	   }
	   $from = '../visitors/' . $details->senderInfo->id . '/' . $folder;
	   $to = '../visitors/' . $details->senderId . '/' . $folder;
	   $creatd = true;
	   if (!file_exists($to)) {
		   $creatd = @mkdir($to, 0777, true);
	   }
	   if (!file_exists($to . '/' . $file->url)) {
		  copy($from . '/' . $file->url, $to . '/' . $file->url);
	   }
	}
	echo json_encode($db->send_message($details));

}
elseif(isset($_FILES['file']) && isset($_GET['message_file'])){
	
	$mf = json_decode($_GET['message_file']);
	$_FILES['file']['name'] = $mf->name;
	$f = new File($_FILES['file']);
	$folder = 'Documents';
	switch ($mf->type) {
		case 'video':
			$folder = 'Videos';
			break;
		
		case 'audio':
			$folder = 'Music';
			break;
		case 'picture':
			$folder = 'Pictures';
			break;
		case 'record':
			$folder = 'Recordings';
			break;
			default:
			$folder = 'Documents';
	}
	echo $f->save_to('../visitors/' . $mf->visitor. '/' . $folder);
}
elseif(isset($_POST['check_new_message']) && isset($_POST['date'])){
	$opened = json_decode($_POST['currently_opened_chat']);
	$visitor_id = $_POST['check_new_message'];
	$date = $_POST['date'];
	$chat_ids = $db->chats_for($visitor_id);
	$result = array();
	
	$count = 0;
	if(count($chat_ids) > 0){
		foreach($chat_ids as $key => $value){
			try {
			$chat = $value['chat_id'];
			$from = $db->get_last_id($chat) - 10;
			$ch = explode('_', $chat)[0] == 'chat';
			$messages = array();
			if($ch){
			  $messages = $db->exec("SELECT * FROM $chat WHERE senderId != '$visitor_id' AND dateReceived = '0' AND sn >= $from")->fetch_all(MYSQLI_ASSOC);
			}else{
               $sql = $db->exec("SELECT * FROM $chat WHERE senderId != '$visitor_id' AND sn >= $from");

			   if($sql->num_rows > 0){
				   while ($row = $sql->fetch_assoc()) {
					   $mid = $row['messageId'];

					   if(!in_array($visitor_id, $db->seen_or_received_gp($mid)['received'])){
                          $messages[]  = $row;
						  $db->group_message_update($chat, $visitor_id, $mid, 'received', $date);
					   }
				   }
			   }
			}
			if(sizeof($messages) > 0){
			foreach ($messages as $key => $value) {
				$senderId = $value['senderId'];
				$mid = $value['messageId'];
				$rt =  $value['replyingTo'];
				$messages[$key]['senderInfo'] = $db->exec("SELECT id, username, dp, tel, country, name_col FROM visitors WHERE id = '$senderId'")->fetch_assoc();
				if($rt != '0'){
					$message['replyingTo'] = $db->exec("SELECT * FROM $chat  WHERE messageId = '$rt'")->fetch_assoc();
					$senderIdR = $message['replyingTo']['senderId'];
					$message['replyingTo']['senderInfo'] = $db->exec("SELECT id, username, dp, tel, country, name_col FROM visitors WHERE id = '$senderIdR'")->fetch_assoc();
				}
                if($ch){
				$db->exec("UPDATE $chat SET dateReceived = '$date' WHERE messageId = '$mid'");
				}else{
					$messages[$key]['deleteInfo'] = json_encode(array('deleted' => $db->group_delete($mid, $senderId)));	
				}
				
			 }
			 $result[$chat] = $messages;
			 $count++;
		  }else{
			$result[$chat] = array();
		  }
		 }catch(MYSQLException $e){
			$result[$chat] = array();
		 }
		}
	}
		echo json_encode($result);
	
}
elseif (isset($_POST['delete_chat'])) {
	$det = json_decode($_POST['delete_chat']);
	$old = $db->exec("SELECT deleted FROM all_chats WHERE chat_id = '$det->chat'")->fetch_assoc()['deleted'];
	if($old == 0)
	   $db->exec("UPDATE all_chats SET deleted = '$det->user' WHERE chat_id = '$det->chat'");
	else{
	   $db->exec("UPDATE all_chats SET deleted = 2 WHERE chat_id = '$det->chat'");
   }
   echo 1;
}

elseif(isset($_POST['change_receipt'])){
	$cr = json_decode($_POST['change_receipt']);
	if(explode('_', $cr->chat)[0] == 'chat'){
	    $db->exec("UPDATE $cr->chat SET $cr->type = '$cr->date' WHERE messageId = '$cr->messageId'");
	}else{
		$db->group_message_update($cr->chat, $cr->user, $cr->messageId, 'seen', $cr->date);
	}
	echo $_POST['change_receipt'];
}

elseif(isset($_POST['check_unread_message'])){
	$cu = json_decode($_POST['check_unread_message']);
	echo json_encode($db->exec("SELECT dateSeen, dateReceived FROM $cu->chat WHERE messageId = '$cu->messageId'")->fetch_assoc());
}
elseif(isset($_POST['check_deleted_message'])){
	$cd = json_decode($_POST['check_deleted_message']);
	$gp = explode('_', $cd->chat)[0] == 'group';
	if($gp){
		echo $db->group_delete($cd->messageId, $cd->friend);	
	}else{
		$di = json_decode($db->exec("SELECT deleteInfo FROM $cd->chat WHERE messageId = '$cd->messageId'")->fetch_assoc()['deleteInfo']);
		$fr = $cd->friend;
		echo $di->$fr;
	}
}

elseif(isset($_POST['message_info'])){
	$mi = json_decode($_POST['message_info']);
	$tab = $mi->id;
	$ret = array();
	try {
		if ($mi->type == 'seen') {
			echo json_encode($db->exec("SELECT dp, tel, id, _date, country FROM $tab, visitors  WHERE $tab.user = visitors.id AND $tab.seen = 1")->fetch_all(MYSQLI_ASSOC));	
	   }
	   else{
		echo json_encode($db->exec("SELECT dp, tel, id, _date, country FROM $tab, visitors  WHERE $tab.user = visitors.id AND $tab.received = 1 AND $tab.seen = 0")->fetch_all(MYSQLI_ASSOC));   
	   }
	} catch (MYSQLException $e) {
		echo json_encode($ret);
	}
	
}

elseif(isset($_POST['check_last_seen'])){
	$id = $_POST['check_last_seen'];
	echo $db->exec("SELECT lastseen FROM visitors WHERE id = '$id'")->fetch_assoc()['lastseen'];
}
elseif(isset($_POST['check_typing'])){
	$id = $_POST['check_typing'];
	echo $db->exec("SELECT typing FROM visitors WHERE id = '$id'")->fetch_assoc()['typing'];
}
elseif(isset($_POST['set_last_seen'])){
	$id = $_POST['set_last_seen'];
	$ls = $_POST['date'];
	$db->exec("UPDATE visitors SET lastseen = '$ls' WHERE id = '$id'");
	try {
		$calls = $db->exec("SELECT * FROM calls");
		if($calls->num_rows > 0){
			while ($row = $calls->fetch_assoc()) {
				$from = $row['from_id'];
				$to = $row['to_id'];
				$lst = strtotime($db->exec("SELECT lastseen FROM visitors WHERE id = '$to'")->fetch_assoc()['lastseen']);
				$lsf = strtotime($db->exec("SELECT lastseen FROM visitors WHERE id = '$from'")->fetch_assoc()['lastseen']);
				$lsi =  strtotime($ls);
				//echo ($lsi - $lsf);
				if(($lsi - $lst) > 2  || ($lsi - $lsf) > 2)
				$db->exec("DELETE FROM calls WHERE from_id = '$from' AND to_id = '$to'");
			}
		}
	} catch (MYSQLException $err) {}
}
elseif(isset($_POST['set_typing'])){
	$det = json_decode($_POST['set_typing']);
	$typing = json_encode(array('date'=> $det->date, 'chat'=> $det->chat, 'message' => $det->message));
	$db->exec("UPDATE visitors SET typing = '$typing' WHERE id = '$det->id'");
}
elseif(isset($_POST['delete_message'])){
	$det = json_decode($_POST['delete_message']);
	$gp = explode('_', $det->chat)[0] == 'group';
	if($gp){
		$db->group_message_update($det->chat, $det->user, $det->messageId, 'deleted', $det->how);
		
	}else{
		$curr = json_decode($db->exec("SELECT deleteInfo FROM $det->chat WHERE messageId = '$det->messageId'")->fetch_assoc()['deleteInfo']);
		$me = $det->user;
		$curr->$me = $det->how;
		$new = json_encode($curr);
		$db->exec("UPDATE $det->chat SET deleteInfo = '$new' WHERE messageId = '$det->messageId'");
	}
}

elseif(isset($_POST['incoming_call'])){
	$me = $_POST['incoming_call'];
	try {
		$sql = $db->exec("SELECT * FROM visitors, calls WHERE calls.to_id = '$me' AND calls.from_id = visitors.id");
		if($sql->num_rows == 1){
			$res = $sql->fetch_all(MYSQLI_ASSOC)[0];
			$db->exec("UPDATE calls SET call_status = 'r' WHERE to_id = '$me'");
			echo json_encode(array('id' => $res['id'], 'chatName' => $res['username'], 'dp' => $res['dp'], 'type' => $res['call_type']));
		}else{
			echo 0;
		}
	} catch (MYSQLException $e) {
		echo 0;
	}
}
elseif(isset($_POST['outgoing_call'])){
	$part = json_decode($_POST['outgoing_call']);
	echo $db->add_call($part);
}
elseif(isset($_POST['call_status'])){
	$part = json_decode($_POST['call_status']);
	$st = $db->exec("SELECT call_status FROM calls WHERE from_id = '$part->from' AND to_id = '$part->to'");
	if($st->num_rows == 1){
		$st = $st->fetch_assoc()['call_status'];
	if($st == 'd' || $st == 'e'){
		$db->exec("DELETE FROM calls WHERE from_id = '$part->from' AND to_id = '$part->to'");
	}
   }else{
   $st = 'e';
   }
	echo $st;
}
elseif(isset($_POST['set_status'])){
	$part = json_decode($_POST['set_status']);
	if($part->value == 'e'){
		$db->exec("DELETE FROM calls WHERE from_id = '$part->from' AND to_id = '$part->to'");
	}else{
	$db->exec("UPDATE calls SET call_status = '$part->value' WHERE from_id = '$part->from' AND to_id = '$part->to'");
	}
	echo 1;
}

elseif(isset($_POST['block_chat']) || isset($_POST['mute_chat'])){

	$bc = isset($_POST['block_chat']) ? json_decode($_POST['block_chat']) : json_decode($_POST['mute_chat']);
	$val = 0;
	$curr = $db->exec("SELECT $bc->cell FROM all_chats WHERE chat_id = '$bc->chat'")->fetch_assoc()[$bc->cell];
	$both_ids = explode('x', explode('_', $bc->chat)[1]);
	$fr = $both_ids[0] == $bc->user ? $both_ids[1] : $both_ids[0];
	if($curr === '2'){
		$db->exec("UPDATE all_chats SET $bc->cell = '$fr' WHERE chat_id = '$bc->chat'");
		$val = $fr;
	}elseif ($curr === '0') {
		$db->exec("UPDATE all_chats SET $bc->cell = '$bc->user' WHERE chat_id = '$bc->chat'");
		$val = $bc->user;
	}elseif ($curr === $bc->user) {
		$db->exec("UPDATE all_chats SET $bc->cell = '0' WHERE chat_id = '$bc->chat'");
		$val = '0';
	}elseif ($curr === $fr) {
		$db->exec("UPDATE all_chats SET $bc->cell = '2' WHERE chat_id = '$bc->chat'");
		$val = '2';
	}else{
		$val = '0';
	}
	echo json_encode(array('error' => 0, 'value' => $val));
	
}

elseif(isset($_GET['page_info'])){
	echo file_get_contents($_GET['page_info']);
}

elseif(isset($_POST['public_users'])){
	$det = json_decode($_POST['public_users']);
	$id = $det->user;
	$avail = array($id);
	$last = $det->last;
	$chats = $db->chats_for($id);
       foreach($chats as $key => $value){
		$chat_id = $value['chat_id'];
		$cc = explode('_', $chat_id);
		if($cc[0] == 'chat'){
			$chk = explode('x', $cc[1]);
			$fr = $chk[0] == $id ? $chk[1] : $chk[0];
			$avail[] =  $fr;
		}
	   }
	echo json_encode($db->exec("SELECT id, dp, country, tel, about FROM visitors WHERE visitors.id NOT IN ('" . implode("','", $avail) . "') AND account_type = 1 AND removed = 0 AND sn > '$last' LIMIT 10")->fetch_all(MYSQLI_ASSOC));
}

elseif(isset($_POST['new_public_chat'])){
	$det = json_decode($_POST['new_public_chat']);
	$id = $det->user;
	$fr = $det->new;
    $chat_id1 = 'chat_' . $fr . 'x' . $id;
    $chat_id2 = 'chat_' . $id . 'x' . $fr;
	if($db->exec("SELECT * FROM visitors WHERE id = '$fr' AND removed = 0 AND account_type = 1")->num_rows == 1){
	try{
		if($db->exec("SELECT last_updated FROM all_chats WHERE chat_id = '$chat_id1' OR chat_id = '$chat_id2'")->num_rows == 0){
			$db->add_chat($chat_id1);
			echo $db->chats_info($chat_id1, $id, $det->date);
		  }else{
			echo 0;
		}
	}catch(MYSQLException $e){
		$db->add_chat($chat_id1);
		echo $db->chats_info($chat_id1, $id, $det->date);
	}
   }else{
	echo 0;
  }
}
elseif (isset($_GET['cg_wallpaper']) && isset($_FILES['file'])){
	$_FILES['file']['name'] = $_GET['cg_wallpaper'];
	$f = new File($_FILES['file']);
	$user_id = $_GET['user_id'];
	echo json_encode(array('dp' => $f->save_to('../visitors/' . $user_id . '/wallpapers'),
	'id' => $user_id, 'name' => $_FILES['file']['name']));
}

elseif(isset($_POST['new_wall_paper'])){
	$det = json_decode($_POST['new_wall_paper']);
	$id = $det->user;
	$new = $det->new;
	$db->exec("UPDATE visitors SET wallpaper = '$new' WHERE id = '$id'");
	echo 1;
}

elseif(isset($_POST['update_profile'])){
	$det = json_decode($_POST['update_profile']);
	$cell = $det->cell;
	$id = $det->user;
	$val = $det->value;
	$ch = $det->chat;
	if($ch != ''){
		$cn_new = '0';
		$cn = $db->exec("SELECT custom_name FROM all_chats WHERE chat_id = '$ch'")->fetch_assoc()['custom_name'];
		if($cn == '0'){
			$cn_new = json_encode(array($det->owner => '0', $id => $val));
		}else{
			$cn = json_decode($cn);
			$cn->$id = $val;
			$cn_new = json_encode($cn);
		}
		$db->exec("UPDATE all_chats SET custom_name = '$cn_new' WHERE chat_id = '$ch'");
		echo 0;
		return;
	}
	if($cell == 'tel'){
		$tel = $db->exec("SELECT tel FROM visitors  WHERE id = '$id'")->fetch_assoc()['tel'];
		if($tel == $val){
			echo 0;
			return;
		}	
	}
	$db->exec("UPDATE visitors SET $cell = '$val' WHERE id = '$id'");
	echo 1;
}

elseif (isset($_POST['delete_account'])) {
	$id = $_POST['delete_account'];
	$dir = '../visitors/' . $id;
	$files = dir_files($dir);
	if(count($files) > 0){
	foreach ($files as $key => $value) {
		$dir_ = $dir . '/' . $value;
		$files_ = dir_files($dir_);
		if(($value == 'Recordings' || $value == 'Pictures')  && count($files_) > 0){
			continue;
		}
		if(count($files_) > 0){
			foreach ($files_ as $key_ => $value_) {
				unlink($dir_ . '/' . $value_);
			}
		}
		rmdir($dir_);
   	}
  }
  $db->exec("UPDATE visitors SET removed = 1, email = '', dp = '', mail_confirmation_code = '' WHERE id = '$id'");
  	destroy_cookie(array(
		'uid' => $id,
		'informed_ed' => false,
		'em_1'  => false,
		'em_2' => false
	));
  echo 1;
}

elseif (isset($_POST['export_chat'])) {
	$exp = json_decode($_POST['export_chat']);
	$xt = $exp->extension;
	$time = time();
    $name = base64_encode($time) . '.' . $xt;
	$all = $db->exec("SELECT * FROM $exp->chat, visitors WHERE $exp->chat.senderId = visitors.id ORDER BY $exp->chat.sn")->fetch_all(MYSQLI_ASSOC);
	
    $dir = "../tmp/";
	$old_files = dir_files($dir);
	if(count($old_files) > 0){
		foreach ($old_files as $key => $value) {
			$time_created = base64_decode(explode('.', $value)[0]);
			if(($time - $time_created)/3600 >= 2){
				unlink($dir . $value);
			}
		}
	}

	$f = fopen($dir . $name, 'a');
	if($xt == 'xml'){
		fwrite($f, '<?xml version="1.0" encoding="UTF-8"?>'.PHP_EOL);
		fwrite($f, '<messages>'.PHP_EOL);
	}
	if($xt == 'json'){
		fwrite($f, '{'.PHP_EOL);
	}
	$count = 1;
	foreach ($all as $key => $value) {
		$file = $value['fileInfo'];
		$file_mess = 'None';
		if($file != '0'){
			$file = json_decode($file);
			$t_ = $file->type;
		    $dir_ = $t_ == 'picture' ? 'Pictures' : ($t_ == 'record' ? 'Recordings' : 'Documents');
			$file_mess = ROOT . 'file-viewer/?f=' . base64_encode(ROOT . 'projects/whatsapp-clone/app/visitors/' .$value['id'] . '/' . $dir_ . '/' . $file->url);
		}

		$ds = $value['dateSent'];
		$dr = $value['dateReceived'];
		$dss = $value['dateSeen'];
		$by = $value['username'];
		$rep = $value['replyingTo'];
		$mid = $value['messageId'];
		$m = urldecode(htmlspecialchars_decode($value['message']));

		if($xt == 'txt'){
		fwrite($f, ' '.PHP_EOL);
		fwrite($f, '--------------------------------------'.PHP_EOL);
		fwrite($f, ('Date Sent: [' . $ds . ']').PHP_EOL);
		fwrite($f, ('Date Received: [' . $dr . ']').PHP_EOL);
		fwrite($f, ('Date Seen: [' . $dss . ']').PHP_EOL);
		fwrite($f, ('Sent By: ' . $by).PHP_EOL);
		fwrite($f, ('Replying to: ' . $rep).PHP_EOL);
		fwrite($f, ('Message ID: ' . $mid).PHP_EOL);
		fwrite($f, ('Message: ' . $m).PHP_EOL);
		fwrite($f, ('Attachment: ' . $file_mess).PHP_EOL);
		fwrite($f, '--------------------------------------'.PHP_EOL);
		}elseif ($xt == 'xml'){
			fwrite($f, ' <message>'.PHP_EOL);
			fwrite($f, ('   <date_sent>' . $ds . '</date_sent>').PHP_EOL);
			fwrite($f, ('   <date_received>' . $dr . '</date_received>').PHP_EOL);
			fwrite($f, ('   <date_seen>' . $dss . '</date_seen>').PHP_EOL);
			fwrite($f, ('   <sent_by>' . $by . '</sent_by>').PHP_EOL);
			fwrite($f, ('   <replying_to>' . $rep . '</replying_to>').PHP_EOL);
			fwrite($f, ('   <message_id>' . $mid . '</message_id>').PHP_EOL);
			fwrite($f, ('   <message>' . $m . '</message>').PHP_EOL);
			fwrite($f, ('   <attachment>' . $file_mess . '</attachment>').PHP_EOL);
			fwrite($f, ' </message>'.PHP_EOL);
		} elseif ($xt == 'json') {
			fwrite($f, (' ' . '"' . $mid . '"' . ': {').PHP_EOL);
			fwrite($f, ('   "date_sent": "' . $ds . '",').PHP_EOL);
			fwrite($f, ('   "date_received": "' . $dr . '",').PHP_EOL);
			fwrite($f, ('   "date_seen": "' . $dss . '",').PHP_EOL);
			fwrite($f, ('   "sent_by": "' . $by . '",').PHP_EOL);
			fwrite($f, ('   "replying_to": "' . $rep . '",').PHP_EOL);
			fwrite($f, ('   "message_id": "' . $mid . '",').PHP_EOL);
			fwrite($f, ('   "message": "' . $m . '",').PHP_EOL);
			fwrite($f, ('   "attachment": "' . $file_mess . '"').PHP_EOL);
			if($count == count($all)){
				fwrite($f, (' }').PHP_EOL);
			}else{
				fwrite($f, (' },').PHP_EOL);
			}
			$count++;
		}
	}
	if($xt == 'xml'){
		fwrite($f, '<messages>'.PHP_EOL);
	}
	if($xt == 'json'){
		fwrite($f, '}'.PHP_EOL);
	}
    fclose($f);

	echo json_encode(array('error' => 0, 'value' => $name));
}

elseif (isset($_GET['report_files_upload']) && isset($_FILES['file'])){
	$_FILES['file']['name'] = $_GET['report_files_upload'];
	$f = new File($_FILES['file']);
	echo trim(ROOT . '/file-viewer/?f=' . base64_encode(ROOT . '/uploads/' . $f->save_to('../uploads')));
}
?>