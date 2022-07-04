import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, Dimensions, TouchableHighlight, Linking, Image, ScrollView, TextInput, TouchableOpacity, ToastAndroid } from 'react-native'
import Color, { colorYiq } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
import Wrapper from '../components/Wrapper'
import Input from '../components/Input'
import ImageInput from '../components/ImageInput'
const { width, height } = Dimensions.get('window')
import { KOMA_API_TOKEN_KEY, KOMA_API_URL } from '../tools/constants'
import { userLoggedIn } from '../../NavigationServices'
const md5 = require('md5')
import { encrypt } from '../tools/AES'
import { updateChatFromServer } from '../../App'

export default class ConsultationForm extends Component {
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  render() {
    const { image, messageText } = this.state
    return (
      <Wrapper paper header themeColor={Color.success} navigation={this.navigation} title='Buat Konsultasi'
        afterContent={
          <View style={{ paddingHorizontal: 20, paddingVertical: 15, borderTopColor: Color.borderColor, borderTopWidth: 1 }}>
            <TouchableHighlight
              onPress={() => {
                if (messageText === '') return ToastAndroid.show('Mohon isi pertanyaan/keluhan Anda terlebih dahulu', ToastAndroid.SHORT)
                this._sendMessage()
              }}
              style={{ borderRadius: 20 }}
            >
              <View style={{ paddingVertical: 15, paddingHorizontal: 20, backgroundColor: Color.success, borderRadius: 20 }}>
                <Text style={{ textAlign: 'center', color: colorYiq(Color.success), fontSize: 18, fontWeight: 'bold' }}>Kirim</Text>
              </View>
            </TouchableHighlight>
          </View>
        }
      >
        <View style={{ padding: 20 }}>
          <Input multiline placeholder='Rincikan Keluhan/Pertanyaan Anda' value={messageText} onChangeText={text => { this.setState({ messageText: text }) }} label={
            <Text style={{ marginBottom: 10 }}>Keluhan/Pertanyaan <Text style={{ color: Color.danger }}>*</Text></Text>
          } />
          <ImageInput value={image} onPickImage={(e) => { this.setState({ image: e }) }} />
          <View>
            <Text style={{ fontSize: 11, color: Color.textMuted, textAlignVertical: 'center', lineHeight: 16 }}>Dengan mengirim pertanyaan, Anda menyetujui <Text onPress={() => { this.navigation.navigate('ConsultationTerms') }} style={{ color: Color.success }}>Syarat & Ketentuan</Text> penggunaan aplikasi E-Health Kuansing</Text>
          </View>
        </View>
      </Wrapper>
    )
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this._backHandler)
    StatusBar.setBackgroundColor(this.statusBar.backgroundColor, this.statusBar.isAnimation)
    StatusBar.setBarStyle(this.statusBar.barStyle, this.statusBar.isAnimation)
    StatusBar.setTranslucent(this.statusBar.isTranslucent)
    const { route } = this.props
    if (route.params) {
      const { backHandlerPrevScreen } = route.params
      if (backHandlerPrevScreen) backHandlerPrevScreen.remove()
    }
  }

  _sendMessage = async () => {
    let id, nowstr
    let now = new Date()
    let ynow = now.getFullYear()
    let mnow = ('0' + (now.getMonth() + 1)).slice(-2)
    let dnow = ('0' + now.getDate()).slice(-2)
    let hnow = ('0' + now.getHours()).slice(-2)
    let inow = ('0' + now.getMinutes()).slice(-2)
    let snow = ('0' + now.getSeconds()).slice(-2)
    nowstr = ynow + '-' + mnow + '-' + dnow + ' ' + hnow + ':' + inow + ':' + snow
    let user = userLoggedIn
    id = md5(new Date().getTime() + user.user_id)
    const wrappedPromise = cancellablePromise(this._promiseSendAMessage(id, nowstr, user))
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        if (res.status) {
          this.navigation.replace('ChatBubble', {
            user_id: user.user_id,
            chat_id: res.data.message.chat_id,
            interlocutor: {
              user_id: res.data.interlocutor.user_id,
              user_name: res.data.interlocutor.user_name,
              user_picture: res.data.interlocutor.user_picture
            }
          })
          if (updateChatFromServer && typeof updateChatFromServer === 'function') updateChatFromServer()
        } else {
          ToastAndroid.show(res.msg, ToastAndroid.SHORT)
        }
      })
      .then(() => {
        this._removePromise(wrappedPromise)
      })
      .catch(e => {
        ToastAndroid.show('Failed to send message', ToastAndroid.SHORT)
      })

  }

  _promiseSendAMessage = (message_id, message_time, user) => {
    const { image, messageText } = this.state
    let formData = new FormData()
    return new Promise((resolve, reject) => {
      formData.append('message_id', message_id)
      formData.append('send_to_user_id', this.props.route.params.send_to_user_id)
      formData.append('user_id', user.user_id)
      formData.append('message_time', message_time)
      formData.append('message_text', encrypt(('Permintaan konsultasi dengan keluhan/pertanyaan: ' + messageText)))
      formData.append('message_text_plain', ('Permintaan konsultasi dengan keluhan/pertanyaan: ' + messageText))
      formData.append('message_attachment_url', image ? image.base64 : '')
      formData.append('message_attachment_type', image ? image.type : '')
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

  componentWillUnmount() {
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

  _backHandler = () => {
    return false
  }

  constructor(props) {
    super(props)
    this.state = {
      messageText: '',
      image: null
    }
    this.statusBar = {
      backgroundColor: Color.success,
      barStyle: 'light-content',
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