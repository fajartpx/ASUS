import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, Dimensions, ScrollView, ToastAndroid, AppState, TouchableHighlight, Keyboard, Image, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Color, { colorYiq } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
import Header from '../components/Header'
import Input from '../components/Input'
import Button from '../components/Button'
import dateFormat from '../tools/dateFormat'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { updateChat, updateUnseenChat } from '../../App'
const { width, height } = Dimensions.get('window')
const md5 = require('md5')
import { decrypt, encrypt } from '../tools/AES'
import { KOMA_API_URL, KOMA_API_TOKEN_KEY } from '../tools/constants'
import ImageView from '../components/ImageView'

export let updateMessageList
export let updateChatStatus

export default class ChatBubble extends Component {
  _scrollRef
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  render() {
    const { messages, user, messageText, chat, attachment } = this.state
    const statusIcon = ['time-outline', 'checkmark', 'checkmark-done', 'alert-circle-outline']
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', paddingVertical: 5, backgroundColor: Color.theme }}>
          <TouchableHighlight
            style={{ borderRadius: 40, marginLeft: 5 }}
            onPress={() => {
              this.navigation.goBack()
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 5, paddingHorizontal: 5, borderRadius: 40, backgroundColor: Color.theme }}>
              <Icon name='chevron-back' size={24} color={colorYiq(Color.theme)} />
              <View style={{ width: 35, height: 35, borderRadius: 35 / 2, marginLeft: 5, backgroundColor: colorYiq(Color.theme), overflow: 'hidden', borderWidth: 2, borderColor: colorYiq(Color.theme) }}>
                <Image source={{ uri: user === null ? this.props.route.params.interlocutor.user_picture : user.user_picture }} style={{ width: '100%', height: '100%', }} resizeMode='cover' />
              </View>
            </View>
          </TouchableHighlight>
          <View style={{ flex: 1, paddingLeft: 10, paddingRight: 20, justifyContent: 'center' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, textAlignVertical: 'center', color: colorYiq(Color.theme) }}>{user === null ? this.props.route.params.interlocutor.user_name : user.user_name}</Text>
          </View>
        </View>
        {/* <Header title={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View>
              <Text style={{ fontWeight: 'bold',color: colorYiq(Color.theme),fontSize: 16,lineHeight: 22 }}>{user === null ? this.props.route.params.interlocutor.user_name : user.user_name}</Text>
            </View>
          </View>
        } color={Color.theme} navigation={this.navigation} /> */}
        <ScrollView
          ref={ref => this._scrollRef = ref}
          onContentSizeChange={() => {
            if (this._scrollRef) this._scrollRef.scrollToEnd({ animated: false })
          }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 15, flexDirection: 'column-reverse' }}
        >
          {
            messages.map((a, i) => {
              return (
                <View key={a.message_id}>
                  {
                    (messages[i + 1] && messages[i + 1]['message_time'].substr(0, 10) || '0') !== a.message_time.substr(0, 10) &&
                    <View style={{ marginTop: 15, marginBottom: (messages[i + 1] && messages[i + 1]['user_id'] || '0') === a.user_id ? 10 : 0 }}>
                      <Text style={{ textAlign: 'center', padding: 4, paddingHorizontal: 8, backgroundColor: Color.theme, borderRadius: 20, color: colorYiq(Color.theme), fontSize: 11, alignSelf: 'center', fontWeight: 'bold', letterSpacing: .5 }}>{dateFormat(a.message_time.substr(0, 10))}</Text>
                    </View>
                  }

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: (messages[i + 1] && messages[i + 1]['user_id'] || '0') === a.user_id ? 5 : 15, marginHorizontal: 20, alignSelf: a.user_id === this.props.route.params.user_id ? 'flex-end' : 'flex-start' }}>
                    <TouchableHighlight
                      style={{ borderRadius: 8, minWidth: 80, maxWidth: (width - 40) - 50 }}
                      onPress={() => {
                        if (a.user_id === this.props.route.params.user_id && a.message_status === '3') this._sendMessage(a)
                      }}
                    >
                      <View key={a.message_id} style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: a.user_id === this.props.route.params.user_id ? (a.message_status === '3' ? Color.danger : Color.theme) : Color.grayLight }}>
                        {
                          a.message_attachment_url !== '' &&
                          <ImageView uri={a.message_attachment_url} width={(width - 40) - 70} />
                        }
                        <Text style={{ color: colorYiq(a.user_id === this.props.route.params.user_id ? (a.message_status === '3' ? Color.danger : Color.theme) : Color.grayLight), lineHeight: 22, fontSize: 15 }}>{decrypt(a.message_text)}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginBottom: -4, marginTop: -4 }}>
                          <Text style={{ color: colorYiq(a.user_id === this.props.route.params.user_id ? (a.message_status === '3' ? Color.danger : Color.theme) : Color.grayLight), fontSize: 11, color: colorYiq(a.user_id === this.props.route.params.user_id ? (a.message_status === '3' ? Color.danger : Color.theme) : Color.grayLight), opacity: .65 }}>{a.message_time.substr(11, 5)}</Text>
                          {
                            a.user_id === this.props.route.params.user_id &&
                            <Icon name={statusIcon[parseInt(a.message_status)]} style={{ marginLeft: 5 }} size={11} color={Color.white} />
                          }
                        </View>
                      </View>
                    </TouchableHighlight>
                  </View>

                </View>
              )
            })
          }
        </ScrollView>
        <View style={{ backgroundColor: Color.white, borderTopColor: Color.borderColor, borderTopWidth: 1 }}>
          {
            (chat !== null && chat.chat_status === '0') &&
            <View style={{ backgroundColor: Color.danger, paddingHorizontal: 20, paddingVertical: 5 }}>
              <Text style={{ color: colorYiq(Color.danger), textAlign: 'center' }}>Konsultasi tidak aktif</Text>
              <Text style={{ color: colorYiq(Color.danger), fontSize: 11, textAlign: 'center' }}>Anda dapat menulis pesan setelah diaktifkan oleh dokter</Text>
            </View>
          }
          {
            attachment &&
            <View style={{ maxHeight: width / 4 * 3 }}>
              <ScrollView>
                <Image onLoadEnd={() => { if (this._scrollRef) this._scrollRef.scrollToEnd({ animated: false }) }} source={{ uri: attachment.uri }} resizeMode='contain' style={{ width: width, height: width / attachment.width * attachment.height }} />
              </ScrollView>
              <TouchableOpacity
                onPress={() => {
                  this.setState({
                    attachment: null
                  })
                }}
                style={{ position: 'absolute', top: 20, right: 20 }}
              >
                <View style={{ width: 25, height: 25, backgroundColor: 'rgba(0,0,0,.5)', borderRadius: 25 / 2, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name='close' size={18} color={Color.white} />
                </View>
              </TouchableOpacity>
            </View>
          }
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingVertical: 10, paddingHorizontal: 15 }}>
            <TouchableOpacity
              onPress={() => { this.navigation.navigate('CameraRoll', { onPickImage: this._onPickImage }) }}
              style={{ width: 38, height: 38, borderRadius: 38 / 2, backgroundColor: chat === null || chat.chat_status === '0' ? Color.grayLight : Color.danger, alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name='camera' color={chat === null || chat.chat_status === '0' ? Color.grayDark : colorYiq(Color.danger)} style={{ marginHorizontal: 5 }} size={18} />
            </TouchableOpacity>
            <Input disabled={chat === null || chat.chat_status === '0'} multiline placeholder='Tulis pesan' value={messageText} onChangeText={text => { this.setState({ messageText: text }) }} containerStyle={{ marginBottom: 0, flex: 1, marginHorizontal: 5 }} textInputStyle={{ paddingVertical: 4, paddingHorizontal: 10, height: null, textAlignVertical: 'center', maxHeight: 70 }} inputableStyle={{ borderRadius: 38 / 2 }} />
            <TouchableOpacity
              onPress={() => {
                if (!(chat === null || chat.chat_status === '0' || (attachment === null && messageText === ''))) this._sendMessage()
              }}
              style={{ width: 38, height: 38, borderRadius: 38 / 2, backgroundColor: chat === null || chat.chat_status === '0' || (attachment === null && messageText === '') ? Color.grayLight : Color.theme, alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name='send' color={chat === null || chat.chat_status === '0' || (attachment === null && messageText === '') ? Color.grayDark : colorYiq(Color.theme)} style={{ marginHorizontal: 5 }} size={18} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  _onPickImage = e => {
    this.setState({
      attachment: e
    })
  }

  _appStateChange = (e) => {
    if (e === 'active') this._getMessageFromServer()
  }

  _subscriptionAppState
  _subscriptionKeyboardDidShow
  _subscriptionKeyboardDidHide
  componentDidMount() {
    this._subscriptionAppState = AppState.addEventListener('change', this._appStateChange)
    BackHandler.addEventListener('hardwareBackPress', this._backHandler)
    StatusBar.setBackgroundColor(this.statusBar.backgroundColor, this.statusBar.isAnimation)
    StatusBar.setBarStyle(this.statusBar.barStyle, this.statusBar.isAnimation)
    StatusBar.setTranslucent(this.statusBar.isTranslucent)
    this._subscriptionKeyboardDidShow = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow)
    this._subscriptionKeyboardDidHide = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide)
    const { route } = this.props
    if (route.params) {
      const { backHandlerPrevScreen } = route.params
      if (backHandlerPrevScreen) backHandlerPrevScreen.remove()
    }
    this._getMessageFromLocal(this._getMessageFromServer)
  }

  componentWillUnmount() {
    if (this._subscriptionAppState) this._subscriptionAppState.remove()
    if (this._subscriptionKeyboardDidShow) this._subscriptionKeyboardDidShow.remove()
    if (this._subscriptionKeyboardDidHide) this._subscriptionKeyboardDidHide.remove()
    BackHandler.removeEventListener('hardwareBackPress', this._backHandler)
    const { route } = this.props
    if (route.params) {
      const { setStatusBarStyle, backHandlerPrevScreen } = route.params
      if (setStatusBarStyle) setStatusBarStyle()
      if (backHandlerPrevScreen) backHandlerPrevScreen.add()
    }
    this._pendingPromise.map(p => {
      this._removePromise(p)
    })
  }

  _keyboardDidShow = () => {
    if (this._scrollRef) this._scrollRef.scrollToEnd({
      animated: false
    })
  }

  _keyboardDidHide = () => {
    if (this._scrollRef) this._scrollRef.scrollToEnd({
      animated: false
    })
  }

  _getMessageFromLocal = (finisher = null) => {
    const chat_id = this.props.route.params.chat_id
    AsyncStorage.getItem('messages_' + chat_id, (e, rs) => {
      if (!e && rs !== null) {
        rs = JSON.parse(rs)
        this.setState({
          messages: rs
        })
      }
      if (finisher !== null && typeof finisher === 'function') finisher()
    })
  }

  _getMessageFromServer = () => {
    const wrappedPromise = cancellablePromise(this._promiseMessage())
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        if (res.status) {
          this.setState({
            messages: res.data.messages,
            user: res.data.user,
            chat: res.data.chat
          }, () => {
            const chat_id = this.props.route.params.chat_id
            AsyncStorage.setItem('messages_' + chat_id, JSON.stringify(res.data.messages))
            AsyncStorage.getItem('unseen_chats', (e, rs) => {
              if (!e && rs !== null) {
                rs = JSON.parse(rs)
                let index = rs.map(a => a.chat_id).indexOf(chat_id)
                if (index > -1) {
                  rs[index] = {
                    ...rs[index],
                    unseen_count: '0'
                  }
                }
                AsyncStorage.setItem('unseen_chats', JSON.stringify(rs), e => {
                  if (!e) {
                    if (updateUnseenChat && typeof updateUnseenChat === 'function') updateUnseenChat()
                  }
                })
              }
            })
          })
        }
      })
      .then(() => {
        this._removePromise(wrappedPromise)
      })
      .catch(e => {
        console.log(e)
      })
  }

  _promiseMessage = () => {
    const chat_id = this.props.route.params.chat_id
    const user_id = this.props.route.params.user_id
    return new Promise((resolve, reject) => {
      fetch(`${KOMA_API_URL}home/messages?chat_id=${chat_id}&user_id=${user_id}`, {
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

  _sendMessage = (message = null) => {
    let id, nowstr
    if (message === null) {
      let now = new Date()
      let ynow = now.getFullYear()
      let mnow = ('0' + (now.getMonth() + 1)).slice(-2)
      let dnow = ('0' + now.getDate()).slice(-2)
      let hnow = ('0' + now.getHours()).slice(-2)
      let inow = ('0' + now.getMinutes()).slice(-2)
      let snow = ('0' + now.getSeconds()).slice(-2)
      nowstr = ynow + '-' + mnow + '-' + dnow + ' ' + hnow + ':' + inow + ':' + snow
      id = md5(new Date().getTime() + this.props.route.params.user_id)
      this.setState({
        messageText: '',
        attachment: null,
        messages: [
          {
            message_id: id,
            message_text: encrypt(this.state.messageText),
            message_attachment_url: this.state.attachment ? this.state.attachment.uri : '',
            message_attachment_type: this.state.attachment ? this.state.attachment.type : '',
            message_time: nowstr,
            message_status: "0",
            user_id: this.props.route.params.user_id
          },
          ...this.state.messages
        ]
      })
    } else {
      const { messages } = this.state
      id = message.message_id
      nowstr = message.message_time
      const index = messages.map(a => a.message_id).indexOf(id)
      messages[index] = {
        ...messages[index],
        message_status: "0"
      }
      this.setState({ messages })
    }

    const wrappedPromise = cancellablePromise(this._promiseSendAMessage(id, nowstr, message))
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        let messages = this.state.messages
        let index_msg = messages.map(a => a.message_id).indexOf(res.data.message.message_id)
        if (res.status) {
          messages[index_msg] = {
            ...messages[index_msg],
            message_status: '1'
          }
          AsyncStorage.setItem('messages_' + this.props.route.params.chat_id, JSON.stringify(messages))
          AsyncStorage.getItem('chats', (e, chats) => {
            chats = chats === null ? [] : JSON.parse(chats)
            let index_chat = chats.map(a => a.chat_id).indexOf(this.props.route.params.chat_id)
            chats[index_chat] = {
              ...chats[index_chat],
              message_text: res.data.message.message_text,
              message_time: res.data.message.message_time,
              message_attachment_url: res.data.message.message_attachment_url,
              message_attachment_type: res.data.message.message_attachment_type,
              sender_user_id: res.data.message.sender_user_id
            }
            AsyncStorage.setItem('chats', JSON.stringify(chats), e => {
              if (!e && updateChat && typeof updateChat === 'function') updateChat()
            })
          })
        } else {
          messages[index_msg] = {
            ...messages[index_msg],
            message_status: '3'
          }
          ToastAndroid.show(res.msg, ToastAndroid.SHORT)
        }
        this.setState({ messages })
      })
      .then(() => {
        this._removePromise(wrappedPromise)
      })
      .catch(e => {
        ToastAndroid.show('Failed to send message', ToastAndroid.SHORT)
        let messages = this.state.messages
        let index_msg = messages.map(a => a.message_id).indexOf(id)
        messages[index_msg] = {
          ...messages[index_msg],
          message_status: '3'
        }
        this.setState({ messages })
      })

  }

  _promiseSendAMessage = (message_id, message_time, message = null) => {
    const { attachment } = this.state
    let formData = new FormData()
    formData.append('message_id', message_id)
    formData.append('send_to_user_id', this.props.route.params.interlocutor.user_id)
    formData.append('user_id', this.props.route.params.user_id)
    formData.append('message_time', message_time)
    formData.append('message_text', message !== null ? message.message_text : encrypt(this.state.messageText))
    formData.append('message_text_plain', message !== null ? decrypt(message.message_text) : this.state.messageText)
    formData.append('message_attachment_url', attachment ? attachment.base64 : '')
    formData.append('message_attachment_type', attachment ? attachment.type : '')
    return new Promise((resolve, reject) => {
      fetch(`${KOMA_API_URL}home/send`, {
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

  _updateChatStatus = (data) => {
    const {chat} = this.state
    if(chat.chat_id !== data.chat_id) return true
    this.setState({
      chat: {
        ...chat,
        chat_status: data.chat_status
      }
    }, () => {
      ToastAndroid.show(data.chat_status === '1' ? 'Dokter telah mengaktifkan sesi konsultasi' : 'Dokter menon-aktifkan sesi konsultasi', ToastAndroid.SHORT)
    })
    AsyncStorage.getItem('chats', (e, chats) => {
      chats = chats === null ? [] : JSON.parse(chats)
      let index_chat = chats.map(a => a.chat_id).indexOf(data.chat_id)
      if (index_chat < 0) return true
      chats[index_chat] = {
        ...chats[index_chat],
        chat_status: data.chat_status
      }
      AsyncStorage.setItem('chats', JSON.stringify(chats), e => {
        if (!e && updateChat && typeof updateChat === 'function') updateChat()
      })
    })
  }

  _backHandler = () => {
    return false
  }

  constructor(props) {
    super(props)
    updateMessageList = this._getMessageFromServer
    updateChatStatus = this._updateChatStatus
    this.state = {
      user: null,
      messages: [],
      messageText: '',
      chat: null,
      attachment: null
    }
    this.statusBar = {
      backgroundColor: Color.theme,
      barStyle: colorYiq(Color.theme, true) ? 'dark-content' : 'light-content',
      isAnimation: true,
      isTranslucent: false
    }
    this.navigation = {
      ...this.props.navigation,
      navigate: (screen, params = {}) => {
        this.props.navigation.navigate(screen, {
          ...params,
          setStatusBarStyle: () => {
            StatusBar.setBackgroundColor(this.statusBar.backgroundColor, this.statusBar.isAnimation)
            StatusBar.setBarStyle(this.statusBar.barStyle, this.statusBar.isAnimation)
            StatusBar.setTranslucent(this.statusBar.isTranslucent)
          },
          backHandlerPrevScreen: {
            add: () => {
              BackHandler.addEventListener('hardwareBackPress', this._backHandler)
            },
            remove: () => {
              BackHandler.removeEventListener('hardwareBackPress', this._backHandler)
            }
          }
        })
      }
    }
  }
}