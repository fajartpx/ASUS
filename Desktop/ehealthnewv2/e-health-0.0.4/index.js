/**
 * @format
 */

import React from 'react'
import { AppRegistry } from 'react-native'
import App,{ updateChat,updateUnseenChat } from './App'
import { name as appName } from './app.json'

import PushNotificationIOS from "@react-native-community/push-notification-ios"
import PushNotification from "react-native-push-notification"

import AsyncStorage from '@react-native-async-storage/async-storage'
import { updateChatStatus, updateMessageList } from './src/screens/ChatBubble'
// Must be outside of any component LifeCycle (such as `componentDidMount`).
PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: function (token) {
    AsyncStorage.getItem('fcm_token',(e,rs) => {
      if (!e && rs !== null) {
        rs = JSON.parse(rs)
        if (rs.token !== token.token) AsyncStorage.setItem('fcm_token',JSON.stringify({ token: token.token,os: token.os,sent: false }))
      } else {
        AsyncStorage.setItem('fcm_token',JSON.stringify({ token: token.token,os: token.os,sent: false }))
      }
    })
  },

  // (required) Called when a remote is received or opened, or local notification is opened
  onNotification: function (notification) {
    // process the notification
    if (notification.foreground && notification.channelId === 'chat_notification' || notification.channelId === 'update_chat_list_notification') {
      if (notification.channelId === 'chat_notification' && updateMessageList && typeof updateMessageList === 'function') updateMessageList()
      AsyncStorage.getItem('chats',(e,rs) => {
        if (!e && rs !== null) {
          rs = JSON.parse(rs)
          let index = rs.map(a => a.chat_id).indexOf(notification.data.chat_id)
          if (index > -1) {
            rs[index] = {
              ...rs[index],
              chat_status: notification.data.chat_status,
              user_name: notification.data.user_name,
              user_picture: notification.data.user_picture,
              message_text: notification.data.message_text,
              message_time: notification.data.message_time,
              message_attachment_url: notification.data.message_attachment_url,
              message_attachment_type: notification.data.message_attachment_type,
              sender_user_id: notification.data.sender_user_id
            }
          } else {
            rs = [
              ...rs,
              {
                chat_id: notification.data.chat_id,
                chat_status: notification.data.chat_status,
                user_name: notification.data.user_name,
                user_picture: notification.data.user_picture,
                message_text: notification.data.message_text,
                message_time: notification.data.message_time,
                message_attachment_url: notification.data.message_attachment_url,
                message_attachment_type: notification.data.message_attachment_type,
                sender_user_id: notification.data.sender_user_id
              }
            ]
          }
          rs.sort(function (a,b) {
            let ya = parseInt(a.message_time.substr(0,4))
            let ma = parseInt(a.message_time.substr(5,2)) - 1
            let da = parseInt(a.message_time.substr(8,2))
            let ha = parseInt(a.message_time.substr(11,2))
            let ia = parseInt(a.message_time.substr(14,2))
            let sa = parseInt(a.message_time.substr(17,2))
            let yb = parseInt(b.message_time.substr(0,4))
            let mb = parseInt(b.message_time.substr(5,2)) - 1
            let db = parseInt(b.message_time.substr(8,2))
            let hb = parseInt(b.message_time.substr(11,2))
            let ib = parseInt(b.message_time.substr(14,2))
            let sb = parseInt(b.message_time.substr(17,2))
            let datea = new Date(ya,ma,da,ha,ia,sa)
            let dateb = new Date(yb,mb,db,hb,ib,sb)

            return dateb.getTime() - datea.getTime()
          })
        } else {
          rs = [{
            chat_id: notification.data.chat_id,
            chat_status: notification.data.chat_status,
            user_name: notification.data.user_name,
            user_picture: notification.data.user_picture,
            message_text: notification.data.message_text,
            message_time: notification.data.message_time,
            message_attachment_url: notification.data.message_attachment_url,
            message_attachment_type: notification.data.message_attachment_type,
            sender_user_id: notification.data.sender_user_id
          }]
        }

        AsyncStorage.setItem('chats',JSON.stringify(rs),e => {
          if (!e) {
            if (updateChat && typeof updateChat === 'function') updateChat()
          }
        })
      })

      if (notification.channelId === 'chat_notification') {
        AsyncStorage.getItem('unseen_chats',(e,rs) => {
          if (!e && rs !== null) {
            rs = JSON.parse(rs)
            let index = rs.map(a => a.chat_id).indexOf(notification.data.chat_id)
            if (index > -1) {
              rs[index] = {
                ...rs[index],
                unseen_count: (parseInt(rs[index].unseen_count) + 1).toString()
              }
            } else {
              rs = [
                ...rs,
                {
                  chat_id: notification.data.chat_id,
                  unseen_count: '1'
                }
              ]
            }
          } else {
            rs = [{
              chat_id: notification.data.chat_id,
              unseen_count: '1'
            }]
          }
          AsyncStorage.setItem('unseen_chats',JSON.stringify(rs),e => {
            if (!e) {
              if (updateUnseenChat && typeof updateUnseenChat === 'function') updateUnseenChat()
            }
          })
        })
      }

    }

    if (notification.foreground && notification.channelId === 'seen_notification') {
      if (updateMessageList && typeof updateMessageList === 'function') updateMessageList()
    }
    
    if (notification.foreground && notification.channelId === 'update_chat_status_notification') {
      if (updateChatStatus && typeof updateChatStatus === 'function') updateChatStatus(notification.data)
    }

    // (required) Called when a remote is received or opened, or local notification is opened
    notification.finish(PushNotificationIOS.FetchResult.NoData)
  },

  // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
  onAction: function (notification) {
    console.log("ACTION:",notification.action)
    console.log("NOTIFICATION:",notification)
  },

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError: function (err) {
    console.error(err.message,err)
  },

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: true,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   * - if you are not using remote notification or do not have Firebase installed, use this:
   *     requestPermissions: Platform.OS === 'ios'
   */
  requestPermissions: true,
  senderID: '202351798597'
})

import { Provider } from 'react-redux'
import store from './src/store'
let storeInstance = store()

class Root extends React.Component {
  render() {
    return (
      <Provider store={storeInstance}>
        <App />
      </Provider>
    )
  }
}

AppRegistry.registerComponent(appName,() => Root)
