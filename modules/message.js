import * as helper from './helper.js';
import * as ac from './actions-proper.js';
import * as sw from './serviceWorker.js';

export let autoWelcomeMessage = function(chat) {

    let self = this;

    function send(message) {
        return new Promise((res, rej) => {
            let s = self.settings;
            let d = {};
            d['messageId'] = '';
            d['chatId'] = chat;
            d['senderId'] = '0001';
            d['message'] = message.escape();
            d['dateSent'] = 0;
            d['dateReceived'] = 0;
            d['dateSeen'] = 0;
            d['replyingTo'] = 0;
            d['fileInfo'] = 0;
            d['forwarded'] = 0;
            d['isGroup'] = 0;
            d['deleteInfo'] = {};
            d['deleteInfo'][self.friendId(chat)] = 0;
            d['deleteInfo'][s.id] = 0;
            d['senderInfo'] = {
                username: 'Julius',
                dp: '',
                id: '0001',
                country: 'ae',
                tel: '+971000000000'
            }

            sw.sendMessage(d).then(() => {
                res()
            }).catch(e => {
                console.log(e)
                rej()
            })
        })
    }

    const a = `*Hi there!*
         Thanks for taking your precious time to test my project. If you are a developer I will be so glad to have you as a mentor cuz I am just a junior developer but if you are a junior like me, we can work together. For any of the above, we can begin by sharing reliable contacts.
          If you are not a developer then God bless you for your support especially in your career.
          Try to read everything about the features here => ${self.root.split('/app')[0]} and try them all not forgetting to report any issue.`;
    const a1 = `You can download the project for free from the GitHub repository https://github.com/julius-ek-hub/whatsapp-clone
        But if you need concise source codes for some particular features in the project, then drop me an email here -> aids@247-dev.com with subject *WhatsApp Clone*`;
    const b = `All my Online channels are new, please help me grow it together by:
        Subscribing -> https://www.youtube.com/channel/UCyfzaf7uohrk_a1NTdWzakg?sub_confirmation=1 
        ============ 
        Follow me on Twitter -> https://twitter.com/247developer 
        ============
        Like the Facebook page -> https://www.facebook.com/julius.ekane.946/
        Plssssss.. 
        Thank you all! 
        If you want to buy me a coffee, you can do that here -> https://www.buymeacoffee.com/julius.ek as God continues to bless you`;
    const c = `My name is *Julius Ekane* and I am a *Cameroonian* residing in the *UAE.* Programming has been my hobby, interest, joy, ever since 2017.
         I may not have studied it in a physical school but I appreciate myself for putting a lot of efforts getting resources online.`;
    const _d = `It was a terribly difficult thing in the beginning but now I can take whatever language I want.`;
    const e = `If you are a junior developer like me or an aspirant, this should be a motivation, we all must get there. Now let\'s talk`;
    const f = `How are you doing? Tell me about yourself.`;
    const g = `And sorry the messages upto this one are automatic. Once you reply, I will be here live else just add your email by going to your profile so we can meet again.`;
    const all = [a, a1, b, c, _d, e, f, g];

    function start(index = 0) {
        if (index >= all.length) {
            return;
        }
        send(all[index]).finally(() => {
            start(index + 1)
        })
    }
    start();

}

export let prepareMessage = function(unprepared, file) {
    let s = this.settings;
    let d = {};
    let cid = this.openedChat;
    let spl = unprepared.id.split('-');
    if (spl.length == 2 && spl[0] == 'quickreply') {
        cid = spl[1];
    }
    let fs = cid.split('_');
    let group = fs[0] == 'group';
    d['messageId'] = helper.random(900000, 78973898) + '_' + new Date().UTC_TIME();
    d['chatId'] = cid;
    d['senderId'] = s.id;
    d['message'] = (file ? file.caption : unprepared.value.trim()).escape()
    d['dateSent'] = 0;
    d['dateReceived'] = 0;
    d['dateSeen'] = 0;
    d['replyingTo'] = this.state.replyingTo;
    d['fileInfo'] = file ? file.file : 0;
    d['forwarded'] = 0;
    d['isGroup'] = group ? 1 : 0;
    d['deleteInfo'] = {};
    if (!group) {
        d['deleteInfo'][this.friendId(cid)] = 0;
        d['deleteInfo'][s.id] = 0;
    }
    d['senderInfo'] = {
        username: s.username,
        dp: s.dp,
        id: s.id,
        country: s.country,
        tel: s.tel
    }
    return d;
}

export let messageSent = function(client, server) {
    try {
        let s = this.settings;
        server['senderInfo'] = {
            username: s.username,
            tel: s.tel,
            dp: s.dp,
            id: s.id,
            country: s.country,
            name_col: s.name_col
        }
        if (server.isGroup == 1) {
            server.deleteInfo['deleted'] = 0;
        }
        delete this.chats[client.chatId].messages[client.messageId];
        this.chats[server.chatId].messages[server.messageId] = server;
        this.chats[server.chatId].info.last_message = server;
        this.highlighChatHead(server);
        let message_gui = helper._('#' + client.messageId.toString()).removeClass('message-sending');
        message_gui.id(server.messageId);
        message_gui.lastChild.lastChild.firstChild.removeClass('text-danger').html(new Date(server.dateSent).format('h:ia') + ' ');
        message_gui.lastChild.lastChild.lastChild.removeClass('text-danger').style({ cursor: 'unset' }).clicked(() => { return; }).html('done');
        ac.play_sound(this, 'sent', server.chatId);
    } catch (err) {}
}

export let messageSentFailed = function(client) {
    try {
        let s = this.settings;
        let message_gui = helper._('#' + client.messageId.toString()).removeClass('message-sending');
        let d = message_gui.lastChild.lastChild.firstChild.addClass('text-danger').html('Couldn\'t send');
        let rec = message_gui.lastChild.lastChild.lastChild.addClass('text-danger').style({ cursor: 'pointer' }).clicked(() => {
            let sel = new helper.Modal().RequestSelection();
            sel.title = '';
            sel.options = [

                { id: 'del', value: 'Delete' },
                { id: 'res', value: 'Resend' },
                { id: 'null', value: 'Two things can cause a message not to be sent; Network issues or either of you has block the other', disabled: true }
            ];
            sel.request().then(res => {
                if (res == 'del') {
                    delete this.chats[client.chatId].messages[client.messageId];
                    message_gui.parent().delete();
                    this.bottomInfo('Deleted', 'success');
                } else {
                    if (!ac.checkBlock(s, client.chatId)) {
                        message_gui.addClass('message-sending');
                        d.removeClass('text-danger').html('--- ');
                        rec.removeClass('text-danger').style({ cursor: 'unset' }).clicked(() => { return; }).html('pending');

                        if (client.fileInfo != 0 && client.fileInfo.type != 'gif' && client.upload_this_file_first) {
                            this.sendMessageFiles(client, true);
                            return;
                        }

                        sw.sendMessage(client).then(resp => {
                            this.messageSent(client, resp);
                        }).catch(err => {
                            this.messageSentFailed(client)
                        })
                    }
                }
            }).catch(e => {});
        }).html('error_outline');
    } catch (err) {}
}

export let default_ = function(message, txtarea) {
    this.prepareReply(message.messageId, true);
    this.sendGIF(true)
    this.updateInnerNotification(message.chatId, true);
    if (!(txtarea.hasOwnProperty('forwarded') && txtarea.forwarded > 0)) {
        txtarea.value = '';
        txtarea.focus();
        try { ac.typingMessage(txtarea); } catch (err) {}
    }
    let m = helper._(`#${message.messageId}`.toString()).parent();
    helper.scroll_to(m.self, 'smooth', m.parent().self);
}

export let addMessage = function(details, unprepared, file) {

    let s = this.settings;
    let self = this
    if (unprepared) {
        return new Promise((res, rej) => {

            let forwarding = unprepared.hasOwnProperty('forwarded') && unprepared.forwarded > 0;
            let prepared = forwarding ? unprepared : this.prepareMessage(unprepared, file);
            prepared['new_'] = true;
            let nu = this.state.needUpload;
            if (nu.length == 0) {
                let id_ = forwarding ? [] : unprepared.id.split('-');
                let can_add_gui = (id_.length == 2 && id_[0] == 'quickreply' && id_[1].in(this.openedChats)) || prepared.chatId.in(this.openedChats);
                if (can_add_gui) {
                    this.addMessage(prepared);
                    this.chats[prepared.chatId].messages[prepared.messageId] = prepared;
                    this.chats[prepared.chatId].info.last_message = prepared
                    this.default(prepared, unprepared);
                }
                if (!ac.checkBlock(s, prepared.chatId)) {

                    sw.sendMessage(prepared).then(resp => {
                        if (can_add_gui) { self.messageSent(prepared, resp); }
                        res();
                    }).catch(err => {
                        console.error(err)
                        if (can_add_gui) { self.messageSentFailed(prepared); }
                        res();
                    })
                } else {
                    if (can_add_gui) { self.messageSentFailed(prepared); }
                    res()
                }
            } else {
                this.sendMessageFiles(unprepared).then(() => {
                    res()
                });
            }
        });

    } else {
        try {
            let messagesBox = helper._('#chatBox-' + details.chatId).child(0).child(1);
            let no_message = messagesBox.children.length == 2;
            let n = details.dateSent;
            let lm = this.chats[details.chatId].info.last_message;
            let oldDate = new Date(lm.dateSent).format('d/m/y');
            let newDate = new Date(n == 0 ? new Date().UTC_DATE() : n).format('d/m/y');
            if ((oldDate != newDate && !(lm.dateSent == 0 && lm.messageId.split('_sn_').length == 1)) ||
                Object.keys(this.chats[details.chatId].messages).length == 0 || no_message) {
                messagesBox.addChild(this.buildMessageGUI(details, 'date'));
            }
            messagesBox.addChild(this.buildMessageGUI(details));
            let new_ = false;
            if (details.hasOwnProperty('new_')) {
                new_ = details.new_;
            }
            this.highlighChatHead(details, new_);
            delete details.new_;
        } catch (e) {
            console.log(e)
        }
    }
}

export let sendMessageFiles = function(textarea, resending) {
    let self = this;
    let files = this.state.needUpload;
    let s = this.settings;
    let txt;
    let need_upload = [];
    let ind = 0;
    if (resending) {
        let file = textarea.upload_this_file_first;
        sw.uploadMessageFile(file.file, s.id, file.type, (progress) => {}).then(uploaded => {
            textarea.fileInfo.url = uploaded;
            delete textarea.upload_this_file_first;
            final_sending(textarea).then(() => {}).catch(err => {})
        }).catch(err => {
            self.messageSentFailed(textarea, true);
        })
        this.state.needUpload = [];
    } else {

        return new Promise((res, rej) => {

            txt = textarea.value;

            function add_file() {
                if (ind >= files.length) {
                    start_with_files();
                    return;
                }
                setTimeout(() => {

                    let file = files[ind];
                    let cap = ind == files.length - 1 ? txt : '';
                    let ret = { file: { type: file.type, duration: file.duration }, caption: cap };
                    if (file.type == 'gif') {
                        ret.file['url'] = file.url;
                        ret.file['size'] = file.size;
                    } else {
                        let f = new helper.File_(file.file);
                        ret.file['url'] = f.URL;
                        ret.file['size'] = f.worked_size();
                    }
                    let prepared = self.prepareMessage(textarea, ret);
                    self.addMessage(prepared);
                    self.chats[prepared.chatId].messages[prepared.messageId] = prepared;
                    self.chats[prepared.chatId].info.last_message = prepared;
                    self.default(prepared, textarea);

                    if (file.type == 'gif') {
                        final_sending(prepared).then(() => {
                            ind++;
                            add_file();
                        }).catch(() => {
                            ind++;
                            add_file();
                        })
                    } else {
                        prepared['upload_this_file_first'] = { file: file.file, type: file.type };
                        need_upload.push(prepared);
                        ind++;
                        add_file();
                    }


                }, 500);

            }
            add_file();


            function start_with_files() {
                if (need_upload.length > 0) {
                    let index = 0;

                    function upload() {
                        if (index >= need_upload.length) {
                            self.state.needUpload = [];
                            res();
                            return;
                        }
                        let prepared = need_upload[index];
                        let file = prepared.upload_this_file_first;

                        sw.uploadMessageFile(file.file, s.id, file.type, (progress) => {}).then(uploaded => {
                            prepared.fileInfo.url = uploaded;
                            delete prepared.upload_this_file_first;
                            final_sending(prepared).then(() => {

                                index++;
                                upload();
                            }).catch(err => {
                                index++;
                                upload();
                            })
                        }).catch(err => {
                            self.messageSentFailed(prepared);
                            index++;
                            upload();
                        })
                    }
                    upload();
                } else {
                    self.state.needUpload = [];
                    res();
                }
            }
        })
    }

    function final_sending(prepared) {
        return new Promise((res, rej) => {
            sw.sendMessage(prepared).then(resp => {
                self.messageSent(prepared, resp);
                res();
            }).catch(er => {
                console.error(er)
                self.messageSentFailed(prepared);
                rej()
            })
        })
    }
}

export let sort_messages = function(messages, chat) {
    let keys = Object.keys(messages);
    let keys_sent = keys.filter(key => { return key.split('_sn_').length == 2 }).map(key_ => { return Number(key_.split('_sn_')[1]) }).sort(function(a, b) { return a - b });
    let keys_unsent = keys.filter(key => { return key.split('_sn_').length == 1 });
    let final = {};
    keys_sent.forEach(k => {
        let sort_key = chat + '_sn_' + k;
        final[sort_key] = messages[sort_key]
    });
    if (keys_unsent.length > 0) {
        keys_unsent.forEach(k => {
            final[k] = messages[k];
        });
    }

    return final;
}

export let loadMoreMessages = function(holder) {
    let self = this;
    let s = this.settings;
    let cid = this.openedChat;
    let chat = this.chats[cid];
    if (window.hasOwnProperty('loading_messages_for') && window.loading_messages_for == cid) {
        return;
    }
    let min = Math.min(...Object.keys(chat.messages).filter(_id => { return _id.split('_sn_').length == 2; }).map(_id => { return Number(_id.split('_sn_')[1]) }));
    let spin = holder.child(1).child(0).disable().child(0).addClass('spin');
    window.loading_messages_for = cid;
    sw.loadMessages(cid, s.id, { max: min - 1, refreshing: '' }).then(resp => {
        chat.messages = this.sort_messages(chat.messages, cid);
        let len = resp.length;
        if (len > 0) {
            if (len < 10) { holder.child(1).hide() }
            resp.reverse();

            let add_to_chat = (index = 0) => {
                if (index >= len) {
                    self.updateReceipt(cid);
                    spin.removeClass('spin').parent().enable();
                    window.loading_messages_for = null;
                    return;
                }
                let message = resp[index];

                let gp = cid.split('_')[0] == 'group';
                let di = typeof message.deleteInfo == 'string' ? JSON.parse(message.deleteInfo) : message.deleteInfo;
                message.deleteInfo = di;
                if ((gp && String(di.deleted).in(['2', '0'])) || (!gp && String(di[s.id]).in(['0', '2']))) {

                    let keys = Object.keys(chat.messages);
                    let firstExistingMessage = chat.messages[keys[0]];
                    let f = message.dateSent.split(' ')[0].trim();
                    let n = firstExistingMessage.dateSent.split(' ')[0].trim();
                    if (f != n) {
                        helper._(this.buildMessageGUI(message, 'date')).insertAfter(holder.child(1).self);
                    }
                    helper._(this.buildMessageGUI(message)).insertAfter(holder.child(2).self);

                }
                chat.messages[message.messageId] = message;
                chat.messages = this.sort_messages(chat.messages, cid);
                add_to_chat(index + 1);
            }
            add_to_chat();

        } else {
            holder.child(1).hide()
        }

    }).catch(err => {
        spin.removeClass('spin').parent().enable();
        window.loading_messages_for = null;
    })
}

export let refreshMessages = function(chat_id) {
    let s = this.settings;
    let recording = this.state.recording;
    let uploading = this.state.needUpload.length != 0;
    let replying = this.state.replyingTo != '0';
    let selecting = this.state.selecting.selecting;
    let loading_url_info = window.url_info_on_request.length != 0;
    let playing_voice = this.state.playingChat == chat_id;
    let busy = window.hasOwnProperty('loading_messages_for') && window.loading_messages_for == chat_id;
    let calling = this.state.calling;
    if (chat_id != this.openedChat ||
        recording ||
        uploading ||
        replying ||
        selecting ||
        busy ||
        loading_url_info ||
        playing_voice ||
        calling) {
        return;
    }
    let min;
    try {
        min = Math.min(...Object.keys(this.chats[chat_id].messages).filter(_id => { return _id.split('_sn_').length == 2; }).map(_id => { return Number(_id.split('_sn_')[1]) }));
    } catch (e) {
        min = 0;
    }
    min = min == Infinity ? 0 : min;
    window.loading_messages_for = chat_id;
    let df = this.defaultMessage.self.cloneNode(true);
    let holder = helper._('#chatBox-' + chat_id).child(0).child(1);
    let load = helper._(holder.child(1).self.cloneNode(true));
    holder.child(1).child(0).disable().child(0).addClass('spin');
    sw.loadMessages(chat_id, s.id, { max: '', refreshing: min }).then(resp => {
        holder.truncate().addChild([df, load.self]);
        this.chats[chat_id].messages = {};
        if (resp.length > 0) {
            resp.forEach(message => {
                let gp = chat_id.split('_')[0] == 'group';
                let di = typeof message.deleteInfo == 'string' ? JSON.parse(message.deleteInfo) : message.deleteInfo;
                message.deleteInfo = di;
                if ((gp && String(di.deleted).in(['2', '0'])) || (!gp && String(di[s.id]).in(['0', '2']))) {

                    if ((message.dateSeen == '0' && !gp) && message.senderId != s.id) {
                        this.updateInnerNotification(chat_id, false);
                    }
                    this.addMessage(message);

                }
                this.chats[chat_id].messages[message.messageId] = message;
                this.chats[chat_id].info.last_message = message;
            });

            this.updateReceipt(chat_id);
        }
        load.child(0).enable().clicked(() => {
            this.loadMoreMessages(holder)
        }).child(0).removeClass('spin');
    }).catch(e => {
        holder.child(1).child(0).enable().child(0).removeClass('spin');
    }).finally(() => {
        this.destroyMessageSelection();
        window.loading_messages_for = null;
    })
}

export let sendGIF = function(close) {
    let self = this;
    let cid = this.openedChat;
    let searching = this.settings.recent_gif;
    let gifFrame = helper._('#gif-frame-' + cid);
    gifFrame.parent().style({ borderRadius: '10px' })
    if (gifFrame.Height > 70 || close) {
        gifFrame.truncate().setHeight('0px');
        gifFrame.parent().style({ borderRadius: '30px' })
    } else {
        let gif_holder = helper.make_el('div').style({
            minHeight: '50px',
            maxHeight: '200px',
            overflow: 'auto',
            textAlign: 'center',
        }).class('all-gifs');
        let search_indicator = helper.make_el('div').class('btn-sm text-center').hide();
        gifFrame.style({ height: 'auto' }).addChild([
            helper.make_el('div').class('input-group-prepend').addChild([
                helper.make_el('input').attr({
                    type: 'search',
                    placeholder: 'Search GiF...',
                    class: 'form-control outline-none',
                    style: {
                        borderTopRightRadius: '0',
                        borderBottomRightRadius: '0',
                        boxShadow: 'none'
                    }
                }).self,
                helper.make_el('span').attr({
                    class: 'input-group-text material-icons-outlined',
                    style: {
                        borderTopLeftRadius: '0',
                        borderBottomRightRadius: '0',
                        cursor: 'pointer'
                    },
                    onclick: (e) => {
                        let txt = e.target.previousSibling;
                        if (txt.value.empty()) {
                            return;
                        }
                        searching = txt.value.trim();
                        search_gif();
                        txt.value = '';
                    }
                }).html('search').self
            ]).self,
            search_indicator.self,
            gif_holder.self
        ]);

        function search_gif() {
            search_indicator.html('Loading GiF...<i class="fa fa-spinner fa-pulse"></i>').show();
            sw.searchGIF(searching).then(resp => {
                search_indicator.hide()
                resp = resp.results;
                if (resp.length > 0) {
                    gif_holder.truncate();
                    let x = (gif_holder.Width / Math.ceil(innerWidth / 200)) - 2;
                    resp.forEach(res => {
                        let gif = res.media[0].nanogif;
                        helper.make_el('button').style({
                            width: x + 'px',
                            height: x + 'px',
                            padding: '0px',
                            border: '0.2px solid rgba(18, 140, 126, 0.5)'
                        }).class('btn').addChild(
                            helper.make_el('img').attr({
                                src: gif.url,
                                style: {
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    background: res.bg_color
                                }
                            }).self
                        ).appendTo(gif_holder.self).clicked(() => {
                            self.state.needUpload = [{
                                type: 'gif',
                                url: gif.url,
                                size: new helper.File_().worked_size(gif.size),
                                duration: 0.0
                            }];
                            gifFrame.truncate().setHeight('0px');
                            gifFrame.parent().style({ borderRadius: '30px' });
                            self.addMessage(null, gifFrame.parent().child(3).self);
                        })
                    })
                    self.settings.recent_gif = searching;
                }
            }).catch(err => {
                search_indicator.html('<div class="text-danger"><i class="fa fa-warning"></i> Failed to load GiF</div>').show();
                setTimeout(() => {
                    if (gifFrame.Height > 70)
                        search_gif();
                }, 5000);
            })
        }
        search_gif();

        let re_arrange_gifs = () => {
            let x = (gif_holder.Width / Math.ceil(innerWidth / 200)) - 2;
            gif_holder.children.forEach(c => {
                helper._(c).style({
                    width: x + 'px',
                    height: x + 'px',
                });
            })
        }

        window.resize_callbacks.push(re_arrange_gifs)
    }
}