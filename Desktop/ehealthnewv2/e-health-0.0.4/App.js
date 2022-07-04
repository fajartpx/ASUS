
import React,{ Component } from 'react'
import { Text,View,LogBox,TextInput,Dimensions,StatusBar,Image,AppState } from 'react-native'
import PushNotification from "react-native-push-notification"
import { CreateChannel } from './src/services/PushController'
import NotifyContainer from './src/components/Notify'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setChats,setUnseenCount,setUnseenData } from './src/actions/chats.actions'

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state.',
  'If you want to use Reanimated 2'
])

import Color from './src/tools/Color'

import { LocaleConfig } from 'react-native-calendars'
import NavigationServices,{ userLoggedIn } from './NavigationServices'
import AsyncStorage from '@react-native-async-storage/async-storage'
import cancellablePromise from './src/tools/cancellablePromise'
import { KOMA_API_URL, KOMA_API_TOKEN_KEY } from './src/tools/constants'
import Otp from './src/components/Otp'

LocaleConfig.locales['id'] = {
  monthNames: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
  monthNamesShort: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'],
  dayNames: ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'],
  dayNamesShort: ['Min','Sen','Sel','Rab','Kam','Jum','Sab'],
  today: 'Hari\'Ini'
}
LocaleConfig.defaultLocale = 'id'

function changeFontStyle(a,b) {
  let oldRender = a.render
  a.render = function (...args) {
    let origin = oldRender.call(this,...args)
    return React.cloneElement(origin,{
      style: [b,origin.props.style]
    })
  }
}

export let updateFCM
export let updateChat
export let updateChatFromServer
export let updateUnseenChat
class App extends Component {
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise,p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  constructor(props) {
    super(props)
    changeFontStyle(Text,{ fontFamily: 'PlusJakartaSans',color: Color.textColor })
    changeFontStyle(TextInput,{ fontFamily: 'PlusJakartaSans' })
    StatusBar.setBackgroundColor(Color.theme,true)
    StatusBar.setBarStyle('light-content',true)
    PushNotification.channelExists('chat_notification',function (exists) {
      if (!exists) {
        CreateChannel('chat_notification','Chat','Chat Notification')
      }
    })
    PushNotification.channelExists('seen_notification',function (exists) {
      if (!exists) {
        CreateChannel('seen_notification','Seen','Seen Notification',false,false,0)
      }
    })
    PushNotification.channelExists('update_chat_list_notification',function (exists) {
      if (!exists) {
        CreateChannel('update_chat_list_notification','Update Chat List','Update Chat List Notification',false,false,0)
      }
    })
    PushNotification.channelExists('update_chat_status_notification',function (exists) {
      if (!exists) {
        CreateChannel('update_chat_status_notification','Update Chat Status','Update Chat Status Notification',false,false,0)
      }
    })
    updateFCM = this._checkFCM
    this._checkUnseenChat()
    this._checkFCM()
    updateChat = this._updateChat
    this._updateChat(this._getChatFromServer)
    updateUnseenChat = this._checkUnseenChat
    updateChatFromServer = this._getChatFromServer
  }

  _checkUnseenChat = () => {
    AsyncStorage.getItem('unseen_chats',(e,res) => {
      if (!e && res !== null) {
        res = JSON.parse(res)
        this.props.setUnseenData(res)
        res = res.map(a => parseInt(a.unseen_count))
        if (res.length > 0) this.props.setUnseenCount(res.reduce((total,num) => total + num))
      }
    })
  }

  _updateChat = (finisher = null) => {
    AsyncStorage.getItem('chats',(e,res) => {
      if (!e && res !== null) res = JSON.parse(res)
      if (res !== null) {
        res.sort(function (a,b) {
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
        this.props.setChats(res)
      }
      if (finisher && typeof finisher === 'function') finisher()
    })
  }

  _getChatFromServer = async () => {
    let user = await AsyncStorage.getItem('user_logged_in')
    if (user !== null) user = JSON.parse(user)
    if (user === null) return true
    const wrappedPromise = cancellablePromise(this._promiseChat(user))
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        if (res.status) {
          AsyncStorage.setItem('unseen_chats',JSON.stringify(res.data.unseen_chats),e => {
            if (!e) this._checkUnseenChat()
          })
          AsyncStorage.setItem('chats',JSON.stringify(res.data.chats),e => {
            if (!e) this._updateChat()
          })
        }
      })
      .then(() => { this._removePromise(wrappedPromise) })
      .catch(e => {
        console.log(e)
      })
  }

  _promiseChat = (user) => {
    return new Promise((resolve,reject) => {
      fetch(`${KOMA_API_URL}?user_id=${user.user_id}`,{
        method: 'GET',
        headers: {
          'Token-Key': KOMA_API_TOKEN_KEY
        }
      })
        .then(res => res.json())
        .then(resolve)
        .catch(reject)
    })
  }

  _checkFCM = () => {
    AsyncStorage.getItem('fcm_token',(e,rs) => {
      if (e || rs === null) return true
      rs = JSON.parse(rs)
      if (!rs.sent) this._updateFCM(rs,() => {
        rs = {
          ...rs,
          sent: true
        }
        AsyncStorage.setItem('fcm_token',JSON.stringify(rs))
      })
    })
  }

  _updateFCM = async (token,finisher = null) => {
    const user = await AsyncStorage.getItem('user_logged_in')
    if (user === null) return false
    const wrappedPromise = cancellablePromise(this._promiseUpdateFCM(token,JSON.parse(user)))
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        if (res.status && finisher !== null && typeof finisher === 'function') finisher()
      })
      .then(() => { this._removePromise(wrappedPromise) })
      .catch(e => {
        console.log(e)
      })
  }

  _promiseUpdateFCM = (token,user) => {
    const formData = new FormData()
    formData.append('user_android_fcm_token',token.token)
    formData.append('user_id',user.user_id)
    return new Promise((resolve,reject) => {
      fetch(`${KOMA_API_URL}home/fcm-token`,{
        method: 'POST',
        headers: {
          'Token-Key': KOMA_API_TOKEN_KEY
        },
        body: formData
      })
        .then(res => res.json())
        .then(resolve)
        .catch(reject)
    })
  }

  _subscription
  componentDidMount() {
    this._subscription = AppState.addEventListener('change',this._appStateChange)
  }

  componentWillUnmount() {
    this._pendingPromise.map(p => {
      this._removePromise(p)
    })
    if(this._subscription) this._subscription.remove()
  }

  _appStateChange = (e) => {
    if (e === 'active') this._getChatFromServer()
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <NavigationServices />
        <NotifyContainer />
        <Otp />
      </View >
    )
  }
}

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {
    setChats: bindActionCreators(setChats,dispatch),
    setUnseenData: bindActionCreators(setUnseenData,dispatch),
    setUnseenCount: bindActionCreators(setUnseenCount,dispatch)
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(App)