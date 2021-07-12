import * as helper from './helper.js';
import * as ac from './actions-proper.js';

export let buildMessageGUI = function(details, what, idInner) {
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
            if (si == s.id) {
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

            if (this.state.selecting.selecting) {
                e.preventDefault()
                return;
            }
            e.preventDefault();
            self.actOnMessage(e, messBox.Id);
        },

        onclick: (e) => {
            if (messBox.Id.split('_sn_').length == 1) { return }

            if (this.state.selecting.selecting) {
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

        if (this.state.selecting.selecting) {
            return;
        }
        ac.detectMobileContextMenu(e).then(() => {
            self.actOnMessage(e, messBox.Id);
        }).catch(() => {});
    }).addChild(message_content).appendTo(message_container);

    return message_container;
}

export let buildMedia = function(details) {

    let f = details.fileInfo;
    let url = f.url;
    let needFetch = true;
    let site_security = window.location.protocol;
    if (!f.url.includes(`blob:${site_security}//`) && f.type != 'gif') {
        url = `${this.root}visitors/${details.senderInfo.id}/${ac.folder(f.type)}/${f.url}`;
    }
    if (f.url.includes(`blob:${site_security}//`)) {
        needFetch = false;
    }
    let self = this;
    let ret, playBtn;
    let file_state = { deleted: true, fetching: true };
    let audio;

    if (f.type == 'record') {
        audio = new Audio(url);
        audio.hidden = true;
        audio.currentTime = 0.5;
        audio.controls = true;
        playBtn = helper.make_el('button').attr({
            class: 'btn play-btn',
            onclick: (e) => {
                if (file_state.deleted && !file_state.fetching) {
                    self.bottomInfo('This file has been deleted', 'error');
                    return;
                }
                if (file_state.fetching) {
                    self.bottomInfo('This file is not ready, please wait...', 'error');
                    return;
                }
                if (self.state.selecting.selecting) {
                    return;
                }
                if (self.state.recording) {
                    self.bottomInfo('Can\'t play audio, recording is ongoing...', 'error');
                    return;
                }
                ac.play(e.target.tagName == 'BUTTON' ? e.target : helper._(e.target).parent().self, audio, f, this).catch(() => {
                    self.bottomInfo('Something is wrong, Sorry!', 'error');
                });
            }
        }).html('<i class="fa fa-spinner fa-spin" style="font-size:18px"></i>');

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
                helper.make_el('td').addChild(playBtn.self).self,
                helper.make_el('td').style({ position: 'relative', width: '200px' }).addChild([
                    helper.make_el('input').attr({
                        type: 'range',
                        class: 'slider',
                        min: '0',
                        max: '100',
                        value: '0'
                    }).self,
                    audio,
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
            onclick: () => {
                if (file_state.fetching) {
                    self.bottomInfo('This file is not ready, please wait...', 'error');
                    return;
                }

                if (f.type == 'picture' && !this.state.selecting.selecting) new helper.Modal().expandElement(ret.self)
            }
        })
    } else {
        ret = helper.make_el('div').html(url)
    }

    if (f.type.in(['picture', 'record']) && needFetch) {
        helper.blob(url).then(b => {

            file_state.deleted = false;
            file_state.fetching = false;
            if (f.type == 'record') {
                audio.src = b;
                playBtn.html('<i class ="fa fa-play"></i>');
            } else
                ret.attr({ alt: 'Message File', src: b })
        }).catch(err => {
            if (f.type == 'record') {
                playBtn.html('<span class ="material-icons-outlined text-danger">error_outline</span>');
            } else {
                ret.attr({ alt: 'Message File', src: b })
                ret.attr({ alt: ' Failed to fetch file' })
            }
            file_state.deleted = true;
            file_state.fetching = false;
        })
    } else {
        if (f.type == 'record') {
            audio.src = url;
            playBtn.html('<i class ="fa fa-play"></i>');
        } else {
            ret.attr({ alt: 'Message File', src: url })
        }
        file_state.deleted = false;
        file_state.fetching = false;
    }
    return ret.self;
}