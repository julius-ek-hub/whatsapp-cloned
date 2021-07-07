import * as helper from './helper.js';
import * as ac from './auth-client.js';
import * as sw from './serviceWorker.js';


/**
 * This section builds a gui for Registration/Login and Home screen
 * Read -- Documentation ... https://docs.247-dev.com/whatsapp-v1.0/#registration-gui
 */
let WhatsApp = function() {
    let self = this;
    this.addProperties = function(args) {
        for (let i in args) {
            this[i] = args[i];
        }
    }

    this.main = helper.make_el('div').id('whatsapp');
    this.left = helper.make_el('div').id('whatsapp-left');
    this.right = helper.make_el('div').id('whatsapp-right');
    this.rightInner = helper.make_el('div').class('relative');
    this.rightInner.appendTo(this.right.self);

    this.defaultMessage = helper.make_el('div').class('message-container center')
        .addChild(helper.make_el('div').class('message text-dark security').html(
            '<i class="fa fa-unlock-alt"></i> Messages you send to this chat are not very secured ' +
            'so do not share sensible, private information. <a href="javascript:void(0)">Learn more...</a>').self);

    this.chatHeader = helper.make_el('div').class('chat-header');
    this.nav = helper.make_el('nav').class('wc-navs');
    this.navCamera = helper.make_el('button').style({ width: '15.5%' }).class('nav-camera text-muted').addChild(helper.make_el('i').class('fa fa-camera').self);
    this.navChats = helper.make_el('button').class('nav-chats').html('CHATS');
    this.navStatus = helper.make_el('button').class('nav-status text-muted').html('STATUS');
    this.navCalls = helper.make_el('button').class('nav-calls text-muted').html('CALLS');
    this.nav.addChild([
        this.navCamera.self,
        this.navChats.self,
        this.navStatus.self,
        this.navCalls.self
    ]);

    this.chatHeaderTitleAndSearchIconeArea = helper.make_el('div').class('chat-head-title');
    this.chatHeaderTitle = helper.make_el('h3').class('ml-2').html('WhatsApp Clone');
    this.chatHeaderSearchIcon =
        helper.make_el('button').id('wc-search-ic').attr({ 'data-toggle': 'dropdown' })
        .addChild(helper.make_el('i').class('fa fa-ellipsis-v').self);

    this.chatHeaderTitleAndSearchIconeArea.addChild([
        this.chatHeaderTitle.self,
        this.chatHeaderSearchIcon.self
    ])

    this.chatHeader.addChild([
        this.chatHeaderTitleAndSearchIconeArea.self,
        this.nav.self
    ])

    this.chatsContainerMain = helper.make_el('div').class('relative')

    this.chatsContainerInner = helper.make_el('div').class('absolute');


    /*
     * all nav-display items should be found inside a relative box with an absolute position
     * 
     */
    this.allRelative = helper.make_el('div').class('relative');

    this.chatsHolder =
        helper.make_el('table').class('table table-hover')
        .addChild(helper.make_el('tbody').style({ userSelect: 'none', height: '100%' }).self);

    this.abschatHolder = helper.make_el('div').class('absolute').style({ overflowY: 'auto', height: '100%' });

    this.relchatsHolder = helper.make_el('div').style({ overflowY: 'auto' }).class('relative');
    let add_user_btn = helper.make_el('button').attr({
        class: 'btn rounded-circle',
        title: 'Add a public chat',
        id: 'add_public_user_btn',
        style: {
            position: 'absolute',
            right: '10px',
            bottom: '10px'
        },
        onclick: () => { this.add_public_user(add_user_btn); }
    }).html('<span style="font-size:1.5em" class="material-icons-outlined">person_add</span>').self
    this.allRelative.addChild([
        this.abschatHolder.addChild(this.relchatsHolder.addChild(
            this.chatsHolder.self
        ).self).self,
        add_user_btn
    ])

    this.chatsContainerInner.addChild([
        this.chatHeader.self,
        this.allRelative.self
    ]).appendTo(this.chatsContainerMain.self)

    this.statusHolder =
        helper.make_el('table').class('table table-hover')
        .addChild(helper.make_el('tbody').self)

    this.absstatusHolder = helper.make_el('div').class('absolute');

    this.callsHolder =
        helper.make_el('table').class('table table-hover')
        .addChild(helper.make_el('tbody').self);

    this.abscallsHolder = helper.make_el('div').class('absolute');

}

WhatsApp.prototype.window = function(parent) {
    parent = parent ? parent : document.body;
    parent.style.position = 'relative';

    let mainBody = helper.make_el('div');

    let head = helper.make_el('div').style({ background: 'white' });

    let subBody = helper.make_el('div');

    let foot = helper.make_el('div');
    mainBody.addChild([
        head.self,
        subBody.self,
        foot.self
    ]);

    let main = helper.make_el('div').class('wc-window').addChild(mainBody.self);

    return {
        head: head,
        body: mainBody,
        subBody: subBody,
        foot: foot,
        main: main,
        destroy: function() {
            main.delete()
        },
        launch: function() {
            main.appendTo(parent);
        }
    }
}

/**
 * Now lets build the window for our chatboxes
 */
WhatsApp.prototype.ChatBox = function(properties) {

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
        }).html('You can not send messages to this chat <a href="" target="_blank">Learn more...</a>').self
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
                            this.expandMedia(e.target)
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
                                this.updateInnerNotification(self.openedChat, true)
                                ac.deleteMessage(del, self);
                                this.destroyMessageSelection();
                            }).catch(e => {
                                this.bottomInfo('Failed to delete', 'error');
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

WhatsApp.prototype.init = function() {
    let self = this;
    let device = new helper.Modal().mobile;
    let m = this.main,
        l = this.left,
        r = this.right;
    m.addChild([this.left.self, this.right.self]).appendTo(document.body);
    let structurize = function() {
        if (new helper.Modal().mobile != device) {
            window.location.reload(); // Reloads the browser each time there is a toggle of device type (PC, mobile) from developer console
        }
        let w = innerWidth;
        let l_ = '100%',
            r_ = '100%',
            s_p = 'static',
            m_d = 'flex';
        self.chatHeader.style({ background: 'rgb(18,140,126)' });
        self.chatHeaderTitle.style({ color: 'rgba(255, 255, 255, 0.9)' });
        self.chatHeaderSearchIcon.style({ color: 'rgba(255, 255, 255, 0.9)' });

        if (w < 700) {
            m_d = 'block';
            s_p = 'absolute';
            l.style({ borderRight: 'none' })
        }
        if (w >= 700) {
            m_d = 'flex'
            l.style({ borderRight: '1px solid rgba(0,0,0,0.1)' });
            self.chatHeader.style({ background: 'rgba(255,255,255, 0.8)' });
            self.chatHeaderTitle.style({ color: 'rgba(18,140,126, 0.8)' });
            self.chatHeaderSearchIcon.style({ color: 'rgba(18,140,126, 0.8)' });
        }
        if (w >= 700 && w < 800) {
            l_ = '40%';
            r_ = '60%';
        }
        if (w >= 800 && w < 1000) {
            l_ = '35%';
            r_ = '65%';
        }
        if (w >= 1000) {
            l_ = '30%';
            r_ = '70%';
        }
        m.style({
            height: innerHeight,
            width: '100%',
            display: m_d,
            position: 'relative'
        })
        l.style({
            height: '100%',
            width: l_,
            overflowY: 'auto',
            position: s_p,
            top: '0'
        })
        r.style({
            height: '100%',
            width: r_,
            position: s_p
        })

    }

    structurize()
    window.resize_callbacks.push(structurize);
}

WhatsApp.prototype.reset = function() {
    this.left.truncate();
    this.rightInner.truncate();
}

WhatsApp.prototype.chat_action_HTML = function(chat, action, show, title) {
    let area = helper._('#' + chat).child(0);

    if (show)
        area.addChild(helper.make_el('span').attr({
            id: `${action}%${chat}`,
            class: 'material-icons-outlined chat-status',
            title: title
        }).html(action.split('-')[1]).self)
    else
        try {
            helper._(`#${action}%${chat}`).delete();
        } catch (er) {}
}

WhatsApp.prototype.addChat = function(details) {
    let cid = details.chatId;
    try {
        helper._('#add_public_user_btn').style({ zIndex: 'unset' });
        helper._('#no_chat_cover').delete();
    } catch (err) {}
    let self = this;
    this.chatsHolder.child(0).addChild(helper.make_el('tr').attr({
        id: cid,
        style: { cursor: 'pointer' }
    }).addChild([
        helper.make_el('td').class('td-dp').addChild(
            helper.make_el('img').attr({
                class: 'dp',
                src: details.dp,
                onclick: (e) => {
                    self.expandMedia(e.target)
                }
            }).self
        ).self,
        helper.make_el('td').attr({
            style: {
                paddingLeft: '3px',
                width: '100%'
            },
            onclick: () => {
                self.openChat(cid)
            }
        }).addChild([
            helper.make_el('span').style({
                fontSize: 'large'
            }).class('font-weight-bolder').html(`${this.username(details.contactId, details.name)}`).self,
            helper.make_el('div').class('text-muted last-message').html(details.lastMessage).self
        ]).self,
        helper.make_el('td').attr({
            style: {
                paddingLeft: '0',
                paddingRight: '2px',
                verticalAlign: 'middle',
                fontSize: 'small'
            },
            onclick: () => {
                self.openChat(cid);
            }
        }).addChild([
            helper.make_el('div').class('text-small').style({
                textAlign: 'center',
                color: (details.unread > 0) ? 'rgb(37, 211, 102)' : 'rgba(0,0,0,0.4)',
                whiteSpace: 'nowrap',
            }).html(details.lastDate).self,
            helper.make_el('div').style({
                textAlign: 'center',
                marginTop: '3px',
            }).addChild(helper.make_el('span').class('badge')
                .style({ visibility: (details.unread > 0) ? 'visible' : 'hidden' }).html(details.unread).self).self
        ]).self
    ]).self);

    let set = this.settings;

    if (set.muted_chats.indexOf(cid) != -1) {
        this.chat_action_HTML(details.chatId, 'action-notifications_off', true, 'This contact has been muted');
    }
    if (set.blocked_chats.indexOf(cid) != -1) {
        this.chat_action_HTML(details.chatId, 'action-block', true, 'This contact has been blocked');
    }
    if (details.removed == 1) {
        this.chat_action_HTML(cid, 'action-remove_circle', true, 'This contact no longer exists');
    }
}

WhatsApp.prototype.Alert = function(obj) {
    return helper.smoothAlert(obj);
}

WhatsApp.prototype.collectInfo = function(maintitle, collections) {
    return helper.collectInfo(maintitle, collections);
}


/**
 * The authentication screen to for new users
 */

WhatsApp.prototype.Authentication = function() {
    let self = this;
    let dp_to_be_uploaded = null;
    let info = {
        username: 'Visitor',
        dp: '',
        telcode: '+971',
        tel: '',
        country: 'ae',
        pin: '',
        id: null,
        invitation_code: '',
        name_col: this.colors[helper.random(0, this.colors.length - 1)]
    }

    let auth_container = helper.make_el('div').style({ position: 'relative', background: 'white', overflow: 'hidden' });
    let common = helper.make_el('div').style({
        position: 'absolute',
        inset: '0px'
    }).class('disappear-left auth-body').addChild(helper.make_el('div').style({
        position: 'relative',
        background: 'white',
        height: '100%',
        width: '100%'
    }).self).self;
    let auth_number = helper._(common.cloneNode(true)).removeClass('disappear-left');
    let auth_confirm_tel = helper._(common.cloneNode(true));
    let auth_set_dp = helper._(common.cloneNode(true));
    let auth_login = helper._(common.cloneNode(true));

    let all = [auth_number, auth_confirm_tel, auth_set_dp, auth_login];
    all.forEach(auth => {
        auth.appendTo(auth_container.self)
    });

    let wn = new helper.Modal({ bg: '#eeeeee' });
    wn.add_content(auth_container.self)
    wn.open();
    let structurize = function() {
        let iw = innerWidth,
            w = iw + 'px',
            ml = '0px';

        if (iw > 700) {
            w = '700px';
            ml = (iw - 700) / 2 + 'px'
        }
        auth_container.style({ width: w, height: innerHeight + 'px', marginLeft: ml });
    }
    structurize();
    window.resize_callbacks.push(structurize);

    let requestNumber = function() {

        let request = () => {
            return new Promise((resolve, reject) => {
                auth_number.child(0).addChild([
                    helper.make_el('div').class('text-secondary top').addChild([
                        helper.make_el('span')
                        .html(
                            `<div class="position-relative" style="padding:10px">
                            <div style="margin-left:42px;" class="h6">To begin testing this project, Choose a phone number.</div>
                            <button class="btn btn-light position-absolute" data-toggle = "dropdown" style="left:0;top:4px">
                            <span class="material-icons-outlined">help_outline</span>
                            </button>
                            <div class = "dropdown-menu">
                            <a href="${self.mainRoot}" class = "dropdown-item">Return to main Home page</a>
                             <a href="https://www.247-dev.com/projects/whatsapp-clone" class = "dropdown-item">View Project features</a>
                            </div>
                            </div>

                            <div>
                            If you have visited before and want to continue with your account, 
                            use the same number and country keeping in mind that you have your PIN 
                            or we have your Email.
                            </div>`
                        ).self,
                        helper.make_el('div').class('text-danger').id('error-tel').self
                    ]).self,
                    helper.make_el('div').class('input-group mb-0').addChild([
                        helper.make_el('div').class('input-group-append')
                        .addChild(helper.make_el('button').attr({
                                class: 'btn btn-outline-light text-dark',
                                onclick: (e) => {
                                    let btn = e.target;
                                    btn = btn.tagName == 'SPAN' || btn.tagName == 'I' ? helper._(btn).parent() : helper._(btn);
                                    let s = new helper.Modal().RequestSelection();
                                    s.title = 'Choose your country';
                                    s.add_search = true;
                                    let countries = self.countries;
                                    for (let c in countries) {

                                        s.options.push({
                                            id: c,
                                            value: countries[c].nicename + '<span class="text-secondary font-weight-lighter" style="float:right">+' + countries[c].phonecode + '</span>'
                                        });
                                    }
                                    s.request().then(resp => {
                                        info.telcode = '+' + countries[resp].phonecode;
                                        info.country = resp;
                                        btn.child(0).html(resp)
                                        btn.parent().parent().child(1).child(0).html(info.telcode);
                                    }).catch(err => {})

                                }
                            })
                            .addChild([
                                helper.make_el('span').html('AE').self,
                                helper.make_el('i').class('fa fa-sort-desc text-muted')
                                .attr({ style: 'font-size: 1.7em;margin:-10px 0 0 5px' }).self
                            ]).self).self,
                        helper.make_el('div').class('input-group-append')
                        .addChild(helper.make_el('button').class('btn btn-outline-light text-dark').html('+971').self).self,
                        helper.make_el('input').attr({
                            id: 'tel',
                            type: 'text',
                            class: 'form-control btn-outline-light text-dark',
                            placeholder: 'Enter telephone number...'
                        }).self,
                        helper.make_el('div').class('input-group-append')
                        .addChild(helper.make_el('button').attr({
                            class: 'btn btn-primary',
                            style: { marginRight: '6px' },
                            onclick: (e) => {
                                let btn = e.target;
                                btn.disabled = true;
                                ac.validateNumber(btn).then(resp => {
                                    info.tel = resp;
                                    helper._(btn).html('... <span class="spinner-border spinner-border-sm"></span>');

                                    sw.checkIfUserExists(info.telcode + info.tel, btn).then(resp => {

                                        if (resp == 0) {

                                            previewNumber().then(() => {
                                                resolve(resp);

                                            }).catch(() => {
                                                helper._(btn).html('Verify')
                                                btn.disabled = false;
                                            })
                                        } else {
                                            if (resp.removed == '1') {
                                                self.Alert({
                                                    body: ('<div class="text-danger" style="background:rgba(255,0,0,0.08);padding:8px">' +
                                                        '<i class="fa fa-warning"></i> ACCESS FORBIDDEN</div>An account that was created using this number' +
                                                        ' has been deleted and there is no way we can be of help. If it\'s a coincidence then choose another number ' +
                                                        'or create a new account'),
                                                    width: 60,
                                                    direction: 'bottom',
                                                    cancelText: 'Got it'
                                                });
                                                helper._(btn).html('Verify').parent().previousSibling.self.value = '';
                                                btn.disabled = false;
                                                return;
                                            }
                                            resolve(resp);
                                        }

                                    })


                                })
                            }
                        }).html('Verify').self).self
                    ]).self

                ]);
            })
        }
        return {
            destroy: () => {
                auth_number.removeClass('appear-left').addClass('disappear-left').truncate();
            },
            request: request
        }
    }
    let show_pin = () => {
        setTimeout(() => {
            self.Alert('Your PIN for this entire project is <b>' +
                info.pin + '</b>. You have to use it with your phone number when next you are asked to login.' +
                ' Do not share it with anyone! Could be changed later if only you provide an email', 50, 'bottom')
        }, 2000);
    }
    let confirmOTP = function() {
        let request = () => {
            show_pin()

            return new Promise((res, rej) => {
                auth_confirm_tel.removeClass('disappear-left').addClass('appear-left').child(0).addChild([
                    helper.make_el('div').class('text-secondary top').addChild([
                        helper.make_el('span').html('We just sent your PIN code to ' + info.telcode + info.tel +
                            ' please enter the code to continue.').addChild(helper.make_el('div').class('m-2').addChild(
                            helper.make_el('a').attr({
                                href: 'javascript:void(0)'
                            }).clicked(show_pin).html('Re-show PIN').self
                        ).self).self,
                        helper.make_el('div').class('text-danger').id('error-pin').self
                    ]).self,
                    helper.make_el('div').class('input-group mb-0').addChild([
                        helper.make_el('div').class('input-group-append')
                        .addChild(helper.make_el('button').class('btn btn-outline-light text-dark')
                            .addChild(helper.make_el('span').html('PIN').self).self).self,
                        helper.make_el('input').attr({
                            id: 'tel',
                            type: 'text',
                            class: 'form-control btn-outline-light text-dark',
                            placeholder: 'Enter PIN...',
                            onkeydown: (e) => {
                                if (!e.target.value.empty() && e.key == 'Enter') {
                                    ac.confirmOTP(e.target.nextSibling.childNodes[0], info.pin).then(() => {
                                        res()
                                    })
                                }
                            }
                        }).self,
                        helper.make_el('div').class('input-group-append')
                        .addChild(helper.make_el('button').attr({
                            class: 'btn btn-primary',
                            style: { marginRight: '5px' },
                            onclick: (e) => {
                                ac.confirmOTP(e.target, info.pin).then(() => {
                                    res()
                                })
                            }
                        }).html('Verify').self).self
                    ]).self
                ])
            })
        }

        return {
            destroy: () => {
                auth_confirm_tel.removeClass('appear-left').addClass('disappear-left').truncate()
            },
            request: request
        }
    }
    let setDp = function() {
        let request = () => {
            return new Promise((res, rej) => {
                auth_set_dp.removeClass('disappear-left').addClass('appear-left').child(0).addChild([
                    helper.make_el('div').class('text-secondary top').addChild([
                        helper.make_el('span').html('So people will know you better, please give us a Username and/or profile photo').self,
                        helper.make_el('div').class('text-danger').id('error-name-or-dp').self
                    ]).self,
                    helper.make_el('div').class('input-group mb-0').addChild([
                        helper.make_el('div').class('input-group-append')
                        .addChild(helper.make_el('button').attr({
                                class: 'btn btn-outline-light text-dark',
                                style: { padding: '0px' },
                                onclick: (e) => {
                                    let tg = e.target;
                                    let img = tg.tagName == 'BUTTON' ? helper._(tg).child(0) : tg
                                    ac.choose_file({ accept: 'image/*' }).then(files => {
                                        dp_to_be_uploaded = files[0];
                                        img.src = new helper.File_(files[0]).URL;
                                    })
                                }
                            })
                            .addChild(
                                helper.make_el('img').attr({
                                    class: 'dp',
                                    src: self.dp('', 0),
                                    style: {
                                        height: '35px',
                                        width: '35px'
                                    }
                                }).self).self).self,
                        helper.make_el('input').attr({
                            type: 'text',
                            class: 'form-control btn-outline-light text-dark',
                            placeholder: 'Enter Username...'
                        }).self,
                        helper.make_el('div').class('input-group-append')
                        .addChild(helper.make_el('button').attr({
                            class: 'btn btn-primary',
                            style: { marginRight: '5px' },
                            onclick: (e) => {
                                let btn = e.target;
                                btn.disabled = true;
                                ac.finish_up(btn, dp_to_be_uploaded, info).then(resp => {
                                    res({ btn: btn, info: resp })
                                }).catch(() => {
                                    btn.disabled = false;
                                })
                            }
                        }).html('Finish').self).self
                    ]).self,
                    helper.make_el('button').attr({
                        onclick: (e) => {
                            let btn = e.target;
                            btn.disabled = true;
                            res({ btn: btn, info: info });
                        }
                    }).class('btn btn-outline-light skip text-dark').html('Skip').self
                ])
            })
        }

        return {
            destroy: () => {
                auth_set_dp.removeClass('appear-left').addClass('disappear-left').truncate()
            },
            request: request
        }
    }

    let requestLogin = function() {
        let request = () => {
            return new Promise((res, rej) => {
                auth_login.removeClass('disappear-left').addClass('appear-left').child(0).addChild([
                    helper.make_el('div').class('text-secondary top').addChild([
                        helper.make_el('span').html('The number ' + info.telcode + info.tel + ' you provided is already a member of this project. To prove ownership of it, ' +
                            'provide the 6 digits PIN that was used to register it.').self,
                        helper.make_el('div').class('text-danger').id('error-pin').self
                    ]).self,
                    helper.make_el('form').class('input-group mb-0').addChild([
                        helper.make_el('input').attr({
                            autocomplete: 'username',
                            type: 'text',
                        }).hide().self,
                        helper.make_el('div').class('input-group-append')
                        .addChild(helper.make_el('span').class('btn btn-outline-light text-dark').html('PIN').self).self,
                        helper.make_el('input').attr({
                            autocomplete: 'current-password',
                            id: 'pin',
                            type: 'password',
                            class: 'form-control btn-outline-light text-dark',
                            placeholder: 'Enter PIN for this number...',
                            onkeydown: (e) => {
                                if (!e.target.value.empty() && e.key == 'Enter') {
                                    ac.verifyUser(e.target.nextSibling.childNodes[0], info).then(() => {
                                        res()
                                    })
                                }
                            }
                        }).self,
                        helper.make_el('div').class('input-group-append')
                        .addChild(helper.make_el('button').attr({
                            class: 'btn btn-primary',
                            style: { marginRight: '5px' },
                            onclick: (e) => {
                                e.preventDefault();
                                ac.verifyUser(e.target, info).then(() => {
                                    res()
                                })
                            }
                        }).html('Login').self).self,
                    ]).self,
                    helper.make_el('div').style({
                        padding: '8px',
                        textAlign: 'left',
                        color: 'rgba(0,0,0,0.7)'
                    }).addChild([
                        helper.make_el('span').html('If you forgot your PIN and provided a verified email during registration, ').self,
                        helper.make_el('a').attr({
                            href: 'javascript:void(0)'
                        }).clicked(() => {
                            let ld = new helper.Modal().Loading('Give us a sec... <i class="fa fa-spinner fa-spin" style="font-size:24px"></i>');
                            sw.emailForReset(info.telcode + info.tel).then(resp => {
                                ld.loader.close()
                                if (resp == 0) {
                                    self.Alert('Sorry! But you don\'t have an Email with us.');
                                    return;
                                }

                                let code = helper.random(100000, 900000);

                                sw.email({
                                    subject: 'PIN Reset',
                                    b64_code: ('project=project_1&time=' + new Date().UTC_DATE()).to_b64(),
                                    bodyLink: '#',
                                    bodyLinkName: '',
                                    body: 'Use the PIN above when next you want to login to your accout',
                                    main: 'PIN: ' + code,
                                    from: 'no_rep',
                                    receipients: [resp]
                                }).then(() => {
                                    ld = new helper.Modal().Loading('Updating info... <i class="fa fa-spinner fa-spin" style="font-size:24px"></i>');
                                    sw.resetPIN(resp, code).then(() => {
                                        ld.loader.close();
                                        self.Alert({
                                            body: (`Your new PIN has been sent to your email, you will use this PIN henceforth 
                                                   and each time you forget it, the process continues. You will learn all these too if you wish. 
                                                   Check your email, it should be there in less 
                                                   than 5 minutes else click to resend the email.`),
                                            width: 70,
                                            direction: 'bottom'
                                        });
                                    }).catch(err => {
                                        ld.loader.close();
                                        self.bottomInfo('Failed to reset PIN', 'error');
                                    })

                                }).catch((err) => {})


                            }).catch(err => {
                                ld.loader.close();
                                self.bottomInfo('Operation Failed', 'error');
                            })
                        }).html('Click here').self,
                        helper.make_el('span').html(' and we\'ll send a new PIN to your verified email. But if you did not provide an email, then you have lost the Account. You may have to create another, it\'s simple.').self
                    ]).self,
                    helper.make_el('button').attr({
                        onclick: (e) => {
                            let btn = e.target;
                            btn.disabled = true
                            res()
                        }
                    }).class('btn btn-outline-light skip text-danger').html('Exit').self
                ])
            })
        }

        return {
            destroy: () => {
                auth_login.removeClass('appear-left').addClass('disappear-left').truncate()
            },
            request: request
        }
    }

    let previewNumber = function() {
        return new Promise((res, rej) => {
            new helper.Modal().Confirm({
                title: 'Confirm!',
                content: 'We are about to send your login PIN to <b>' +
                    info.telcode + info.tel + '</b>. Is this is your number?',
                rejectText: 'No',
                acceptText: 'Yes'
            }).then(() => {
                info.pin = helper.random(100000, 900000);
                res()
            }).catch(() => {
                rej()
            })
        })
    }

    return {
        requestNumber: requestNumber,
        confirmOTP: confirmOTP,
        setDp: setDp,
        requestLogin: requestLogin,
        previewNumber: previewNumber
    };
}



WhatsApp.prototype.setEnvironment = function(details, welcome) {

    let self = this;
    this.addProperties({
        settings: details
    });
    this.settings['recent_gif'] = 'love';

    sw.getChats(details.id).then(resp => {
        if (resp.length > 0) {

            function getInfo(ind = 0) {
                if (ind >= resp.length) {
                    self.realLaunching(details.id, welcome);
                    return;
                }
                let id = resp[ind].chat_id;
                sw.getChatInfo(id, self.settings.id).then(info => {
                    self.chats[info.chat_id] = { info: info, messages: {} }
                    getInfo(ind + 1);
                })
            }

            getInfo();
        } else {

            this.realLaunching(details.id, welcome)
        }

    })
}

WhatsApp.prototype.realLaunching = function(id, welcome) {
    this.launchHome();
    welcome.destroy();
    this.checkIncomingCall();

    let must_always_be_updated = [
        () => this.checkNewMessages(),
        () => this.check4MessageUpdates(),
        () => this.checkLastSeen(),
        () => sw.updateLastSeen(id, this.settings.public_last_seen),
        () => this.checkTyping(),
        () => this.updateChatsInfo()
    ];
    window.interval_functions = [];
    must_always_be_updated.forEach(cb => {
        window.interval_functions.push({ run: cb, once: false });
    })
    sw.start_live_updates();
    this.getEmail();
    this.informUser();
}

WhatsApp.prototype.fullScreen = function() {


    let self = this;
    let elem = document.documentElement;
    let fse = document.fullscreenElement;
    let errors = 0;

    if (fse || fse != null) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        } else {
            errors++;
        }
    } else {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        } else {
            errors++;
        }

    }
    if (errors != 0) {
        self.bottomInfo('Your browser does not support Full screen')
    }
}

WhatsApp.prototype.launchHome = function() {
    let id = this.settings.id;
    this.reset();
    try {
        self.chatsContainerMain.child(0).delete()
    } catch (error) {}
    let self = this;
    self.chatsContainerMain.appendTo(self.left.self);

    let fullscreen = helper.make_el('button').attr({
            onclick: () => {
                self.fullScreen();
            }
        }).class('dropdown-item')
        .html('<span class="material-icons-outlined">fullscreen</span> <span class="drop-item">Enable Full screen</span>')


    document.onfullscreenchange = function(event) {
        let fse = document.fullscreenElement;


        let ic = 'close_fullscreen',
            text = 'Exit Full screen';
        if (!fse || fse == null) {
            ic = 'fullscreen';
            text = 'Enable Full screen';
        }
        fullscreen.child(0).html(ic);
        fullscreen.lastChild.html(text)
    };

    let shareMenu = [
        fullscreen.self,
        helper.make_el('button').attr({
            onclick: () => {
                self.openProfile();
            }
        }).class('dropdown-item')
        .html('<span class="material-icons-outlined">manage_accounts</span> <span class="drop-item">Profile</span>').self,
        /*
          You can add more to your main menu
        */
        helper.make_el('button').attr({
            class: 'dropdown-item text-danger',
            onclick: () => {
                new helper.Modal().Confirm({
                    title: '1 sec<hr>',
                    content: 'Just in case you wish to visit again then please make sure you have saved the ' +
                        'number and PIN you got during registration. If not you can just simply go to settings and ' +
                        'add a genuine email so we can always send your PIN to it when you forget during login. ' +
                        'It\'s been nice you sacrificed your time to test my project. <hr><b>God</b> bless your career!',
                    acceptText: 'Logout'
                }).then(() => {
                    let loading = new helper.Modal().Loading('<div class="text-muted">Logging Out... <i class="fa fa-spinner fa-spin" style="font-size:24px"></i></div>');
                    sw.logOut(id).then(() => {
                        setTimeout(() => {
                            loading.loader.close()
                            window.location.reload()
                        }, 2000)
                    })
                }).catch(er => {})
            }
        }).html('<span class="material-icons-outlined text-danger">power_settings_new</span> <span class="drop-item text-danger">Logout</span>').self,
    ];

    let screen = new helper.Modal({
        parent: self.rightInner.self,
        bg: 'whitesmoke',
        defaultContent: '<div><span class="material-icons-outlined">forum</span></div><div>No chat is open!!</div> Click on any of the available chats to start a conversation.'
    });
    screen.open();
    self.rightInner.child(0).style({ zIndex: '0' })

    self.chatHeaderTitleAndSearchIconeArea.addChild(helper.make_el('div').class('dropdown-menu main-menu').addChild(shareMenu).self);
    let structurize = function() {
        self.allRelative.setHeight((innerHeight - self.chatHeader.self.getBoundingClientRect().height - 4) + 'px');
        let w = innerWidth
        if (w < 700) {
            self.left.prependTo(self.rightInner.self);
            self.rightInner.child(1).self.hidden = true;
        } else {
            self.left.prependTo(self.main.self)
            if (self.openedChat == null) {
                self.rightInner.child(0).self.hidden = false;
            }
        }
        self.rightInner.setHeight(innerHeight + 'px');
    }
    structurize();

    window.resize_callbacks.push(structurize);

    let chats = this.chats;
    if (Object.keys(chats).length > 0) {
        this.chatsHolder.child(0).truncate();
        helper._('#add_public_user_btn').style({ zIndex: 'unset' })
        for (let c in chats) {
            this.prepareChat(chats[c]);
        }
    }

    let c_id = `chat_0001x${id}`;
    if (id != '0001' && chats[c_id].info.last_message.senderId == null) {
        this.autoWelcomeMessage(c_id)
    }
}

WhatsApp.prototype.dp = function(dp, id) {
    return dp == '' ? this.defaultDp : this.root + 'visitors/' + id + '/dp/' + dp;
}
WhatsApp.prototype.username = function(id, tel) {
    if (id == '0001') {
        return 'Julius<span class="material-icons" style="font-size: 14px;color:#007bff">verified</span>'
    }
    let ch = this.chat_id_from_user_id(id);
    if (ch == '') {
        return tel;
    } else {
        let c = this.chats[ch].info.custom_name;
        return c == 0 ? tel : c;
    }
}
WhatsApp.prototype.chat_id_from_user_id = function(id) {
    let set = this.settings;

    let f = 'chat_' + set.id + 'x' + id;
    let s = 'chat_' + id + 'x' + set.id;
    let res = '';
    if (f.in(Object.keys(this.chats))) {
        res = f
    } else if (s.in(Object.keys(this.chats))) {
        res = s;
    }
    return res;
}

WhatsApp.prototype.prepareChat = function(chat) {
    let info = chat.info;
    let dp, name, removed;
    let lastReceipt = '';
    if (info.last_message.senderId == this.settings.id) {
        let r = ac.messageReceipt(info.last_message);

        lastReceipt = '<span class="receipt' + r.receiptCss + '">' + r.receipt + '</span> ';
    }
    let ld = info.last_message.dateSent;
    let lastM = info.last_message.message.trim().unescape();
    if (lastM == '') {
        let d = ac.describeFile(JSON.parse(info.last_message.fileInfo));
        lastM = d.icon + ' ' + d.description;
    }
    let lm_receipt = '...';
    if (info.last_message.senderId == this.settings.id) {
        lm_receipt = 'from-me'
    }
    let cn = info.custom_name;

    if (info.group == 1) {
        dp = `${this.root}/images/whatsapp-logo.png`;
        name = cn;
        removed = 0;
    } else {
        dp = this.dp(info.dp, info.id)
        if (cn == 0) {
            name = info.tel;
        } else {
            name = cn;
        }
        removed = info.partner_removed;
    }

    let sname = (info.last_message.isGroup == 1 && ld != 'Recently') ? (info.last_message.senderId == this.settings.id ? 'You' : this.username(info.last_message.senderId, info.last_message.senderInfo.tel)) + ': ' : '';
    this.addChat({
        chatId: info.chat_id,
        contactId: info.id,
        dp: dp,
        name: name,
        lastMessage: lastReceipt + '<span class="' + lm_receipt + '">' + sname + ac.decorateMessage(helper.reduce(lastM, 60)) + '</span>',
        unread: info.unread,
        removed: removed,
        lastDate: (!['0', 0].includes(info.blocked)) ? '' : (ld == 'Recently' ? 'Recently' : new Date(info.last_message.dateSent).nice_one())
    });
}

WhatsApp.prototype.openChat = function(id) {
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
        this.updateReceipt(id);
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
        let lb = all_m.child(1).child(0).disable().child(0).addClass('spin');
        sw.loadMessages(info.chat_id, s.id, { max: '', refreshing: '' }).then(resp => {
            if (resp.length > 0) {
                if (resp.length < 10) { all_m.child(1).hide(); }
                resp.forEach(message => {
                    let gp = info.chat_id.split('_')[0] == 'group';
                    let di = JSON.parse(message.deleteInfo);
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

                this.updateReceipt(id);
            } else {
                all_m.child(1).hide();
            }
            all_m.child(1).child(0).enable().clicked(() => {
                this.loadMoreMessages(all_m);
            }).child(0).removeClass('spin');
        }).catch(e => {
            lb.removeClass('spin');
        })

    }
    this.unhighlighChatHead(id);
}

WhatsApp.prototype.autoWelcomeMessage = function(chat) {

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
          Try to read everything about the features here => http://localhost/247-dev/projects/whatsapp-clone/ and try them all not forgetting to report any issue.`;
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

WhatsApp.prototype.closeChat = function(id, dir = 'left') {

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

/**
 * The message Object, Let's make up our message box
 */

WhatsApp.prototype.prepareMessage = function(unprepared, file) {
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

WhatsApp.prototype.friendId = function(chat_id) {
    let ids = chat_id.split('_')[1].split('x');
    return ids[0] == this.settings.id ? ids[1] : ids[0];
}

WhatsApp.prototype.buildMessageGUI = function(details, what, idInner) {
    let self = this;
    let s = this.settings;
    let message_content = [];
    let messageClass = ' ',
        bg = 'white',
        float = 'unset',
        ta = ' center',
        id = '',
        sending = '',
        date = '--- ',
        borderRadius = '0px 8px 8px 8px';
    let margin_ = '0px';
    if (what == 'date') {
        bg = 'lightblue';
        messageClass = ' m-date '
        ta = ta + ' sticky';
        message_content.push(helper.make_el('span')
            .html(ac.niceDate(details.dateSent == 0 ? new Date().UTC_DATE() : details.dateSent, 'general')).self)
    } else if (what == 'inner-unread') {
        ta = ta + ' inner-unread'
        id = 'inner-notification-' + idInner;
        bg = 'transparent';
        message_content = [
            helper.make_el('span').html(1).self,
            helper.make_el('span').html(' UNREAD MESSAGE').self
        ]
    } else {
        float = 'left';
        ta = '';
        id = details.messageId;
        let si = details.senderId;
        let receiptClass = '',
            receiptClassCss = '',
            message_date_mini_class = 'message-mini-date-left';
        if (si == s.id) {
            message_date_mini_class = 'message-mini-date';
            let r = ac.messageReceipt(details);
            receiptClassCss = r.receiptCss;
            receiptClass = r.receipt;
            float = 'right',
                bg = 'rgb(220, 248, 198)',
                borderRadius = '8px 8px 0px 8px';
        }

        let d = details.dateSent;

        if (d == 0) {
            sending = ' message-sending';
        } else {
            date = new Date(d).format('h:ia') + ' ';
        }

        let del = details.deleteInfo;
        del = typeof del == 'string' ? JSON.parse(del) : del;

        let a1 = 'You deleted this message',
            a2 = 'This message was deleted';
        let announce = a2;
        if ('deleted' in del && ((String(del.deleted).in(['2', '3']) && si != s.id) ||
                (del.deleted == 2 && si == s.id))) {
            messageClass = ' deleted ';
            if (si == self.id) {
                announce = a1;
            }
            message_content.push(helper.make_el('span').class('text-muted').html('<i class="fa fa-ban"></i> <i>' + announce + '</i>').self);
        } else if (del[s.id] == 2 || String(del[this.friendId(details.chatId)]).in(['2', '3'])) {

            if (del[s.id] == 2) {
                announce = a1;
            }

            message_content.push(helper.make_el('span').class('text-muted').html('<i class="fa fa-ban"></i> <i>' + announce + '</i>').self);

        } else {
            let fmt = 'initial';
            if (details.isGroup == 1 && details.senderId != s.id) {
                let name_ = this.username(details.senderId, details.senderInfo.tel);
                margin_ = '-6px 0 -2px 0';
                message_content.push(helper.make_el('div').style({ color: details.senderInfo.name_col }).class('message-sender').html(name_ + '<span class="sender-ctry">' + details.senderInfo.country.toLocaleLowerCase() + '</span>').self);
                fmt = '-8px';
            }

            if (details.forwarded > 0) {
                margin_ = '-6px 0 -2px 0';
                message_content.push(helper.make_el('div').style({ marginTop: fmt }).class('message-forwarded').html('<i class="fa fa-mail-forward"></i> <i>Forwarded' + (details.forwarded > 2 ? ' many times' : '') + '</i>').self)
            }

            if (details.replyingTo != 0) {
                margin_ = '0px';
                let theRepliedMessageObj = details.replyingTo;
                let Rmess = ac.decorateMessage(theRepliedMessageObj.message.trim().split('\n').join(' ').unescape());
                let name_ = theRepliedMessageObj.senderInfo.tel;
                if (Rmess != '' && !['0', 0].includes(theRepliedMessageObj.fileInfo)) {
                    let d = ac.describeFile(theRepliedMessageObj.fileInfo);
                    Rmess = d.icon + ' ' + Rmess;
                } else if (Rmess == '') {
                    let d = ac.describeFile(theRepliedMessageObj.fileInfo);
                    Rmess = d.icon + ' ' + d.description;
                }
                if (theRepliedMessageObj.senderId == s.id) {
                    name_ = 'You';
                } else {
                    name_ = this.username(theRepliedMessageObj.senderId, name_);
                }
                message_content.push(
                    helper.make_el('div').addChild([
                        helper.make_el('div').style({ color: theRepliedMessageObj.senderInfo.name_col }).class('message-sender').html(name_).self,
                        helper.make_el('div').class('text-dark replied-message')
                        .html(Rmess).self
                    ]).attr({
                        class: 'message-reply',
                        onclick: () => {
                            if (this.state.selecting.selecting == true) {
                                return;
                            }
                            try {
                                let scrolltarget = helper._('#' + theRepliedMessageObj.messageId).parent();
                                helper.scroll_to(scrolltarget.self, 'smooth', scrolltarget.parent().self);

                                setTimeout(() => {
                                    scrolltarget.style({ background: 'rgba(0,0,0,0.1)', padding: '10px' })
                                    setTimeout(() => {
                                        scrolltarget.style({ background: 'transparent', padding: 'unset' })
                                    }, 4000)
                                }, 400)
                            } catch (err) {}
                        }
                    }).self
                );
            }
            if (!(details.fileInfo == '0' || details.fileInfo == 0)) {

                details.senderInfo.dp = this.dp(details.senderInfo.dp, details.senderId);

                if (typeof details.fileInfo == 'string') {
                    details.fileInfo = JSON.parse(details.fileInfo);
                }


                message_content.push(this.buildMedia(details))
            }
            if (!details.message.empty()) {
                message_content.push(helper.make_el('div').style({ margin: margin_ }).class('text-message').html(ac.decorateMessage(ac.addLinksToMessage(details.message.unescape()))).self);
            }

            message_content.push(helper.make_el('div').class('message-date-receipt-conatainer')
                .addChild(helper.make_el('span').addChild([
                    helper.make_el('span').class(message_date_mini_class)
                    .html(date).self,
                    helper.make_el('span').class('receipt reciept-message-inner' + receiptClassCss).html(receiptClass).self
                ]).self).self);
        }
    }
    let message_container = helper.make_el('div').style({ textAlign: ta }).class('message-container text-dark' + ta).self;

    let firstClick = 0;
    let messBox = helper.make_el('div').attr({
        class: ('message' + messageClass + sending).trim(),
        id: id,
        style: {
            float: float,
            background: bg,
            borderRadius: what ? '8px' : borderRadius
        },
        oncontextmenu: (e) => {
            if (messBox.Id.split('_sn_').length == 1) { return }

            if (this.state.selecting.selecting == true) {
                e.preventDefault()
                return;
            }
            e.preventDefault();
            self.actOnMessage(e, messBox.Id);
        },

        onclick: (e) => {
            if (messBox.Id.split('_sn_').length == 1) { return }

            if (this.state.selecting.selecting == true) {
                self.createMessageSelection(messBox.Id);
            } else {
                if (firstClick == 0) {
                    firstClick = new Date().getTime();
                } else {
                    if ((new Date().getTime() - firstClick) / 1000 <= 0.3) {
                        self.actOnMessage(e, messBox.Id);
                    }
                    firstClick = 0;
                }
            }
        }
    }).touched((e) => {
        if (messBox.Id.split('_sn_').length == 1) { return }

        if (this.state.selecting.selecting == true) {
            return;
        }
        ac.detectMobileContextMenu(e).then(() => {
            self.actOnMessage(e, messBox.Id);
        }).catch(() => {});
    }).addChild(message_content).appendTo(message_container);

    return message_container;
}

WhatsApp.prototype.buildMedia = function(details) {
    let f = details.fileInfo;
    let url = f.url;
    let needFetch = true;
    if (!f.url.includes('blob:http://') && f.type != 'gif') {
        url = `${this.root}visitors/${details.senderInfo.id}/${ac.folder(f.type)}/${f.url}`;
    }
    if (f.url.includes('blob:http://')) {
        needFetch = false;
    }
    let self = this;
    let ret;
    let file_state = { deleted: true, fetching: true };
    let el;
    if (f.type == 'record') {
        el = helper.make_el('audio').attr({
            hidden: 'true'
        }).self;
        el.currentTime = 0.5;
        ret = helper.make_el('table').class('audio-file').addChild(helper.make_el('tbody')
            .addChild(helper.make_el('tr').addChild([
                helper.make_el('td').style({ position: 'relative' }).addChild([
                    helper.make_el('img').attr({
                        src: details.senderInfo.dp,
                        class: 'dp'
                    }).self,
                    helper.make_el('i').class('fa fa-microphone').style({
                        position: 'absolute',
                        bottom: '0px',
                        right: '-2px',
                        color: 'rgb(52, 183, 241)',
                        fontSize: '1.1em'
                    }).self
                ]).self,
                helper.make_el('td').addChild(helper.make_el('button').attr({
                    class: 'btn play-btn',
                    onclick: (e) => {
                        if (file_state.deleted && file_state.fetching == false) {
                            self.bottomInfo('This file has been deleted', 'error');
                            return;
                        }
                        if (file_state.fetching) {
                            self.bottomInfo('This file is not ready, please wait...', 'error');
                            return;
                        }
                        if (self.state.selecting.selecting == true) {
                            return;
                        }
                        if (self.state.recording) {
                            self.bottomInfo('Can\'t play audio, recording is ongoing...', 'error');
                            return;
                        }
                        ac.play(e.target.tagName == 'BUTTON' ? e.target : helper._(e.target).parent().self, el, f, this);
                    }
                }).html('<i class = "fa fa-play"></i>').self).self,
                helper.make_el('td').style({ position: 'relative', width: '200px' }).addChild([
                    helper.make_el('input').attr({
                        type: 'range',
                        class: 'slider',
                        min: '0',
                        max: '100',
                        value: '0'
                    }).self,
                    el,
                    helper.make_el('span').attr({
                        class: 'text-muted',
                        style: {
                            position: 'absolute',
                            left: '0',
                            bottom: '-4px',
                            fontSize: 'small'
                        }
                    }).html(f.duration ? ac.message_time(f.duration) : '00:00').self
                ]).self
            ]).self).self)
    } else if (f.type == 'picture' || f.type == 'gif') {
        ret = helper.make_el('img').attr({
            alt: f.type == 'gif' ? 'GIF' : 'Fetching file...',
            style: {
                maxHeight: '300px',
                display: 'block',
                width: '100%',
                objectFit: 'cover'
            },
            onclick: () => { if (f.type == 'picture') self.expandMedia(ret.self) }
        })
    } else {
        ret = helper.make_el('div').html(url)
    }

    if (f.type.in(['picture', 'record']) && needFetch) {
        helper.blob(url).then(b => {

            file_state.deleted = false;
            file_state.fetching = false;
            if (f.type == 'record')
                el.src = b;
            else
                ret.attr({ alt: 'Message File', src: b })
        }).catch(err => {
            ret.attr({ alt: 'Failed to fetch' })
            file_state.deleted = true;
            file_state.fetching = false;
        })
    } else {
        if (f.type == 'record') {
            el.src = url;
        } else {
            ret.attr({ alt: 'Message File', src: url })
        }
        file_state.deleted = false;
        file_state.fetching = false;
    }
    return ret.self;
}

WhatsApp.prototype.pauseRecording = function() {
    let allAudio = [].slice.call(document.querySelectorAll('div audio'));
    let wasPlayinBefore = allAudio.filter(audio => audio.paused == false);
    if (wasPlayinBefore.length > 0) {
        helper._(wasPlayinBefore[0]).parent().previousSibling.child(0).click();
        this.state.playingChat = null;
    }
}

WhatsApp.prototype.messageSent = function(client, server) {
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

WhatsApp.prototype.messageSentFailed = function(client) {
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

WhatsApp.prototype.default = function(message, txtarea) {
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

WhatsApp.prototype.addMessage = function(details, unprepared, file) {

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
    }
}

WhatsApp.prototype.sendMessageFiles = function(textarea, resending) {
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

WhatsApp.prototype.sort_messages = function(messages, chat) {
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

WhatsApp.prototype.loadMoreMessages = function(holder) {
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
                let di = JSON.parse(message.deleteInfo);
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

WhatsApp.prototype.refreshMessages = function(chat_id) {
    let s = this.settings;
    let recording = this.state.recording == true;
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
                let di = JSON.parse(message.deleteInfo);
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

        window.loading_messages_for = null;
        load.child(0).enable().clicked(() => {
            this.loadMoreMessages(holder)
        }).child(0).removeClass('spin');
    }).catch(e => {
        holder.child(1).child(0).enable().child(0).removeClass('spin');
        window.loading_messages_for = null;
    })
}

WhatsApp.prototype.highlighChatHead = function(details, new_) {
    let chat = helper._('#' + details.chatId);
    let s = this.settings;
    if (new_) {
        chat.insertBefore(chat.parent().firstChild.self)
    }

    let sname = details.isGroup == 1 ? (details.senderId == s.id ? 'You' : this.username(details.senderId, details.senderInfo.tel)) + ': ' : '';

    let receipt = '',
        lm_receipt = '...';
    if (details.senderId == s.id) {
        let r = ac.messageReceipt(details);
        receipt = '<span class="receipt' + r.receiptCss + '">' + r.receipt + '</span> ';
        lm_receipt = 'from-me'
    }
    let lastM = ac.decorateMessage(details.message.trim().unescape());
    if (lastM == '') {
        let d = ac.describeFile(details.fileInfo);
        lastM = d.icon + ' ' + d.description;
    }
    let inf_ = this.chats[details.chatId].info;
    chat = chat.self;
    let last_mess_holder = chat.childNodes[1].childNodes[1],
        last_date = chat.lastChild.firstChild,
        last_unr = chat.lastChild.lastChild.lastChild;
    last_mess_holder.innerHTML = receipt + '<span class="' + lm_receipt + '">' + sname + helper.reduce(lastM, 60) + '</span>';
    last_date.innerHTML = new Date(details.dateSent).nice_one(true);
    if (details.senderId != s.id && this.openedChat != details.chatId && details.dateSeen == 0) {
        inf_.unread++;
        last_unr.innerHTML = inf_.unread;
        last_unr.style.visibility = 'visible';
        last_date.style.color = 'rgb(37, 211, 102)';
    }
}

WhatsApp.prototype.resolveMinorIssues = function() {
    let oc = this.openedChat;
    return new Promise((res, rej) => {
        if (oc == null || oc.split('_')[0] == 'group') {
            res();
            return;
        }
        let ms = this.chats[oc].messages;
        for (let mid in ms) {
            let gui = helper._('#' + mid).lastChild.lastChild.lastChild;
            if (gui.htm() == 'done' && ms[mid].dateSeen != '0' && ms[mid].senderInfo.id == this.settings.id)
                gui.addClass('seen').html('done_all');
        }
        res();

    });
}
WhatsApp.prototype.checkNewMessages = function() {
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

WhatsApp.prototype.updateReceipt = function(chatId) {
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

WhatsApp.prototype.check4MessageUpdates = function() {
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
                                        helper._('#' + messageId).addClass('deleted').
                                        html('<span class="text-muted"><i class="fa fa-ban"></i> <i>This message was deleted</i></span>').self
                                        if (message.isGroup == 1)
                                            message.deleteInfo.deleted = 2;
                                        else
                                            message.deleteInfo[si] = 2;
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

WhatsApp.prototype.unhighlighChatHead = function(chatId) {

    let inf_ = this.chats[chatId].info;
    let chat = helper._('#' + chatId).self;
    let last_date = chat.lastChild.firstChild,
        last_unr = chat.lastChild.lastChild.lastChild;
    last_unr.innerHTML = 0;
    inf_.unread = 0;
    last_unr.style.visibility = 'hidden';
    last_date.style.color = 'rgba(0, 0, 0, 0.4)';
}
WhatsApp.prototype.updateInnerNotification = function(chatId, destroy) {
    let box = helper._('#chatBox-' + chatId).child(0);
    let badge = box.child(3).child(0).child(1)
    if (destroy) {
        try {
            box.child(1).removeChild(helper._('#inner-notification-' + chatId).parent().self)
        } catch (err) {}
        badge.html()
        badge.self.hidden = true;
    } else {
        try {
            let noti = helper._('#inner-notification-' + chatId);
            let num = Number(noti.child(0).htm());
            noti.child(0).html(num + 1);
            noti.child(1).html(' UNREAD MESSAGES');
            badge.html(num + 1)
        } catch (err) {
            box.child(1).addChild(this.buildMessageGUI(null, 'inner-unread', chatId));
            badge.html(1);
        }
        badge.self.hidden = false;
    }
}

WhatsApp.prototype.sendGIF = function(close) {
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

WhatsApp.prototype.prepareReply = function(messageId, close) {
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

WhatsApp.prototype.recordIndicator = function(e) {
    this.pauseRecording();
    let self = this;
    let btn = e.target.tagName == 'BUTTON' ? e.target : helper._(e.target).parent().self
    let cnR = btn.getAttribute('can-record');
    let recordindicator = helper._(btn).parent().parent().parent().child(4);
    let cancel = recordindicator.child(0).child(0).self;
    let timings = recordindicator.child(0).child(1).child(1).html('00:00');
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
WhatsApp.prototype.chooseFile = function(chosen = false, defaultCaption = helper.make_el('textarea').self) {
    let self = this;
    if (this.state.needUpload.length > 0) {
        this.Alert('Please wait for current upload to finish..');
        return;
    }
    let files_to_be_uploaded = [];

    ac.choose_file({ multiple: true, accept: 'image/*' }, chosen).then(files => {
        let container = helper.make_el('div').class('preview-container');
        let w = new helper.Modal();
        let head = helper.make_el('div').class('preview-head').addChild([
            helper.make_el('button').attr({
                class: 'btn',
                style: { color: 'white' },
                onclick: () => {
                    files_to_be_uploaded = [];
                    w.close();
                }
            }).html('<span class="material-icons-outlined">west</span>').self,
            helper.make_el('span').html(' Preview').self
        ]);
        let textarea = helper.make_el('textarea').attr({
            class: 'form-control textarea  caption',
            placeholder: 'Add a caption...',
            onkeyup: (e) => {
                helper.auto_grow(e.target, 38, 100)
            },
            onkeydown: (e) => {
                if (self.settings.enter_button == 1 && e.key == 'Enter') {
                    send()
                }
            }
        }).setHeight('38px').self;

        function send() {
            defaultCaption.value = '';
            if (!chosen) {
                ac.typingMessage(defaultCaption);
            }
            self.addMessage(null, textarea);
        }

        let body = helper.make_el('div').class('preview-body');
        let foot = helper.make_el('div').class('preview-foot')
        let typingZone = helper.make_el('div').class('input-group-prepend caption-zone').addChild([
            textarea,
            helper.make_el('button').attr({
                style: { position: 'absolute' },
                class: 'btn btn-send-caption',
                onclick: (e) => {
                    //Time to send image files....
                    let keys = Object.keys(files_to_be_uploaded);
                    if (keys.length > 0) {
                        for (let i = 0; i < keys.length; i++) {
                            let fu = new helper.File_(files_to_be_uploaded[keys[i]]);
                            self.state.needUpload.push({ type: fu.description().value.toLocaleLowerCase(), file: fu.file });
                        }
                        send();
                    }
                    w.close();
                }
            }).html('Send').self
        ]);

        let slideContainer = helper.make_el('div').class('foot-slide-holder');
        foot.addChild([typingZone.self, slideContainer.self])
        container.addChild([head.self, body.self, foot.self]);
        let count_selectd = 0;
        for (let i = 0; i < files.length; i++) {
            if (count_selectd >= 10) {
                break;
            }
            let f = new helper.File_(files[i]);
            if (!f.isImage()) {
                continue;
            }
            if (count_selectd == 0) {
                body.addChild(f.tag().id('previewshow_0').class('opened-preview').attr({ controls: true }).style({ maxHeight: innerHeight + 'px' }).self)
            }
            slideContainer.addChild(helper.make_el('div').class('preview-foot-img-container').addChild([f.tag().attr({
                    id: 'previewfoot_' + i,
                    onclick: (e) => {
                        let el = helper._(e.target.cloneNode(true)).id('previewshow_' + i).addClass('opened-preview').self;
                        body.truncate();
                        body.addChild(el);
                        structurize();
                    }
                }).self,
                helper.make_el('span').attr({
                    class: 'material-icons-outlined text-danger rounded-circle',
                    style: {
                        position: 'absolute',
                        right: '0',
                        background: 'white',
                        cursor: 'pointer'
                    },
                    onclick: () => {
                        delete files_to_be_uploaded['file_' + i];
                        let this_id = 'previewshow_' + i;
                        let container = helper._('#previewfoot_' + i).parent();
                        let opened = body.child(0).Id;
                        if (opened == this_id) {
                            if (container.has_nextSibling) {
                                container.nextSibling.child(0).click();
                                container.delete();
                            } else if (container.has_previousSibling) {
                                container.previousSibling.child(0).click();
                                container.delete();
                            } else {
                                w.close();
                            }
                        } else {
                            container.delete();
                        }
                    }
                }).html('close').self
            ]).self);
            files_to_be_uploaded['file_' + i] = f.file;
            count_selectd++;
        }
        w.add_content(container.self);
        let structurize = () => {
            [].slice.call(document.querySelectorAll('.opened-preview')).forEach(el => {
                el.style.maxHeight = innerHeight + 'px';
            })
            if (innerWidth < 700) {
                container.style({
                    width: '100%',
                    marginLeft: '0%'
                })
            } else {
                container.style({
                    width: '50%',
                    marginLeft: '25%'
                })
            }

        }

        w.open();
        structurize();
        window.resize_callbacks.push(structurize);
        if (Object.keys(files_to_be_uploaded).length == 0) {
            w.close();
            self.bottomInfo('Files were filtered, you have nothing to upload!', 'error');
        }

        textarea.value = defaultCaption.value;
        helper.auto_grow(textarea, 38, 100);
    })

}
WhatsApp.prototype.confirmDelete = function(single) {
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

WhatsApp.prototype.expandMedia = function(originalMedia) {
    let check_no_dp = originalMedia.src.split('/');
    if (this.state.selecting.selecting == true || check_no_dp[check_no_dp.length - 1] == 'default-dp.jpg') {
        return;
    }
    new helper.Modal().expandElement(originalMedia);
    return;
    let media = originalMedia.cloneNode(true);
    helper._(media).class('')
    let tag = media.tagName;
    let screen = new helper.Modal();

    function prepare(el) {
        el.style = 'max-height:' + innerHeight + 'px;max-width:' + innerWidth + 'px;';
        window.resize_callbacks.push(() => {
            el.style = 'max-height:' + innerHeight + 'px;max-width:' + innerWidth + 'px;';
        })
        let head = helper.make_el('div').style({
            display: 'block',
            position: 'absolute',
            width: '100%',
            background: 'rgba(0,0,0,0.5)',
            fontSize: '1.4em',
            top: '0'
        })
        let closeBtn = helper.make_el('button');
        closeBtn.attr({
            style: {
                float: 'right',
                marginRight: '10px',
                color: 'red',
                border: 'none',
                background: 'transparent',
                margin: '5px'
            },
            title: 'Close modal',
            onclick: () => { screen.close() },
            onmouseenter: () => { closeBtn.style({ fontWeight: 'bolder' }) },
            onmouseleave: () => { closeBtn.style({ fontWeight: 'normal' }) }
        }).html('X');
        head.addChild(closeBtn.self);
        //foot.innerHTML = 'I am foot';
        screen.add_content(head.self);
        screen.add_content(el);
        screen.touch_close = true;
        // screen.add_content(foot);
        screen.open();
    }
    if (tag == 'VIDEO') {
        media.controls = true;
        prepare(media);
    } else if (tag == 'IMG') {
        prepare(media);
    } else {
        let err = document.createElement('div');
        err.innerHTML = 'Invalid Media type, only image and video allowed';
        prepare(err);
    }
}

WhatsApp.prototype.checkLastSeen = function() {
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

WhatsApp.prototype.updateChatsInfo = function() {
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
WhatsApp.prototype.block = function(chat, blc) {
    let s = this.settings;
    if (blc != 0 && blc != s.id && s.blocked_by.indexOf(chat) == -1) {
        s.blocked_by.push(chat);
        _block(false);
    } else if (blc == 0 || blc == s.id) {
        let ind = s.blocked_by.indexOf(chat);
        if (ind != -1) {
            s.blocked_by.splice(ind, 1);
            _block(true);
        }
    }

    function _block(bool) {
        try {
            helper._('#chatBox-' + chat).child(0).child(5).self.hidden = bool;
        } catch (err) {}
    }
}
WhatsApp.prototype.checkTyping = function() {
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
                    if ((now.getTime() - then.getTime()) / 1000 <= 1 && res.chat == id) {
                        affected.child(1).self.hidden = true;
                        affected.child(2).style({ display: 'block' });
                        let affectedInner = affected.child(2).child(0);
                        if (affectedInner.htm() != mess_) {
                            affectedInner.html(mess_)
                        }
                        try {
                            let info = helper._('#chatBox-' + id).child(0).child(0).child(0).child(0).child(0).child(1).child(0).child(1);
                            if (info.htm() != mess_)
                                info.html(mess_);
                        } catch (error) {}
                    } else {
                        affected.child(1).self.hidden = false;
                        affected.child(2).style({ display: 'none' })
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
WhatsApp.prototype.createMessageSelection = function(id) {
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
WhatsApp.prototype.destroyMessageSelection = function() {
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
WhatsApp.prototype.actOnMessage = function(target, message_id) {
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
WhatsApp.prototype.forwardMessages = function() {
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
            if (sel.selected.length > 1) {
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
            value: `${disabledInfo} <img src= "${dp}" class="dp">${name}<span class="text-secondary font-weight-lighter font-size-sm" style="float:right">~ ${gp}</span>`
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
WhatsApp.prototype.copyMessage = function(details) {
        let fi = details.fileInfo;
        let text = typeof details == 'object' ? (details.message == '' ? fi.type == 'gif' ? fi.url : `${this.mainRoot}file-viewer?f=${`${this.root}/visitors/${details.senderId}/${fi.type == 'picture' ? 'Pictures' : 'Recordings'}/${fi.url}`.to_b64()}` : details.message) : details;
    helper.copy(text.unescape());
    this.bottomInfo('Copied to clipboard...', 'success');
}
WhatsApp.prototype.shareMessage = function(details) {
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
WhatsApp.prototype.messageInfo = function(details) {
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

WhatsApp.prototype.openConversation = function(details) {

    let cid = this.chat_id_from_user_id(details.senderInfo.id);
    if (cid == '') {
        sw.addPublicUser(this.settings.id, details.senderInfo.id).then(result => {
            if (this.openedChat != null) {
                this.closeChat('chatBox-' + this.openedChat, 'right');
            }
            this.chats[result.chat_id] = { info: result, messages: {} };
            this.prepareChat({ info: result, messages: {} });
            this.openChat(result.chat_id);
        }).catch(err => {
            this.bottomInfo('You can\'t DM this person because you are not friends and the account is private', 'error');
        })
    } else {
        if (this.openedChat != null) {
            this.closeChat('chatBox-' + this.openedChat, 'right');
        }
        this.openChat(cid);
    }
}

WhatsApp.prototype.deleteChat = function() {
    let s = this.settings;
    let cid = this.openedChat;
    new helper.Modal().Confirm({
        title: 'Please Confirm!',
        content: '<hr>You will never see this chat again but will not be deleted for your partner, ' +
            'just in case your partner texts you, the entire conversation will come back but if the he deletes too, then the ' +
            'chat shall really be deleted for both of you... It\'s crazy I know.<hr>',
        acceptText: 'Proceed',
        rejectText: 'Cancel'
    }).then(() => {
        sw.deleteChat(cid, s.id).then(() => {
            helper._('#' + cid).delete();
            helper._('#chatBox-' + cid).delete();
            this.openedChat = null;
            this.bottomInfo('Chat deleted!', 'success');
        }).catch(() => {
            this.bottomInfo('Failed!', 'error');
        })
    }).catch(() => {})
}

WhatsApp.prototype.exportChat = function() {

    let messages = Object.keys(this.chats[this.openedChat].messages);
    if (messages.length == 0) {
        this.bottomInfo('Empty conversation', 'error');
        return;
    }
    let self = this;
    let w = new helper.Modal();
    w.touch_close = true;
    let head = helper.make_el('div').class('h3').html('<i class="fa fa-download"></i> Export chat');
    let foot = helper.make_el('div').addChild(
        helper.make_el('button').attr({
            class: 'btn btn-light float-right',
            onclick: () => { w.close() }
        }).html('Cancel').self
    );
    let clss = 'btn btn-primary m-2 w-25';
    let xml_btn = helper.make_el('button').attr({
        class: clss,
        onclick: () => {
            beginExport('xml', xml_btn);
        }
    }).html('XML');

    let txt_btn = helper.make_el('button').attr({
        class: clss,
        onclick: () => {
            beginExport('txt', txt_btn);
        }
    }).html('TEXT');

    let json_btn = helper.make_el('button').attr({
        class: clss,
        onclick: () => {
            beginExport('json', json_btn);
        }
    }).html('JSON');

    function change_btn_state(enable) {
        [xml_btn, txt_btn, json_btn].forEach(btn => {
            if (enable)
                btn.enable();
            else
                btn.disable()
        })
    }

    function beginExport(extension, btn) {
        change_btn_state(false)
        btn.html('please hold...')
        let ch = self.openedChat;
        sw.exportChat(ch, extension).then(resp => {
            change_btn_state(true);
            btn.html(extension.toUpperCase());
            w.close();
            ac.sm_download(`${self.mainRoot}tmp/${resp}`, `247-dev.com_chat_${self.settings.username.split(' ')[0]}_&_${self.chats[ch].info.username.split(' ')[0]}`, extension);
        }).catch(err => {
            change_btn_state(true)
            btn.html(extension.toUpperCase());
            self.bottomInfo('Download failed!', 'error');
        })
    }
    let bodyM = helper.make_el('div').style({
        background: 'white',
        display: 'inline-block',
        borderRadius: '8px'
    }).addChild([
        head.self,
        helper.make_el('div').class('p-2').html('Click to download conversation in any of the three formats below').self,
        helper.make_el('div').style({
            padding: '5px'
        }).addChild([
            xml_btn.self,
            txt_btn.self,
            json_btn.self
        ]).self,
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

WhatsApp.prototype.videoCall = function(properties) {

    let s = this.settings;
    let cid = properties.chatId;
    let chat = this.chats[cid];
    let name = this.username(properties.id, properties.name);
    chat.info.custom_name == 0 ? chat.info.tel : chat.info.custom_name;

    if (ac.checkBlock(s, cid)) {
        this.bottomInfo('Can\'t call this user...', 'error');
        return;
    }

    if (this.state.recording) {
        this.bottomInfo('Can\'t make calls, recording is in progress...', 'error');
        return;
    }
    ac.checkPermission({ name: 'camera' }).then(res => {
        if (res == 'granted') {

            let self = this;
            self.state.calling = true;
            let w = new helper.Modal();
            let call_status = helper.make_el('div').class('call-status').html('Opening Camera...');
            let close = function(message, timeout, type = 'e') {
                call_status.html(message);
                ac.play_sound(self, 'callerTune', cid, true);
                setTimeout(() => {
                    try { w.close(); } catch (e) {}
                    ac.clearStream();
                    sw.setCallStatus(s.id, properties.id, type).then(() => {
                        self.state.calling = false;
                        self.checkIncomingCall();
                    }).catch(er => {
                        self.state.calling = false;
                        self.checkIncomingCall();
                    });
                }, timeout);
            }
            let btnEnd = helper.make_el('button').attr({
                        class: 'btn btn-light rounded-circle btn-cancel-call',
                        onclick: () => {
                            close('Call ended', 1000);
                        }
                    }).style({
                        position: 'absolute',
                        bottom: '10px'
                    }).html('<i class="fa fa-phone"></i>').disable();
            let videoStremHolder = helper.make_el('video').attr({
                muted: 'muted',
                style: {
                    objectFit: 'cover',
                    height: '100%',
                    maxWidth: '100%',
                    transform: 'rotateY(180deg)'
                }
            }).self;
            let body = helper.make_el('div').style({
                position: 'relative'
            }).addChild([
                videoStremHolder,
                helper.make_el('div').style({
                    position: 'absolute',
                    top: '0',
                    bottom: '0',
                    width: '100%',
                    background: 'rgba(0,0,0,0.4)',
                }).addChild([
                    helper.make_el('div').style({
                        background: 'transparent',
                        height: '230px',
                        textAlign: 'center',
                    }).addChild([
                        helper.make_el('div').class('incoming-dp pt-2').addChild(
                            helper.make_el('img').attr({
                                src: properties.dp,
                                style: {
                                    objectFit: 'cover',
                                    width: '100px',
                                    height: '100px',
                                    marginTop: '20px',
                                    marginBottom: '10px',
                                    borderRadius: '50px'
                                }
                            }).self
                        ).self,
                        helper.make_el('div').class('call-name').html(name).self,
                        call_status.self
                    ]).self,

                    btnEnd.self
                ]).self
            ]);
            let bodyM = helper.make_el('div').style({
                background: 'white',
                display: 'inline-block',
            }).addChild(body.self)
            w.add_content(bodyM.self);
            let structurize = function() {
                bodyM.setHeight(innerHeight + 'px');
                body.setHeight(innerHeight + 'px')
                if (innerWidth < 700)
                    bodyM.setWidth(innerWidth + 'px')
                else
                    bodyM.setWidth('700px')
            }
            structurize();
            window.resize_callbacks.push(structurize)
            w.open();
            ac.getStream({ video: true }).then(stream => {
                var videoOnly = new MediaStream(stream.getVideoTracks());
                videoStremHolder.srcObject = videoOnly;
                videoStremHolder.onloadedmetadata = function(e) {
                    videoStremHolder.play();
                    call_status.html('Connecting...');
                    tryCalling();
                    btnEnd.enable();
                };
            }).catch(err => {
                close('Camera not found!', 2000);
            })
            let tryCalling = function() {
                sw.outgoingCall(s.id, properties.id, 'v').then((resp) => {
                    if (resp == 1) {
                        beginCall();
                    } else if (resp == 0) {
                        call_status.html('On another call, please wait...');
                        setTimeout(() => {
                            tryCalling();
                        }, 1000);
                    } else {
                        close('Can\'t connect, call ended!', 2000);
                    }
                }).catch(err => {
                    close('Can\'t connect, call ended!', 2000);
                });
            }

            let beginCall = function() {

                call_status.html('Calling');
                let st = new Date().getTime();
                ac.play_sound(self, 'callerTune', cid);

                let checkStatus = () => {
                    setTimeout(() => {

                        sw.checkCallStatus(s.id, properties.id).then(resp => {
                            let end = new Date().getTime();
                            switch (resp) {
                                case 'r':
                                    call_status.html('Ringing');
                                    if ((end - st) / 1000 > 60) {
                                        close('No answer', 2000, 'e');
                                    } else {
                                        checkStatus();
                                    }
                                    break;
                                case 'c':
                                    checkStatus();
                                    break;
                                case 'd':
                                    close('Declined', 2000, 'e');
                                    break;
                                case '0':
                                case 0:
                                    if ((end - st) / 1000 > 5) {
                                        close(name + ' is not available', 2000, 'e');
                                    } else {
                                        checkStatus();
                                    }
                                    break;
                                default:
                                    close('Call failed!', 2000, 'e')
                                    break;
                            }
                        }).catch(err => {
                            close('Call failed!', 2000, 'e')
                        })
                    }, 1000);
                }
                checkStatus();
            }

        } else if (res == 'prompt') {
            this.askMediaPermission('c');
        } else {
            this.mediaErrorAnnounce('c');
        }
    }).catch(() => { this.askMediaPermission('c'); })
}


WhatsApp.prototype.audioCall = function(properties) {
    let s = this.settings;
    let cid = properties.chatId;
    if (ac.checkBlock(s, cid)) {
        this.bottomInfo('Can\'t call this user...', 'error');
        return;
    }
    if (this.state.recording) {
        this.bottomInfo('Can\'t make calls, recording is in progress...', 'error');
        return;
    }
    this.state.calling = true;
    let self = this;

    
    let name = this.username(properties.id, properties.name);

    let w = new helper.Modal();
    let call_status = helper.make_el('div').class('call-status').html('Connecting...');

    let close = function(message, timeout, type = 'e') {
        call_status.html(message)
        ac.play_sound(self, 'callerTune', cid, true);
        setTimeout(() => {
            try { w.close(); } catch (e) {}
            ac.clearStream();
            sw.setCallStatus(s.id, properties.id, type).then(() => {
                self.state.calling = false;
                self.checkIncomingCall();
            }).catch(er => {
                self.state.calling = false;
                self.checkIncomingCall();
            });
        }, timeout);
    }

    let head = helper.make_el('div').style({
        background: 'rgb(18, 140, 126)',
        height: '100px',
        textAlign: 'center'
    }).addChild([
        helper.make_el('div').class('call-name pt-2').html(name).self,
        call_status.self
    ]);
    let foot = helper.make_el('div').class('call-foot').style({
        background: 'rgb(18, 140, 126)',
        height: '70px',
    }).addChild([
        helper.make_el('button').class('btn btn-light').html('<i class="fa fa-volume-up"></i>').self,
        helper.make_el('button').style({
            margin: '0 20% 0 20%'
        }).class('btn btn-light text-muted').html('<i class="fa fa-video-camera"></i>').self,
        helper.make_el('button').class('btn btn-light').html('<i class="fa fa-microphone"></i>').self
    ]);
    let body = helper.make_el('div').style({
        position: 'relative'
    }).addChild([
        helper.make_el('img').attr({
            src: properties.dp,
            style: {
                objectFit: 'cover',
                width: '100%',
                height: '100%'
            }
        }).self,
        helper.make_el('div').style({
            position: 'absolute',
            top: '0',
            bottom: '0',
            width: '100%',
            background: 'rgba(0,0,0,0.2)',
        }).addChild(
            helper.make_el('button').attr({
                class: 'btn btn-light rounded-circle btn-cancel-call',
                onclick: () => {
                    close('Call ended!', 2000, 'e');
                }
            }).style({
                position: 'absolute',
                bottom: '10px'
            }).html('<i class="fas fa-phone"></i>').self
        ).self
    ]);
    let bodyM = helper.make_el('div').style({
        background: 'white',
        display: 'inline-block',
    }).addChild([
        head.self,
        body.self,
        foot.self
    ])
    w.add_content(bodyM.self);
    let structurize = function() {
        bodyM.setHeight(innerHeight + 'px');
        body.setHeight((innerHeight - 170) + 'px')
        if (innerWidth < 700)
            bodyM.setWidth(innerWidth + 'px')
        else
            bodyM.setWidth('700px')
    }
    structurize();
    window.resize_callbacks.push(structurize)
    w.open();
    let tryCalling = function() {
        sw.outgoingCall(s.id, properties.id, 'a').then((resp) => {
            if (resp == 1) {
                beginCall();
            } else if (resp == 0) {
                call_status.html('On another call, please wait...');
                setTimeout(() => {
                    tryCalling();
                }, 1000);
            } else {
                close('Can\'t connect, call ended!', 2000, 'e');
            }
        }).catch(err => {
            close('Can\'t connect, call ended!', 2000, 'e');
        });
    }

    let beginCall = function() {

        call_status.html('Calling');
        let st = new Date().getTime();
        ac.play_sound(self, 'callerTune', cid);
        let checkStatus = () => {
            setTimeout(() => {

                sw.checkCallStatus(s.id, properties.id).then(resp => {
                    let end = new Date().getTime();
                    switch (resp) {
                        case 'r':
                            call_status.html('Ringing');
                            if ((end - st) / 1000 > 60) {
                                close('No answer!', 2000, 'e');
                            } else {
                                checkStatus();
                            }
                            break;
                        case 'c':
                            checkStatus();
                            break;
                        case 'd':
                            close('Declined!', 2000, 'e');
                            break;
                        case '0':
                        case 0:
                            if ((end - st) / 1000 > 5) {
                                close(name + ' is not available', 2000, 'e');
                            } else {
                                checkStatus();
                            }
                            break;
                        default:
                            close('Call ended!', 2000, 'e');
                            break;
                    }
                })
            }, 1000);
        }
        checkStatus();
    }
    tryCalling();
}


WhatsApp.prototype.incomingCall = function(properties) {
    let s = this.settings;
    let self = this;
    let chat = this.chats['chat_' + s.id + 'x' + properties.id];
    if (!chat) {
        chat = this.chats['chat_' + properties.id + 'x' + s.id];
    }
    let cid = chat.info.chat_id;
    let name = this.username(properties.id, chat.info.tel);
    let w = new helper.Modal();
    let head = helper.make_el('div').style({
        background: 'rgb(18, 140, 126)',
        height: '230px',
        textAlign: 'center',
    }).addChild([
        helper.make_el('div').class('call-top').addChild(
            helper.make_el('span').html('<span class="material-icons-outlined">no_encryption</span> <span>Unencripted Call</span>').self
        ).self,
        helper.make_el('div').class('incoming-dp').addChild(
            helper.make_el('img').attr({
                src: this.dp(properties.dp, properties.id),
                style: {
                    objectFit: 'cover',
                    width: '100px',
                    height: '100px',
                    marginTop: '20px',
                    marginBottom: '10px',
                    borderRadius: '50px'
                }
            }).self
        ).self,
        helper.make_el('div').class('call-name').html(name).self,
        helper.make_el('div').class('call-status').html(properties.type == 'v' ? 'WhatsApp Clone video call' : 'WhatsApp Clone voice call').self
    ]);

    function end_call(how) {
        try { w.close(); } catch (e) {}
        ac.play_sound(self, 'incomingCall', cid, true);
        sw.setCallStatus(properties.id, s.id, how).then(() => {
            self.state.calling = false;
            self.checkIncomingCall();
        })
    }

    let ta = helper.make_el('textarea').id('quickreply-' + cid).hide();

    function quickMessage(e) {
        ta.self.value = e.target.innerText;
        self.addMessage(null, ta.self);
        end_call('d');
    }

    let body = helper.make_el('div').style({
        position: 'relative',
        background: 'rgb(18, 140, 126)'
    }).addChild(

        helper.make_el('div').style({
            position: 'absolute',
            top: '0',
            bottom: '0',
            width: '100%',
            background: 'rgba(0,0,0,0.5)',
        }).addChild(
            helper.make_el('div').style({
                position: 'absolute',
                bottom: '10px',
                textAlign: 'center',
                width: '100%'
            }).addChild([
                helper.make_el('button').attr({
                    class: 'btn btn-light rounded-circle btn-cancel-call',
                    onclick: () => {
                        end_call('d');
                    }
                }).html('<i class="fa fa-phone"></i>').self,
                helper.make_el('button').attr({
                    class: 'btn btn-light rounded-circle btn-answer-call',
                    onclick: () => {
                        w.close()
                    }
                }).html('<i class="fa fa-phone"></i>').self,
                helper.make_el('button').attr({
                    class: 'btn btn-light rounded-circle btn-text-call',
                    'data-toggle': 'dropdown'
                }).html('<span class="material-icons-outlined">perm_phone_msg</span>').self,
                helper.make_el('div').class('dropdown-menu').addChild([
                    helper.make_el('button')
                    .class('btn btn-light dropdown-item')
                    .clicked((e) => { quickMessage(e) })
                    .html('Can\'t talk right now').self,
                    helper.make_el('button')
                    .class('btn btn-light dropdown-item')
                    .clicked((e) => { quickMessage(e) })
                    .html('Call me later').self,
                    helper.make_el('button')
                    .class('btn btn-light dropdown-item')
                    .clicked((e) => { quickMessage(e) })
                    .html('I am in a meeting').self,
                    helper.make_el('button')
                    .class('btn btn-light dropdown-item')
                    .clicked((e) => { quickMessage(e) })
                    .html('I am driving').self
                ]).self,
                ta.self
            ]).self
        ).self);
    let bodyM = helper.make_el('div').style({
        background: 'white',
        display: 'inline-block',
    }).addChild([
        head.self,
        body.self
    ])
    w.add_content(bodyM.self);
    let structurize = function() {
        bodyM.setHeight(innerHeight + 'px');
        body.setHeight((innerHeight - 230) + 'px')
        if (innerWidth < 700)
            bodyM.setWidth(innerWidth + 'px')
        else
            bodyM.setWidth('700px')
    }
    structurize();
    window.resize_callbacks.push(structurize)
    w.open();
    this.state.calling = true;

    let checkStatus = () => {
        setTimeout(() => {
            sw.checkCallStatus(properties.id, s.id).then(resp => {
                if (resp != 'r') {
                    end_call('e');
                } else {
                    checkStatus();
                }
            })
        }, 1000);
    }
    checkStatus();
    ac.play_sound(self, 'incomingCall', cid, false);
}
WhatsApp.prototype.checkIncomingCall = function() {
    let self = this;
    let check = function() {
        if (!self.state.calling) {
            setTimeout(() => {
                sw.checkIncomingCall(self.settings.id).then(resp => {
                    self.incomingCall({ chatName: resp.chatName, dp: resp.dp, id: resp.id, type: resp.type });
                }).catch((err) => {
                    if (err == 0)
                        check();
                    else
                    //Connection error
                        console.log('can\'t fetch new calls => ' + err);
                });
            }, 1000);
        }
    }
    check()
}

WhatsApp.prototype.askMediaPermission = function(type) {

    let message = 'send voice notes.',
        obj = 'Camera',
        icon = 'photo_camera',
        obj2 = { video: true };
    if (type == 'c') {
        message = 'send still photos and do fake video calls.';
    }

    if (type == 'm') {
        obj = 'Microphone';
        obj2 = { audio: true };
        icon = 'mic_none';
    }

    let bodyM = helper.make_el('div').style({
        display: 'inline-block',
        background: 'white',
        padding: '6px',
        borderRadius: '10px'
    });
    let logo = helper.make_el('div').class('text-center text-secondary')
    .html(`<span class="material-icons-outlined" style="font-size:38px">${icon}</span>`);
    let title = helper.make_el('div').class('text-center m-2').html(`Grant access to ${obj}!`);

    let description = helper.make_el('div').class('text-secondary p-1').style({
        fontSize: '1.1em',
        borderRadius: '10px'
    }).html(
        `Grant this project the permission to use your ${obj} so you can be able to ${message}`
    );

    bodyM.addChild([logo.self, title.self, description.self]);

       let al = this.Alert({
                body: bodyM.self,
                width:  innerWidth > 700 ? 30 : 80 ,
                direction:  innerWidth > 700 ? 'left' : 'top',
                buttonRight: helper.make_el('button').attr({
                     class: 'btn btn-light float-right',
                        onclick: () => {
                            al.delete()
                            ac.mediaAccessPermission(obj2).then((f) => {
                                this.Alert({
                                    body:`You can now ${message}`,
                                    cancelText: 'Ok'  
                                })
                            }).catch(err => {
                                this.mediaErrorAnnounce(type);
                            })
                        }
                        }).html('Grant'),
                cancelText: 'Deny',
                strict: innerWidth > 700 ? true : false 
                })
}

WhatsApp.prototype.mediaErrorAnnounce = function(type) {
    let device = new helper.Modal().mobile ? 'Phone' : 'PC';
    let icon = 'no_photography',
        message = 'Camera and Microphone not found!!';
    if (type == 'c') {
        message = 'Camera not found!';
    }
    if (type == 'm') {
        icon = 'mic_off';
        message = 'Microphone not found!';
    }
    let bodyM = helper.make_el('div').style({
        display: 'inline-block',
        background: 'white',
        padding: '6px',
        borderRadius: '10px'
    });
    let logo = helper.make_el('div').class('text-center text-secondary')
    .html(`<span class="material-icons-outlined" style="font-size:38px">${icon}</span>`);
    let title = helper.make_el('div').class('text-center m-2').html(message);
    let obj = type == 'c' ? 'camera' : 'microphone';
    let description = helper.make_el('div').class('text-secondary p-1').style({
        fontSize: '1.1em',
        borderRadius: '10px'
    }).html(
        `We found it hard to connect to your  ${obj} 
         and for that reason you might not be able to test some of the webRTC functionalities, its not a problem though since we still have a lot more to test. 
         Just in case you want to really test this part of the project then you have to try the following after being sure that your ${device} has ${obj} ..
        <div class = "p-2 m-1" style="background:rgba(0,255,0, 0.07)">
        - Grant this project the permission to use your ${obj} by going to the settings on your browser depending on which browser you use.<br />
        - Enable your browser to use your ${device}'s ${obj} from your ${device}'s settings<br />
        - Update your browser<br />
        - Use a different browser (Chrome, Firefox, Opera, Ms Edge are recommended) <br />
        - Check that another App is not using your ${device}'s ${obj}
        </div>
        If you use iOS or Mac OS, then things might be a little different.
        <div  class = "p-2 m-1 text-info" style="background:rgba(255,0,0, 0.07)">
        NB: If you have done any of the above, you have  to refresh your browser to make it effective.
        </div>
        <p>If none of the obove helps then I\'m sorry, there is no more help to offer. Thanks</p>`
    );

    bodyM.addChild([logo.self, title.self, description.self]);
        this.Alert({
                body: bodyM.self,
                width: 90,
                direction: 'top',
                cancelText: 'Got it'  
           })
}

WhatsApp.prototype.openCamera = function() {
    ac.checkPermission({ name: 'camera' }).then(res => {
        if (res == 'granted') {
            let self = this;
            let w = new helper.Modal();
            let status = helper.make_el('div').class('call-status p-4').html('Opening Camera...');
            let videoStremHolder = helper.make_el('video').attr({
                muted: 'muted',
                style: {
                    objectFit: 'cover',
                    height: '100%',
                    maxWidth: '100%',
                    transform: 'rotateY(180deg)'
                }
            }).self;
            let btnClose = helper.make_el('button').attr({
                            class: 'call-hide btn btn-hide-call btn-light float-right',
                            style: { color: 'red', zIndex: '+10' },
                            onclick: () => {
                                closeCam()
                            }
                        }).html('<i class="fa fa-close"></i>').disable();
            let btnPic = helper.make_el('button').attr({
                        class: 'btn btn-light rounded-circle btn-cam',
                        onclick: () => {
                            takepicture()
                            closeCam()
                        }
                    }).style({
                        position: 'absolute',
                        bottom: '20px'
                    }).html('<i class="fa fa-camera"></i>').disable()
            let body = helper.make_el('div').style({
                position: 'relative'
            }).addChild([
                videoStremHolder,
                helper.make_el('div').style({
                    position: 'absolute',
                    top: '0',
                    bottom: '0',
                    width: '100%',
                    background: 'transparent',
                }).addChild([
                    helper.make_el('div').style({
                        background: 'transparent',
                        height: '230px',
                        textAlign: 'center',
                    }).addChild([
                        btnClose.self,
                        status.self
                    ]).self,

                    btnPic.self
                ]).self
            ]);
            let bodyM = helper.make_el('div').style({
                background: 'rgba(0,0,0,0.8)',
                display: 'inline-block',
            }).addChild(body.self)
            let closeCam = function() {
                w.close();
                ac.clearStream();
            }
            let takepicture = function() {
                let w = innerWidth,
                    h = videoStremHolder.videoHeight / (videoStremHolder.videoWidth / w)
                let canvas = helper.make_el('canvas').attr({
                    height: h + 'px',
                    width: w + 'px',
                    hidden: true,
                }).appendTo(document.body);
                var context = canvas.self.getContext('2d');
                context.drawImage(videoStremHolder, 0, 0, w, h);
                canvas.self.toBlob((blob) => {
                    self.chooseFile(new File([blob], new Date().getTime() + "capture.jpg", { type: "image/jpeg" }))
                }, 'image/jpeg');
                canvas.delete()
            }

            w.add_content(bodyM.self);
            let structurize = function() {
                bodyM.setHeight(innerHeight + 'px');
                body.setHeight(innerHeight + 'px')
                if (innerWidth < 700)
                    bodyM.setWidth(innerWidth + 'px')
                else
                    bodyM.setWidth('700px')
            }
            structurize();
            window.resize_callbacks.push(structurize)
            w.open();
            ac.getStream({ video: true }).then(stream => {

                var videoOnly = new MediaStream(stream.getVideoTracks());
                videoStremHolder.srcObject = videoOnly;
                videoStremHolder.onloadedmetadata = function(e) {
                    videoStremHolder.play();
                    status.delete();
                };
                btnClose.enable();
                btnPic.enable();
            }).catch(err => {
                closeCam();
                this.mediaErrorAnnounce('c');
            })
        } else if (res == 'prompt') {
            this.askMediaPermission('c');
        } else {
            this.mediaErrorAnnounce('c');
        }
    }).catch(() => { this.askMediaPermission('c'); })
}

WhatsApp.prototype.bottomInfo = function(message, type) {
    let icon = '',
        bg = 'lightgreen';
    if (type == 'error') {
        icon = '<i class = "fa fa-warning text-danger"></i> ';
    }
    if (type == 'success') {
        icon = '<i class = "fa fa-check text-success"></i> ';
        bg = 'white'
    }
    let info = helper.make_el('div').style({
        position: 'fixed',
        bottom: '-60px',
        with: '100%',
        right: '0',
        left: '0',
        zIndex: window.lastZindex += 8,
        textAlign: 'center',
        transition: '0.3s bottom'
    }).addChild(helper.make_el('div').style({
        display: 'inline-block',
        background: bg,
        padding: '5px 10px',
        borderRadius: '16px'
    }).html(icon + message).self).appendTo(document.body);
    info.style({ bottom: '60px' });
    setTimeout(() => {
        info.delete();
        window.lastZindex -= 8
    }, 4000);
}

/**
 * This screen remains running until all utilities are ready.
 */

WhatsApp.prototype.welcomeScreen = function() {
    let wn = new helper.Modal({
        bg: 'white'
    });

    let top = helper.make_el('h2').attr({
        class: 'wc-wlcm-up font-weight-light'
    }).html('WhatsApp Clone').self;

    let middle = helper.make_el('div').attr({
        class: 'wc-wlcm-middle'
    }).addChild([
        helper.make_el('img').attr({
            src: this.root + 'images/whatsapp-logo.png',
            alt: 'WhatsApp Logo',
            class: 'logo'
        }).self,
        helper.make_el('div').attr({
            class: 'wc-wlcm-loading'
        }).html('Welcome... <i class="fa fa-spinner fa-pulse"></i>').self
    ]).self

    let bottom = helper.make_el('div').attr({
        class: 'wc-wlcm-down'
    }).addChild([
        helper.make_el('span').html('From').self,
        helper.make_el('h6').attr({
            style: {
                fontWeight: 'light'
            }
        }).html('247-dev.com').self
    ]).self

    let body = helper.make_el('div').addChild([top, middle, bottom]).self
    wn.add_content(body)

    return {
        launch: () => { wn.open(); },
        destroy: (timeout) => {
            if (timeout) {
                setTimeout(() => {
                    wn.close();
                }, timeout)
            } else {
                wn.close()
            }
        }
    }
}

WhatsApp.prototype.shareActions = function(ik) {
    let link = this.root + '?invite=' + ik;
    return [
        helper.make_el('button').attr({
            title: 'Share on Facebook',
            class: 'btn btn-light rounded-circle round-btn'
        }).html('<span class="material-icons-outlined">facebook</span>').self,
        helper.make_el('a').attr({
            class: 'btn btn-light rounded-circle round-btn',
            href: 'https://wa.me/?text=' + link,
            target: '_blank',
            title: 'Share on the Real WhatsApp'
        }).html('<i class="fa fa-whatsapp"></i>').self,
        helper.make_el('a').attr({
            class: 'btn btn-light rounded-circle round-btn',
            href: 'https://twitter.com/share?url=' + link,
            target: '_blank',
            title: 'Share on Twitter'
        }).html('<i class="fa fa-twitter"></i>').self,
        helper.make_el('a').attr({
            class: 'btn btn-light rounded-circle round-btn',
            href: 'mailto:?subject=Join me test this project - WhatsApp Clone&body=WhatsApp Clone built using pure JavaScript, join me test it and win the chance to get the entire source codes with documentations. Here is the link to test with me: ' + link,
            target: '_blank',
            title: 'Share by Email'
        }).html('<span class="material-icons-outlined">email</span>').self,
        helper.make_el('button').attr({
            class: 'btn btn-light rounded-circle round-btn',
            title: 'Share in other ways according to your device',
            onclick: () => {
                helper.webShare({
                    title: 'Join me test this project - WhatsApp Clone',
                    text: 'WhatsApp Clone built using pure JavaScript, join me test it and win the chance to get the entire source codes with documentations',
                    url: link
                }).then(() => { console.log('shared') }).catch(er => {
                    this.copyMessage(link);
                })
            }
        }).html('<i class="fa fa-share-alt"></i>').self,
        helper.make_el('button').attr({
            class: 'btn btn-light rounded-circle round-btn',
            title: 'Copy your link to clipboard',
            onclick: () => {
                this.copyMessage(link);
            }
        }).html('<i class="fa fa-copy"></i>').self
    ];
}
WhatsApp.prototype.add_public_user = function(btn) {
    let self = this;
    let s = this.settings;
    let w = new helper.Modal();
    let head = helper.make_el('div').style({
        width: '100%',
        background: 'rgba(0,0,0,0.05)',
        textAlign: 'left',
        padding: '8px'
    }).addChild([
        helper.make_el('span').html('Share your link, anyone who connects using your link becomes your friend...').self,
        helper.make_el('div').class('add-public-user-links-container').addChild(this.shareActions(s.invitation_key)).self,
        helper.make_el('div').style({ paddingTop: '8px' })
        .html('Or add pucblic users...<span class="float-right text-muted">').self
    ]);
    let usersContainer = helper.make_el('div')
        .class('add-public-user-links-container').addChild([
            helper.make_el('table').setWidth('100%').class('table-public-users').html('<tbody></tbody>').self,
            helper.make_el('button').attr({
                class: 'btn btn-light',
                style: {
                    fontSize: 'medium',
                    padding: '6px'
                },
                onclick: () => {
                    getUsers();
                }
            }).self
        ])
    let body = helper.make_el('div').style({
        padding: '5px',
        textAlign: 'left',
        overflowY: 'auto'
    }).addChild(usersContainer.self);

    let foot = helper.make_el('div').addChild(
        helper.make_el('button').attr({
            class: 'btn btn-light float-right',
            onclick: () => {
                w.close();
                helper._(btn).enable();
            }
        }).html('OK').self
    );

    let bodyM = helper.make_el('div').style({
        background: 'white',
        display: 'inline-block',
        borderRadius: '8px'
    }).addChild([
        head.self,
        body.self,
        foot.self
    ])
    w.add_content(bodyM.self);
    let structurize = function() {
        body.style({ maxHeight: (innerHeight - 200) + 'px' });
        if (innerWidth < 700)
            bodyM.setWidth((innerWidth - innerWidth % 50) + 'px')
        else
            bodyM.setWidth('700px')
    }
    structurize();
    window.resize_callbacks.push(structurize)
    w.open();
    helper._(btn).disable();

    if (!window.available_public_chats || window.available_public_chats == undefined) {
        window.available_public_chats = [];
    }

    function addUser(user) {
        usersContainer.child(0).child(0).addChild(
            helper.make_el('tr').addChild([
                helper.make_el('td').setWidth('50px').addChild(
                    helper.make_el('img').attr({
                        src: self.dp(user.dp, user.id),
                        class: 'dp'
                    }).self
                ).self,

                helper.make_el('td').addChild([
                    helper.make_el('span').class('font-weight-bolder').html(user.tel).self,
                    helper.make_el('div').class('text-muted').html(user.about.unescape()).self
                ]).self,

                helper.make_el('td').setWidth('120px').addChild(helper.make_el('button').attr({
                    class: 'btn btn-primary btn-add-public-user',
                    onclick: (e) => {
                        let bt = helper._(e.target).html('Hang on... <i class="fa fa-spinner fa-pulse"></i>').disable()
                        sw.addPublicUser(s.id, user.id).then(result => {
                            self.chats[result.chat_id] = { info: result, messages: {} };
                            self.prepareChat({ info: result, messages: {} });
                            bt.style({ background: 'transparent', color: 'rgba(0,0,0,0.6)' }).html('You are now friends');
                        })
                    }
                }).html('Add to chats').self).self
            ]).self
        )
        window.available_public_chats.push(user);
    }

    function getUsers() {

        let last = window.available_public_chats;
        last = last.length == 0 ? 0 : Math.max(...last.map(el => { return Number(el.id) }));

        usersContainer.child(1).html('Please wait... <i class="fa fa-spinner fa-pulse"></i>');
        sw.getPublicUsers(s.id, last).then(res => {

            if (res.length > 0) {
                res.forEach(u => { addUser(u) });
                usersContainer.child(1).html('Load more...')
            } else {
                usersContainer.child(1).addClass('text-danger').html('<i class="fa fa-warning"></i> No more chats to load!')
            }

        }).catch(err => {
            self.bottomInfo('Connection Error', 'error')
        })
    }

    let last = window.available_public_chats;
    if (last.length > 0) {
        last.forEach(u => { addUser(u) });
        usersContainer.child(1).html('Load more...')
    } else
        getUsers();
}

WhatsApp.prototype.openProfile = function(chat_id) {
    if (chat_id && chat_id.split('_')[0] == 'group') {
        return;
    }
    let myId = this.settings.id;
    let w = new helper.Modal();
    let self = this;
    let settings = this.settings;
    let editing = null;
    let edit_icon = '<span class="material-icons-outlined">edit</span>';
    let visibility = 'visible';
    let enter_toggle = 'toggle_off';
    let enter_toggle_class = 'text-muted';
    if (chat_id) {
        visibility = 'hidden';
        i = this.chats[chat_id].info;
        settings = {
            dp: i.dp,
            wallpaper: 'default',
            account_type: i.account_type,
            invitation_key: i.invite_key,
            date_joined: i.date_joined,
            read_receipt: 1,
            notification_sound: 1,
            public_last_seen: 1,
            blocked_chats: [],
            muted_chats: [],
            username: i.custom_name == 0 ? i.username : i.custom_name,
            tel: i.tel,
            id: i.id,
            about: i.about,
            country: i.country,
            wallpapers: [],
            removed: i.partner_removed
        }
    }

    let reset_choice = (new_) => {
        document.querySelectorAll('button.chat_bg_option').forEach(el => {
            helper._(el).lastChild.hide()
        });
        sw.updateWallpaper(settings.id, new_).then(() => {
            settings.wallpaper = new_;
            if (self.openedChat != null) {
                helper._('#chatBox-' + self.openedChat).child(0).style(ac.wallpaper_style(self));
            }
            self.bottomInfo('Wallpaper updated successfully', 'success');
        })
    }

    let edit_info = function(id) {
        let text_arr = ['profile_name', 'profile_tel', 'profile_about'];

        if (settings.id != settings.id && ['profile_name', null].indexOf(id) == -1) {
            return;
        }

        if (text_arr.indexOf(editing) != -1) {
            let holder = helper._('#' + editing).attr({
                contenteditable: 'false',
                style: {
                    outline: 'none',
                    borderBottom: 'none',
                }
            });
            let val = holder.value();
            switch (editing) {
                case 'profile_name':

                    if (val.split('').all_in(helper.letters.concat(helper.numbers).concat([' '])) && !val.empty() && val.length.in_range(1, 30)) {
                        if (val != settings.username)
                            sw.updateProfile({ user: settings.id, cell: 'username', value: val, chat: chat_id, owner: self.settings.id }).then(() => {
                                if (chat_id) {
                                    self.chats[chat_id].info.custom_name = val;
                                    helper._('#' + chat_id).child(1).child(0).html(val);
                                    helper._('#chatBox-' + chat_id).child(0).child(0).child(0).child(0).child(0).child(1).child(0).child(0).html(val);
                                    self.refreshMessages(chat_id);
                                } else {
                                    settings.username = val;
                                }

                                self.bottomInfo('Name updated successfully!', 'success')
                            }).catch(err => {
                                self.bottomInfo('Name update failed!', 'error')
                            })
                    } else {
                        self.bottomInfo('Invalid name!', 'error')
                        holder.html(self.username(settings.id, settings.username))
                    }
                    break;

                case 'profile_about':
                    if (!val.empty() && val.length.in_range(1, 200)) {
                        val = val.escape();
                        if (val != settings.about.unescape())
                            sw.updateProfile({ user: settings.id, cell: 'about', value: val, chat: chat_id }).then(() => {
                                settings.about = val;
                                self.bottomInfo('Updated successfully!', 'success')
                            }).catch(err => {
                                self.bottomInfo('Update failed!', 'error')
                            })
                    } else {
                        self.bottomInfo('Invalid input', 'error')
                        holder.html(settings.about.unescape());
                    }
                    break;

                case 'profile_tel':
                    if (!val.empty() && val.isTel()) {
                        if (val != settings.tel)
                            sw.updateProfile({ user: settings.id, cell: 'tel', value: val, chat: chat_id }).then(() => {
                                settings.tel = val;
                                self.bottomInfo('Updated successfully!', 'success')
                            }).catch(err => {
                                self.bottomInfo('Update failed! Error: ' + err, 'error')
                            })
                    } else {
                        self.bottomInfo('Invalid input', 'error')
                        holder.html(settings.tel);
                    }

            }
        }

        if (text_arr.indexOf(id) != -1) {
            helper._('#' + id).attr({
                contenteditable: 'true',
                style: {
                    outline: 'none',
                    borderBottom: '1.5px solid rgb(52, 183, 241)',
                }
            }).self.focus();
            editing = id;
            if (id == 'profile_tel') {

                let cc = '+' + self.countries[settings.country.toUpperCase()].phonecode;

                function add_cc(e) {
                    let new_v = e.target.innerText;
                    if (new_v.length <= cc.length) {
                        e.target.innerHTML = cc;
                    }
                }
                helper._('#profile_tel').attr({
                    onkeyup: (e) => {
                        add_cc(e)
                    },
                    oncut: (e) => {
                        setTimeout(() => {
                            add_cc(e)
                        }, 100)
                    }
                })
            }
        }


        let options = {
            profile_receipt: {
                settings_id: 'readReceipt',
                title: 'Read Receipt',
                options: [
                    { id: '1', value: 'Enable' },
                    { id: '0', value: 'Disable' }
                ],
                html: { html_1: 'Enabled', html_0: 'Disabled' },
                db_cell: 'read_receipt'
            },
            profile_sound: {
                settings_id: 'notificationSounds',
                title: 'Notification Sounds',
                options: [
                    { id: '1', value: 'Enable' },
                    { id: '0', value: 'Disable' }
                ],
                html: { html_1: 'Enabled', html_0: 'Disabled' },
                db_cell: 'notification_sound'
            },
            profile_othersound: {
                settings_id: 'other_sounds',
                title: 'Other Sounds',
                options: [
                    { id: '1', value: 'Enable' },
                    { id: '0', value: 'Disable' }
                ],
                html: { html_1: 'Enabled', html_0: 'Disabled' },
                db_cell: 'other_sounds'
            },
            profile_last_seen: {
                settings_id: 'publicLastSeen',
                title: 'Last Seen',
                options: [
                    { id: '1', value: 'Public' },
                    { id: '0', value: 'Private' }
                ],
                html: { html_1: 'Public', html_0: 'Private' },
                db_cell: 'public_last_seen'
            },
            profile_acc_type: {
                settings_id: 'accountType',
                title: 'Account Type',
                options: [
                    { id: '1', value: 'Public' },
                    { id: '0', value: 'Private' }
                ],
                html: { html_1: 'Public', html_0: 'Private' },
                db_cell: 'account_type'
            },

        }
        if (Object.keys(options).includes(id)) {
            let active = options[id];
            let sel = new helper.Modal().RequestSelection();
            sel.touch_close = true;
            sel.title = active.title;
            sel.options = active.options;
            sel.request().then(resp => {
                if (resp != settings[options[id].settings_id]) {
                    sw.updateProfile({ user: settings.id, cell: active.db_cell, value: resp, chat: undefined }).then(() => {
                        settings[options[id].settings_id] = resp;
                        helper._('#' + id).html(active.html['html_' + resp]);
                        self.bottomInfo(active.title + ' updated successfully!', 'success')
                    }).catch(err => {
                        self.bottomInfo(active.title + ' update failed!', 'error')
                    })
                }
            }).catch(err => {})
        } else if (id == 'profile_enterBTN') {
            let val = settings.enter_button == 1 ? 0 : 1;
            sw.updateProfile({ user: settings.id, cell: 'enter_button', value: val, chat: undefined }).then(() => {
                settings.enter_button = val;
                if (val == 1) {
                    helper._('#' + id).removeClass('text-muted').addClass('text-primary').html('toggle_on');
                } else {
                    helper._('#' + id).removeClass('text-primary').addClass('text-muted').html('toggle_off');
                }

                self.bottomInfo('Updated was successfull!', 'success')
            }).catch(err => {
                console.log(err)
                self.bottomInfo('Update failed!', 'error')
            })
        }

    }

    let muted_blocked_count = (type) => {
        let obj = type == 'block' ? settings.blocked_chats : settings.muted_chats;
        let word = type == 'block' ? ' Blocked' : ' Muted'
        return obj.length + word + ' chat' + (obj.length == 1 ? '' : 's')
    }

    let chat_inner_text_for_menu_item = (chat, menu_item) => {
        try {
            let ddm = helper._('#chatBox-' + chat).child(0).child(0).child(0).child(0).lastChild.lastChild.lastChild;
            if (menu_item == 'block')
                ddm.child(2).html('Block');
            else
                ddm.child(0).html('Mute');
        } catch (err) {}
    }

    let solidColors = () => {
        let all = [];

        self.colors.forEach(col => {

            let colBtn = helper.make_el('button').attr({
                class: 'btn chat_bg_option',
                style: {
                    background: col,
                    height: '50px',
                    width: '50px',
                    margin: '0 0 5px 5px',
                    borderRadius: '25px'
                },
                onclick: () => {
                    reset_choice(col);
                    colBtn.child(0).show();
                }
            }).addChild(helper.make_el('span').attr({
                class: 'material-icons-outlined',
                style: {
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1px',
                }
            }).hide().html('check').self);

            if (settings.wallpaper == col) {
                colBtn.child(0).show();
            }
            all.push(colBtn.self)
        });
        return all;
    }

    let pictureWp = () => {

        let fileChooser = helper.make_el('button').attr({
            class: 'btn',
            style: {
                height: '50px',
                width: '50px',
                margin: '0 0 5px 5px',
                borderRadius: '25px',
                border: '1px solid royalblue'
            },
            onclick: () => {
                ac.choose_file({ accept: 'image/*' }).then(files => {
                    let f = new helper.File_(files[0]);
                    let loader = new helper.Modal().Loading('Hang on..');
                    f.upload({ destination: 'src/actions.php?cg_wallpaper=' + f.name.i + '&user_id=' + settings.id, progressHandler: () => {} }).then(done => {
                        done = JSON.parse(done);
                        settings.wallpapers.push(done.dp);
                        loader.loader.close()
                    }).catch(er => {
                        loader.loader.close();
                        self.bottomInfo('Failed', 'error');
                    })
                    let wp_d = helper.make_el('button').attr({
                        class: 'btn chat_bg_option',
                        style: {
                            height: '50px',
                            width: '50px',
                            margin: '0 0 5px 5px',
                            borderRadius: '25px',
                            border: '1px solid royalblue',
                            overflow: 'hidden',
                            padding: '0px',
                            position: 'relative'
                        },
                        onclick: () => {
                            reset_choice(f.name.i);
                            wp_d.lastChild.show();
                        }
                    }).addChild([
                        helper.make_el('img').attr({
                            src: f.URL,
                            style: {
                                objectFit: 'cover',
                                height: '50px',
                                width: '50px',
                                borderRadius: '25px',
                            }
                        }).self,
                        helper.make_el('span').attr({
                            class: 'material-icons-outlined',
                            style: {
                                background: 'white',
                                borderRadius: '12px',
                                padding: '1px',
                                position: 'absolute',
                                right: '10px',
                                top: '10px',
                            }
                        }).hide().html('check').self
                    ]);

                    fileChooser.parent().addChild(wp_d.self)
                })
            }
        }).html('<span class="material-icons-outlined">add_photo_alternate</span>');


        let wp_opt = function(type, src) {
            let wp_div = helper.make_el('button').attr({
                class: 'btn chat_bg_option',
                style: {
                    height: '50px',
                    width: '50px',
                    margin: '0 0 5px 5px',
                    borderRadius: '25px',
                    border: '1px solid royalblue',
                    overflow: 'hidden',
                    padding: '0px',
                    position: 'relative'
                },
                onclick: () => {
                    reset_choice(src);
                    wp_div.lastChild.show().self.style.visibility = 'visible';
                }
            }).addChild([
                helper.make_el('img').attr({
                    src: type == 'default' ? self.defaultBg : (self.root + 'visitors/' + settings.id + '/wallpapers/' + src),
                    style: {
                        objectFit: 'cover',
                        height: '50px',
                        width: '50px',
                        borderRadius: '25px',
                    }
                }).self,
                helper.make_el('span').attr({
                    class: 'material-icons-outlined',
                    style: {
                        background: 'white',
                        borderRadius: '12px',
                        padding: '1px',
                        position: 'absolute',
                        right: '10px',
                        top: '10px',
                        visibility: settings.wallpaper == src ? 'visible' : 'hidden'
                    }
                }).html('check').self
            ])

            return wp_div.self;
        }

        let all = [fileChooser.self];

        all.push(wp_opt('default', 'default'));

        if (settings.wallpapers.length > 0) {
            settings.wallpapers.forEach(wp => {
                all.push(wp_opt('custom', wp))
            })

        }
        return all;
    }

    let head = helper.make_el('div').style({
        background: 'rgba(0,0,0,0.02)',
        height: '40px',
        position: 'relative'
    }).addChild([
        helper.make_el('button').attr({
            class: 'btn btn-light has_click_event',
            style: { position: 'absolute', left: '0' },
            onclick: () => {
                w.close()
            }
        }).html('<span class="material-icons-outlined has_click_event">arrow_back</span>').self,
        helper.make_el('span').style({ fontSize: '1.3em' }).html('Profile').self
    ]);

    let mainBody = helper.make_el('div').attr({
        style: {
            background: 'white',
        },
        onclick: (e) => {
            let el = e.target;
            if (el.innerHTML != 'edit' && el.id != editing && !el.className.includes('has_click_event'))
                edit_info(null);
        }
    });
    let subBody = helper.make_el('div').style({ overflowY: 'auto' });

    let dp_zone = helper.make_el('img').attr({
        style: {
            objectFit: 'cover',
            height: '200px',
            width: '200px',
            borderRadius: '100px',
            marginTop: '20px',
            boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px'
        },
        src: this.dp(settings.dp, settings.id),
        onclick: (e) => {
            if (myId != settings.id) {
                self.expandMedia(e.target);
                return;
            }
            let rs = new helper.Modal().RequestSelection();
            rs.title = '';
            rs.options = [
                { id: 'view_pic', value: 'View Picture' },
                { id: 'change_pic', value: 'Upload new picture' }
            ];
            rs.request().then(resp => {
                if (resp == 'view_pic')
                    self.expandMedia(e.target);
                else {
                    ac.choose_file({ accept: 'image/*' }).then(files => {
                        let f = new helper.File_(files[0]);
                        if (!f.isImage()) {
                            self.bottomInfo('Invalid file, only JPEG, PNG, JPG', 'error');
                            return;
                        }
                        let ld = new helper.Modal().Loading('Hang on... <span class="spinner-border spinner-border-sm"></span>');

                        f.upload({
                            destination: 'src/actions.php?update_dp=' + f.name.i + '&user_id=' + settings.id,
                            progressHandler: (props) => {}
                        }).then(respond => {
                            settings.dp = f.name.i;
                            e.target.src = this.dp(f.name.i, settings.id);
                            settings.dps.push(f.name.i)
                            add_dp(f.name.i);
                            ld.loader.close();
                        }).catch(e => {
                            ld.loader.close();
                            self.bottomInfo('Failed to update dp', 'error');
                        })
                    })
                }
            }).catch(er => {})
        }
    });

    let all_dps = helper.make_el('div').style({
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        overflowX: 'auto',
        padding: '5px',
    });

    let reset_dp = function() {
        document.querySelectorAll('button.btn-profile-dp').forEach(el => {
            helper._(el).lastChild.hide();
        });
    }

    function add_dp(dp) {
        reset_dp()
        let dp_div = helper.make_el('button').attr({
            class: 'btn btn-profile-dp',
            style: {
                height: '50px',
                width: '50px',
                margin: '0 0 5px 5px',
                borderRadius: '25px',
                border: '1px solid royalblue',
                overflow: 'hidden',
                padding: '0px',
                position: 'relative'
            },
            onclick: () => {
                if (settings.dp != dp) {
                    sw.updateProfile({ cell: 'dp', user: settings.id, value: dp }).then(() => {
                        settings.dp = dp;
                        reset_dp(dp);
                        dp_div.lastChild.show().self.style.visibility = 'visible';
                        dp_zone.self.src = dp_div.child(0).self.src;
                    }).catch(() => {
                        self.bottomInfo('Failed to upadate dp', 'error');
                    });
                }
            }
        }).addChild([
            helper.make_el('img').attr({
                src: self.dp(dp, settings.id),
                style: {
                    objectFit: 'cover',
                    height: '50px',
                    width: '50px',
                    borderRadius: '25px',
                }
            }).self,
            helper.make_el('span').attr({
                class: 'material-icons-outlined',
                style: {
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1px',
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    visibility: settings.dp == dp ? 'visible' : 'hidden'
                }
            }).html('check').self
        ]);

        all_dps.addChild(dp_div.self);
    }


    let dpDiv = helper.make_el('div').style({
        textAlign: 'center',
        minHeight: '240px'
    }).addChild([
        dp_zone.self,
        helper.make_el('div').class('profile-values-container').addChild([
            helper.make_el('div').html('<span class="material-icons-outlined">collections</span>').self,
            helper.make_el('div').class('profile-values text-center').addChild([
                helper.make_el('span').class('text-muted').html('Choose from older Dps').self,
                all_dps.self
            ]).self,
            helper.make_el('div').attr({
                class: 'has_click_event',
                title: 'Delete either selected or unselected',
                onclick: () => {
                    if (settings.dps.length == 0 || settings.dp == '') {
                        self.bottomInfo('You don\'t have any Dp', 'error');
                        return;
                    }
                    let sel = new helper.Modal().RequestSelection();
                    sel.title = 'What do you want to do?'
                    sel.options = [
                        { id: 'sel', value: 'Delete current Dp <span class="text-muted text-sm">(Your dp will be globally removed, you have to add another)</span>' }
                    ];
                    if (settings.dps.length > 1) {
                        sel.options.push({ id: 'unsel', value: 'Delete all Dps except the current one' });
                    }
                    sel.request().then(resp => {
                            if (resp == 'sel') {
                                sw.deleteDp([settings.dp], settings.id, 1).then(() => {
                                    dp_zone.self.src = self.defaultDp;
                                    document.querySelectorAll('button.btn-profile-dp').forEach(el => {
                                        let dp_z = helper._(el).firstChild;
                                        let src_arr = dp_z.self.src.split('/')
                                        if (src_arr[src_arr.length - 1] == settings.dp)
                                            helper._(el).delete();
                                    });
                                    settings.dps = settings.dps.filter(dp => {
                                        return dp != settings.dp;
                                    });
                                    settings.dp = ''
                                    this.bottomInfo('Done', 'success')
                                }).catch(err => {
                                    this.bottomInfo('Failed', 'error');
                                })

                            } else {
                                sw.deleteDp(settings.dps.filter(dp => { return dp != settings.dp }), self.id, 0).then(() => {
                                    document.querySelectorAll('button.btn-profile-dp').forEach(el => {
                                        let dp_z = helper._(el).firstChild;
                                        let src_arr = dp_z.self.src.split('/')
                                        if (src_arr[src_arr.length - 1] != settings.dp)
                                            helper._(el).delete();
                                    });
                                    settings.dps = [settings.dp];
                                    this.bottomInfo('Done', 'success')
                                }).catch(err => {
                                    this.bottomInfo('Failed', 'error');
                                })
                            }
                        }).catch(err => {})
                        //
                }
            }).style({ visibility: 'visible' }).html('<span class="material-icons-outlined text-danger">delete</span>').self
        ]).self,
    ]);

    if (settings.id == myId) {
        if (settings.dps.length > 0)
            settings.dps.forEach(dp => {
                add_dp(dp);
            });

        if (settings.enter_button == 1) {
            enter_toggle = 'toggle_on';
            enter_toggle_class = 'text-primary';
        }

    } else {
        all_dps.parent().parent().delete()
    }

    let nameDive = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">person</span>').self,
        helper.make_el('div').class('profile-values').addChild([
            helper.make_el('span').class('text-muted').html('Name').self,
            helper.make_el('div').id('profile_name').html(self.username(settings.id, settings.username)).self,
            helper.make_el('div').class('text-muted')
            .html(chat_id ? 'You can customize this name if you don\'t want number to be displayed!' :
                'This name will be visible to all your contacts').self
        ]).self,
        helper.make_el('div').attr({
            class: 'has_click_event',
            onclick: () => {
                 if(settings.id != '0001')
                   edit_info('profile_name');
            }
        }).style({ visibility: 'visible' }).html(edit_icon).self
    ])

    let aboutDiv = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">info</span>').self,
        helper.make_el('div').class('profile-values').addChild([
            helper.make_el('span').class('text-muted').html('About').self,
            helper.make_el('div').id('profile_about').html(settings.about.unescape()).self
        ]).self,
        helper.make_el('div').attr({
            class: 'has_click_event',
            onclick: () => {
                   edit_info('profile_about');
            }
        }).style({ visibility: visibility }).html(edit_icon).self
    ])

    let telDiv = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">phone</span>').self,
        helper.make_el('div').class('profile-values').addChild([
            helper.make_el('span').class('text-muted').html('Phone').self,
            helper.make_el('div').id('profile_tel').html(settings.tel).self
        ]).self,
        helper.make_el('div').attr({
            class: 'has_click_event',
            onclick: () => {
                edit_info('profile_tel');
            }
        }).style({ visibility: visibility }).html(edit_icon).self
    ])

    let countryDiv = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">flag</span>').self,
        helper.make_el('div').class('profile-values').addChild([
            helper.make_el('span').class('text-muted').html('Country').self,
            helper.make_el('div').html(self.countries[settings.country.toUpperCase()].nicename).self
        ]).self
    ]);

    let blockedConts = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">block</span>').self,
        helper.make_el('div').attr({
            class: 'profile-values',
            onclick: () => {
                let tab = new helper.Modal().Table();
                tab.title = 'Bloked chats';
                tab.defaultContent = 'No Blocked Chats!';
                if (settings.blocked_chats.length > 0) {

                    let conatainer = helper.make_el('table').class('table-blocked-users').style({ width: '100%' }).addChild(helper.make_el('tbody').self);
                    settings.blocked_chats.forEach(el => {
                        let p = self.chats[el].info;
                        conatainer.child(0).addChild(helper.make_el('tr').addChild([
                            helper.make_el('td').setWidth('50px').addChild(
                                helper.make_el('img').attr({
                                    src: self.dp(p.dp, p.id),
                                    class: 'dp'
                                }).self
                            ).self,

                            helper.make_el('td').addChild([
                                helper.make_el('span').class('font-weight-bolder').html(p.tel).self,
                                helper.make_el('div').class('text-muted').html(p.about.unescape()).self
                            ]).self,

                            helper.make_el('td').setWidth('120px').addChild(helper.make_el('button').attr({
                                class: 'btn btn-primary btn-add-public-user',
                                onclick: (e) => {
                                    let bt = helper._(e.target).html('Hang on... <i class="fa fa-spinner fa-pulse"></i>').disable()
                                    sw.blockContact(el, settings.id).then(ret => {
                                        bt.style({ background: 'transparent', color: 'rgba(0,0,0,0.6)' }).html('Chat Unblocked');
                                        let ind_b = settings.blocked_chats.indexOf(el);
                                        settings.blocked_chats.splice(ind_b, 1);
                                        chat_inner_text_for_menu_item(el, 'block');
                                        self.chat_action_HTML(el, 'action-block', false, '');
                                        helper._('#profile_blocked').html(muted_blocked_count('block'));
                                        self.bottomInfo('Unblock successfull', 'success');
                                    }).catch(err => {
                                        // console.log(err)
                                    })
                                }
                            }).html('Unblock').self).self
                        ]).self)
                    })
                    tab.options.push(conatainer.self)
                }

                tab.launch().then(res => {}).catch(err => {})
            }
        }).addChild([
            helper.make_el('span').class('text-muted').html('Blocked chats').self,
            helper.make_el('div').id('profile_blocked').html(muted_blocked_count('block')).self
        ]).self
    ]);

    let mutedConts = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">volume_off</span>').self,
        helper.make_el('div').attr({
            class: 'profile-values',
            onclick: () => {
                let tab = new helper.Modal().Table();
                tab.title = 'Muted chats';
                tab.defaultContent = 'No Muted Chats!';
                if (settings.muted_chats.length > 0) {

                    let conatainer = helper.make_el('table').class('table-muted-users').style({ width: '100%' }).addChild(helper.make_el('tbody').self);

                    settings.muted_chats.forEach(el => {

                        let p = self.chats[el].info;
                        conatainer.child(0).addChild(helper.make_el('tr').addChild([
                            helper.make_el('td').setWidth('50px').addChild(
                                helper.make_el('img').attr({
                                    src: self.dp(p.dp, p.id),
                                    class: 'dp'
                                }).self
                            ).self,

                            helper.make_el('td').addChild([
                                helper.make_el('span').class('font-weight-bolder').html(p.tel).self,
                                helper.make_el('div').class('text-muted').html(p.about.unescape()).self
                            ]).self,

                            helper.make_el('td').setWidth('120px').addChild(helper.make_el('button').attr({
                                class: 'btn btn-primary btn-add-public-user',
                                onclick: (e) => {
                                    let bt = helper._(e.target).html('Hang on... <i class="fa fa-spinner fa-pulse"></i>').disable()
                                    sw.muteContact(el, settings.id).then(ret => {
                                        bt.style({ background: 'transparent', color: 'rgba(0,0,0,0.6)' }).html('Chat Unmuted');
                                        let ind_b = settings.muted_chats.indexOf(el);
                                        settings.muted_chats.splice(ind_b, 1);
                                        chat_inner_text_for_menu_item(el, 'mute');
                                        self.chat_action_HTML(el, 'action-notifications_off', false, '');
                                        helper._('#profile_muted').html(muted_blocked_count('muted'));
                                        self.bottomInfo('Unmute successfull', 'success');
                                    }).catch(err => {
                                        // console.log(err)
                                    })
                                }
                            }).html('Unmute').self).self
                        ]).self)
                    })

                    tab.options.push(conatainer.self);
                }
                tab.launch().then(res => {}).catch(err => {})
            }
        }).addChild([
            helper.make_el('span').class('text-muted').html('Muted chats').self,
            helper.make_el('div').id('profile_muted').html(muted_blocked_count('muted')).self
        ]).self
    ]);

    let wallPP = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">wallpaper</span>').self,
        helper.make_el('div').class('profile-values').addChild([
            helper.make_el('span').class('text-muted').html('Wallpaper').self,
            helper.make_el('div').html('Solid colors').self,
            helper.make_el('div').style({
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                overflowX: 'auto',
                padding: '5px'
            }).addChild(solidColors()).self,

            helper.make_el('div').style({ marginTop: '10px' }).html('Photos <span class="text-muted">(When you upload a new photo, select it after upload, to use. It must be checked to indicate <b>active</b>)</span>').self,

            helper.make_el('div').style({
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                overflowX: 'auto',
                padding: '5px'
            }).addChild(pictureWp()).self,
        ]).self,

        helper.make_el('div').attr({
            class: 'has_click_event',
            title: 'Delete either selected or unselected',
            onclick: () => {
                if (settings.wallpapers.length == 0) {
                    self.bottomInfo('You don\'t have any custom wallpaper', 'error');
                    return;
                }
                let sel = new helper.Modal().RequestSelection();
                sel.title = 'What do you want to do?'
                if (settings.wallpaper.split('.').length > 1) {
                    sel.options.push({ id: 'curr', value: 'Delete current Wallpaper <span class="text-muted text-sm">(Your wallpaper will reset to default)</span>' });
                    sel.options.push({ id: 'all', value: 'Delete all custom wallpapers except current' });
                } else {
                    sel.options.push({ id: 'all', value: 'Delete all custom wallpapers' });
                }

                sel.request().then(resp => {
                        if (resp == 'all') {
                            sw.deleteWp(settings.wallpapers.filter(wp => { return wp != settings.wallpaper }), settings.id, 0).then(() => {
                                document.querySelectorAll('button.chat_bg_option').forEach(el => {
                                    let dp_z = helper._(el).firstChild;
                                    if (dp_z.self.tagName == 'IMG') {
                                        let src_arr = dp_z.self.src.split('/');
                                        let src = src_arr[src_arr.length - 1];
                                        if (src != settings.wallpaper && src != 'default-bg.jpg') {
                                            helper._(el).delete();
                                        }

                                    }
                                });
                                settings.wallpapers = settings.wallpapers.filter(wp => {
                                    return (wp == settings.wallpaper && wp != 'default');
                                });

                                this.bottomInfo('Done', 'success')
                            }).catch(err => {
                                this.bottomInfo('Failed', 'error');
                            })

                        } else {
                            sw.deleteWp([settings.wallpaper], settings.id, 1).then(() => {
                                reset_choice('default');
                                document.querySelectorAll('button.chat_bg_option').forEach(el => {
                                    let wp_z = helper._(el).firstChild;
                                    if (wp_z.self.tagName == 'IMG') {
                                        let src_arr = wp_z.self.src.split('/');
                                        let src = src_arr[src_arr.length - 1];
                                        if (src == settings.wallpaper)
                                            helper._(el).delete();
                                        if (src == 'default-bg.jpg') {
                                            wp_z.nextSibling.show().self.style.visibility = 'visible';
                                        }
                                    }
                                });
                                settings.wallpapers = settings.wallpapers.filter(wp => {
                                    return wp != settings.wallpaper;
                                });

                                settings.wallpaper = 'default';

                                this.bottomInfo('Done', 'success')
                            }).catch(err => {
                                this.bottomInfo('Failed', 'error');
                            })
                        }
                    }).catch(err => {})
                    //
            }
        }).style({ visibility: 'visible' }).html('<span class="material-icons-outlined text-danger">delete</span>').self
    ])
    let red = '',
        em_html = '(Click to add Email)';
    if (settings.id == myId) {
        let em = settings.email;
        if (!em.empty()) {
            em_html = em;
            if (settings.email_confirmed == 0) {
                red = ' <span class="text-muted">(Unconfirmed)</span>';
            }
        } else {
            red = ' <i class="fa fa-circle text-danger"></i>';
        }
    }
    let addEmail = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">email</span>').self,
        helper.make_el('div').attr({
            onclick: () => {
                self.getEmail(false, true);
            }
        }).class('profile-values').style({ cursor: 'pointer' }).addChild([
            helper.make_el('span').class('text-muted').html('Email' + red).self,
            helper.make_el('div').id('profile_email').html(em_html).self
        ]).self,
        helper.make_el('div').attr({
            class: 'has_click_event',
            onclick: () => {
                self.getEmail('edit');
            }
        }).style({ visibility: visibility }).html(edit_icon).self
    ]);

    let enterBtnEqualsSend = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">keyboard_return</span>').self,
        helper.make_el('div').class('profile-values').addChild([
            helper.make_el('span').html('Enter button equals send').self,
            helper.make_el('div').class('text-muted').html(
                'By toggling this on, whenever you press the Enter button when typing a message, it sends the message. This is good only for PCs'
            ).self
        ]).self,
        helper.make_el('div').attr({
            class: 'has_click_event',
            onclick: () => {
                edit_info('profile_enterBTN');
            }
        }).style({ visibility: visibility }).html('<span class="material-icons-outlined ' + enter_toggle_class + '" id = "profile_enterBTN">' + enter_toggle + '</span>').self
    ]);

    let readRec = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">done_all</span>').self,
        helper.make_el('div').attr({
            onclick: () => {
                edit_info('profile_receipt');
            }
        }).class('profile-values').addChild([
            helper.make_el('span').class('text-muted').html('Read receipt').self,
            helper.make_el('div').id('profile_receipt').html(settings.read_receipt == 1 ? 'Enabled' : 'Disabled').self,
            helper.make_el('div').class('text-muted').html(
                'This setting is not really useful, When you disable Read receipt, the partner won\'t know when you\'ve read their messages.' +
                ' Unlike the real WhatsApp, this setting is not mutual unless it is disabled for both chats.'
            ).self
        ]).self
    ]);

    let notiSound = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">notifications</span>').self,
        helper.make_el('div').attr({
            onclick: () => {
                edit_info('profile_sound');
            }
        }).class('profile-values').addChild([
            helper.make_el('span').class('text-muted').html('Notification sounds').self,
            helper.make_el('div').id('profile_sound').html(settings.notification_sound == 1 ? 'Enabled' : 'Disabled').self,
            helper.make_el('div').class('text-muted').html(
                'This includes only sounds from incoming calls and new messages outside the chat'
            ).self
        ]).self
    ]);

    let otherSound = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">notifications</span>').self,
        helper.make_el('div').attr({
            onclick: () => {
                edit_info('profile_othersound');
            }
        }).class('profile-values').addChild([
            helper.make_el('span').class('text-muted').html('Extra sounds').self,
            helper.make_el('div').id('profile_othersound').html(settings.other_sounds == 1 ? 'Enabled' : 'Disabled').self,
            helper.make_el('div').class('text-muted').html(
                'This includes sounds like message sent, caller tune, new message inside the chat...'
            ).self
        ]).self
    ]);

    let LastSeen = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">schedule</span>').self,
        helper.make_el('div').attr({
            onclick: () => {
                edit_info('profile_last_seen');
            }
        }).class('profile-values').addChild([
            helper.make_el('span').class('text-muted').html('Last seen').self,
            helper.make_el('div').id('profile_last_seen').html(settings.public_last_seen == 1 ? 'Public' : 'Private').self,
            helper.make_el('div').class('text-muted').html(
                'By setting last seen to private, your chats won\'t know when you are online or when last you visited.'
            ).self
        ]).self
    ]);

    let accountType = helper.make_el('div').class('profile-values-container').addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">account_circle</span>').self,
        helper.make_el('div').attr({
            onclick: () => {
                edit_info('profile_acc_type');
            }
        }).class('profile-values').addChild([
            helper.make_el('span').class('text-muted').html('Account Type').self,
            helper.make_el('div').id('profile_acc_type').html(settings.account_type == 1 ? 'Public' : 'Private').self,
            helper.make_el('div').class('text-muted').html(
                'By setting your account type to private, no one can connect with you except you share invitation link, you won\'t appear on the list of public chats.'
            ).self
        ]).self
    ]);


    let invite = helper.make_el('div').attr({
        class: 'profile-values-container',
        style: { cursor: 'pointer' },
        onclick: () => {
            let body = helper.make_el('div').style({
                width: 'inherit',
                overflow: 'auto'
            }).addChild([
                helper.make_el('div').html('Share your link').self,
                helper.make_el('div').style({
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    overflowX: 'auto',
                    padding: '5px'
                }).addChild(this.shareActions(settings.invitation_key)).self,
            ])
            this.Alert({
                body:  body.self,
                width: 90,
                direction: 'bottom'  
           })
        }
    }).addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">people</span>').self,
        helper.make_el('div').class('profile-values').html('Invite a friend').self
    ]);
    let _name = '<b>' + this.username(settings.id, settings.tel) + '</b>';
    let inviteFor = helper.make_el('div').attr({
        class: 'profile-values-container',
        style: { cursor: 'pointer' },
        onclick: () => {
            let body = helper.make_el('div').style({
                width: 'inherit',
                overflow: 'auto'
            }).addChild([
                helper.make_el('div').html('Share ' + _name +
                    '\'s link. The account is public so whoever login or join using the link, ' +
                    'becomes a friend to ' + _name).self,
                helper.make_el('div').style({
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    overflowX: 'auto',
                    padding: '5px'
                }).addChild(this.shareActions(settings.invitation_key)).self,
            ])
            this.Alert({
                body:  body.self,
                width: 90,
                direction: 'bottom'  
           })
        }
    }).addChild([
        helper.make_el('div').html('<span class="material-icons-outlined">share</span>').self,
        helper.make_el('div').class('profile-values').html('Share this Contact').self
    ]);

    let deactivate = helper.make_el('div').addChild(
        helper.make_el('button').attr({
            class: 'btn btn-danger',
            style: {
                margin: '10px'
            },
            onclick: () => {
                let cnf = new helper.Modal().Confirm({
                    acceptText: '<span class="text-danger">Delete account</span>',
                    title: '<span class="material-icons-outlined">warning</span> Please Confirm!<hr>',
                    content: 'Your account is going to be deleted completely from our Database, All files and ' +
                        'messages you have shared with people on this platform will be lost but your partner will ' +
                        'still have his copy of the chat. <div> If you have made up your mind, then we are truely not happy ' +
                        'that you are leaving. Just in case you love the project don\'t forget to: </div>' +
                        '<div> -- Rate my work</div>' +
                        '<div> -- Download source codes if you are a developer</div>' +
                        '<div> -- Like our page on Facbook </div>' +
                        '<div> -- Check out more projects </div><hr>'
                });
                cnf.then(() => {
                    sw.deleteAccout(settings.id).then(() => {
                        this.Alert('Your Account has been Deleted!');
                        setTimeout(() => {
                            window.location.reload();
                        }, 3000);
                    }).catch(d => {
                        console.log(d)
                    })
                }).catch(e => {})
            }
        }).html('Delete Account').self,
    );

    let company = helper.make_el('div').addChild([
        helper.make_el('div').class('h4').html('WhatApp Clone').self,
        helper.make_el('div').attr({
            class: 'text-muted',
            style: { marginTop: '10px' }
        }).html('BY').self,
        helper.make_el('div').class('h4').html(`${self.username('0001', 'Julius')}`).self,
        helper.make_el('div').class('text-muted').addChild([
            helper.make_el('a').style({ marginRight: '1.1em' }).attr({
                href: self.mainRoot
            }).html('<span class="material-icons-outlined" style="font-size: 2.5em;">home</span>').self,
            helper.make_el('a').style({ marginRight: '1.1em' }).attr({
                href: 'https://www.facebook.com/julius.ekane.946/'
            }).html('<span class="material-icons-outlined" style="font-size: 2.5em">facebook</span>').self,
            helper.make_el('a').style({ marginRight: '1.1em' }).attr({
                href: 'https://twitter.com/247developer'
            }).html('<i class="fa fa-twitter" style="font-size: 3em"></i>').self,
            helper.make_el('a').style({ marginRight: '1.1em' }).attr({
                href: 'https://www.youtube.com/channel/UCyfzaf7uohrk_a1NTdWzakg'
            }).html('<i class="fa fa-youtube-play" style="font-size: 2.7em;color:red"></i>').self,
            helper.make_el('a').style({ marginRight: '1.1em' }).attr({
                href: 'https://github.com/julius-ek-hub'
            }).html('<i class="fa fa-github" style="font-size: 2.7em;color:black;"></i>').self,
            helper.make_el('a').style({ marginRight: '1.1em' }).attr({
                href: 'https://stackoverflow.com/users/12869226/julius'
            }).html('<i class="fa fa-stack-overflow" style="font-size: 2.7em;color:#ffc209"></i>').self
        ]).self,
        helper.make_el('div').class('text-muted').html('&copy;' + new Date().format('Y') + ' All rights reserved.').self
    ]);
    let dateJoined = helper.make_el('div').addChild([
        helper.make_el('div').attr({
            class: 'text-muted',
            style: { marginTop: '10px' }
        }).html('Date Joined').self,
        helper.make_el('div').html(new Date(settings.date_joined).format('d/m/Y - h:ia', 'local')).self
    ]);

    let options = [
        dpDiv.self,
        nameDive.self,
        aboutDiv.self,
        telDiv.self,
        countryDiv.self
    ]

    if (!chat_id) {
        [
            addEmail.self,
            blockedConts.self,
            mutedConts.self,
            wallPP.self,
            enterBtnEqualsSend.self,
            readRec.self,
            notiSound.self,
            otherSound.self,
            LastSeen.self,
            accountType.self,
            invite.self,
            deactivate.self,
        ].forEach(item => options.push(item))
    } else {
        if (settings.account_type == 1)
            options.push(inviteFor.self)
    }
    options.push(dateJoined.self);
    options.push(company.self);
    if (settings.removed == 0) {
        subBody.addChild(options)
    } else
    if (settings.id != myId) {
        subBody.addClass('p-3').html('This account no longer exists!');
        w.touch_close = true;
    }
    let foot = helper.make_el('div');

    mainBody.addChild([
        head.self,
        subBody.self,
        foot.self
    ]);

    w.add_content(mainBody.self);

    let structurize = function() {
        subBody.style({ maxHeight: (innerHeight - 40) + 'px' })
        if (innerWidth < 700) {
            mainBody.style({
                width: innerWidth + 'px',
                marginLeft: '0px'
            })
        } else {
            mainBody.style({
                width: '700px',
                marginLeft: (innerWidth - 700) / 2 + 'px'
            })
        }
    }
    structurize();
    window.resize_callbacks.push(structurize)
    w.open()
}
WhatsApp.prototype.reportChat = function(chat, from, about) {
    let self = this;
    let cn = about.custom_name;
    let categories = {
        nude: { html: 'Nude' },
        voilence: { html: 'Voilence' },
        blackmail: { html: 'Blackmailing' },
        spam: { html: 'Spam' },
        scam: { html: 'Scamming' },
        other: { html: 'Other' }
    }
    this.collectInfo('Report ' + (cn == 0 ? about.tel : cn) + ',', {
        select: {
            description: 'What kind of issue do you want to report?',
            type: 'select',
            title: 'Category',
            required: true,
            options: categories,
            acceptable: (selected) => {
                return Object.keys(categories).indexOf(selected) != -1;
            }
        },
        textarea: {
            description: 'We are going to need you to tell us exactly what the matter is in not more than 200 characters',
            title: 'Tell us more',
            placeholder: 'Type here...',
            type: 'textarea',
            required: false,
            acceptable: (value) => {
                return true;
            }
        },
        files: {
            type: 'file',
            description: 'If you have screen shots of some of your allegations, please add. Maximum is 10',
            title: 'Add screenshots',
            required: false,
            selected: {},
            attributes: { accept: 'image/*', multiple: 'true' },
            max: 11,
            acceptable: (file) => {
                return new helper.File_(file).extension().in(['jpeg', 'png', 'jpg']);
            }
        }
    }).then(resp => {
        let fs = resp.files;
        let fl = fs.length;
        let links = [];
        if (fl > 0) {
            let ld = new helper.Modal().Loading('Uploading files...  <i class="fa fa-spinner fa-spin" style="font-size:24px"></i>')
            function upload_(index = 0) {
                if (index >= fl) {
                    links = links.map(l => { return `<div>Link_${links.indexOf(l) + 1}: <a href="${l}">${l}</a></div>` }).join(', ');
                    ld.loader.close();
                    send_now();
                    return;
                }
                let f = new helper.File_(fs[index]);
                f.upload({ progressHandler: () => {}, destination: 'src/actions.php?report_files_upload=' + f.name.i }).then(respond => {
                    links.push(respond);
                    upload_(index + 1);
                }).catch(err => {
                    upload_(index + 1);
                })

            }
            upload_();
        } else {
            links = '';
            send_now();
        }

        function send_now() {
            sw.email({
                subject: 'Reporting a user',
                b64_code: ('project=whatsapp-clone&time=' + new Date().UTC_DATE()).to_b64(),
                bodyLink: '#',
                bodyLinkName: '',
                body: `<div><b>TYPE: ${resp.select} && USER_ID: ${from} && CHAT: ${chat} && PROJECT: whatsapp-clone</b></div> ${resp.textarea} <h4>Links: </h4> ${links}`,
                main: `A report`,
                from: 'no_rep',
                receipients: ['info@247-dev.com']
            }).then(() => {
                self.Alert('Thanks for the info, we\'ll handle it');
            }).catch((err) => {console.log(err)})
        }
    })
}
WhatsApp.prototype.informUser = function(){
    if(helper.cookie('informed_ed')){
        return;
    }
    let icon = 'emoji_people',
        message = 'Hi';
    let bodyM = helper.make_el('div').style({
        display: 'inline-block',
        background: 'white',
        padding: '6px',
        borderRadius: '10px'
    });
    let logo = helper.make_el('div').class('text-center text-secondary')
    .html(`<span class="material-icons-outlined" style="font-size:38px">${icon}</span>`);
    let title = helper.make_el('div').class('text-center m-2').html(message);
    let description = helper.make_el('div').class('text-secondary p-1').style({
        fontSize: '1.1em',
        borderRadius: '10px'
    }).html(
        `So excited to have you around, trust me you are gonna like it. Source codes are free, it's up to you to support my work
         <div style="background: rgba(255,0,0,0.1)" class="p-2 text-danger">
         <div class="h6"><i class="fa fa-warning"></i> DISCLAIMER/NB.</div>
         This is a web project and it is entirely on a single page so while still on it, never use the browser's back button or the phone's back button, 
         else they will take you to the page you were before the project. If you wish to navigate or browse around, allways use the custom buttons 
         shown in the app. <br />
         - If you want to remain logged in, do not clear your browser's cache<br />
         - If you use iOS or MAC OS device then you might face some issues especially when taking still photos <br />
         </div> 
         <p>
         Please do not forget to do at least one of the following after getting the codes: <br />
         - Rate my work, from the menu,<br />
         - Leave a message in the group chat <br />
         - Subscribe to my YouTube Channel <br />
         - Like/Follow on Facebook/twitter <br />
         - Share this project with a friend <br />
         - Buy me a coffe
         </p>`
    );

    bodyM.addChild([logo.self, title.self, description.self]);
        this.Alert({
                body: bodyM.self,
                width: 90,
                direction: 'top',
                cancelText: 'Got it'  
           }) 
   helper.set_cookie('informed_ed', true, 10);
}
WhatsApp.prototype.getEmail = function(edit, from_settings) {
    let self = this;
    let set = this.settings;
    if ((set.email_confirmed == 1 && !set.email.empty()) && !edit) {
        return;
    }
    let qry = helper.url_query_string_value('confirm_emil');
    if (qry != null && qry == set.mail_confirmation_code && !edit) {
        sw.updateProfile({ cell: 'email_confirmed', user: set.id, value: 1 }).then(() => { set.email_confirmed = 1 }).catch(() => {})
        return;
    }
    let obj = {
        description: 'Please provide us with your email so just in case you forget your login passcode,' +
            ' we will email it to you',
        type: 'email',
        title: 'Email',
        placeholder: 'Enter Email here...',
        required: true,
        acceptable: (value) => {
            return value.isEmail();
        }
    }

    let obj2 = {
        description: 'Please enter the OTP that was sent to your email',
        type: 'password',
        title: 'Confirm OTP',
        placeholder: 'Enter OTP here...',
        required: true,
        acceptable: (value) => {
            return !isNaN(value);
        }
    }
    if (!set.email.empty()) {
        if (edit) {
            new helper.Modal().Confirm({
                title: 'Reset Email?',
                content: 'By clicking Yes, your first email is going to be deleted and you really need to provide another if you wish.',
                acceptText: 'Yes',
                rejectText: 'No'
            }).then(() => {
                reset();
            }).catch((rej) => {})

            return;
        }

        if (set.email_confirmed == 0 && set.mail_confirmation_code != '' && (!helper.cookie('em_2') || from_settings)) {
        helper.set_cookie('em_2', true, 1);
            new helper.Modal().Confirm({
                title: 'Hey!',
                content: 'An email was sent to ' + set.email + ', Please confirm it\'s yours. Or go to settings and change it.',
                acceptText: 'Confirm Email'
            }).then(() => {
                confirm();
            }).catch((rej) => {})

        }

        return;
    }
    if(helper.cookie('em_1') && !from_settings){
        return;
    }
    this.collectInfo('Hey!', {
        emailorpasscode: obj
    }).then(result => {
        let em_ = result.emailorpasscode;
        sw.checkIfUserExists(em_).then(res => {
            if (res != 0) {
                self.bottomInfo('The email you provided is already in use by another account', 'error');
                return;
            }
            let code = helper.random(1000000, 9000000);
            sw.email({
                subject: 'Confirm Email',
                b64_code: ('project=project_1&time=' + new Date().UTC_DATE()).to_b64(),
                bodyLink: self.root + '?confirm_emil=' + code,
                bodyLinkName: 'Click here to confirm Email',
                body: 'Use the OTP above to activate your email.. You can also click on the link below',
                main: 'OTP: ' + code,
                from: 'no_rep',
                receipients: [em_]
            }).then(() => {
                sw.updateProfile({ cell: 'mail_confirmation_code', user: set.id, value: code }).then(() => {
                    set.mail_confirmation_code = code;
                    sw.updateProfile({ cell: 'email', user: set.id, value: em_ }).then(() => { set.email = result.emailorpasscode }).catch(() => {})

                    obj2.acceptable = (val) => {
                        return val == code;
                    }
                    confirm();
                }).catch((e) => {})
            }).catch((err) => {})
        }).catch((e) => {
            this.bottomInfo('Operation failed', 'error');
        })
    });
   helper.set_cookie('em_1', true, 1);
    function reset() {

        sw.updateProfile({ cell: 'email', user: set.id, value: '' }).then(() => {
            set.email = '';
            sw.updateProfile({ cell: 'email_confirmed', user: set.id, value: 0 }).then(() => {
                set.email_confirmed = 0;
                sw.updateProfile({ cell: 'mail_confirmation_code', user: set.id, value: 0 }).then(() => {
                    set.mail_confirmation_code = '';
                    self.getEmail();
                }).catch((e) => { console.log(e) })
            }).catch((e) => { console.log(e) })
        }).catch((e) => { console.log(e) })
    }

    function confirm() {
        self.collectInfo('Hey!', {
            confirmationcode: obj2
        }).then(resp => {

            if (resp.confirmationcode == set.mail_confirmation_code) {
                self.Alert('<div class="text-success h5" style="padding: 10px;background:rgba(0,255,0,0.2)">' +
                    '<i class="fa fa-check"></i> Excellent!</div>' +
                    '<p>Your email is now active</p>');

                sw.updateProfile({ cell: 'email_confirmed', user: set.id, value: 1 }).then(() => { set.email_confirmed = 1 }).catch(() => {})
            } else {
                self.Alert('<div class="text-danger h5" style="padding: 10px;background:rgba(255,0,0,0.2)">' +
                    '<i class="fa fa-warning"></i> Error!</div>' +
                    '<p>The code did not match the one we sent</p>');
            }
        })
    }
}
export { WhatsApp }