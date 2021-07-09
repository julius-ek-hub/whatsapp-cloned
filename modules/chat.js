import * as helper from './helper.js';
import * as ac from './actions-proper.js';

export let addChat = function(details) {
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
                    new helper.Modal().expandElement(e.target)
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

export let prepareChat = function(chat) {
    let info = chat.info;
    let dp, name, removed;
    let lastReceipt = '';
    if (info.last_message.senderId == this.settings.id) {
        let r = ac.messageReceipt(info.last_message);

        lastReceipt = '<span class="receipt' + r.receiptCss + '">' + r.receipt + '</span> ';
    }
    let ld = info.last_message.dateSent;
    let lastM = info.last_message.message.trim().split('\n').join(' ').unescape();
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