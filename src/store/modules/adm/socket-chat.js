import io from 'socket.io-client'
import Vue from 'vue'
import i18n from '../../../i18n'
import utils from '../../../lib/adamant'
import * as admApi from '../../../lib/adamant-api'
/* eslint-disable */
export default (context) => {
    console.log({
        context
    })
    const address = context.rootState.address
    const socket = io('ws://51.15.245.173:36668')

    socket.on('connect', () => {
        socket.emit('msg', address + ' connected!')
        socket.emit('address', address)
        console.log('Connect Socket')
    })

    socket.on('newTrans', tx => { // новая транзакция 
        let chats = context.rootGetters.getChats
        let targetChat
        if (tx.recipientId === context.rootGetters.getAdmAddress) {

            targetChat = Object.values(chats).filter(chat => chat.partner === tx.senderId)
            if (targetChat && targetChat[0] && targetChat[0].partner) {

                if (!context.rootState.newChats && context.rootState.newChats[targetChat[0].partner]) {

                    Vue.set(context.rootState.newChats, targetChat[0].partner, 1)
                    if (context.rootState.notifySound) {
                        try {
                            window.audio.playSound('newMessageNotification')
                        } catch (e) {}
                    }
                    context.rootState.totalNewChats = context.rootState.totalNewChats + 1
                } else {

                    let newMessages = context.rootState.newChats[targetChat[0].partner]
                    if (!newMessages) {
                        newMessages = 0
                    }
                    if (context.rootState.notifySound) {
                        try {
                            window.audio.playSound('newMessageNotification')
                        } catch (e) {}
                    }

                    Vue.set(context.rootState.newChats, targetChat[0].partner, newMessages + 1)
                    context.rootState.totalNewChats = context.rootState.totalNewChats + 1
                    const chats = context.rootGetters.getChats[targetChat[0].partner];
                    const txup = admApi.decodeChat(tx, tx.senderPublicKey);
                    txup.direction = "to";
                    chats.messages[txup.id] = txup;

                    chats.last_message = {
                        confirm_class: "confirmed",
                        direction: "to",
                        id: txup.id,
                        message: txup.message,
                        timestamp: txup.timestamp
                    }
                }
            }

        } else {
            console.log('Отчет о доставке')
            targetChat = Object.values(chats).filter(chat => chat.partner === tx.recipientId)
            if (targetChat.length > 0 && targetChat[0].messages[tx.id]) {
                Vue.set(targetChat[0].messages[tx.id], 'confirm_class', 'confirmed')
            }
        }
        // Update last chat message
        Vue.set(targetChat, 'last_message', {
            ...targetChat.last_message,
            message: i18n.t('chats.' + (tx.recipientId === context.rootGetters.getAdmAddress ? 'received_label' : 'sent_label')) + ' ' + tx.amount / 100000000 + ' ADM',
            confirm_class: 'confirmed',
            timestamp: utils.epochTime()
        })
        context.commit('transactions', [tx])
    })

    socket.on('reconnecting', data => { // неудачный рекконект
        console.log(address + ' recconecting...')
    })

    return socket
}