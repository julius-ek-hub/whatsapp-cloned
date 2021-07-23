import * as helper from './helper.js';
import * as sw from './serviceWorker.js';

export let prepareElements = function() {
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

export let window_ = function(parent) {
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

export let init = function() {
    this.prepareElements();
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

export let reset = function() {
    this.left.truncate();
    this.rightInner.truncate();
}

export let setEnvironment = function(details, welcome) {

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
                }).catch(e => {
                    welcome.failed("Could not load chat informations properly")
                })
            }

            getInfo();
        } else {

            this.realLaunching(details.id, welcome)
        }

    }).catch(err => {
        welcome.failed(err)
    })
}

export let realLaunching = function(id, welcome) {
    this.launchHome();
    welcome.destroy();

    let must_always_be_updated = [
        () => this.checkNewMessages(),
        () => this.check4MessageUpdates(),
        () => this.checkLastSeen(),
        () => sw.updateLastSeen(id, this.settings.public_last_seen),
        () => this.checkTyping(),
        () => this.updateChatsInfo(),
        () => this.updateReceipt(),
        () => this.resolveMinorIssues(),
        () => this.checkIncomingCall()
    ];
    window.interval_functions = [];
    must_always_be_updated.forEach(cb => {
        window.interval_functions.push({ run: cb, once: false });
    })
    sw.start_live_updates();
    this.getEmail();
    this.informUser();
}

export let fullScreen = function() {

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
        this.bottomInfo('Your browser does not support Full screen', 'error')
    }
}

export let launchHome = function() {
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
                        localStorage.clear();
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

export let unsentMessages = function(chatId) {
    let handler = {};
    // localStorage.clear()
    let get = () => {
        return localStorage.getItem(chatId);
    }

    handler['exists'] = () => {
        return get() != null;
    }

    handler['messages'] = () => {
        return handler.exists() ? get().parse() : [];
    }

    handler['add'] = (details) => {
        let old = handler.messages();
        if (!old.some(m_ => { return m_.messageId == details.messageId })) {
            old.push(details);
        }

        handler.update(old)

    }

    handler['update'] = function(new_) {
        try {
            localStorage.setItem(chatId, JSON.stringify(new_))
        } catch (e) {
            handler.drop();
            localStorage.setItem(chatId, JSON.stringify(new_))
        }
    }

    handler['drop'] = (messageId) => {
        if (messageId) {
            let old = handler.messages();
            old.removeIf(mess => { return mess.messageId == messageId });
            handler.update(old);
        } else
            localStorage.removeItem(chatId);
    }

    handler['get'] = get;


    return handler;
}