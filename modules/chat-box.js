import * as helper from './helper.js';
import * as ac from './actions-proper.js';
import * as sw from './serviceWorker.js';

export let ChatBox = function(properties) {

    let win = this.window(this.rightInner.self);
    let id = 'chatBox-' + properties.chatId;
    win.main.class('chat-box').id(id);
    let mainBody = win.main.child(0).class('chat-box-inner');
    let subBody = mainBody.child(1).class('all-messages-container');
    let head = mainBody.child(0).class('chat-box-head').setHeight('60px');
    let foot = mainBody.child(2).class('chat-box-foot');
    let block = helper.make_el('div').style({
        background: 'white',
        position: 'absolute',
        display: 'table',
        width: '100%',
        height: '60px',
        bottom: '0',
        zIndex: '+2',
    }).addChild(
        helper.make_el('div').style({
            display: 'table-cell',
            verticalAlign: 'middle',
            textAlign: 'center',
            color: 'gray'
        }).html('You can not send messages to this chat').self
    ).self;
    block.hidden = properties.group == 1 ? true : (this.settings.blocked_by.indexOf(properties.chatId) == -1);
    mainBody.addChild([
        helper.make_el('div').attr({
            hidden: 'true',
            style: {
                position: 'absolute',
                zIndex: '+1',
                bottom: '100px',
                right: '10px',
                width: '40px',
                height: '40px',
            }
        }).addChild(helper.make_el('button').attr({
            class: 'btn btn-light rounded-circle',
            style: {
                position: 'relative',
                height: '100%',
                width: '100%'
            },
            onclick: () => {
                let allM = helper._(`#${id}`).child(0).child(1).self
                helper.scroll_to(allM.lastChild, 'smooth', allM);
            }
        }).addChild([
            helper.make_el('span').style({
                position: 'absolute',
                transform: 'rotate(-90deg)',
                top: '10px',
                left: '15px',
                color: 'rgba(0,0,0,0.5)'
            }).html('&#10094').self,
            helper.make_el('span').attr({
                class: 'badge',
                style: {
                    position: 'absolute',
                    top: '4px',
                    right: '-5px'
                },
                hidden: true
            }).html(0).self
        ]).self).self,
        helper.make_el('div').class('recording-indicator').addChild(helper.make_el('div').class('relative')
            .addChild([
                helper.make_el('button').attr({
                    class: 'float-left btn btn-light text-danger',
                    title: 'Click to Cancel voice note'
                }).html('<i class = "fa fa-trash"></i>').style({ fontSize: 'large' }).self,
                helper.make_el('button').class('btn btn-light')
                .html('<span class = "recording-blink"> <i class = "fa fa-microphone"></i> </span><span>00:00</span>').self,
                helper.make_el('button').attr({
                    class: 'float-right btn btn-light',
                    title: 'Click to send voice note'
                }).html('Send').self
            ]).self).self,
        block
    ]);
    subBody.addChild([
        properties.bodyContent,
        helper.make_el('div').class('message-container center load-more-messages')
        .addChild(helper.make_el('button').attr({
            class: 'btn btn-light',
            style: { color: 'rgba(0, 0, 0, 0.6)' }
        }).html('<span class="material-icons-outlined">refresh</span>').self).self
    ]);

    let headContent = helper.make_el('table')
        .addChild(helper.make_el('tbody').addChild(helper.make_el('tr').addChild([
            helper.make_el('td').style({ width: '80px' }).class('td-dp').addChild(helper.make_el('button').attr({
                class: 'btn',
                style: {
                    width: '100%',
                    position: 'relative',
                    textAlign: 'right'
                },
                onclick: () => { this.closeChat(id) }
            }).addChild([
                helper.make_el('span').attr({
                    class: 'material-icons-outlined',
                    style: {
                        marginTop: '8px',
                        position: 'absolute',
                        left: '0',
                        fontSize: '1.8em',
                        color: 'rgba(255,255,255,0.7)'
                    }
                }).html('arrow_back').self,
                helper.make_el('img').attr({
                    class: 'dp',
                    src: properties.dp,
                    onclick: (e) => {
                        if (innerWidth >= 700)
                            new helper.Modal().expandElement(e.target)
                    }
                }).self
            ]).self).self,
            helper.make_el('td').class('td-name').addChild([
                helper.make_el('div').attr({
                    onclick: () => {
                        this.openProfile(properties.chatId);
                    }
                }).class('chat-info').addChild([
                    helper.make_el('span').class('chat-name').html(`${this.username(properties.id, properties.name)}`).self,
                    helper.make_el('div').class('last-seen').
                    html(properties.group == 1 ? properties.members.join(', ') :
                        (!['0', 0].includes(properties.blocked)) ? '' :
                        ac.lastSeen(properties.lastSeen)).self
                ]).self,
                helper.make_el('div').class('chat-icons').addChild([
                    helper.make_el('span').class('action-icons').html('<span>1</span>').self,
                    helper.make_el('button').attr({
                        class: 'btn action-icons',
                        title: 'Delete selected message(s)',
                        onclick: () => {
                            this.confirmDelete().then(del => {
                                this.updateInnerNotification(this.openedChat, true)
                                ac.deleteMessage(del, this);
                                this.destroyMessageSelection();
                            })
                        }
                    }).html('<i class ="fa fa-trash"></i>').self,
                    helper.make_el('button').attr({
                        class: 'btn action-icons',
                        title: 'Relpy selected message',
                        onclick: () => {
                            this.prepareReply(this.state.selecting.selected[0], false);
                            this.destroyMessageSelection()
                        }
                    }).html('<i class ="fa fa-reply"></i>').self,
                    helper.make_el('button').attr({
                        class: 'btn action-icons',
                        title: 'Forward selected message(s)',
                        onclick: () => {
                            this.forwardMessages();
                        }
                    }).html('<i class ="fa fa-mail-forward"></i>').self,
                    helper.make_el('button').class('btn action-icons').attr({
                        title: 'Cancel selection',
                        onclick: () => {
                            this.destroyMessageSelection()
                        }
                    }).html('<i class ="fa fa-close"></i>').self
                ]).self
            ]).self,
            helper.make_el('td').class('td-addcall').addChild(properties.group == 1 ? '' : [
                helper.make_el('button').attr({
                    title: 'Add call',
                    class: 'btn call',
                    'data-toggle': 'dropdown'
                }).html('<span class="material-icons-outlined">add_ic_call</span>').self,
                helper.make_el('div').class('dropdown-menu').addChild([
                    helper.make_el('button').attr({
                        class: 'dropdown-item',
                        onclick: () => { this.videoCall(properties); }
                    }).html('<i class="fa fa-video-camera"></i> Video').self,
                    helper.make_el('button').attr({
                        class: 'dropdown-item',
                        onclick: () => { this.audioCall(properties); }
                    }).html('<i class="fa fa-phone"></i> Audio').self
                ]).self
            ]).self,
            helper.make_el('td').class('td-menu').addChild([
                helper.make_el('button').attr({
                    class: 'btn menu',
                    'data-toggle': 'dropdown'
                }).html('<span class="material-icons-outlined">more_vert</span>').self,
                helper.make_el('div').class('dropdown-menu').addChild(properties.menuContents).self
            ]).self
        ]).self).self).self;

    let textarea = helper.make_el('textarea').attr({
        class: 'form-control textarea',
        placeholder: 'Type a message',
        onkeyup: (e) => {
            ac.typingMessage(e.target);
            sw.setTyping(e.key, this);
        },
        onpaste: (e) => {
            setTimeout(() => {
                ac.typingMessage(e.target);
            }, 100);
        },
        oncut: (e) => {
            setTimeout(() => {
                ac.typingMessage(e.target);
            }, 100);
        },
        onkeydown: (e) => {
            let tg = e.target;
            if (this.settings.enter_button == 1 && !tg.value.empty() && e.key == 'Enter') {
                e.preventDefault();
                this.addMessage(null, tg);
            }
        }
    }).setHeight('38px').self;
    let footContent = helper.make_el('div').class('input-group-prepend sending-box-outer').addChild([
        helper.make_el('div').class('form-control sending-box-inner').addChild([
            helper.make_el('div').class('message-reply reply-frame').self,
            helper.make_el('div').id('gif-frame-' + properties.chatId).class('gif-container').self,
            helper.make_el('button').attr({
                class: 'btn input-group-text btn-icons text-muted',
                onclick: () => {
                    this.sendGIF();
                }
            }).style({ position: 'absolute' }).html('<i class="fa fa-smile-o" style="font-size: 1.4em;"></i>').self,
            textarea,
            helper.make_el('button').attr({
                class: 'btn input-group-text btn-at text-muted',
                style: { position: 'absolute' },
                title: 'Click to upload picture',
                onclick: () => {
                    this.chooseFile(false, textarea);
                }
            }).html('<i class="fa fa-paperclip" style="font-size: 1.4em;"></i>').self,
            helper.make_el('button').attr({
                class: 'btn input-group-text btn-camera text-muted',
                title: 'Click to take a photo',
                style: { position: 'absolute' },
                onclick: () => { this.openCamera() }
            }).html('<i class="fa fa-camera" style="font-size: 1.4em;"></i>').self
        ]).self,
        helper.make_el('button').attr({
            class: 'btn input-group-text rounded-circle btn-send',
            style: { position: 'absolute', right: '0' },
            'can-record': 'true',
            title: 'Click to start recording voice notes',
            onclick: (e) => {
                let btn = e.target.tagName == 'BUTTON' ? e.target : helper._(e.target).parent().self
                let cnR = btn.getAttribute('can-record');
                if (cnR == 'false') {
                    this.addMessage(null, helper._(btn).parent().child(0).child(3).self);
                } else {
                    this.recordIndicator(e);
                }
            }

        }).addChild([
            helper.make_el('i').class('fa fa-microphone').style({ display: 'block' }).self,
            helper.make_el('span').class('material-icons-outlined').html('send').style({
                display: 'none',
                marginLeft: '-3.8px',
                marginTop: '-3px',
                fontSize: '1.3em'
            }).self
        ]).self
    ]).self;
    head.addChild(headContent);
    foot.addChild(footContent);
    return win;
}

export let openChat = function(id) {
    let s = this.settings;
    let chat = this.chats[id];
    let info = chat.info;
    let self = this;
    let oc = this.openedChat;
    let chat_details = {
        name: info.custom_name,
        bodyContent: this.defaultMessage.self.cloneNode(true),
        dp: `${this.root}/images/whatsapp-logo.png`,
        lastSeen: 0,
        menuContents: '',
        chatId: info.chat_id,
        id: info.id,
        blocked: info.blocked,
        group: info.group,
        members: []
    }
    if (info.group == 1) {
        let mbs = info.members;
        let count = 0;
        for (let mb of mbs) {

            if (mb.id == s.id) {
                chat_details.members.push('You');
                count++;
            } else {
                chat_details.members.push(this.username(mb.id, mb.tel));
                count++;

            }
            if (count == 5) {
                chat_details.members.push('+' + (mbs.length - 4));
                break;
            }
        }

        chat_details.menuContents = [
            helper.make_el('button').attr({
                class: 'dropdown-item',
                onclick: () => {
                    self.refreshMessages(id);
                }
            }).html('Refresh chat').self
        ]
    } else {

        let b = s.blocked_chats;
        let m = s.muted_chats;
        let myId = s.id;
        let b_ = () => {
            return (b.length > 0 && b.indexOf(id) != -1) ? 'Unblock' : 'Block';
        };
        let m_ = () => {
            return (m.length > 0 && m.indexOf(id) != -1) ? 'Unmute' : 'Mute';
        };
        chat_details.menuContents = [
            helper.make_el('button').attr({
                onclick: (e) => {
                    sw.muteContact(id, myId).then((resp) => {
                        self.bottomInfo(`${info.tel} has been ${m_()}d!`, 'success');
                        if ([myId, '2', 2].includes(resp)) {
                            s.muted_chats.push(id);
                            self.chat_action_HTML(id, 'action-notifications_off', true, 'This contact has been muted');
                        } else {
                            let ind_m = s.muted_chats.indexOf(id);
                            s.muted_chats.splice(ind_m, 1);
                            self.chat_action_HTML(id, 'action-notifications_off', false, '');
                        }
                        e.target.innerHTML = m_();
                    }).catch(() => {
                        self.bottomInfo(`Failed to ${m_()} chat!`, 'error');
                    })
                }
            }).class('dropdown-item').html(m_()).self,
            helper.make_el('button').attr({
                class: 'dropdown-item',
                onclick: () => {
                    self.reportChat(id, s.id, info);
                }
            }).html('Report').self,
            helper.make_el('button').attr({
                onclick: (e) => {
                    sw.blockContact(id, myId).then((resp) => {
                        self.bottomInfo(`${info.tel} has been ${b_()}ed!`, 'success');
                        if ([myId, '2', 2].includes(resp)) {
                            s.blocked_chats.push(id);
                            self.chat_action_HTML(id, 'action-block', true, 'This chat has been blocked');
                        } else {
                            let ind_b = s.blocked_chats.indexOf(id);
                            s.blocked_chats.splice(ind_b, 1);
                            self.chat_action_HTML(id, 'action-block', false, '');
                        }
                        e.target.innerHTML = b_();
                    }).catch(() => {
                        self.bottomInfo(`Failed to ${b_()}`, 'error');
                    })
                }
            }).class('dropdown-item').html(b_()).self,
            helper.make_el('button').attr({
                onclick: () => {
                    self.deleteChat();
                }
            }).class('dropdown-item').html('Delete chat').self,
            helper.make_el('button').attr({
                class: 'dropdown-item',
                onclick: () => {
                    self.exportChat();
                }
            }).html('Export chat').self,
            helper.make_el('button').attr({
                class: 'dropdown-item',
                onclick: () => {
                    self.refreshMessages(id);
                }
            }).html('Refresh chat').self
        ];
        chat_details.dp = this.dp(info.dp, info.id);
        chat_details.name = info.custom_name == 0 ? info.tel : info.custom_name;
        chat_details.lastSeen = info.lastSeen
    }
    try {
        let ChatBox = helper._('#chatBox-' + id);

        ChatBox.child(0).style(ac.wallpaper_style(this));

        ChatBox.removeClass(['diappear-left', 'disappear-right']);
        ChatBox.addClass('appear-right');
        if (oc != null && innerWidth >= 700 && oc != id) {
            this.closeChat('chatBox-' + oc, 'right')
        }
        this.openedChat = id;
        let tr = ChatBox.child(0).child(0).child(0).child(0).child(0);
        let closeBtn = tr.child(0).child(0);
        if (info.partner_removed == 1) {
            tr.child(2).truncate();
        }
        let arrBack = closeBtn.child(0).self;
        helper._('#' + this.openedChat).style({ background: 'rgba(0,0,0,0.1)' });

        let structurize = function() {
                let w = innerWidth;
                if (w < 700) {
                    arrBack.hidden = false;
                    closeBtn.attr({
                        style: { textAlign: 'right' },
                        onclick: () => {
                            self.closeChat('chatBox-' + id);
                        }
                    });
                } else {
                    arrBack.hidden = true;
                    closeBtn.attr({
                        style: { textAlign: 'center' },
                        onclick: () => { return false; }
                    })
                }
            }
            /**
             * Detecting scrolling up and down a chat
             */
        let lastScrollTop = 0;
        let btn = ChatBox.child(0).child(3);
        let all_m = ChatBox.child(0).child(1);
        all_m.scrolled(() => {
            let this_ = all_m.self;
            if (this_.scrollTop > lastScrollTop && (this_.clientHeight + this_.scrollTop) < this_.scrollHeight) {
                ac.innerScrollTo(btn, true);
            } else {
                let def = false;
                if ((this_.clientHeight + this_.scrollTop) == this_.scrollHeight) {
                    def = true;
                }
                ac.innerScrollTo(btn, false, def)
            }
            lastScrollTop = this_.scrollTop;
            let all_dates = [].slice.call(document.querySelectorAll(`div#chatBox-${id} .sticky`));
            for (let i = 0; i < all_dates.length; i++) {
                let st = all_dates[i];
                let m = helper._(st).child(0);
                let diff = st.offsetTop - this_.scrollTop;
                if (diff <= 3) {
                    m.setWidth('110px');
                } else {
                    m.setWidth('unset');
                }
                if (diff <= 30 && i > 0) {
                    $(all_dates[i - 1]).offset({ top: diff - 1 });
                } else if (i > 0) {
                    all_dates[i - 1].style.top = '-2px';
                }
            }
        });

        let ct, y1, x1, rotate = 0,
            distY;

        let touch_start = (e) => {
            ct = e.changedTouches[0];
            y1 = ct.clientY;
            x1 = ct.clientX;
        }
        let touch_move = (e) => {
            ct = e.changedTouches[0];
            distY = ct.clientY - y1;
            let new_rotate = (rotate + distY) + 20;
            if (Math.abs(ct.clientX - x1) < 100 && distY > 0) {
                all_m.child(1).child(0).style({ marginTop: (distY > 50 ? 50 : distY) + 'px' }).show().child(0).style({ transform: 'rotate(' + new_rotate + 'deg)' });
            }
        }
        let touch_end = (e) => {
            all_m.child(1).child(0).style({ marginTop: 'unset' }).child(0).style({ transform: 'initial' });
            ct = e.changedTouches[0];
            if (Math.abs(ct.clientX - x1) < 100 && distY > 200) {
                self.loadMoreMessages(all_m);
            }
            y1 = 0;
            x1 = 0;
            distY = 0;
            rotate = 0;
        }
        all_m.touched(touch_start);
        all_m.touchmove(touch_move);
        all_m.touchend(touch_end);

        structurize();
        window.resize_callbacks.push(structurize);
    } catch (err) {
        let d = this.ChatBox(chat_details);
        helper._(chat_details.bodyContent).child(0).lastChild.clicked(() => {
            this.Alert(
                'The messages are somehow secured through in-built front and back end encoding and decoding, ' +
                'escaping and unescaping methods with my front end html escaping Sting prototype <code>String.escape()</code>'
            )
        })
        d.launch();
        this.openChat(id)
        this.openedChats.push(id);
        let all_m = helper._(`#chatBox-${id}`).child(0).child(1);
        all_m.child(1).child(0).disable().child(0).addClass('spin');
        sw.loadMessages(info.chat_id, s.id, { max: '', refreshing: '' }).then(resp => {
            if (resp.length > 0) {
                if (resp.length < 10) { all_m.child(1).hide(); }
                arrange_messages(resp)
            } else {
                all_m.child(1).hide();
            }

        }).finally(e => {
            all_m.child(1).child(0).enable().clicked(() => {
                this.loadMoreMessages(all_m);
            }).child(0).removeClass('spin');
            let unsent = this.unsentMessages(info.chat_id).messages();
            if (unsent.length > 0)
                arrange_messages(unsent);
        })


        function arrange_messages(messages) {
            messages.forEach(message => {
                let gp = info.chat_id.split('_')[0] == 'group';
                let di = typeof message.deleteInfo == 'string' ? JSON.parse(message.deleteInfo) : message.deleteInfo;
                message.deleteInfo = di;
                if ((gp && String(di.deleted).in(['2', '0'])) || (!gp && String(di[s.id]).in(['0', '2']))) {

                    if ((message.dateSeen == '0' && !gp) && message.senderId != s.id) {
                        self.updateInnerNotification(message.chatId, false);
                    }
                    self.addMessage(message);

                }
                chat.messages[message.messageId] = message;
                chat.info.last_message = message;
            });
        }

    }
    this.unhighlighChatHead(id);
}

export let closeChat = function(id, dir = 'left') {

    let ChatBox = helper._('#' + id)
    ChatBox.removeClass(['appear-left', 'appear-right']);
    ChatBox.addClass('disappear-' + dir);
    let oc = this.openedChat;
    helper._('#' + oc).style({ background: 'initial' });
    this.updateInnerNotification(oc, true);
    this.destroyMessageSelection();
    this.prepareReply(null, true);
    this.sendGIF(true);
    this.pauseRecording();
    if (innerWidth < 700) {
        this.openedChat = null;
    }
}