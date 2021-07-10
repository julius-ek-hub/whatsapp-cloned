import * as vf from './verify.js';
import * as mm from "./message-makeup.js";
import * as mess from "./message.js";
import * as cb from "./chat-box.js";
import * as chat from "./chat.js";
import * as pa from "./prepare-app.js";
import * as actions from "./general-actions.js";
import * as ma from "./message-actions.js";
import * as p from "./profile.js";
import * as du from "./db-updates.js";
import * as calls from "./calls.js";
import * as announce from "./announcments.js";

let WhatsAppClone = function() {
    this.addProperties = function(arg) {
        for (let i in arg) {
            this[i] = arg[i];
        }
    }
}


let modules = [vf, mm, mess, cb, chat, pa, actions, ma, p, du, calls, announce];

modules.forEach(module_ => {

    for (let method in module_) {
        WhatsAppClone.prototype[method.split('').removeIf(char => { return method.indexOf(char) == (method.length - 1) && char == '_' }).join('')] = module_[method];
    }

})

export default WhatsAppClone;