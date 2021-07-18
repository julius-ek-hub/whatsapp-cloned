<?php
class WC extends DBC{
    function __construct($CONN){
	parent::__construct($CONN);
    try {
       $this->create_table('countries', 'countries');
    } catch (MYSQLException $e) {
        //countries.sql exists
    }
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
        $last_message['deleteInfo'] = json_decode($last_message['deleteInfo']);
        $senderId = $last_message['senderId'];
        if($last_message['isGroup'] == '0'){
           $this->exec("UPDATE $chat_id SET dateReceived = '$date' WHERE dateReceived = '0' AND senderId != '$visitor_id'");
        }else{
        $last_message['deleteInfo'] = array('deleted' => $this->group_delete( $last_message['messageId'], $visitor_id));
         if($senderId != $visitor_id){
           $this->group_message_update($chat_id, $visitor_id, $last_message['messageId'], 'received', $date);
        }
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
              auto_refresh_chat boolean DEFAULT 1,
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
                    _group boolean DEFAULT 0,
                    PRIMARY KEY(sn)
                )");
            $time = time();
            $this->exec("INSERT INTO all_chats(chat_id, last_updated, deleted, blocked, muted, custom_name, _group) VALUES('group_0000', '$time', '0', '0', '0', 'Talk with everyone', 1)");

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

            case 'countries':

            $this->exec("CREATE TABLE `countries` (
            `id` int(11) NOT NULL,
            `iso` char(2) NOT NULL,
            `name` varchar(80) NOT NULL,
            `nicename` varchar(80) NOT NULL,
            `iso3` char(3) DEFAULT NULL,
            `numcode` smallint(6) DEFAULT NULL,
            `phonecode` int(5) NOT NULL
            )");

            $this->exec("INSERT INTO `countries` (`id`, `iso`, `name`, `nicename`, `iso3`, `numcode`, `phonecode`) VALUES
            (1, 'AF', 'AFGHANISTAN', 'Afghanistan', 'AFG', 4, 93),
            (2, 'AL', 'ALBANIA', 'Albania', 'ALB', 8, 355),
            (3, 'DZ', 'ALGERIA', 'Algeria', 'DZA', 12, 213),
            (4, 'AS', 'AMERICAN SAMOA', 'American Samoa', 'ASM', 16, 1684),
            (5, 'AD', 'ANDORRA', 'Andorra', 'AND', 20, 376),
            (6, 'AO', 'ANGOLA', 'Angola', 'AGO', 24, 244),
            (7, 'AI', 'ANGUILLA', 'Anguilla', 'AIA', 660, 1264),
            (8, 'AQ', 'ANTARCTICA', 'Antarctica', NULL, NULL, 0),
            (9, 'AG', 'ANTIGUA AND BARBUDA', 'Antigua and Barbuda', 'ATG', 28, 1268),
            (10, 'AR', 'ARGENTINA', 'Argentina', 'ARG', 32, 54),
            (11, 'AM', 'ARMENIA', 'Armenia', 'ARM', 51, 374),
            (12, 'AW', 'ARUBA', 'Aruba', 'ABW', 533, 297),
            (13, 'AU', 'AUSTRALIA', 'Australia', 'AUS', 36, 61),
            (14, 'AT', 'AUSTRIA', 'Austria', 'AUT', 40, 43),
            (15, 'AZ', 'AZERBAIJAN', 'Azerbaijan', 'AZE', 31, 994),
            (16, 'BS', 'BAHAMAS', 'Bahamas', 'BHS', 44, 1242),
            (17, 'BH', 'BAHRAIN', 'Bahrain', 'BHR', 48, 973),
            (18, 'BD', 'BANGLADESH', 'Bangladesh', 'BGD', 50, 880),
            (19, 'BB', 'BARBADOS', 'Barbados', 'BRB', 52, 1246),
            (20, 'BY', 'BELARUS', 'Belarus', 'BLR', 112, 375),
            (21, 'BE', 'BELGIUM', 'Belgium', 'BEL', 56, 32),
            (22, 'BZ', 'BELIZE', 'Belize', 'BLZ', 84, 501),
            (23, 'BJ', 'BENIN', 'Benin', 'BEN', 204, 229),
            (24, 'BM', 'BERMUDA', 'Bermuda', 'BMU', 60, 1441),
            (25, 'BT', 'BHUTAN', 'Bhutan', 'BTN', 64, 975),
            (26, 'BO', 'BOLIVIA', 'Bolivia', 'BOL', 68, 591),
            (27, 'BA', 'BOSNIA AND HERZEGOVINA', 'Bosnia and Herzegovina', 'BIH', 70, 387),
            (28, 'BW', 'BOTSWANA', 'Botswana', 'BWA', 72, 267),
            (29, 'BV', 'BOUVET ISLAND', 'Bouvet Island', NULL, NULL, 0),
            (30, 'BR', 'BRAZIL', 'Brazil', 'BRA', 76, 55),
            (31, 'IO', 'BRITISH INDIAN OCEAN TERRITORY', 'British Indian Ocean Territory', NULL, NULL, 246),
            (32, 'BN', 'BRUNEI DARUSSALAM', 'Brunei Darussalam', 'BRN', 96, 673),
            (33, 'BG', 'BULGARIA', 'Bulgaria', 'BGR', 100, 359),
            (34, 'BF', 'BURKINA FASO', 'Burkina Faso', 'BFA', 854, 226),
            (35, 'BI', 'BURUNDI', 'Burundi', 'BDI', 108, 257),
            (36, 'KH', 'CAMBODIA', 'Cambodia', 'KHM', 116, 855),
            (37, 'CM', 'CAMEROON', 'Cameroon', 'CMR', 120, 237),
            (38, 'CA', 'CANADA', 'Canada', 'CAN', 124, 1),
            (39, 'CV', 'CAPE VERDE', 'Cape Verde', 'CPV', 132, 238),
            (40, 'KY', 'CAYMAN ISLANDS', 'Cayman Islands', 'CYM', 136, 1345),
            (41, 'CF', 'CENTRAL AFRICAN REPUBLIC', 'Central African Republic', 'CAF', 140, 236),
            (42, 'TD', 'CHAD', 'Chad', 'TCD', 148, 235),
            (43, 'CL', 'CHILE', 'Chile', 'CHL', 152, 56),
            (44, 'CN', 'CHINA', 'China', 'CHN', 156, 86),
            (45, 'CX', 'CHRISTMAS ISLAND', 'Christmas Island', NULL, NULL, 61),
            (46, 'CC', 'COCOS (KEELING) ISLANDS', 'Cocos (Keeling) Islands', NULL, NULL, 672),
            (47, 'CO', 'COLOMBIA', 'Colombia', 'COL', 170, 57),
            (48, 'KM', 'COMOROS', 'Comoros', 'COM', 174, 269),
            (49, 'CG', 'CONGO', 'Congo', 'COG', 178, 242),
            (50, 'CD', 'CONGO, THE DEMOCRATIC REPUBLIC OF THE', 'Congo, the Democratic Republic of the', 'COD', 180, 242),
            (51, 'CK', 'COOK ISLANDS', 'Cook Islands', 'COK', 184, 682),
            (52, 'CR', 'COSTA RICA', 'Costa Rica', 'CRI', 188, 506),
            (53, 'CI', 'COTE D\'IVOIRE', 'Cote D\'Ivoire', 'CIV', 384, 225),
            (54, 'HR', 'CROATIA', 'Croatia', 'HRV', 191, 385),
            (55, 'CU', 'CUBA', 'Cuba', 'CUB', 192, 53),
            (56, 'CY', 'CYPRUS', 'Cyprus', 'CYP', 196, 357),
            (57, 'CZ', 'CZECH REPUBLIC', 'Czech Republic', 'CZE', 203, 420),
            (58, 'DK', 'DENMARK', 'Denmark', 'DNK', 208, 45),
            (59, 'DJ', 'DJIBOUTI', 'Djibouti', 'DJI', 262, 253),
            (60, 'DM', 'DOMINICA', 'Dominica', 'DMA', 212, 1767),
            (61, 'DO', 'DOMINICAN REPUBLIC', 'Dominican Republic', 'DOM', 214, 1809),
            (62, 'EC', 'ECUADOR', 'Ecuador', 'ECU', 218, 593),
            (63, 'EG', 'EGYPT', 'Egypt', 'EGY', 818, 20),
            (64, 'SV', 'EL SALVADOR', 'El Salvador', 'SLV', 222, 503),
            (65, 'GQ', 'EQUATORIAL GUINEA', 'Equatorial Guinea', 'GNQ', 226, 240),
            (66, 'ER', 'ERITREA', 'Eritrea', 'ERI', 232, 291),
            (67, 'EE', 'ESTONIA', 'Estonia', 'EST', 233, 372),
            (68, 'ET', 'ETHIOPIA', 'Ethiopia', 'ETH', 231, 251),
            (69, 'FK', 'FALKLAND ISLANDS (MALVINAS)', 'Falkland Islands (Malvinas)', 'FLK', 238, 500),
            (70, 'FO', 'FAROE ISLANDS', 'Faroe Islands', 'FRO', 234, 298),
            (71, 'FJ', 'FIJI', 'Fiji', 'FJI', 242, 679),
            (72, 'FI', 'FINLAND', 'Finland', 'FIN', 246, 358),
            (73, 'FR', 'FRANCE', 'France', 'FRA', 250, 33),
            (74, 'GF', 'FRENCH GUIANA', 'French Guiana', 'GUF', 254, 594),
            (75, 'PF', 'FRENCH POLYNESIA', 'French Polynesia', 'PYF', 258, 689),
            (76, 'TF', 'FRENCH SOUTHERN TERRITORIES', 'French Southern Territories', NULL, NULL, 0),
            (77, 'GA', 'GABON', 'Gabon', 'GAB', 266, 241),
            (78, 'GM', 'GAMBIA', 'Gambia', 'GMB', 270, 220),
            (79, 'GE', 'GEORGIA', 'Georgia', 'GEO', 268, 995),
            (80, 'DE', 'GERMANY', 'Germany', 'DEU', 276, 49),
            (81, 'GH', 'GHANA', 'Ghana', 'GHA', 288, 233),
            (82, 'GI', 'GIBRALTAR', 'Gibraltar', 'GIB', 292, 350),
            (83, 'GR', 'GREECE', 'Greece', 'GRC', 300, 30),
            (84, 'GL', 'GREENLAND', 'Greenland', 'GRL', 304, 299),
            (85, 'GD', 'GRENADA', 'Grenada', 'GRD', 308, 1473),
            (86, 'GP', 'GUADELOUPE', 'Guadeloupe', 'GLP', 312, 590),
            (87, 'GU', 'GUAM', 'Guam', 'GUM', 316, 1671),
            (88, 'GT', 'GUATEMALA', 'Guatemala', 'GTM', 320, 502),
            (89, 'GN', 'GUINEA', 'Guinea', 'GIN', 324, 224),
            (90, 'GW', 'GUINEA-BISSAU', 'Guinea-Bissau', 'GNB', 624, 245),
            (91, 'GY', 'GUYANA', 'Guyana', 'GUY', 328, 592),
            (92, 'HT', 'HAITI', 'Haiti', 'HTI', 332, 509),
            (93, 'HM', 'HEARD ISLAND AND MCDONALD ISLANDS', 'Heard Island and Mcdonald Islands', NULL, NULL, 0),
            (94, 'VA', 'HOLY SEE (VATICAN CITY STATE)', 'Holy See (Vatican City State)', 'VAT', 336, 39),
            (95, 'HN', 'HONDURAS', 'Honduras', 'HND', 340, 504),
            (96, 'HK', 'HONG KONG', 'Hong Kong', 'HKG', 344, 852),
            (97, 'HU', 'HUNGARY', 'Hungary', 'HUN', 348, 36),
            (98, 'IS', 'ICELAND', 'Iceland', 'ISL', 352, 354),
            (99, 'IN', 'INDIA', 'India', 'IND', 356, 91),
            (100, 'ID', 'INDONESIA', 'Indonesia', 'IDN', 360, 62),
            (101, 'IR', 'IRAN, ISLAMIC REPUBLIC OF', 'Iran, Islamic Republic of', 'IRN', 364, 98),
            (102, 'IQ', 'IRAQ', 'Iraq', 'IRQ', 368, 964),
            (103, 'IE', 'IRELAND', 'Ireland', 'IRL', 372, 353),
            (104, 'IL', 'ISRAEL', 'Israel', 'ISR', 376, 972),
            (105, 'IT', 'ITALY', 'Italy', 'ITA', 380, 39),
            (106, 'JM', 'JAMAICA', 'Jamaica', 'JAM', 388, 1876),
            (107, 'JP', 'JAPAN', 'Japan', 'JPN', 392, 81),
            (108, 'JO', 'JORDAN', 'Jordan', 'JOR', 400, 962),
            (109, 'KZ', 'KAZAKHSTAN', 'Kazakhstan', 'KAZ', 398, 7),
            (110, 'KE', 'KENYA', 'Kenya', 'KEN', 404, 254),
            (111, 'KI', 'KIRIBATI', 'Kiribati', 'KIR', 296, 686),
            (112, 'KP', 'KOREA, DEMOCRATIC PEOPLE\'S REPUBLIC OF', 'Korea, Democratic People\'s Republic of', 'PRK', 408, 850),
            (113, 'KR', 'KOREA, REPUBLIC OF', 'Korea, Republic of', 'KOR', 410, 82),
            (114, 'KW', 'KUWAIT', 'Kuwait', 'KWT', 414, 965),
            (115, 'KG', 'KYRGYZSTAN', 'Kyrgyzstan', 'KGZ', 417, 996),
            (116, 'LA', 'LAO PEOPLE\'S DEMOCRATIC REPUBLIC', 'Lao People\'s Democratic Republic', 'LAO', 418, 856),
            (117, 'LV', 'LATVIA', 'Latvia', 'LVA', 428, 371),
            (118, 'LB', 'LEBANON', 'Lebanon', 'LBN', 422, 961),
            (119, 'LS', 'LESOTHO', 'Lesotho', 'LSO', 426, 266),
            (120, 'LR', 'LIBERIA', 'Liberia', 'LBR', 430, 231),
            (121, 'LY', 'LIBYAN ARAB JAMAHIRIYA', 'Libyan Arab Jamahiriya', 'LBY', 434, 218),
            (122, 'LI', 'LIECHTENSTEIN', 'Liechtenstein', 'LIE', 438, 423),
            (123, 'LT', 'LITHUANIA', 'Lithuania', 'LTU', 440, 370),
            (124, 'LU', 'LUXEMBOURG', 'Luxembourg', 'LUX', 442, 352),
            (125, 'MO', 'MACAO', 'Macao', 'MAC', 446, 853),
            (126, 'MK', 'MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF', 'Macedonia, the Former Yugoslav Republic of', 'MKD', 807, 389),
            (127, 'MG', 'MADAGASCAR', 'Madagascar', 'MDG', 450, 261),
            (128, 'MW', 'MALAWI', 'Malawi', 'MWI', 454, 265),
            (129, 'MY', 'MALAYSIA', 'Malaysia', 'MYS', 458, 60),
            (130, 'MV', 'MALDIVES', 'Maldives', 'MDV', 462, 960),
            (131, 'ML', 'MALI', 'Mali', 'MLI', 466, 223),
            (132, 'MT', 'MALTA', 'Malta', 'MLT', 470, 356),
            (133, 'MH', 'MARSHALL ISLANDS', 'Marshall Islands', 'MHL', 584, 692),
            (134, 'MQ', 'MARTINIQUE', 'Martinique', 'MTQ', 474, 596),
            (135, 'MR', 'MAURITANIA', 'Mauritania', 'MRT', 478, 222),
            (136, 'MU', 'MAURITIUS', 'Mauritius', 'MUS', 480, 230),
            (137, 'YT', 'MAYOTTE', 'Mayotte', NULL, NULL, 269),
            (138, 'MX', 'MEXICO', 'Mexico', 'MEX', 484, 52),
            (139, 'FM', 'MICRONESIA, FEDERATED STATES OF', 'Micronesia, Federated States of', 'FSM', 583, 691),
            (140, 'MD', 'MOLDOVA, REPUBLIC OF', 'Moldova, Republic of', 'MDA', 498, 373),
            (141, 'MC', 'MONACO', 'Monaco', 'MCO', 492, 377),
            (142, 'MN', 'MONGOLIA', 'Mongolia', 'MNG', 496, 976),
            (143, 'MS', 'MONTSERRAT', 'Montserrat', 'MSR', 500, 1664),
            (144, 'MA', 'MOROCCO', 'Morocco', 'MAR', 504, 212),
            (145, 'MZ', 'MOZAMBIQUE', 'Mozambique', 'MOZ', 508, 258),
            (146, 'MM', 'MYANMAR', 'Myanmar', 'MMR', 104, 95),
            (147, 'NA', 'NAMIBIA', 'Namibia', 'NAM', 516, 264),
            (148, 'NR', 'NAURU', 'Nauru', 'NRU', 520, 674),
            (149, 'NP', 'NEPAL', 'Nepal', 'NPL', 524, 977),
            (150, 'NL', 'NETHERLANDS', 'Netherlands', 'NLD', 528, 31),
            (151, 'AN', 'NETHERLANDS ANTILLES', 'Netherlands Antilles', 'ANT', 530, 599),
            (152, 'NC', 'NEW CALEDONIA', 'New Caledonia', 'NCL', 540, 687),
            (153, 'NZ', 'NEW ZEALAND', 'New Zealand', 'NZL', 554, 64),
            (154, 'NI', 'NICARAGUA', 'Nicaragua', 'NIC', 558, 505),
            (155, 'NE', 'NIGER', 'Niger', 'NER', 562, 227),
            (156, 'NG', 'NIGERIA', 'Nigeria', 'NGA', 566, 234),
            (157, 'NU', 'NIUE', 'Niue', 'NIU', 570, 683),
            (158, 'NF', 'NORFOLK ISLAND', 'Norfolk Island', 'NFK', 574, 672),
            (159, 'MP', 'NORTHERN MARIANA ISLANDS', 'Northern Mariana Islands', 'MNP', 580, 1670),
            (160, 'NO', 'NORWAY', 'Norway', 'NOR', 578, 47),
            (161, 'OM', 'OMAN', 'Oman', 'OMN', 512, 968),
            (162, 'PK', 'PAKISTAN', 'Pakistan', 'PAK', 586, 92),
            (163, 'PW', 'PALAU', 'Palau', 'PLW', 585, 680),
            (164, 'PS', 'PALESTINIAN TERRITORY, OCCUPIED', 'Palestinian Territory, Occupied', NULL, NULL, 970),
            (165, 'PA', 'PANAMA', 'Panama', 'PAN', 591, 507),
            (166, 'PG', 'PAPUA NEW GUINEA', 'Papua New Guinea', 'PNG', 598, 675),
            (167, 'PY', 'PARAGUAY', 'Paraguay', 'PRY', 600, 595),
            (168, 'PE', 'PERU', 'Peru', 'PER', 604, 51),
            (169, 'PH', 'PHILIPPINES', 'Philippines', 'PHL', 608, 63),
            (170, 'PN', 'PITCAIRN', 'Pitcairn', 'PCN', 612, 0),
            (171, 'PL', 'POLAND', 'Poland', 'POL', 616, 48),
            (172, 'PT', 'PORTUGAL', 'Portugal', 'PRT', 620, 351),
            (173, 'PR', 'PUERTO RICO', 'Puerto Rico', 'PRI', 630, 1787),
            (174, 'QA', 'QATAR', 'Qatar', 'QAT', 634, 974),
            (175, 'RE', 'REUNION', 'Reunion', 'REU', 638, 262),
            (176, 'RO', 'ROMANIA', 'Romania', 'ROM', 642, 40),
            (177, 'RU', 'RUSSIAN FEDERATION', 'Russian Federation', 'RUS', 643, 70),
            (178, 'RW', 'RWANDA', 'Rwanda', 'RWA', 646, 250),
            (179, 'SH', 'SAINT HELENA', 'Saint Helena', 'SHN', 654, 290),
            (180, 'KN', 'SAINT KITTS AND NEVIS', 'Saint Kitts and Nevis', 'KNA', 659, 1869),
            (181, 'LC', 'SAINT LUCIA', 'Saint Lucia', 'LCA', 662, 1758),
            (182, 'PM', 'SAINT PIERRE AND MIQUELON', 'Saint Pierre and Miquelon', 'SPM', 666, 508),
            (183, 'VC', 'SAINT VINCENT AND THE GRENADINES', 'Saint Vincent and the Grenadines', 'VCT', 670, 1784),
            (184, 'WS', 'SAMOA', 'Samoa', 'WSM', 882, 684),
            (185, 'SM', 'SAN MARINO', 'San Marino', 'SMR', 674, 378),
            (186, 'ST', 'SAO TOME AND PRINCIPE', 'Sao Tome and Principe', 'STP', 678, 239),
            (187, 'SA', 'SAUDI ARABIA', 'Saudi Arabia', 'SAU', 682, 966),
            (188, 'SN', 'SENEGAL', 'Senegal', 'SEN', 686, 221),
            (189, 'CS', 'SERBIA AND MONTENEGRO', 'Serbia and Montenegro', NULL, NULL, 381),
            (190, 'SC', 'SEYCHELLES', 'Seychelles', 'SYC', 690, 248),
            (191, 'SL', 'SIERRA LEONE', 'Sierra Leone', 'SLE', 694, 232),
            (192, 'SG', 'SINGAPORE', 'Singapore', 'SGP', 702, 65),
            (193, 'SK', 'SLOVAKIA', 'Slovakia', 'SVK', 703, 421),
            (194, 'SI', 'SLOVENIA', 'Slovenia', 'SVN', 705, 386),
            (195, 'SB', 'SOLOMON ISLANDS', 'Solomon Islands', 'SLB', 90, 677),
            (196, 'SO', 'SOMALIA', 'Somalia', 'SOM', 706, 252),
            (197, 'ZA', 'SOUTH AFRICA', 'South Africa', 'ZAF', 710, 27),
            (198, 'GS', 'SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS', 'South Georgia and the South Sandwich Islands', NULL, NULL, 0),
            (199, 'ES', 'SPAIN', 'Spain', 'ESP', 724, 34),
            (200, 'LK', 'SRI LANKA', 'Sri Lanka', 'LKA', 144, 94),
            (201, 'SD', 'SUDAN', 'Sudan', 'SDN', 736, 249),
            (202, 'SR', 'SURINAME', 'Suriname', 'SUR', 740, 597),
            (203, 'SJ', 'SVALBARD AND JAN MAYEN', 'Svalbard and Jan Mayen', 'SJM', 744, 47),
            (204, 'SZ', 'SWAZILAND', 'Swaziland', 'SWZ', 748, 268),
            (205, 'SE', 'SWEDEN', 'Sweden', 'SWE', 752, 46),
            (206, 'CH', 'SWITZERLAND', 'Switzerland', 'CHE', 756, 41),
            (207, 'SY', 'SYRIAN ARAB REPUBLIC', 'Syrian Arab Republic', 'SYR', 760, 963),
            (208, 'TW', 'TAIWAN, PROVINCE OF CHINA', 'Taiwan, Province of China', 'TWN', 158, 886),
            (209, 'TJ', 'TAJIKISTAN', 'Tajikistan', 'TJK', 762, 992),
            (210, 'TZ', 'TANZANIA, UNITED REPUBLIC OF', 'Tanzania, United Republic of', 'TZA', 834, 255),
            (211, 'TH', 'THAILAND', 'Thailand', 'THA', 764, 66),
            (212, 'TL', 'TIMOR-LESTE', 'Timor-Leste', NULL, NULL, 670),
            (213, 'TG', 'TOGO', 'Togo', 'TGO', 768, 228),
            (214, 'TK', 'TOKELAU', 'Tokelau', 'TKL', 772, 690),
            (215, 'TO', 'TONGA', 'Tonga', 'TON', 776, 676),
            (216, 'TT', 'TRINIDAD AND TOBAGO', 'Trinidad and Tobago', 'TTO', 780, 1868),
            (217, 'TN', 'TUNISIA', 'Tunisia', 'TUN', 788, 216),
            (218, 'TR', 'TURKEY', 'Turkey', 'TUR', 792, 90),
            (219, 'TM', 'TURKMENISTAN', 'Turkmenistan', 'TKM', 795, 7370),
            (220, 'TC', 'TURKS AND CAICOS ISLANDS', 'Turks and Caicos Islands', 'TCA', 796, 1649),
            (221, 'TV', 'TUVALU', 'Tuvalu', 'TUV', 798, 688),
            (222, 'UG', 'UGANDA', 'Uganda', 'UGA', 800, 256),
            (223, 'UA', 'UKRAINE', 'Ukraine', 'UKR', 804, 380),
            (224, 'AE', 'UNITED ARAB EMIRATES', 'United Arab Emirates', 'ARE', 784, 971),
            (225, 'GB', 'UNITED KINGDOM', 'United Kingdom', 'GBR', 826, 44),
            (226, 'US', 'UNITED STATES', 'United States', 'USA', 840, 1),
            (227, 'UM', 'UNITED STATES MINOR OUTLYING ISLANDS', 'United States Minor Outlying Islands', NULL, NULL, 1),
            (228, 'UY', 'URUGUAY', 'Uruguay', 'URY', 858, 598),
            (229, 'UZ', 'UZBEKISTAN', 'Uzbekistan', 'UZB', 860, 998),
            (230, 'VU', 'VANUATU', 'Vanuatu', 'VUT', 548, 678),
            (231, 'VE', 'VENEZUELA', 'Venezuela', 'VEN', 862, 58),
            (232, 'VN', 'VIET NAM', 'Viet Nam', 'VNM', 704, 84),
            (233, 'VG', 'VIRGIN ISLANDS, BRITISH', 'Virgin Islands, British', 'VGB', 92, 1284),
            (234, 'VI', 'VIRGIN ISLANDS, U.S.', 'Virgin Islands, U.s.', 'VIR', 850, 1340),
            (235, 'WF', 'WALLIS AND FUTUNA', 'Wallis and Futuna', 'WLF', 876, 681),
            (236, 'EH', 'WESTERN SAHARA', 'Western Sahara', 'ESH', 732, 212),
            (237, 'YE', 'YEMEN', 'Yemen', 'YEM', 887, 967),
            (238, 'ZM', 'ZAMBIA', 'Zambia', 'ZMB', 894, 260),
            (239, 'ZW', 'ZIMBABWE', 'Zimbabwe', 'ZWE', 716, 263)");

            $this->exec("ALTER TABLE `countries` ADD PRIMARY KEY (`id`)");
            $this->exec("ALTER TABLE `countries` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=240; COMMIT");

            break;
  }
 }	
}
?>
