window.resize_callbacks = [];
window.onresize = function() {
    let rcs = this.resize_callbacks;
    if (rcs.length > 0) {
        rcs.forEach(rc => { rc() });
    }
}
window.lastZindex = +2;
export function _(el) {
    let self;
    try {
        if (typeof el == 'object' && el.tagName != undefined) {
            self = el;
        } else if (typeof el == 'string' &&
            el.indexOf('#') == '0' &&
            document.getElementById(el.replace('#', '').trim())) {
            self = document.getElementById(el.replace('#', '').trim());
        } else if (typeof el == 'string' && document.querySelector(el)) {
            self = document.querySelector(el);
        }
    } catch (err) {

        return;
    }

    let get_style = (cssObjProp) => {
        return window.getComputedStyle(self, null).getPropertyValue(cssObjProp);
    }
    return {
        self: self,
        get BCR() {
            return self.getBoundingClientRect();
        },
        get Height() {
            return this.BCR.height
        },
        get Width() {
            return this.BCR.width;
        },
        get Top() {
            return this.self.offsetTop;
        },
        get Id() {
            return this.self.id
        },
        get className() {
            return this.self.className;
        },
        get classList() {
            return this.self.className.split(' ');
        },
        get lastChild() {
            return _(this.self.lastChild);
        },
        get firstChild() {
            return _(this.self.firstChild);
        },
        get previousSibling() {
            return _(this.self.previousSibling);
        },
        get nextSibling() {
            return _(this.self.nextSibling);
        },
        get has_nextSibling() {
            if (this.self.nextSibling)
                return true;
            else
                return false;
        },
        get has_previousSibling() {
            if (this.self.previousSibling)
                return true;
            else
                return false;
        },
        attr: function(props) {
            if (typeof props == 'string') {
                return self.getAttribute(props);
            } else if (typeof props == 'object') {
                for (let prop in props) {
                    let val = props[prop];
                    if (typeof val == 'function') {
                        self[prop] = val;
                    } else if (prop == 'style' && typeof val == 'object') {
                        for (let s in val) {
                            self.style[s] = val[s];
                        }
                    } else {
                        self.setAttribute([prop], props[prop]);
                    }
                }
                return _(el)
            } else {
                return _(el)
            }
        },
        id: function(value) {
            return _(el).attr({ id: value });
        },
        enable: function() {
            el.disabled = false;
            return _(el);
        },
        disable: function() {
            el.disabled = true;
            return _(el);
        },
        click: function() {
            el.click();
            return _(el);
        },
        pause: function() {
            el.pause();
            return _(el);
        },
        play: function() {
            el.play();
            return _(el);
        },
        class: function(value) {
            return _(el).attr({ class: value });
        },
        style: function(value) {
            return _(el).attr({ style: value });
        },
        setHeight: function(value) {
            return _(el).style({ height: value });
        },
        setWidth: function(value) {
            return _(el).style({ width: value });
        },
        value: function() {
            let get_atrr = self.getAttribute('value');
            if (get_atrr != '' && get_atrr != undefined)
                return _(el).attr('value');
            else
                return _(el).htm()
        },
        child: function(nextChild) {
            if (!isNaN(nextChild)) {
                return _(self.childNodes[nextChild]);
            }
        },
        parent: function(n) {
            if (n && !isNaN(n)) {
                let ini = self;
                for (let i = 1; i <= n; i++) {
                    ini = ini.parentElement;
                }
                return _(ini);
            } else
                return _(self.parentElement);

        },
        addChild: function(children) {
            if (typeof children == 'object' && children.length > 0) {
                children.forEach(child => {
                    child = _(child).self;
                    self.appendChild(child);
                });
            } else if (typeof children == 'string') {
                _(self).html(children)
            } else {
                self.appendChild(_(children).self);
            }
            return _(el)
        },
        children: [].slice.call(self.childNodes),
        removeClass: function(className) {
            if (typeof className == 'object') {
                className.forEach(class_ => { self.classList.remove(class_) })
            } else { self.classList.remove(className); }
            return _(el);
        },
        addClass: function(className) {
            if (typeof className == 'object') {
                className.forEach(class_ => { self.classList.add(class_) })
            } else { self.classList.add(className); }
            return _(el);
        },
        html: function(val) {
            self.innerHTML = val;
            return _(el);
        },
        htm: function() {
            try {
                return self.innerHTML;
            } catch (err) {
                return self.value;
            }
        },
        appendTo: function(parent) {
            parent.appendChild(self);
            return _(el)
        },
        prependTo: function(parent) {
            parent.insertBefore(self, parent.firstChild);
            return _(el)
        },
        insertAfter: function(el) {
            el.parentElement.insertBefore(self, el.nextSibling);
            return _(el)
        },
        insertBefore: function(el) {
            el.parentElement.insertBefore(self, el);
            return _(el)
        },
        delete: function() {
            try { self.parentElement.removeChild(self) } catch (err) {};
        },
        hide: function() {
            self.hidden = true;
            return _(el)
        },
        show: function() {
            self.hidden = false;
            return _(el)
        },
        unfocus: function() {
            self.blur();
            return _(el)
        },
        truncate: function() {
            self.innerHTML = '';
            return _(el)
        },
        removeChild(child) {
            self.removeChild(child);
            return _(el);
        },
        clicked: (callback) => {
            self.onclick = callback;
            return _(el);
        },
        touched: (callback) => {
            self.addEventListener('touchstart', callback, passive() ? { passive: true } : false);
            return _(el);
        },
        touchmove: (callback) => {
            self.addEventListener('touchmove', callback, passive() ? { passive: true } : false);
            return _(el);
        },
        touchend: (callback) => {
            self.addEventListener('touchend', callback, passive() ? { passive: true } : false);
            return _(el);
        },
        scrolled: (callback) => {
            self.addEventListener('scroll', callback, false);
            return _(el);
        }
    }
}

export function make_el(name) {
    return _(document.createElement(name));
}
export let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
];

export let numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function url_query_string_value(str) {
    return new URL(window.location.href).searchParams.get(str);
}

export function url_backwards(localhost) {
    let pn = window.location.pathname.split('/');
    back = '';
    for (let i = 0; i < (pn.length - 3); i++) {
        back += '../';
    }
    return back.trim();
}

export function set_cookie(name, value, days) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

export function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
export function good_url(url) {
    let http = url.split('http://');
    let https = url.split('https://');
    if ((http.length == 2 && http[0].empty()) || (https.length == 2 && https[0].empty()))
        return url;
    else
        return 'http://' + url;
}
export function auto_grow(element, min, max) {
    element.style.height = min + 'px';
    if (element.scrollHeight > max) {
        element.style.height = max + 'px';
        element.style.overflow = 'auto';
    } else {
        element.style.height = (element.scrollHeight) + "px";
    }
}

export function scroll_to(child, behavior, parent = 'html, body') {
    child = typeof child == 'string' ? _('#' + child).self : child;

    try {
        child.parentElement.scroll({
            top: child.offsetTop - innerHeight / 3,
            left: 0,
            behavior: behavior
        });


    } catch (err) {
        try {
            make_el('a').attr({ href: "#" + child.id }).appendTo(document.body).click().delete();
        } catch (err) { console.error(err) }

    }
}

export function reduce(text, max) {
    let ret = '';
    text = text.toString();
    if (text.length <= max) {
        ret = text;
    } else {
        for (let i = 0; i < (max - 3); i++) {
            ret += text[i];
        }
        ret += '...';
    }
    return ret.trim();
}

export function copy(text) {
    let input = make_el('input').attr({ value: text }).self
    _(document.body).addChild(input);
    input.select();
    input.setSelectionRange(0, 99999);
    document.execCommand("copy");
    _(input).delete()
}

export function webShare(shareObj) {
    return new Promise((resolve, reject) => {
        try {
            navigator.share(shareObj).then(() => {
                resolve()
            }).catch(err => {
                reject(err)
            })
        } catch (err) {
            reject(err)
        }
    })
}

export function passive() {
    let supportsPassive = false;
    try {
        let opts = Object.defineProperty({}, 'passive', {
            get: function() {
                supportsPassive = true;
            }
        });
        window.addEventListener("testPassive", null, opts);
        window.removeEventListener("testPassive", null, opts);
    } catch (e) {}

    return supportsPassive;
}

export function cookie(name) {
    let cookie_store = document.cookie;
    let return_val = false;

    function get_value(pair) {
        let check = pair.trim().split('=');
        if (check[0] == name)
            return check[1];
        else
            return false;
    }
    if (!cookie_store.empty()) {
        let check_total = cookie_store.split(';');
        if (check_total.length > 1) {
            for (let item of check_total) {
                if (get_value(item)) {
                    return_val = get_value(item);
                    break;
                }
            }
        } else {
            return_val = get_value(cookie_store);
        }
    }
    return return_val;
}

String.prototype.empty = function() {
    return this.trim() == '';
};
String.prototype.in = function(arr, caseSensitive) {
    if (caseSensitive)
        return arr.indexOf(this) != -1;
    else
        return (arr.indexOf(this.toLowerCase()) != -1 || arr.indexOf(this.toUpperCase()) != -1);
}
Number.prototype.in_range = function(lower, upper) {
    return this >= lower && this <= upper;
}
String.prototype.isURL = function() {
    let c1 = this.split('http://');
    let c2 = this.split('https://');
    let c3 = this.split('www.');
    let c4 = this.split('.');
    let qm = this.split('?')
    if ((c1.length == 2 && c1[0].empty()) ||
        (c2.length == 2 && c2[0].empty()) ||
        qm.length >= 2 && qm[0].isURL() ||
        c3.length == 2 && c3[0].empty() ||
        c4.length > 1 && !c4[0].empty() && !c4[c4.length - 1].empty() &&
        this.split('').all_in(letters.concat(numbers).concat(['-', '_', '.', '/', ':', '#'])))
        return true;
    else
        return false;
}
String.prototype.isEmail = function() {
    let at = this.split('@');
    let dot = this.split('.');
    if ((at.length == 2 && !at[0].empty() && !at[1].empty()) &&
        (dot.length > 1 && !dot[0].empty() && !dot[dot.length - 1].empty()) &&
        this.split('').all_in(letters.concat(numbers).concat(['-', '@', '_', '.'])))
        return true;
    else
        return false;
}
String.prototype.reproduce = function(total) {
    let str = this;
    for (let count = 1; count < total; count++) {
        str += this;
    }
    return str.toString();
}
String.prototype.to_b64 = function() {
    return window.btoa(unescape(encodeURIComponent(this)));
}

String.prototype.escape = function() {
    if (this.length == '') {
        return this;
    } else {
        return this.split('').map(function(value) {
            let ret;
            switch (value) {
                case "<":
                    ret = '&lt;';
                    break;
                case ">":
                    ret = '&gt;';
                    break;
                default:
                    ret = value;
            }
            return ret;
        }).join('').replace(/'/g, "\\'");
    }
}
String.prototype.unescape = function(html) {
    let final;
    if (this.length == '') {
        final = this;
    } else {
        final = this.split('').map(function(value) {
            let ret;
            switch (value) {
                case "<":
                    ret = '&lt;';
                    break;
                case ">":
                    ret = '&gt;';
                    break;
                default:
                    ret = value;
            }
            return ret;
        }).join('').replace(/\\'/g, "'");

        if (html)
            final.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    }
    return final;
}

String.prototype.to_utf8 = function() {
    try { return decodeURIComponent(escape(window.atob(this))); } catch (err) { return null }
}
String.prototype.replace_at = function(arr) {
    let new_str = '';
    let str = this.split('');
    for (let i = 0; i < str.length; i++) {
        if (arr[i] != undefined) {
            str[i] = arr[i];
        }
        new_str += str[i];
    }
    return new_str;
}

Array.prototype.includesAnyOf = function(anotherArrElements) {
    let ret = false;
    for (let c of anotherArrElements) {
        if (this.includes(c)) {
            ret = true;
            break;
        }
    }
    return ret;
};
Array.prototype.all_in = function(anotherArray, caseSensitive = false) {
    let ret = true;
    for (let s of this) {
        if (caseSensitive) {
            if (!s.in(anotherArray, true)) {
                ret = false;
                break;
            }
        } else {
            if (!s.in(anotherArray)) {
                ret = false;
                break;
            }
        }
    }
    return ret;
}

Array.prototype.removeIf = function(callback) {
    for (let i = 0; i < this.length; i++) {
        if (callback(this[i]))
            this.splice(i, 1);
    }
    return this;
}

export function o_sort(unordered) {
    return Object.keys(unordered).sort().reduce(
        (obj, key) => {
            obj[key] = unordered[key];
            return obj;
        }, {}
    );
}



String.prototype.isTel = function() {
    let test = this.split('');
    test = test.removeIf(el => { return (test.indexOf(el) == 0 && el == '+') }).join('').trim();
    return !isNaN(Number(test)) && test.length.in_range(6, 14);
}

/**
 * Communications with the server.... ajax()
 */
export function ajax() {
    try {
        return new XMLHttpRequest();
    } catch (err) {
        return new ActiveXObject('Microsoft.XMLHTTP');
    }
}

export function Request(address, formdata) {
    return new Promise((resolve, reject) => {

        let details = {
            type: 'GET',
            url: address,
            processData: false,
            contentType: false,
            success: function(data) {
                resolve(data)
            },
            error: function(err) {
                reject('Coonection failed, Reason: ' + err);
            }
        }
        if (formdata) {
            let fd = new FormData();
            for (let d in formdata) {
                fd.append(d, formdata[d]);
            }
            details.type = 'POST';
            details['data'] = fd;
        }
        $.ajax(details);

        //When there is no jQuery

        // let aj = ajax();
        // aj.onload = function() {
        //     if (this.status == 200) {
        //         resolve(this.response);
        //     } else if (this.status == 403) {
        //         reject(Error('Access denied'))
        //     } else {
        //         reject(Error('Error communicating with the server! -> Status => ' + this.status));
        //     }
        // };
        // aj.onerror = function() {
        //     reject(Error('There was a problem connecting to the server'));
        // };
        // if (formdata) {
        //     let fd = new FormData();
        //     for (let d in formdata) {
        //         fd.append(d, formdata[d]);
        //     }
        //     aj.open('POST', address, true);
        //     aj.send(fd);
        // } else {
        //     aj.open('GET', address, true);
        //     aj.send();
        // }
    });
}

export function URL_exists(url, cb) {
    jQuery.ajax({
        url: url,
        dataType: 'text',
        type: 'GET',
        complete: function(xhr) {
            if (typeof cb === 'function')
                cb.apply(this, [xhr.status]);
        },
        error: function() {
            cb(0);
        }
    });
}
export function choose_file(attr, chosen) {
    attr = attr ? attr : {};
    return new Promise((resolve, reject) => {
        if (chosen) {
            resolve([chosen])
            return;
        }
        let fp = _('#file_picker').attr(attr).self
        fp.onclick = function() {
            this.value = ''
        }
        fp.onchange = function() {
            resolve(this.files)
        }
        fp.click()
    })
}

export function blob(file) {
    return new Promise((res, rej) => {
        URL_exists(file, (status) => {
            if (status == 200) {
                fetch(file)
                    .then(resp => resp.blob())
                    .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        res(url);
                    })
                    .catch((err) => {
                        rej()
                    });
            } else {
                rej(status);
            }
        })
    })
}

export function smoothAlert(props) {
    let defaultProps = {
        body: 'Nothing to dislay...',
        width: 95,
        direction: 'top',
        buttonRight: '',
        cancelText: 'Cancel',
        strict: false
    }
    if (typeof props == 'object') {
        for (const key in props) {
            defaultProps[key] = props[key];
        }
    } else {
        defaultProps.body = props
    }
    let br = defaultProps.buttonRight;
    if (typeof br == 'object') {
        br = br.class('btn btn-light ml-1').self
    } else {
        br = make_el('span').html(br).self;
    }
    let cover = make_el('div').style({
        position: 'fixed',
        top: '0',
        width: '100%',
        bottom: '0',
        background: 'rgba(0,0,0,0.5)',
        zIndex: window.lastZindex += 8,
        overflow: 'auto'
    });

    let box = make_el('div').style({
        display: 'table',
        textAlign: 'left',
        background: 'white',
        borderRadius: '4px',
        position: 'fixed',
        height: 'auto',
        width: defaultProps.width + '%',
        color: 'rgba(0,0,0,0.8)'
    });
    let easyClass = 'easy autoEasy';
    switch (defaultProps.direction) {
        case 'top':
            easyClass = 'easy easyFromTop';
            break;
        case 'bottom':
            easyClass = 'easy easyFromBottom';
            break;
        case 'left':
            easyClass = 'easy easyFromLeft';
            break;
        case 'right':
            easyClass = 'easy easyFromRight';
            break
        default:
            easyClass = 'easy autoEasy';
            break;
    }
    let container = make_el('div').style({
        overflow: 'auto'
    }).addChild(defaultProps.body);

    make_el('div').style({
        display: 'table-cell',
        width: '100%',
        overflow: 'auto',
        verticalAlign: 'middle'
    }).addChild([
        container.self,
        make_el('div').class('text-right').addChild([
            make_el('button').attr({
                class: 'btn btn-light',
                onclick: () => {
                    cover.delete()
                }
            }).html(defaultProps.cancelText).self,
            br
        ]).self

    ]).appendTo(box.self);

    let responsive = () => {

        if (defaultProps.direction == 'top' || defaultProps.direction == 'bottom') {
            if (defaultProps.strict) {
                box.style({ left: (100 - defaultProps.width) / 2 + '%' });
                return;
            }
            if (innerWidth <= 700) {
                box.style({
                    width: '90%',
                    left: '5%'
                });
            } else {
                box.style({
                    width: '50%',
                    left: '25%'
                });
            }

        }
        container.style({ maxHeight: (innerHeight - 70) + 'px' });
    }
    responsive();
    window.resize_callbacks.push(responsive)
    box.class(easyClass).appendTo(cover.appendTo(document.body).self);
    return cover;
}

/**
 * Creating new window within any element or filling the entire screen with responsive features
 */


export let Modal = function(props) {
    this.mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent),
        this.x = innerWidth,
        this.y = innerHeight,
        this.touch_close = false,
        this.running = false,
        this.onopen = () => {},
        this.onclose = () => {};
    self = this;
    let handleWindowResize = function() {
        self.x = innerWidth;
        self.y = innerHeight;
    }
    handleWindowResize();
    window.resize_callbacks.push(handleWindowResize);
    let content_exists = false,
        fill = make_el('div'),
        parent = document.body,
        child = fill,
        x = 1,
        y = 1,
        offsetTop = 0,
        offsetLeft = 0,
        bg = 'rgba(0,0,0,0.6)',
        va = 'middle',
        ha = 'center',
        defaultContent = '<h2 class="font-weight-lighter text-warning"> (No content)</h2>',
        className = 'helping-modal-237-dev.com',
        id = Math.random() * 100;

    if (props) {
        bg = props.bg ? props.bg : bg;
        va = props.va ? props.va : va;
        ha = props.ha ? props.ha : ha;
        className = props.className ? props.className : className;
        defaultContent = props.defaultContent ? props.defaultContent : defaultContent;
        id = props.id ? props.id : id;
    }
    if (props && props.parent) {
        parent = props.parent;
        let sub_parent = make_el('div').attr({
            style: {
                position: 'relative',
                height: '100%',
                width: '100%'
            }
        });
        fill.attr({
            class: className,
            style: {
                display: 'table',
                position: 'absolute',
                background: bg,
                zIndex: window.lastZindex += 8,
                textAlign: ha,
                overflow: 'auto',
                width: '100%',
                height: '100%',
                top: '0',
                bottom: '0'
            }
        })
        fill.appendTo(sub_parent.self);
        child = sub_parent;
    } else {
        if (props) {
            x = props.x && parentX > 768 ? props.x : x;
            y = props.y ? props.y : y;
            offsetTop = props.offsetTop ? props.offsetTop : offsetTop;
            offsetLeft = props.offsetLeft && parentX > 768 ? props.offsetLeft : offsetLeft;
        }
        fill.attr({
            class: className,
            style: {
                display: 'table',
                position: 'fixed',
                background: bg,
                zIndex: `+${window.lastZindex += 8}`,
                textAlign: ha,
                overflow: 'auto'
            }
        })
        let set_dimension = function(el, obj) {
            _(el).attr({
                style: {
                    top: obj.top,
                    left: obj.left,
                    width: obj.width,
                    height: obj.height
                }
            })
        }
        let callback = function() {
            set_dimension(fill.self, {
                top: (offsetTop * self.x) + 'px',
                left: (offsetLeft * self.y) + 'px',
                width: (x * self.x) + 'px',
                height: (y * self.y) + 'px'

            })
        }
        window.resize_callbacks.push(callback)
        callback()
    }
    let body = make_el('div').attr({
        style: {
            display: 'table-cell',
            position: 'relative',
            width: '100%',
            verticalAlign: va,
            overflow: 'auto',
            color: 'rgba(0,0,0,0.8)'
        }
    })
    body.appendTo(fill.self)
    this.open = function(timeout) {
        if (!content_exists) {
            body.html(defaultContent);
        }
        child.appendTo(parent);
        self.running = true;
        self.onopen();
    }

    this.add_content = function(content) {
        try {
            body.addChild(content);
        } catch (err) {
            body.html(content);
        }
        content_exists = true;
    }
    this.minimize = function() {
        fill.hidden = true;
    }
    this.maximize = function() {
        fill.hidden = false;
    }
    this.truncate = function() {
        body.html('');
    }
    this.custom_edit = function() {
        return child;
    }
    let key_obj = {}
    this.listen = function(key, callback) {
        key_obj[key] = callback;
        window.onkeydown = function(e) {
            if (Object.keys(key_obj).includes(e.key) && self.running) {
                try {
                    key_obj[e.key]();
                } catch (err) {
                    console.log(err)
                }
            }
        }
    }
    this.close = function() {
        child.delete();
        self.running = false;
        self.onclose();
    }

    body.self.onclick = function(e) {
        if (self.touch_close == true && e.target == this) {
            self.close();
            self.running = false;
        }
    }
    return this;
}

/**
 * Popup confirmation box
 */
Modal.prototype.Confirm = function(obj) {
    let s = this,
        title = '',
        content = '',
        rejectText = 'Cancel',
        acceptText = 'Ok';
    if (obj) {
        content = obj.content ? obj.content : content;
        title = obj.title ? obj.title : title;
        rejectText = obj.rejectText ? obj.rejectText : rejectText;
        acceptText = obj.acceptText ? obj.acceptText : acceptText;
    }
    let confirm_frame = make_el('div').style({
        display: 'inline-block',
        textAlign: 'left',
        background: 'white',
        boxShadow: 'rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px',
        borderRadius: '10px'
    })
    return new Promise((resolve, reject) => {
        let head = make_el('div').style({
            position: 'relative',
            padding: '4px 4px 0px 8px',
            fontSize: '1.5em',
            width: '100%',
            borderRadius: 'inherit'
        }).html(title);

        let body = make_el('div').style({
            overflow: 'auto',
            borderBottomLeftRadius: 'inherit',
            borderBottomRightRadius: 'inherit',
            padding: '0px 10px',
            fontSize: '1.1em',
        }).html(content);

        let set_dimension = function() {
            body.style({ maxHeight: (self.y - 140) + 'px' })
            confirm_frame.style({ width: (self.x <= 768 ? '90%' : '40%') });
        }

        set_dimension();

        window.resize_callbacks.push(set_dimension);

        let ok = make_el('button').attr({
            class: 'btn btn-outline-light text-dark',
            onclick: () => {
                s.close()
                resolve()
            }
        }).html(acceptText);

        let cancel = make_el('button').attr({
            class: 'btn btn-outline-light text-dark',
            onclick: () => {
                s.close()
                reject()
            }
        }).html(rejectText);

        let foot = make_el('div').attr({
            style: {
                textAlign: 'right',
                padding: '8px',
                width: '100%',
                borderRadius: 'inherit'
            }
        })
        foot.addChild([cancel.self, ok.self])
        confirm_frame.addChild([head.self, body.self, foot.self])
        s.add_content(confirm_frame.self)
        s.open()
    })
}


/**
 * Customized select - input with search compatibilities
 */

Modal.prototype.RequestSelection = function() {
    this.multiple = false;
    this.selected = [];
    this.options = [];
    this.onselect = undefined;
    this.title = 'No title';
    this.add_search = false;
    this.okText = 'OK';
    let s = this;
    let select_frame = make_el('div').style({
        display: 'inline-block',
        textAlign: 'left',
        background: 'white',
        boxShadow: 'rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px',
        borderRadius: '10px'
    })

    let body = make_el('div').style({
        overflow: 'auto',
        borderBottomLeftRadius: 'inherit',
        borderBottomRightRadius: 'inherit'
    })

    let set_dimension = function() {
        body.self.style.maxHeight = (s.y - 100) + 'px';
        select_frame.setWidth(s.x <= 768 ? '90%' : '40%');
    }
    set_dimension()
    window.resize_callbacks.push(set_dimension)
    let filter_select = function(search_field) {
        [].slice.call(body.self.childNodes).forEach(el => {
            if (el.innerText.toLowerCase().includes(search_field.value.trim().toLowerCase()))
                el.style.display = 'block';
            else
                el.style.display = 'none'
        })
    }
    this.request = function() {
        return new Promise((resolve, reject) => {
            if (s.options.length == 0) {
                body.html('<h2 class="font-weight-lighter text-warning"> (No content)</h2>');
                s.touch_close = true;
                body.style({ padding: '8px' })
            } else {
                s.options.forEach(option => {
                    let btn = make_el('button').attr({
                        id: option.id,
                        class: 'btn btn-light',
                        style: {
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            borderRadius: '0px',
                            float: 'right',
                            position: 'relative'
                        },

                    }).html(option.value);
                    btn.appendTo(body.self);
                    btn.self.onclick = () => {
                        if (!s.multiple) {
                            resolve(option.id)
                            s.close()
                        } else {
                            s.onselect(btn)
                        }
                    }
                    if ('disabled' in option && option.disabled)
                        btn.self.disabled = true;
                })
            }
            let head = make_el('div').attr({
                class: 'align-middle',
                style: {
                    position: 'relative',
                    width: '100%',
                    borderRadius: 'inherit',
                    padding: '4px'
                }
            })
            s.foot = make_el('div').attr({
                style: {
                    padding: '4px'
                }
            });
            if (s.multiple) {
                s.foot.addChild([
                    make_el('button').attr({
                        class: 'btn btn-white text-muted  float-right',
                        hidden: true,
                        onclick: () => {
                            resolve();
                            s.close()
                        }
                    }).html(s.okText).self,
                    make_el('button').attr({
                        class: 'btn btn-white text-muted  float-right',
                        onclick: () => {
                            reject();
                            s.close()
                        }
                    }).html('Cancel').self
                ])
            } else {
                s.foot.addChild(make_el('button').attr({
                    class: 'btn btn-white text-muted float-right',
                    onclick: () => {
                        reject();
                        s.close()
                    }
                }).html('Cancel').self)
            }
            let head_contents_array = []
            let head_contents = make_el('div').class('input-group mb-0');
            let titleArea = make_el('button').attr({
                class: 'btn btn-white bg-white text-dark font-weight-bolder',
                onfocus: (e) => {
                    _(e.target).style({ boxShadow: 'unset' })
                }
            }).html(self.title).self
            titleArea.hidden = this.title == '' ? true : false;
            head_contents_array.push(titleArea);
            if (s.add_search && s.options.length > 10) {
                head_contents_array.push(make_el('input').attr({
                    placeholder: 'Search options...',
                    type: 'text',
                    class: 'form-control',
                    style: {
                        borderRadius: '8px'
                    },
                    onfocus: (e) => {
                        _(e.target).style({ boxShadow: 'unset' })
                    },
                    onkeyup: (e) => { filter_select(e.target) }
                }).self)
            }
            head_contents.addChild(head_contents_array)
            head.addChild(head_contents.self)
            select_frame.addChild([head.self, body.self, s.foot.self])
            s.add_content(select_frame.self)
            s.open()
        })
    }
    return this;
}


// A table of data for actions

Modal.prototype.Table = function() {
    this.options = [];
    this.title = 'No title';
    this.add_search = false;
    this.okText = 'OK';
    this.defaultContent = 'No content';
    let s = this;
    let select_frame = make_el('div').style({
        display: 'inline-block',
        textAlign: 'left',
        background: 'white',
        boxShadow: 'rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px',
        borderRadius: '10px'
    })

    let body = make_el('div').style({
        overflow: 'auto',
        borderBottomLeftRadius: 'inherit',
        borderBottomRightRadius: 'inherit'
    })

    let set_dimension = function() {
        body.self.style.maxHeight = (s.y - 100) + 'px';
        select_frame.setWidth(s.x <= 768 ? '90%' : '40%');
    }
    set_dimension()
    window.resize_callbacks.push(set_dimension)
    let filter_select = function(search_field) {
        body.children.forEach(el => {
            if (el.innerText.toLowerCase().includes(search_field.value.trim().toLowerCase()))
                el.style.display = 'block';
            else
                el.style.display = 'none'
        })
    }
    this.launch = function() {
        return new Promise((resolve, reject) => {
            if (s.options.length == 0) {
                body.html('<h2 class="font-weight-lighter text-warning"> (' + self.defaultContent + ')</h2>');
                s.touch_close = true;
                body.style({ padding: '8px' })
            } else {
                body.addChild(s.options);
            }
            let head = make_el('div').attr({
                class: 'align-middle',
                style: {
                    position: 'relative',
                    width: '100%',
                    borderRadius: 'inherit',
                    padding: '4px'
                }
            })
            s.foot = make_el('div').attr({
                style: {
                    padding: '4px'
                }
            }).addChild(make_el('button').attr({
                class: 'btn btn-white text-muted  float-right',
                onclick: () => {
                    resolve();
                    s.close()
                }
            }).html('Cancel').self)

            let head_contents_array = []
            let head_contents = make_el('div').class('input-group mb-0');
            let titleArea = make_el('button').attr({
                class: 'btn btn-white bg-white text-dark font-weight-bolder',
                onfocus: (e) => {
                    _(e.target).style({ boxShadow: 'unset' })
                }
            }).html(self.title).self
            titleArea.hidden = this.title == '' ? true : false;
            head_contents_array.push(titleArea);
            if (s.add_search && s.options.length > 10) {
                head_contents_array.push(make_el('input').attr({
                    placeholder: 'Search options...',
                    type: 'text',
                    class: 'form-control',
                    style: {
                        borderRadius: '8px'
                    },
                    onfocus: (e) => {
                        _(e.target).style({ boxShadow: 'unset' })
                    },
                    onkeyup: (e) => { filter_select(e.target) }
                }).self)
            }
            head_contents.addChild(head_contents_array)
            head.addChild(head_contents.self)
            select_frame.addChild([head.self, body.self, s.foot.self])
            s.add_content(select_frame.self)
            s.open()
        })
    }
    return this;
}

//expand images

Modal.prototype.expandElement = function(el, ops = { onopen: () => {}, onclose: () => {} }) {

    this.onclose = ops.onclose;
    this.onopen = ops.onopen;
    this.touch_close = true;
    let self = this;
    el = _(el.cloneNode(true)).class('expand-el');
    el.self.style = '';
    el.style({ maxHeight: '0px', maxWidth: '0px' });
    let tag = el.self.tagName;

    function prepare(el) {
        let mh = 1;
        let mw = 1;
        let animate;

        function easyExpand() {
            el.style({
                maxHeight: mh + 'px',
                maxWidth: mw + 'px'
            });
            if (el.Height >= innerHeight || el.Width >= innerWidth || mh > innerHeight || mw > innerWidth) {
                el.style({
                    maxHeight: innerHeight + 'px',
                    maxWidth: innerWidth + 'px'
                });
                cancelAnimationFrame(animate);
                return;
            }
            mh += 100;
            mw += 100;
            animate = requestAnimationFrame(easyExpand);
        }

        animate = requestAnimationFrame(easyExpand);

        window.resize_callbacks.push(() => {
            el.style({
                maxHeight: innerHeight + 'px',
                maxWidth: innerWidth + 'px'
            });
        })
        let head = make_el('div').style({
            display: 'block',
            position: 'absolute',
            width: '100%',
            background: 'transparent',
            top: '0'
        })
        let closeBtn = make_el('button');
        closeBtn.class('text-danger').attr({
            style: {
                float: 'right',
                border: 'none',
                margin: '15px 30px',
                transition: '100ms transform ease-in-out'
            },
            title: 'Close modal',
            onclick: () => { self.close() },
            onmouseenter: () => { closeBtn.style({ transform: 'scale(1.2)' }) },
            onmouseleave: () => { closeBtn.style({ transform: 'scale(1)' }) }
        }).html('<span class="material-icons-outlined font-weight-bold" style = "font-size:2.5em">close</span>');
        head.addChild(closeBtn.self);
        self.add_content(head.self);
        self.add_content(el.self);
        self.touch_close = true;
        self.open();
    }
    if (tag == 'VIDEO') {
        el.self.controls = true;
        prepare(el);
    } else if (tag == 'IMG') {
        prepare(el);
    } else {
        let err = make_el('div').class('text-danger').html('Invalid Media type, only image and video allowed');
        prepare(err);
    }
}

/*
 * A full screen loading window from Windo
 */

Modal.prototype.Loading = function(content = 'Loading... <span class = "spin"></spin>') {
    let container = make_el('div').style({
        width: 'auto',
        padding: '5px 35px 5px 35px',
        fontSize: '1.4em',
        background: 'white',
        textAlign: 'center',
        display: 'inline-block',
        borderRadius: '8px',
        userSelect: 'none'
    }).html(content);

    this.add_content(container.self);
    this.open();
    return {
        content: container,
        loader: this
    }
}

export function collectInfo(maintitle, collections, maindescription = '') {

    let err = make_el('div').class('text-danger').html('');
    let body = make_el('div').style({ padding: '8px' });
    let fm = make_el('form');
    fm.addChild([
        make_el('div').class('h6').html(`${maintitle} <span class="float-right project-version">collectInfo v1.0</span>`).self,
        make_el('div').class('text-muted').html(maindescription).self,
        err.self
    ])
    body.addChild(fm.self);

    let ic_class = 'input-group-text material-icons-outlined';
    for (let i in collections) {
        let ic_style = {
            borderTopRightRadius: '0',
            borderBottomRightRadius: '0'
        };
        let field_style = {
            borderTopLeftRadius: '0',
            borderBottomLeftRadius: '0',
            boxShadow: 'none'
        };
        let collection = collections[i];
        let type = collection.type;
        let grouped = [make_el('div').self];
        if (type == 'email') {

            grouped = [
                make_el('span').class(ic_class)
                .style(ic_style).html('alternate_email').self,
                make_el('input').attr({
                    style: field_style,
                    id: 'collection_' + i,
                    class: 'form-control info-collection-field',
                    type: 'email',
                    placeholder: collection.placeholder
                }).self
            ]
        } else if (type == 'password') {


            grouped = [
                make_el('span').class(ic_class)
                .style(ic_style).html('lock').self,
                make_el('input').attr({
                    autocomplete: 'username'
                }).hide().self,
                make_el('input').attr({
                    style: field_style,
                    id: 'collection_' + i,
                    class: 'form-control info-collection-field',
                    type: 'password',
                    placeholder: collection.placeholder,
                    autocomplete: 'new-password'
                }).self
            ]
        } else if (type == 'textarea') {

            field_style['minHeight'] = '200px';
            ic_style['verticalAlign'] = 'top'
            grouped = [
                make_el('textarea').attr({
                    style: field_style,
                    id: 'collection_' + i,
                    class: 'form-control info-collection-field',
                    placeholder: collection.placeholder
                }).self
            ]
        } else if (type == 'select') {
            field_style = {
                borderRadius: '0',
                boxShadow: 'none',
                textAlign: 'center',
                cursor: 'pointer'
            };
            grouped = [
                make_el('span').class(ic_class)
                .style(ic_style).html('category').self,
                make_el('span').attr({
                    style: field_style,
                    id: 'collection_' + i,
                    class: 'form-control info-collection-field',
                    selected: 'none',
                    onclick: (e) => {
                        let wn = new Modal().RequestSelection();
                        wn.title = 'Please choose one'
                        for (let op in collection.options) {
                            wn.options.push({ id: op, value: collection.options[op].html })
                        }
                        wn.request().then(resp => {
                            err.html('');
                            _(e.target).attr({
                                selected: resp,
                                style: { outline: 'none' }
                            }).html(collection.options[resp].html)
                        }).catch(err => {})
                    }
                }).html('Click to choose').self,
                make_el('span').attr({
                    class: ic_class,
                    onclick: (e) => {
                        e.target.previousSibling.click();
                    }
                })
                .style({
                    borderTopLeftRadius: '0',
                    borderBottomLeftRadius: '0',
                    cursor: 'pointer'
                }).html('arrow_drop_down').self,
            ]
        } else if (type == 'file') {
            let file_count = 0;
            grouped = [
                make_el('span').attr({
                    class: 'info-collection-field',
                    style: {
                        background: 'rgba(0,0,0,0.8)',
                        cursor: 'pointer',
                        padding: '6px 6px 0px 6px',
                        color: 'rgba(255,255,255, 0.7)',
                        fontSize: '1.4em'
                    },
                    id: 'collection_' + i,
                    onclick: (e) => {
                        let errors = 0;
                        let target = e.target;
                        let conatiner = _(target.tagName == 'SPAN' ? target.parentElement.parentElement : target.parentElement).class('block');
                        choose_file(collection.attributes).then(files => {
                            conatiner.child(0).self.style.outline = 'none';
                            for (let f = 0; f < files.length; f++) {
                                if (Object.keys(collection.selected).length >= (collection.max - 1)) {
                                    break;
                                }
                                let curr = files[f];
                                if (collection.acceptable(curr)) {
                                    let id = 'file_' + file_count;
                                    collection.selected[id] = curr;
                                    conatiner.addChild(
                                        make_el('div').id(id).attr({ title: 'Click to preview File' }).class('btn btn-light m-1 position-relative').addChild([
                                            make_el('span').class('material-icons position-absolute text-danger').attr({
                                                title: 'Delete this file',
                                                onclick: (e) => {
                                                    let p = _(e.target).parent();
                                                    delete collection.selected[p.Id];
                                                    p.delete();
                                                }
                                            }).html('cancel').self,
                                            make_el('span').style({ marginLeft: '28px' }).html(curr.name).self
                                        ]).clicked((e) => {
                                            if (e.target.innerText != 'cancel') {

                                                new Modal().expandElement(new File_(curr).tag().self)
                                            }
                                        }).self
                                    )

                                } else {
                                    errors++;
                                    console.log(curr)
                                }
                                file_count++;
                            }

                            if (errors > 0) {
                                smoothAlert('Some files were filtered out!');
                            }
                        })
                    }
                }).addChild(
                    make_el('span').class('material-icons-outlined').html('add').self
                ).self,
            ]
        } else if (type == 'rating') {
            grouped = make_el('div').class('info-collection-field').id('collection_' + i).attr({
                selected: 1
            });

            let reset_star = (e) => {

                grouped.childNodes.forEach(star => {
                    star.style.color = 'whitesmoke';
                    grouped.style.outline = 'none';
                    err.html('')
                });

                let sn = Number(e.target.id.split('_')[1]);

                for (let i = 1; i <= sn; i++) {
                    _(grouped).attr({ selected: sn }).children[i - 1].style.color = 'rgb(37, 211, 102)';
                }
            }
            for (let i = 1; i <= 5; i++) {
                let col = 'whitesmoke';
                if (i == 1) {
                    col = 'rgb(37, 211, 102)';
                }
                grouped.addChild(make_el('span').id('rating-star_' + i).style({
                    color: col,
                    marginRight: '8px',
                    fontSize: '2em',
                    padding: '0px',
                    transition: '0.3s all',
                    cursor: 'pointer',
                    height: '23px'
                }).clicked(reset_star).class('material-icons-outlined').html('star').self)
            }
            grouped = grouped.self;

        } else if (type == 'text') {
            grouped = [
                make_el('span').class(ic_class)
                .style(ic_style).html('person').self,
                make_el('input').attr({
                    style: field_style,
                    id: 'collection_' + i,
                    class: 'form-control info-collection-field',
                    type: 'text',
                    placeholder: collection.placeholder
                }).self
            ]
        } else if (type == 'tel') {
            grouped = [
                make_el('span').class(ic_class)
                .style(ic_style).html('local_phone').self,
                make_el('input').attr({
                    style: field_style,
                    id: 'collection_' + i,
                    class: 'form-control info-collection-field',
                    type: 'tel',
                    placeholder: collection.placeholder
                }).self
            ]
        }
        fm.addChild([
            make_el('div').class('h5 m-0').html(collection.title).self,
            make_el('div').class('text-muted mb-1').html(collection.description).self,
            make_el('div').class('input-group-prepend').style({ marginBottom: '6px' }).addChild(grouped).self
        ]);
    }

    let submitBtn = make_el('button').html('Submit');
    let al = smoothAlert({
        body: body.self,
        width: 60,
        direction: 'top',
        buttonRight: submitBtn,
        cancelText: 'Cancel'
    });
    return new Promise((res, rej) => {
        submitBtn.clicked(() => {
            let returns = {};
            let errors = 0;
            let fields = [].slice.call(document.getElementsByClassName('info-collection-field'));
            fields.forEach(field => {
                let key = field.id.split('_')[1];
                let cat = collections[key];
                if (cat.type == 'file') {

                    let all_files = Object.values(cat.selected);
                    if ((cat.required && all_files.length.in_range(1, (cat.max - 1))) ||
                        (!cat.required && all_files.length <= (cat.max - 1))) {
                        returns[key] = all_files;
                        field.style.outline = 'none';
                    } else {
                        errors++;
                        field.style.outline = '1px solid orangered';
                    }

                } else {
                    let val = cat.type.in(['select', 'rating']) ? _(field).attr('selected') : field.value.trim();
                    if ((cat.required && val.empty()) ||
                        (!val.empty() && !cat.acceptable(val))) {
                        errors++;
                        field.style.outline = '1px solid orangered';
                    } else {
                        returns[key] = val;
                        field.style.outline = 'none';
                    }
                }
            })
            if (errors == 0) {
                res(returns)
                al.delete()
            } else {
                err.html('Please fill out the form correctly');
                smoothAlert('Please fill out the form correctly, check from top');
            }
        })
    })
}

/**
 *  Your date method to help you simplify Js dates
 */

Date.prototype.format = function(format, type) {
    let description = {
        d: 'day in number',
        D: 'day in words',
        m: 'month in number',
        M: 'month in words',
        y: 'last two digits of the year',
        Y: 'full digits of the year',
        h: 'hour',
        i: 'minute',
        s: 'second',
        S: 'millisencond',
        a: 'am or pm',
        A: 'AM or PM',
        p: 'call it supperscript or power or whatever eg. th, rd, st, nd (attached to d)'
    };
    let count = 0;
    let ret = '';
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
        'October', 'November', 'December'
    ];
    for (let i = 0; i < format.length; i++) {
        let f = format[i];
        switch (f) {
            case 'd':
                let d = (type == 'UTC') ? this.getUTCDate() : this.getDate();
                ret += ((d.toString().length == 1) ? '0' + d : d);
                count++;
                break;
            case 'D':
                ret += days[(type == 'UTC') ? this.getUTCDay() : this.getDay()];
                count++;
                break;
            case 'm':
                let m = (type == 'UTC') ? (this.getUTCMonth() + 1) : (this.getMonth() + 1);
                ret += ((m.toString().length == 1) ? '0' + m : m);
                count++;
                break;
            case 'M':
                ret += months[(type == 'UTC') ? this.getUTCMonth() : this.getMonth()];
                count++;
                break;
            case 'y':
                ret += (type == 'UTC') ? this.getUTCFullYear().toString().substr(-2) : this.getFullYear().toString().substr(-2);
                count++;
                break;
            case 'Y':
                ret += (type == 'UTC') ? this.getUTCFullYear() : this.getFullYear();
                count++;
                break;
            case 'h':
                let hf = (type == 'UTC') ? this.getUTCHours() : this.getHours();
                let h = (hf > 12) ? (hf - 12) : ((hf == 0) ? 12 : hf);
                ret += (h.toString().length == 1) ? '0' + h : h;
                count++;
                break;
            case 'i':
                let j = (type == 'UTC') ? this.getUTCMinutes() : this.getMinutes();
                ret += (j.toString().length == 1) ? '0' + j : j;
                count++;
                break;
            case 's':
                let s = (type == 'UTC') ? this.getUTCSeconds() : this.getSeconds();
                ret += (s.toString().length == 1) ? '0' + s : s;
                count++;
                break;
            case 'S':
                let s2 = (type == 'UTC') ? this.getUTCMilliseconds() : this.getMilliseconds();
                ret += (s2.toString().length == 1) ? '0' + s2 : s2;
                count++;
                break;
            case 'a':
                ret += (((type == 'UTC') ? this.getUTCHours() : this.getHours()) >= 12) ? 'pm' : 'am';
                count++;
                break;
            case 'A':
                ret += (((type == 'UTC') ? this.getUTCHours() : this.getHours()) >= 12) ? 'PM' : 'AM';
                count++;
                break;
            case 'p':
                let p = (type == 'UTC') ? this.getUTCDate().toString() : this.getDate().toString();
                if (p.length == 1 || (p.length == 2 && p.charAt(0) != 1)) {
                    if (p == '1' || p.charAt(1) == '1') {
                        ret += 'st';
                    } else if (p == '2' || p.charAt(1) == '2') {
                        ret += 'nd';
                    } else if (p == '3' || p.charAt(1) == '3') {
                        ret += 'rd';
                    } else {
                        ret += 'th';
                    }
                } else {
                    ret += 'th';
                }
                count++;
                break;
            default:
                ret += f;
        }
    }
    if (count > 0)
        return ret.trim();
    else
        console.log('Invalid date format, please read the formats below, ' +
            'you can separate them with any character except the ones given below because if' +
            ' you use any property below, it will be converted to the corresponding value. Thanks! \n' + JSON.stringify(description));
};

Date.prototype.UTC_DATE = function() {
    return this.format('m/d/y h:i:s A UTC', 'UTC');
}

Date.prototype.UTC_TIME = function() {

    return Date.UTC(Number(this.format('Y', 'UTC')), Number(this.format('m', 'UTC')),
        Number(this.format('d', 'UTC')), Number(this.format('h', 'UTC')), Number(this.format('i', 'UTC')),
        Number(this.format('s', 'UTC')), Number(this.format('S', 'UTC')), 'UTC');
}

Date.prototype.nice_one = function(must_show_time) {
    let go = this.format('M d, Y');
    let d = new Date();
    let now = d.format('d/m/y/')
    let then = this.format('d/m/y/');
    let then_ = this.format('h:i a');
    let now_ = d.format('h:i a');
    if (now == then) {
        //If both dates are the same, we check hours.
        if (then_.split(':')[0] == now_.split(':')[0]) {
            //If the hours are the same too, we return minutes ago by subtraction...
            let diff = Number(d.format('i')) - Number(this.format('i'));
            go = diff == 0 && !must_show_time ? 'Now' : must_show_time ? then_ : (diff + 'm');
        } else {
            //If hours are not the same, we return the time in the example format 'Today - 3:40am'
            go = then_;
        }
    } else {
        then = then.split('/');
        now = now.split('/');
        //If both dates are not the same, we check years
        if (then[2] == now[2]) {
            //If the years are the same, we check the months
            go = this.format('M d'); //Default value for same year
            if (then[1] == now[1]) {
                //If months are the same, we check the days diffence
                let diff = Number(now[0]) - Number(then[0]);
                if (diff == 1) {
                    //A day diffence of 1, will mean yesterday
                    go = then_;
                }
            }
        }
    }
    return go;
}




/**
 * The file method to help you with your every file works
 */

export let File_ = function(file) {
    if (file) {
        this.file = file;
        this.type = file.type;
        this.size = file.size;
        this.extension = function() {
            let separate_by_dots = file.name.split('.');
            return separate_by_dots[separate_by_dots.length - 1].toLowerCase();
        };
        this.name = {
            r: file.name,
            i: '247-dev.com' + '-file-' + new Date().UTC_TIME() + '.' + this.extension()
        };
        this.isImage = function() {
            let result = false;
            let imgs = ['jpeg', 'jpg', 'png', 'gif'];
            if (imgs.includes(this.extension())) {
                result = true;
            }
            return result;
        }
        this.isVideo = function() {
            let result = false;
            let vids = ['mp4', '3gp', 'mkv', 'wmv', 'mpeg'];
            if (vids.includes(this.extension())) {
                result = true;
            }
            return result;
        }
        this.isAudio = function() {
            let result = false;
            let auds = ['mp3', 'wav', 'acc', 'ogg'];
            if (auds.includes(this.extension())) {
                result = true;
            }
            return result;
        }
        this.isTypeCV = function() {
            if (['docx', 'pdf'].includes(this.extension()))
                return true;
            else
                return false;
        }
        this.URL = file.src || this.make_url(file);
    }
}
File_.prototype.make_url = function(file) {
    let b = new Blob([file], { type: file.type });
    let url = (window.webkitURL || window.mozURL || window.msURL || window.oURL || window.URL);
    return url.createObjectURL(b);
};

File_.prototype.tag = function(controls) {
    if (this.isImage()) {
        let img = make_el('img').attr({ src: this.URL });
        return img;
    } else if (this.isVideo()) {
        let video = make_el('video').addChild(
            make_el('source').attr({ src: this.URL }).self);
        return video;
    } else if (this.isAudio()) {
        let audio = make_el('audio').addChild(
            make_el('source').attr({ src: this.URL }).self)
        return audio;
    } else {
        let link = make_el('a').attr({ href: this.URL, target: '_blank' });
        return link;
    }
}

File_.prototype.description = function() {
    let result = { value: 'Unkown', logo: '' };
    let sc = 'Source code';
    if (this.isImage()) {
        result.value = 'Picture';
        result.logo = '';
    } else if (this.isVideo()) {
        result.value = 'Video';
        result.logo = '';
    } else if (this.isAudio()) {
        result.value = 'Audio';
        result.logo = '<i class="fa fa-headphones"></i>';
    } else {
        switch (this.extension().toLowerCase()) {
            /* Some known documents */
            case 'pdf':
                result.value = 'PDF';
                result.logo = '<i class="fa fa-file-pdf" style = "color:red"></i>';
                break;
            case 'docx':
                result.value = 'MS Office word';
                result.logo = '<i class="fa fa-file-word"></i>';
                break;
            case 'xlsx':
                result.value = 'MS Office excel';
                result.logo = '<i class="fa fa-file-excel"></i>';
                break;
            case 'accdb':
                result.value = 'MS Office access';
                result.logo = '<i class="fa fa-database"></i>';
                break;
            case 'ppt':
                result.value = 'MS Office power point';
                result.logo = '<i class="fa fa-file-powerpoint"></i>';
                break;
            case 'zip':
                result.value = 'Zipped files';
                result.logo = '<i class="fa fa-file-archive"></i>';
                break;
            case 'txt':
                result.value = 'Plain text';
                result.logo = '<i class="fa fa-file-alt"></i>';
                break;
                /* Some know programming languages */
            case 'php':
                result.value = sc + ' (PHP)';
                result.logo = '<i class="fa fa-php"></i>';
                break;
            case 'asp':
                result.value = sc + ' (ASP)';
                result.logo = '<i class="fa fa-code"></i>';
                break;
            case 'xml':
                result.value = sc + ' (XML)';
                result.logo = '<i class="fa fa-code"></i>';
                break;
            case 'json':
                result.value = sc + ' (JSON)';
                result.logo = '<i class="fa fa-js-square"></i>';
                break;
            case 'css':
                result.value = sc + ' (CSS)';
                result.logo = '<i class="fa fa-file-code"></i>';
                break;
            case 'html':
            case 'htm':
                result.value = sc + ' (' + ext.toUpperCase() + ')';
                result.logo = '<i class="fa fa-file-code"></i>';
                break;
            case 'js':
                result.value = sc + ' (JS)';
                result.logo = '<i class="fa fa-js-square"></i>';
                break;
            case 'cpp':
                result.value = sc + ' (C++)';
                result.logo = '<i class="fa fa-code"></i>';
                break;
            case 'c':
                result.value = sc + ' (C)';
                result.logo = '';
                break;
            case 'java':
                result.value = sc + ' (JAVA)';
                result.logo = '<i class="fa fa-java"></i>';
                break;
            case 'class':
                result.value = sc + ' (JAVA BYTECODE)';
                result.logo = '<i class="fa fa-java"></i>';
                break;
                /* Other file types */
            case 'exe':
                result.value = 'Setup file';
                result.logo = '<i class="fas fa-laptop"></i>';
                break;
            case 'apk':
                result.value = 'APK';
                result.logo = '<i class="fa fa-google-play"></i>';
                break;
            case 'sql':
                result.value = 'SQL';
                result.logo = '<i class="fa fa-database"></i>';
                break;
            default:
                result.value = reduce(this.extension().toUpperCase(), 10);
                result.logo = '<i class="fa fa-question-circle"></i>';
        }
    }
    return result;
}

//working the size;
File_.prototype.worked_size = function(size) {
        let sz = size ? size : this.size;
        if (sz == 0) return '0B';
        var k = 1024,
            sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(sz) / Math.log(k));
        return parseFloat((sz / Math.pow(k, i)).toFixed(2)) + '' + sizes[i];
    }
    /* Working out the uploading, real business */
File_.prototype.ready = function() {
    return ajax();
}
File_.prototype.upload = function(props) {
    let self = this;
    return new Promise((resolve, reject) => {
        let f = self.file;
        const MAX_FILE_SIZE = 1024 * 1024; //1MB
        let start = 0;
        let stop = MAX_FILE_SIZE;
        let chunks = [];
        let uploaded = 0;
        /* For small files <= 1MB.. Just upload at once*/
        if (f.size <= MAX_FILE_SIZE) {
            upload_(f);
        } else {
            /* For large files we have to split into an array of smaller sizes, 1MB.*/
            while (start < f.size) {
                chunks.push(f.slice(start, stop) || f.webkitSlice(start, stop));
                start = stop;
                stop = start + MAX_FILE_SIZE;
            }
            /* Then upload each chunk separately. We will reassembled them on the server. */
            upload_(chunks[uploaded]);
        }

        function upload_(file) {
            let request = self.ready();
            let fd = new FormData();
            fd.append('file', file);
            request.onload = function() {
                if (uploaded == chunks.length - 1 || uploaded == chunks.length) {
                    resolve(this.response);
                } else {
                    upload_(chunks[uploaded + 1]);
                    uploaded++;
                }
            }
            request.upload.onprogress = function(e) {
                let l = e.loaded,
                    t = e.total,
                    percentage, size;
                let chunksLen = chunks.length;
                if (chunksLen == 1 || chunksLen == 0) {
                    percentage = Math.ceil((l / t) * 100);
                    size = e.loaded;
                } else if (chunksLen > 1 && uploaded == 0) {
                    percentage = Math.ceil((l / t) * 100) / chunksLen;
                    size = e.loaded;
                } else {
                    size = uploaded * MAX_FILE_SIZE + self.size % MAX_FILE_SIZE + (l / t);
                    percentage = Math.floor((size / self.size) * 100);
                }
                props.progressHandler({ percentage: percentage, size: size, total: self.worked_size() });
            };
            request.onerror = function() {
                reject(Error('Connection Error'));
            };
            request.open('POST', props.destination, true);
            request.send(fd);
        }
    });
};