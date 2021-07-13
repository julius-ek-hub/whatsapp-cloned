import * as helper from './helper.js';
import * as ac from './actions-proper.js';
import * as sw from './serviceWorker.js';

export let checkNewMessages = function() {
    let self = this;
    let s = this.settings;
    return new Promise((res, rej) => {
        sw.checkNewMessage(s.id, this.openedChat).then(resp => {
            if (resp.length == 0 || Object.keys(resp).length == 0) {
                res()
                return;
            }
            if (Object.keys(resp).length > 0 && Object.keys(this.chats).length == 0) {
                res()
                window.location.reload();
            }
            let chatIds = Object.keys(resp);
            let chat_index = 0;

            work_on_chat_id();

            function work_on_chat_id() {

                let chatId = chatIds[chat_index];
                if (chat_index >= chatIds.length) {
                    self.resolveMinorIssues().then(() => {
                        res();
                    }).catch(err => {
                        res();
                    })
                    return;
                }
                if (ac.checkBlock(s, chatId, 'reply')) {
                    chat_index++;
                    work_on_chat_id();
                    return;
                }

                if (Object.keys(self.chats).indexOf(chatId) == -1) {

                    sw.getChatInfo(chatId, s.id).then(res => {

                        self.chats[res.chat_id] = { info: res, messages: {} };

                        self.prepareChat({ info: res, messages: {} });

                        chat_index++;
                        work_on_chat_id();
                    }).catch(err => {
                        chat_index++;
                        work_on_chat_id();
                    });

                    return;
                }



                let newMessages = resp[chatId];

                if (newMessages.length == 0) {
                    chat_index++;
                    work_on_chat_id();
                    return;
                }
                newMessages.forEach(message => {
                    message.dateReceived = new Date().UTC_DATE();
                    message['new_'] = true;
                    let lastMess = self.chats[chatId].info.last_message;
                    try {
                        self.updateInnerNotification(chatId, false);

                        self.addMessage(message)
                        self.chats[chatId].messages[message.messageId] = message;
                        let MessagesBox = helper._('#chatBox-' + chatId).child(0).child(1).self;
                        let lastMessageBefore = helper._('#' + lastMess.messageId).parent().self;
                        if (Math.abs((MessagesBox.scrollTop + MessagesBox.clientHeight) - (lastMessageBefore.offsetTop + lastMessageBefore.clientHeight)) < innerHeight / 2.1) {
                            helper.scroll_to(lastMessageBefore, 'smooth', lastMessageBefore.parentElement);
                        }
                        if (self.openedChat == chatId) {
                            ac.play_sound(self, 'receivedIn', chatId);
                            self.updateReceipt(chatId);
                        } else {
                            ac.play_sound(self, 'receivedOut', chatId);
                        }
                    } catch (error) {
                        self.highlighChatHead(message, true);
                        ac.play_sound(self, 'receivedOut', chatId);
                    }
                    self.chats[chatId].info.last_message = message;
                    chat_index++;
                    work_on_chat_id();
                })
            }
        }).catch(err => {
            //Error checking messages
            res();
        })
    })
}

export let updateReceipt = function(chatId) {
    let s = this.settings;
    if (s.read_receipt == 0) {
        return;
    }
    let messages = this.chats[chatId].messages;
    for (let m in messages) {
        let mess = messages[m];
        if ((mess.dateSeen == '0' || chatId.split('_')[0] == 'group') && mess.senderId != s.id) {
            sw.updateReceipt(chatId, mess.messageId, s.id).then(resp => {
                mess.dateSeen = resp;
            });
        }
    }
}

export let check4MessageUpdates = function() {

    let chats = this.chats;
    let s = this.settings;
    let self = this;
    return new Promise((res, rej) => {
        let chatIds = Object.keys(chats);
        if (chatIds.length > 0) {

            handel_chat_ids();

            function handel_chat_ids(chat_id_index = 0) {
                if (chat_id_index >= chatIds.length) {
                    res();
                    return;
                }
                let chatId = chatIds[chat_id_index];

                if (ac.checkBlock(s, chatId) || self.openedChat != chatId) {
                    handel_chat_ids(chat_id_index + 1);
                    return;
                }
                let messages = chats[chatId].messages;
                let messageIds = Object.keys(messages);
                if (messageIds.length > 0) {
                    handle_message_ids();

                    function handle_message_ids(message_id_index = 0) {

                        if (message_id_index >= messageIds.length) {
                            handel_chat_ids(chat_id_index + 1);
                            return;
                        }

                        try {

                            let messageId = messageIds[message_id_index];
                            let message = messages[messageId];
                            let di = message.deleteInfo
                            message.deleteInfo = typeof di == 'string' ? JSON.parse(di) : di;
                            di = message.deleteInfo;
                            let maycheck = false;
                            let si = message.senderInfo.id;
                            let c1 = si != s.id;
                            if (message.isGroup == 1 && di.deleted == 0 && c1) {
                                maycheck = true;
                            } else if (message.isGroup == 0 && di[self.friendId(message.chatId)] == 0 && c1) {
                                maycheck = true;
                            }

                            if (maycheck) {
                                sw.checkDeleted(chatId, messageId, si).then(resp => {
                                    if (resp == 2) {

                                        helper._('#' + messageId).addClass('deleted').truncate().addChild([

                                            helper.make_el('button').class('message-menu').attr({
                                                title: 'Click to take actions on this message',
                                                onclick: (e) => {
                                                    if (self.state.selecting.selecting) {
                                                        return;
                                                    }
                                                    self.actOnMessage(e, messageId);
                                                }
                                            }).html('<span class="material-icons-outlined">more_horiz</span>').self,

                                            helper.make_el('span').class('text-muted ml-4').html('<i class="fa fa-ban"></i> <i>This message was deleted</i>').self

                                        ]);

                                        let lm = chats[chatId].info.last_message;
                                        if (message.isGroup == 1) {
                                            message.deleteInfo.deleted = 2;
                                            lm.deleteInfo.deleted = 2;
                                        } else {
                                            message.deleteInfo[si] = 2;
                                            lm.deleteInfo[si] = 2;
                                        }
                                        if (lm.messageId == message.messageId) {
                                            self.highlighChatHead(lm);
                                        }
                                    }
                                }).catch(err => {
                                    //Err
                                    console.log('Can\'t check for deleted messages => ' + err);
                                })
                            }
                            if (message.dateReceived == '0' ||
                                message.dateSeen == '0' &&
                                message.senderId == s.id) {

                                sw.check4messageUpdates(chatId, messageId, s.id).then(resp => {

                                    try {
                                        let lastM = chats[chatId].info.last_message;
                                        let letM_receipt = helper._('#' + chatId).child(1).self.childNodes[1].firstChild;
                                        let message_gui = helper._('#' + messageId).self.lastChild.lastChild.lastChild;
                                        let dr = resp.dateReceived;
                                        let ds = resp.dateSeen;
                                        if (dr != '0' && message.dateReceived == '0') {
                                            message.dateReceived = dr;
                                            message_gui.innerHTML = 'done_all';
                                            if (lastM.senderId == message.senderId) {
                                                letM_receipt.innerHTML = 'done_all';
                                                lastM.dateReceived = dr;
                                            }
                                        } else if (ds != '0' && message.dateSeen == '0') {
                                            message.dateSeen = ds;
                                            message_gui.innerHTML = 'done_all';
                                            message_gui.classList.add('seen');
                                            if (lastM.senderId == message.senderId) {
                                                letM_receipt.innerHTML = 'done_all';
                                                letM_receipt.classList.add('seen');
                                                lastM.dateSeen = ds;
                                            }
                                        }
                                    } catch (er) {}
                                    handle_message_ids(message_id_index + 1);
                                }).catch(err => {
                                    //Err
                                    handle_message_ids(message_id_index + 1);
                                })
                            } else {
                                handle_message_ids(message_id_index + 1);
                            }
                        } catch (e) {
                            handel_chat_ids(chat_id_index + 1);
                        }
                    }
                } else {
                    handel_chat_ids(chat_id_index + 1);
                }
            }
        } else {
            res()
        }
    })
}

export let checkTyping = function() {
    let self = this;
    let availableChats = self.chats;
    let ids = Object.keys(availableChats);
    return new Promise((res, rej) => {
        if (ids.length > 0) {
            let index = 0;
            check()

            function check() {
                if (index >= ids.length) {
                    res();
                    return;
                }
                let id = ids[index];
                let info = availableChats[id].info;

                if (ac.checkBlock(self.settings, id) || id.split('_')[0] == 'group') {
                    index++;
                    check();
                    return;
                }
                sw.checkTyping(info.id).then(res => {

                    let now = new Date(new Date().UTC_DATE());
                    let then = new Date(res.date);
                    let mess_ = res.message + '...';
                    let affected = helper._('#' + id).child(1);
                    let typing = affected.child(2);
                    let mess = affected.child(1);
                    if ((now.getTime() - then.getTime()) / 1000 <= 1 && res.chat == id) {
                        mess.hide();
                        typing.show();
                        if (typing.htm() != mess_) {
                            typing.html(mess_)
                        }
                        try {
                            let info = helper._('#chatBox-' + id).child(0).child(0).child(0).child(0).child(0).child(1).child(0).child(1);
                            if (info.htm() != mess_)
                                info.html(mess_);
                        } catch (error) {}
                    } else {
                        mess.show();
                        typing.hide();
                        try {
                            helper._('#chatBox-' + id).child(0).child(0).child(0)
                                .child(0).child(0).child(1).child(0).child(1)
                                .html(ac.lastSeen(self.chats[id].info.lastSeen));
                        } catch (error) {}
                    }
                    index++;
                    check();
                }).catch(err => {
                    //Err
                    index++;
                    check();
                })
            }
        } else { res() }
    })
}

export let checkLastSeen = function() {
    let self = this;
    let availableChats = this.chats;
    let ids = Object.keys(availableChats);
    return new Promise((res, rej) => {
        if (ids.length > 0) {

            let index = 0;
            check()

            function check() {
                if (index >= ids.length) {
                    res();
                    return;
                }
                let id = ids[index];
                if (ac.checkBlock(self.settings, id) || availableChats[id].info.group == 1) {
                    index++;
                    check();
                    return;
                }

                sw.checkLastSeen(availableChats[id].info.id).then(res => {
                    if (availableChats[id].info.lastSeen != res) {
                        self.chats[id].info.lastSeen = res;
                        try {
                            let target = helper._('#chatBox-' + id).child(0).child(0).child(0)
                                .child(0).child(0).child(1).child(0).child(1);
                            if (target.htm() != 'Typing...')
                                target.html(ac.lastSeen(res));
                        } catch (error) {}
                    }
                    index++;
                    check();
                }).catch(err => {
                    index++;
                    check();
                })
            }
        } else { res() }
    })
}

export let updateChatsInfo = function() {
    let chat_ids = Object.keys(this.chats);
    let self = this;

    return new Promise((res, rej) => {
        if (chat_ids.length < 1) {
            res()
            return;
        }
        let index = 0;

        function check() {
            if (index >= chat_ids.length) {
                res();
                return;
            }
            let chat_id = chat_ids[index];
            let ci = self.chats[chat_id].info;
            let ms = self.chats[chat_id].messages;
            let lm = ci.last_message;
            sw.getChatInfo(chat_id, self.settings.id).then(newInfo => {
                let lm_ = newInfo.last_message;
                if ((lm.dateReceived == 0 && lm_.dateReceived != 0) ||
                    (lm.dateSeen == 0 && lm_.dateSeen != 0)) {
                    self.highlighChatHead(lm_);
                }
                if (!newInfo.available_db_mess.every(el => el.messageId.in(Object.keys(ms)))) {
                    self.refreshMessages(chat_id);
                }
                if (ci.dp != newInfo.dp) {
                    let src = self.dp(newInfo.dp, ci.id);
                    helper._('#' + chat_id).child(0).child(0).self.src = src;
                    try {
                        helper._('#chatBox-' + chat_id).child(0).child(0).child(0).child(0).child(0).child(0).child(0).lastChild.self.src = src;
                        self.refreshMessages(chat_id);
                    } catch (err) {}
                }

                self.block(chat_id, newInfo.blocked);

                if (ci.tel != newInfo.tel && newInfo.custom_name == 0) {
                    let tel = newInfo.tel;
                    helper._('#' + chat_id).child(1).child(0).html(tel);
                    try {
                        helper._('#chatBox-' + chat_id).child(0).child(0).child(0).child(0).child(0).child(1).child(0).child(0).html(tel);
                        self.refreshMessages(chat_id);
                    } catch (err) {}
                }

                try { self.chats[chat_id].info = newInfo; } catch (e) {}
                index++;
                check();
            }).catch(e => {
                index++;
                check();
            })
        }
        check();
    })
}