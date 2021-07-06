<?php
class WC extends DBC{
    function __construct($CONN){
	parent::__construct($CONN);
 }
 function add_visitor($details){
    try{
        $stmt = $this->prepare("INSERT INTO visitors (id, username, tel, country, dp, pin, name_col, invitation_key, lastseen, date_joined, typing) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param('sssssssssss', $id, $un, $t, $c, $dp, $ot, $nc, $ik, $ls, $dj, $tp);
        $details = $this->validate_all($details);
        $id = $details->id;
        $un = $details->username;
        $t = $details->tel;
        $c = $details->country;
        $dp = $details->dp;
        $ot = $details->pin;
        $nc = $details->name_col;
        $ik = $details->invitation_key;
        $ls = $details->lastseen;
        $dj = $details->date_joined;
        $tp = json_encode(array('chat' => null, 'date' => '1/1/1970 00:00:00 AM UTC'));
        $stmt->execute();
        $stmt->close();
        return 1;
    }catch(PreparedStatementException $e){
        $this->create_table('visitors', 'visitors');
       return $this->add_visitor($details);
    }
 }
 function get_last_id($table){
    try{
        return intval($this->exec("SELECT MAX(sn) FROM $table")->fetch_assoc()['MAX(sn)']);
    }catch(MYSQLException $e){
        return 0;
    }
 }

 function count_cells($table){
    try{
        return $this->exec("SELECT * FROM $table")->num_rows;
    }catch(MYSQLException $e){
        return 0;
    } 
 }

 function add_call($part){
    try {
		if($this->exec("SELECT * FROM calls WHERE from_id = '$part->to' OR to_id = '$part->to'")->num_rows == 0){
		 $this->exec("INSERT INTO calls(from_id, to_id, call_status, call_stream, call_type) VALUES('$part->from', '$part->to', '0', '', '$part->type')");
         return 1;
		}else{
			return 0;
		}
	} catch (MYSQLException $e) {
		$this->create_table('calls', 'calls');
        return $this->add_call($part);
	} 
 }
 function create_chat($ik, $visitor_id){
    try{
        $partner_id = $this->exec("SELECT id FROM visitors WHERE invitation_key = '$ik' AND id != '$visitor_id'");
        if($partner_id->num_rows == 1){
            $partner_id = $partner_id->fetch_assoc()['id'];
            $chat_id1 = 'chat_' . $partner_id . 'x' . $visitor_id;
            $chat_id2 = 'chat_' . $visitor_id . 'x' . $partner_id;
            try{

            if($this->exec("SELECT last_updated FROM all_chats WHERE chat_id = '$chat_id1' OR chat_id = '$chat_id2'")->num_rows == 0)

            $this->add_chat($chat_id1);

            }catch(MYSQLException $e) {
                $this->add_chat($chat_id1);
            }
        }
     } catch(MYSQLException $e){}
 }

 function seen_or_received_gp($mid){
    $tab = 'mess_' . $mid . '_info';
    $ret = array('received' => array(), 'seen' => array());
    try {
       $sql = $this->exec("SELECT * FROM $tab");
       while ($row = $sql->fetch_assoc()) {
           if($row['seen'] == 1){
              $ret['seen'][] = $row['user'];
           }
           if($row['received'] == 1){
              $ret['received'][] = $row['user'];
           }
       }
    } catch (MYSQLException $e) {};
    return $ret;
 }

 function add_chat($id){
     try {
         $t = time();
         $this->exec("INSERT INTO all_chats(chat_id, last_updated, muted, blocked, deleted) VALUES('$id', '$t', '0', '0', '0')");
     } catch (MYSQLException $e) {
        $this->create_table('all_chats', 'all_chats');
        $this->add_chat($id);
     }
 }
 function unread_messages_count($chat_id, $visitor_id){
    try {
        if(explode('_', $chat_id)[0] == 'chat'){
          return $this->exec("SELECT sn FROM $chat_id WHERE senderId != '$visitor_id' AND (dateSeen = '0' OR dateReceived = '0')")->num_rows;
        }else{
            $count = 0;
            $gp = $this->exec("SELECT messageId FROM $chat_id WHERE senderId != '$visitor_id'");
            if($gp->num_rows > 0){
                
                while ($row = $gp->fetch_assoc()) {
                   $mid = $row['messageId'];
                   $ur = $this->seen_or_received_gp($mid);
                   if(!in_array($visitor_id, $ur['seen'])){
                       $count++;
                   }
                }
            }
            return $count;
        }
    } catch (MYSQLException $e) {
        return 0;
    }
 }
 function chats_info($c_id, $v_id, $date){
    $result = array();
    $f_check =  explode('_', $c_id);
    if($f_check[0] == 'chat'){
        $check = explode('x', $f_check[1]);
        $partner_id = $check[0] == $v_id ? $check[1] : $check[0];
        $partner_info = $this->exec("SELECT username, about, account_type, country, dp, tel, read_receipt, public_last_seen, lastseen, date_joined, invitation_key, removed FROM visitors WHERE id = '$partner_id'")->fetch_assoc();
        // echo json_encode($partner_info);
        // return;
        $rem = $partner_info['removed'];
        $result['dp'] = $rem == 1 ? '' : $partner_info['dp'];
        $result['username'] = $partner_info['username'];
        $result['tel'] = $partner_info['tel'];
        $result['id'] = $partner_id;
        $result['account_type'] = $partner_info['account_type'];
        $result['invite_key'] = $partner_info['invitation_key'];
        $result['read_receipt'] = $partner_info['read_receipt'];
        $result['public_last_visibility'] = $partner_info['public_last_seen'];
        $result['date_joined'] = $partner_info['date_joined'];
        $result['country'] = $partner_info['country'];
        $result['about'] = $partner_info['about'];
        $result['lastSeen'] = $partner_info['lastseen'];
        $result['partner_removed'] = $rem;
    }else{
        $result['members'] = $this->exec("SELECT id, tel FROM visitors WHERE removed = 0")->fetch_all(MYSQLI_ASSOC);
    }

    $ch = $this->exec("SELECT blocked, custom_name, _group FROM all_chats WHERE chat_id = '$c_id'")->fetch_assoc();
    $result['blocked'] = $ch['blocked'];
    $cn = $ch['custom_name'];
    $result['custom_name'] = $cn == '0' ? 0 : ($ch['_group'] == '0' ? json_decode($cn)->$partner_id : $cn);
    $result['chat_id'] = $c_id;
    $result['group'] = $ch['_group'];
    $result['unread'] = $this->unread_messages_count($c_id, $v_id);
	$result['last_message'] = $this->get_last_message($c_id, $v_id,  $date);
    try {
        $li = $this->get_last_id($c_id) - 10;
        $result['available_db_mess'] = $this->exec("SELECT messageId FROM $c_id WHERE sn > $li")->fetch_all(MYSQLI_ASSOC);
    } catch (MYSQLException $e) {
        $result['available_db_mess'] = array();
    }
    return json_encode($result);
 }
 function send_message($details){
     try {
        $fi = $details->fileInfo;
        unset($details->senderName);
        $new_sn = $this->get_last_id($details->chatId) + 1;
        $details->messageId = $details->chatId . '_sn_' .  $new_sn;
        $stmt = $this->prepare("INSERT INTO $details->chatId(chatId, messageId, senderId, message, dateSent, dateReceived, dateSeen, replyingTo, fileInfo, forwarded, isGroup, deleteInfo) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param('ssssssssssss', $ci, $mi, $si, $m, $ds, $dr, $dss, $rt, $f, $fd, $ig, $di);
        $ci = $details->chatId;
        $mi = $details->messageId;
        $si = $details->senderId;
        $m = $details->message;
        $ds = $details->dateSent;
        $dr = $details->dateReceived;
        $dss = $details->dateSeen;
        $rt = $details->replyingTo;
        if($rt != '0'){
            $rt = $rt->messageId;
        }
        $f = gettype($fi) == 'object' ? json_encode($fi) : 0;
        $fd = $details->forwarded;
        $ig = $details->isGroup;
        $di = json_encode($details->deleteInfo);
        $stmt->execute();
        $stmt->close();
        $t = time();
        $this->exec("UPDATE all_chats SET last_updated = '$t', deleted = 0 WHERE chat_id = '$ci'");
        return $details;
     } catch (PreparedStatementException $e) {
        $this->create_table('chat', $details->chatId);
        return $this->send_message($details);
     }
 }
  function group_message_update($ch, $me, $mess, $cell, $date) {
    $tab = 'mess_' . $mess . '_info';
   try {
    $count = $this->exec("SELECT user, received FROM $tab WHERE user = '$me'");
    if($count->num_rows == 0){
        if($cell == 'deleted'){
            $this->exec("INSERT INTO $tab(user, deleted) VALUES('$me', '$date')");
        }else{
            if(!$count->fetch_assoc())
            $this->exec("INSERT INTO $tab(user, received, _date) VALUES('$me', 1, '$date')");
        }
       
     }

     if($cell == 'deleted'){
        $this->exec("UPDATE $tab SET deleted = '$date' WHERE user = '$me'");
      }else{
        $this->exec("UPDATE $tab SET $cell = 1, _date = '$date' WHERE user = '$me'");
      }
        
    
   } catch (MYSQLException $e) {
        $this->create_table('mess_info', $tab);
        $this->group_message_update($ch, $me, $mess, $cell, $date);
   }
}

function group_delete($mid, $senderId){
    $tab = 'mess_' . $mid . '_info';
    $ret = 0;
 try {
    $sql1 = $this->exec("SELECT deleted FROM $tab WHERE user = '$senderId'");
    if($sql1->num_rows == 1){
     $ret = $sql1->fetch_assoc()['deleted'];
    }
    
 } catch (MYSQLException $e) {}
 return $ret;
}

 function get_last_message($chat_id, $visitor_id, $date){
    try {
		$last_message_sn = $this->get_last_id($chat_id);
        $last_message = $this->exec("SELECT * FROM $chat_id WHERE sn = '$last_message_sn'")->fetch_assoc();
        $senderId = $last_message['senderId'];
        if($last_message['isGroup'] == '0'){
           $this->exec("UPDATE $chat_id SET dateReceived = '$date' WHERE dateReceived = '0' AND senderId != '$visitor_id'");
        }else if($senderId != $visitor_id){
            $this->group_message_update($chat_id, $visitor_id, $last_message['messageId'], 'received', $date);
        }
        $last_message['senderInfo'] = $this->exec("SELECT id, username, dp, tel, country, name_col FROM visitors WHERE id = '$senderId'")->fetch_assoc();
        return $last_message;
	} catch (MYSQLException $e) {
        return array(
            'chatId' => $chat_id,
            'messageId' => null,
            'senderId' => null,
            'message' => 'Messages you send to this chat are not end-to-end secured, do not send sensible and private info...',
            'dateSent' => 'Recently',
            'DateReceived' => 'Recently',
            'DateSeen' => 'recently',
            'ReplyingTo' => '0',
            'fileInfo' => '0',
            'forwarded' => '0',
            'isGroup' => '0'
        );
	}
 }
 function chats_for($visitor_id){
    $result = array();
	try {
		$sql = $this->exec("SELECT chat_id, last_updated FROM all_chats WHERE (chat_id LIKE '%$visitor_id%' OR _group = 1) AND deleted != 2 AND deleted != '$visitor_id' ORDER BY last_updated DESC");
		if($sql->num_rows > 0){
		$result = $sql->fetch_all(MYSQLI_ASSOC);
	    }
	   } catch (MYSQLException $er) {}
    return $result;
 }

 function blocked_or_muted_chats($type, $blocker){
    $result = array();
    $chats = $this->chats_for($blocker);
    if(count($chats) > 0){
        foreach ($chats as $key => $value) {
            $chat = $value['chat_id'];
            $check = $this->exec("SELECT blocked, muted FROM all_chats WHERE chat_id = '$chat'")->fetch_assoc();
            if(($type === 'block' && ($check['blocked'] === $blocker || $check['blocked'] === '2')) ||
              ($type === 'mute' && ($check['muted'] === $blocker || $check['muted'] === '2')) ||
              ($type === 'blocked_by' && $check['blocked'] !== '0' && $check['blocked'] !== $blocker)){
               array_push($result, $chat);
            }
        }



    }
    return $result;
 }

 function create_table($type, $name){
  switch ($type) {
      case 'visitors':
          $this->exec("CREATE TABLE visitors(
              sn int(5) NOT NULL AUTO_INCREMENT,
              id varchar(10) NOT NULL,
              username varchar(20) NOT NULL,
              tel varchar(20) NOT NULL,
              email varchar(100) NOT NULL,
              email_confirmed boolean DEFAULT 0,
              mail_confirmation_code text,
              country varchar(50) NOT NULL,
              dp varchar(100) NOT NULL,
              about text DEFAULT 'Hi there, I am using WhatsApp Clone',
              pin text NOT NULL,
              invitation_key varchar(100) NOT NULL,
              lastseen varchar(50) NOT NULL,
              date_joined varchar(50) NOT NULL,
              typing varchar(200) NOT NULL,
              account_type boolean DEFAULT 1,
              wallpaper varchar(100) DEFAULT 'default',
              name_col varchar(10) NOT NULL,
              read_receipt boolean DEFAULT 1,
              notification_sound boolean DEFAULT 0,
              other_sounds boolean DEFAULT 0,
              enter_button boolean DEFAULT 0,
              public_last_seen boolean DEFAULT 1,
              removed boolean DEFAULT 0,
              PRIMARY KEY (sn)
          )");
          break;
          case 'chat':
            $this->exec("CREATE TABLE $name(
                sn int(10) NOT NULL AUTO_INCREMENT,
                chatId varchar(50) NOT NULL,
                messageId varchar(100) NOT NULL,
                senderId varchar(10) NOT NULL,
                message text NOT NULL,
                dateSent varchar(100) NOT NULL,
                dateReceived varchar(100) NOT NULL,
                dateSeen varchar(100) NOT NULL,
                replyingTo varchar(100) NOT NULL,
                fileInfo text NOT NULL,
                forwarded int(5),
                isGroup boolean,
                deleteInfo varchar(50) NOT NULL,
                PRIMARY KEY (sn)
            )");
            break; 
            case 'all_chats':
                $this->exec("CREATE TABLE all_chats(
                    sn int(10) NOT NULL AUTO_INCREMENT,
                    chat_id varchar(50) NOT NULL,
                    last_updated bigint(50),
                    deleted varchar(100) NOT NULL,
                    blocked varchar(10) DEFAULT '0',
                    muted varchar(10) DEFAULT '0',
                    custom_name text DEFAULT '0',
                    group_ boolean DEFAULT 0,
                    PRIMARY KEY(sn)
                )");
            break; 
            case 'calls':
                $this->exec("CREATE TABLE calls(
                    sn int(10) NOT NULL AUTO_INCREMENT,
                    from_id varchar(50) NOT NULL,
                    to_id varchar(50) NOT NULL,
                    call_status varchar(100) NOT NULL,
                    call_stream varchar(100) NOT NULL,
                    call_type char(1) NOT NULL,
                    PRIMARY KEY(sn)
                )");
            break;
            case 'mess_info':
                $this->exec("CREATE TABLE $name(
                    user varchar(20) NOT NULL,
                    received boolean DEFAULT 0,
                    seen boolean DEFAULT 0,
                    _date varchar(50) NOT NULL,
                    deleted int(2) DEFAULT 0,
                    PRIMARY KEY(user)
                )");
            break; 
  }
 }	
}
?>
