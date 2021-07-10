import * as helper from './helper.js';
import * as ac from './actions-proper.js';
import * as sw from './serviceWorker.js';

export let confirmDelete = function(single) {
    let s = this.settings;
    let selected = single ? [single] : this.state.selecting.selected;
    let messages = this.chats[this.openedChat].messages;

    let d = new helper.Modal();
    return new Promise((res, rej) => {
        let actions = [
            helper.make_el('div').style({
                padding: '6px'
            }).html('<i class="fa fa-warning"></i> Delete ' +
                (selected.length == 1 ? '1 message' : selected.length + ' messages') + '. This action is irreversible').self,
            helper.make_el('button').class('btn btn-light').attr({
                style: { display: 'block', width: '100%', textAlign: 'left' },
                onclick: () => {
                    d.close();
                    if (selected.some(el => {
                            let m = messages[el]
                            let di = m.deleteInfo;
                            di = typeof di == 'string' ? JSON.parse(di) : di;
                            return (((m.isGroup == 0 && m.deleteInfo[s.id] == 2) || di.deleted == 2) && m.senderInfo.id == s.id)
                        }))
                        res(3);
                    else
                        res(1)
                }
            })
            .html('Delete for me').self,
        ];

        if (selected.every(el => {
                let m = messages[el];
                let di = m.deleteInfo;
                di = typeof di == 'string' ? JSON.parse(di) : di;
                let c1 = m.senderInfo.id == s.id;
                let c2 = (new Date().getTime() - new Date(m.dateSent).getTime()) / (1000 * 60 * 60) <= 1;
                if (m.isGroup == 1) {
                    return c1 && c2 && di.deleted == 0
                } else {
                    let ids = m.chatId.split('_')[1].split('x');
                    let friend = ids[0] == s.id ? ids[1] : ids[0];
                    return c1 && c2 && di[s.id] == 0 && di[friend] == 0;
                }

            })) {
            actions.push(
                helper.make_el('button').class('btn btn-light').attr({
                    style: { display: 'block', width: '100%', textAlign: 'left' },
                    onclick: () => {
                        d.close();
                        res(2);
                    }
                }).html('Delete for everyone').self
            )
        }
        actions.push(
            helper.make_el('div').style({
                textAlign: 'right'
            }).addChild(
                helper.make_el('button').attr({
                    class: 'btn',
                    onclick: () => {
                        d.close();
                    }
                }).html('Cancel').self
            ).self
        );
        let body = helper.make_el('div').style({
            display: 'inline-block',
            background: 'white',
            padding: '5px',
            borderRadius: '8px'
        }).addChild(actions).self
        d.add_content(body)
        d.open()
    });
}
export let createMessageSelection = function(id) {
    let s = this.settings;
    let holder = helper._('#chatBox-' + this.openedChat).child(0).child(0).child(0).child(0).child(0);
    let icons = holder.child(1).child(1);
    [holder.child(0), holder.child(2), holder.child(3)].forEach(el => {
        el.hide();
    })
    icons.style({ right: '0' });
    this.state.selecting.selecting = true;
    let selected = this.state.selecting.selected;
    let messages = this.chats[this.openedChat].messages;
    if (selected.includes(id)) {
        helper._('#' + id).parent().style({ backgroundColor: 'unset', padding: 'unset' });
        selected.splice(selected.indexOf(id), 1);
    } else {
        selected.push(id)
        helper._('#' + id).parent().style({ backgroundColor: 'rgba(0,255,0,0.2)', padding: '4px' });
    }
    if (selected.length == 0) {
        this.destroyMessageSelection()
    } else {
        if (selected.every(el => {
                let m = messages[el];
                let del = m.deleteInfo;
                let deleted = true;
                if (m.isGroup == 1 && del.deleted == 0) {
                    deleted = false;
                } else {
                    if (del[s.id] == 0 && String(del[this.friendId(m.chatId)]).in(['0', '1']))
                        deleted = false;
                }

                return !deleted;
            })) {
            icons.child(2).show();
            icons.child(3).show();
        } else {
            icons.child(3).hide();
        }
        if (selected.length == 1 && selected.every(el => {
                let m = messages[el];
                let del = m.deleteInfo;
                let deleted = true;
                if (m.isGroup == 1 && del.deleted == 0) {
                    deleted = false;
                } else {
                    if (del[this.statusHolder.id] == 0 && String(del[this.friendId(m.chatId)]).in(['0', '1']))
                        deleted = false;
                }
                return !deleted;
            })) {
            icons.child(2).show()
        } else {
            icons.child(2).hide()
        }
    }
    icons.child(0).html(this.state.selecting.selected.length)
}
export let destroyMessageSelection = function() {
    let holder = helper._('#chatBox-' + this.openedChat).child(0).child(0).child(0).child(0).child(0);
    let icons = holder.child(1).child(1);
    [holder.child(0), holder.child(2), holder.child(3)].forEach(el => {
        el.show();
    })
    icons.style({ right: '-100%' });
    let selected = this.state.selecting.selected;
    if (selected.length > 0) {
        selected.forEach(sel => {
            try {
                helper._('#' + sel).parent().style({ backgroundColor: 'unset', padding: 'unset' });
            } catch (err) {}
        });
    }
    this.state.selecting.selecting = false;
    this.state.selecting.selected = [];
}
export let actOnMessage = function(target, message_id) {
    let s = this.settings;
    let details = this.chats[this.openedChat].messages[message_id];
    if (this.state.selecting.selecting == true ||
        message_id.split('_sn_')[0] != this.openedChat ||
        (details.isGroup == 1 && details.senderId != s.id && details.deleteInfo.deleted == 2)) {
        return;
    }
    let si = details.senderInfo;
    details.senderInfo['senderName'] = this.username(si.id, si.tel);
    ac.messageActionsPc(target, details, s.id).then(resp => {
        switch (resp) {
            case 'del':
                this.confirmDelete(details.messageId).then(del => {
                    this.updateInnerNotification(this.openedChat, true)
                    ac.deleteMessage(del, this, [details.messageId]);
                    this.state.selecting.selecting = false;
                    this.state.selecting.selected = [];
                }).catch(e => {
                    this.bottomInfo('Failed to delete', 'error');
                })
                break;
            case 'sel':
                this.createMessageSelection(details.messageId);
                break;
            case 'rep':
                this.prepareReply(details.messageId, false)
                break;
            case 'forward':
                this.state.selecting = { selected: [details.messageId], selecting: true };
                this.forwardMessages();
                break;
            case 'copy':
                this.copyMessage(details);
                break;
            case 'share':
                this.shareMessage(details);
                break;
            case 'info':
                this.messageInfo(details);
                break;
            case 'open':
                this.openConversation(details);
        }
    })
}
export let forwardMessages = function() {
    let selected = this.state.selecting.selected;
    let s = this.settings;
    let myChats = Object.keys(this.chats)
    let sel = new helper.Modal().RequestSelection();
    sel.title = 'Forward to....';
    sel.multiple = true;
    sel.add_search = true;
    sel.okText = '<span>()</span> Forward';
    let self = this;
    sel.onselect = function(clicked) {
        let chosen = clicked.self.id;
        if (sel.selected.includes(chosen)) {
            sel.selected.splice(sel.selected.indexOf(chosen), 1);
            clicked.style({
                background: 'initial'
            })
        } else {
            if (sel.selected.length > 9) {
                self.bottomInfo('Can only forward to maximum 10 chats at a time', 'error');
            } else {
                sel.selected.push(chosen);
                clicked.style({
                    background: 'rgba(0,255,0,0.2)'
                })
            }
        }
        if (sel.selected.length > 0)
            sel.foot.child(0).show().child(0).html('(' + sel.selected.length + ')');
        else
            sel.foot.child(0).hide();
    }
    myChats.forEach(chat => {
        let info = this.chats[chat].info;
        let name = info.custom_name
        let gp = 'Group';
        if (info.group == 0) {
            gp = "DM";
            name = this.username(info.id, info.tel);
        }
        let disabledInfo = ['0', 0, s.id].includes(info.blocked) ? '' : '<i class="fa fa-ban"></i> ';
        let dp = info.group == 1 ? this.defaultDp : this.dp(info.dp, info.id);
        sel.options.push({
            disabled: disabledInfo,
            id: chat,
            value: `${disabledInfo} <img src= "${dp}" class="dp"> ${name}<span class="text-secondary font-weight-lighter font-size-sm" style="float:right">~ ${gp}</span>`
        });
    });


    sel.request().then(() => {
        let loader = new helper.Modal().Loading('<div class="text-muted">Forwarding ... <i class="fa fa-spinner fa-spin" style="font-size:24px"></i></div>');

        function select_chat(index_c = 0) {
            if (index_c >= sel.selected.length) {
                self.destroyMessageSelection();
                loader.loader.close();
                return;
            }

            let c_chat = sel.selected[index_c];

            function select_message(index_m = 0) {
                if (index_m >= selected.length) {
                    select_chat(index_c + 1);
                    return;
                }
                let d = JSON.parse(JSON.stringify(self.chats[self.openedChat].messages[selected[index_m]]));
                let group = c_chat.split('_')[0] == 'group';

                d.messageId = helper.random(900000, 78973898) + '_' + new Date().UTC_TIME();
                d.chatId = c_chat;
                d.senderId = s.id;
                d.replyingTo = 0;
                d.forwarded = d.forwarded + 1;
                d.isGroup = group ? 1 : 0;
                d.deleteInfo = {};
                if (!group) {
                    d.deleteInfo[self.friendId(c_chat)] = 0;
                    d.deleteInfo[s.id] = 0;
                }
                d.senderInfo.username = s.username
                d.senderInfo.name_col = s.name_col
                d.senderInfo.dp = s.dp
                d.senderInfo.country = s.country
                d.senderInfo.tel = s.tel
                d.dateSent = new Date().UTC_DATE();
                d.dateReceived = 0;
                d.dateSeen = 0;

                self.addMessage(null, d).then(() => {
                    select_message(index_m + 1)
                });

            }
            select_message();
        }
        select_chat();

    }).catch(() => {
        self.destroyMessageSelection();
    })

}
export let copyMessage = function(details) {
        let fi = details.fileInfo;
        let text = typeof details == 'object' ? (details.message == '' ? fi.type == 'gif' ? fi.url : `${this.mainRoot}file-viewer?f=${`${this.root}/visitors/${details.senderId}/${fi.type == 'picture' ? 'Pictures' : 'Recordings'}/${fi.url}`.to_b64()}` : details.message) : details;
    helper.copy(text.unescape());
    this.bottomInfo('Copied to clipboard...', 'success');
}
export let shareMessage = function(details) {
    helper.webShare({
        title: details.message,
        text: details.message,
        url: this.root,
    }).then(() => {
        console.log('Shared successfully');
    }).catch(err => {
        this.copyMessage(details)
    })
}
export let messageInfo = function(details) {
    let w = new helper.Modal();
    let self = this;
    w.touch_close = true;
    let head = helper.make_el('div').class('p-2').html('<i class="fa fa-exclamation-circle"></i> Message Info');
    let foot = helper.make_el('div').addChild(
        helper.make_el('button').attr({
            class: 'btn btn-light float-right',
            onclick: () => { w.close() }
        }).html('OK').self
    );
    let style = ac.wallpaper_style(this);


    style['padding'] = '5px';
    style['textAlign'] = 'left';
    let class_ = 'material-icons-outlined';
    let style_ = ' style="margin-left:22px;"';
    let allSeen = helper.make_el('tbody');
    let allReceived = helper.make_el('tbody');
    let btnSeen = helper.make_el('button').clicked(() => {
        _switch('seen');
    }).class('btn btn-light bg-dark text-light').html('Seen - <span></span>');
    let btnReceived = helper.make_el('button').clicked(() => {
        _switch('received');
    }).class('btn btn-light').html('Received - <span></span>');

    function getInfo(type, collector) {
        sw.getMessageInfo({ type: type, id: 'mess_' + details.messageId + '_info' }).then(res => {
            type == 'seen' ? btnSeen.lastChild.html(res.length) : btnReceived.lastChild.html(res.length);
            if (res.length == 0) {
                collector.addChild('Empty');
                return;
            }
            collector.truncate();
            res.forEach(i => {
                collector.addChild(helper.make_el('tr').addChild([
                    helper.make_el('td').addChild(helper.make_el('img').attr({
                        src: self.dp(i.dp, i.id),
                        class: 'dp'
                    }).self).setWidth('50px').self,
                    helper.make_el('td').addChild([
                        helper.make_el('span').html(self.username(i.id, i.tel)).self,
                        helper.make_el('div').class('text-muted').html(ac.niceDate(i._date) + ' - ' + new Date(i._date).format('h:ia', 'local')).self
                    ]).self,
                    helper.make_el('td').setWidth('50px').html(i.country.toLocaleLowerCase()).self
                ]).self)
            })
        })
    }

    function _switch(type) {
        [btnSeen, btnReceived].forEach(btn => {
            btn.removeClass(['bg-dark', 'text-light']);
        })
        if (type == 'seen') {
            allReceived.parent().hide();
            allSeen.parent().show();
            btnSeen.addClass(['bg-dark', 'text-light']);
            getInfo('seen', allSeen);
        } else {
            allSeen.parent().hide();
            allReceived.parent().show();
            btnReceived.addClass(['bg-dark', 'text-light']);
            getInfo('received', allReceived);
        }
    }

    let infos = [
        helper.make_el('div').class('relative').html('<span class = "receipt ' + class_ + '">done</span> <span ' + style_ + '>Date sent ~ ' + new Date(details.dateSent).format('dp M Y, h:ia') + '</span>').self,
        helper.make_el('div').class('relative').
        html('<span class = "receipt ' + class_ + '">done_all</span> <span ' + style_ + '>Date received ~ ' +
            ((details.dateReceived == '0' || details.dateReceived == 0) ? 'Not Received' : new Date(details.dateReceived).format('dp M Y, h:ia')) + '</span>').self,
        helper.make_el('div').class('relative').html('<span class = "receipt seen ' + class_ + '">done_all</span> <span ' + style_ + '>Date seen ~ ' +
            ((details.dateSeen == '0' || details.dateSeen == 0) ? 'Not Seen' : new Date(details.dateSeen).format('dp M Y, h:ia')) + '</span>').self,
    ]
    if (details.isGroup == 1) {
        infos = [
            helper.make_el('div').addChild([
                btnSeen.self,
                btnReceived.self
            ]).self,
            helper.make_el('div').style({ maxHeight: '200px', overflowY: 'auto' }).addChild([
                helper.make_el('div').addChild(helper.make_el('table').class('table-message-info').addChild(allSeen.self).self).self,
                helper.make_el('div').addChild(helper.make_el('table').class('table-message-info').addChild(allReceived.self).hide().self).self
            ]).self
        ]

        getInfo('seen', allSeen);
    }
    let theMessage = helper._('#' + details.messageId).parent();
    let bodyM = helper.make_el('div').style({
        background: 'white',
        display: 'inline-block',
        overflowY: 'auto',
        borderRadius: '8px'
    }).addChild([
        head.self,
        helper.make_el('div').style(style).addChild(theMessage.self.cloneNode(true)).self,
        helper.make_el('div').style({
            background: 'whitesmoke',
            textAlign: 'left',
            padding: '8px'
        }).addChild(infos).self,
        foot.self
    ])
    w.add_content(bodyM.self);
    let structurize = function() {
        bodyM.style({ maxHeight: innerHeight + 'px' });
        if (innerWidth < 700)
            bodyM.setWidth((innerWidth - innerWidth % 50) + 'px')
        else
            bodyM.setWidth('700px')
    }
    structurize();
    window.resize_callbacks.push(structurize)
    w.open()

}

export let prepareReply = function(messageId, close) {
    let s = this.settings;
    let self = this;
    let cid = this.openedChat;
    let body = helper._('#chatBox-' + cid).child(0);
    let foot = body.child(2);
    let repFrame = foot.child(0).child(0).child(0).style({ padding: '0px' }).class('message-reply reply-frame').self;
    let repFrameOuter = repFrame.parentElement;
    if (close) {
        this.state.replyingTo = 0;
        helper._(repFrame).style({ padding: '0px', height: '0px' }).truncate();
        repFrameOuter.style.borderRadius = '30px';
        window.getting_url_info = false;
    } else {

        if (messageId == null) {
            return;
        }

        this.prepareReply(messageId, true);
        let chat = this.chats[cid];
        let message = chat.messages[messageId];
        this.state.replyingTo = message;
        let si = message.senderInfo;
        let name = this.username(si.id, si.tel);
        let m = ac.decorateMessage(message.message.trim().split('\n').join(' ').unescape());
        if (message.fileInfo != '0') {
            let d = ac.describeFile(message.fileInfo);
            m = d.icon + ' ' + (m == '' ? d.description : m);
        }
        helper._(repFrame).style({ paddingLeft: '4px', height: '40px' }).addChild([
            helper.make_el('span').class('message-sender')
            .html(message.senderId == s.id ? 'You' : name).self,
            helper.make_el('div').class('replied-message').html(m).self,
            helper.make_el('button').attr({
                onclick: () => {
                    self.prepareReply(messageId, true);
                }
            }).class('close-reply').html('<i class="fa fa-close"></i>').self
        ])
        repFrameOuter.style.borderRadius = '15px';
        helper._(repFrameOuter).child(3).self.focus()
    }
}

export let recordIndicator = function(e) {
    this.pauseRecording();
    let self = this;
    let btn = e.target.tagName == 'BUTTON' ? e.target : helper._(e.target).parent().self
    let cnR = btn.getAttribute('can-record');
    let recordindicator = helper._(btn).parent().parent().parent().child(4);
    let cancel = recordindicator.child(0).child(0).self;
    let timings = recordindicator.child(0).child(1).child(1).html(' <i class="fa fa-spinner fa-spin" style="font-size:18px"></i> Connecting to mic');
    let send = recordindicator.child(0).child(2).self;
    send.hidden = true;
    this.sendGIF(true);

    function hideIndicator() {
        btn.style.transform = 'scale(1)';
        recordindicator.removeClass('show-recording-indicator');
        recordindicator.addClass('hide-recording-indicator');
        self.state.recording = false;
        btn.disabled = false;
        ac.clearStream();
    }

    function showIndicator() {
        btn.style.transform = 'scale(1.5)';
        recordindicator.removeClass('hide-recording-indicator');
        recordindicator.addClass('show-recording-indicator');
        self.state.recording = true;
        btn.disabled = true;
    }
    if (cnR == 'true') {
        ac.checkPermission({ name: 'microphone' }).then(res => {
            if (res == 'granted') {
                showIndicator();
                ac.preparerecording(cancel, send, timings, this).then(resp => {
                    this.state.needUpload = [{ type: 'record', file: resp.file, duration: resp.duration }]
                    hideIndicator();
                    this.addMessage(null, helper._(btn).parent().child(0).child(3).self)
                }).catch((err) => {
                    this.state.needUpload = [];
                    hideIndicator();

                })

            } else if (res == 'prompt') {
                this.askMediaPermission('m');
            } else {
                this.mediaErrorAnnounce('m');
            }
        }).catch(() => { this.askMediaPermission('m'); })
    }
}