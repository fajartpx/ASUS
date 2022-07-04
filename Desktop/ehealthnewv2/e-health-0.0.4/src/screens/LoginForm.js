import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, TouchableHighlight, TouchableOpacity, ToastAndroid, ActivityIndicator } from 'react-native'
import Color, { colorYiq } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
import Wrapper from '../components/Wrapper'
import Input from '../components/Input'
import { KOMA_API_URL, KOMA_API_TOKEN_KEY } from '../tools/constants'
import deviceInfoModule from 'react-native-device-info'
import calculateTime from '../tools/calculateTime'
import { updateUserLoggedIn } from '../../NavigationServices'
import { updateChatFromServer, updateFCM } from '../../App'
import { requestOtp } from '../components/Otp'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default class LoginForm extends Component {
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  render() {
    const { phoneNumber, loading } = this.state
    return (
      <Wrapper paper header themeColor={Color.theme} navigation={this.navigation} title='Masuk'
        afterContent={
          <View style={{ paddingHorizontal: 20, paddingVertical: 15, borderTopColor: Color.borderColor, borderTopWidth: 1 }}>
            <TouchableHighlight
              onPress={() => {
                if(loading) return true
                requestOtp({
                  phoneNumber,
                  requestedForExistNumber: true,
                  onRequestBegin: () => {
                    this.setState({
                      loading: true
                    })
                  },
                  onSuccess: this._loginAct,
                  onCancel: () => {
                    this.setState({
                      loading: false
                    })
                  }
                })
              }}
              style={{ borderRadius: 20 }}
            >
              <View style={{ height: 60, justifyContent: 'center', paddingHorizontal: 20, backgroundColor: Color.theme, borderRadius: 20 }}>
                {
                  loading &&
                  <ActivityIndicator size={25} color={colorYiq(Color.theme)} />
                  ||
                  <Text style={{ textAlign: 'center', color: colorYiq(Color.theme), fontSize: 18, fontWeight: 'bold' }}>Masuk</Text>
                }
              </View>
            </TouchableHighlight>
          </View>
        }
      >
        <View style={{ padding: 20 }}>
          <Text style={{ marginBottom: 20, color: Color.textMuted }}>Masukkan nomor HP kamu yang sudah kamu daftarkan sebelumnya.</Text>
          <View>
            <Input
              prepend={
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, margin: 5, marginRight: 0, backgroundColor: Color.grayLighter, borderRadius: 4 }}>
                  <Text style={{ fontWeight: 'bold' }}>+62</Text>
                </View>
              }
              keyboardType='number-pad'
              textInputStyle={{ paddingLeft: 15 }}
              value={phoneNumber}
              onChangeText={text => this.setState({ phoneNumber: text.replace(/[^0-9]/g, '') })}
              placeholder='8123456789' label='Nomor HP' />
          </View>
          {/* <TouchableOpacity
            style={{ alignSelf: 'flex-end' }}
          >
            <Text style={{ fontWeight: 'bold', fontSize: 12, color: Color.theme }}>Lupa nomor HP?</Text>
          </TouchableOpacity> */}
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

  _loginAct = () => {
    const { phoneNumber } = this.state
    if (phoneNumber === '') return ToastAndroid.show('Silakan masukkan nomor ponsel Anda', ToastAndroid.SHORT)
    const wrappedPromise = cancellablePromise(this._promiseLogin())
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        if (res.status)
          return AsyncStorage.setItem('user_logged_in', JSON.stringify(res.data.user), e => {
            if (!e) updateFCM()
            if (!e) updateUserLoggedIn()
            if (!e) updateChatFromServer()
            if (!e) ToastAndroid.show('Selamat datang', ToastAndroid.SHORT)
          })
        ToastAndroid.show(res.msg || 'Terjadi kesalahan! Coba lagi nanti', ToastAndroid.SHORT)
      })
      .then(() => {
        this._removePromise(wrappedPromise)
        this.setState({
          loading: false
        })
      })
      .catch(e => {
        ToastAndroid.show('Terjadi kesalahan! Coba lagi nanti', ToastAndroid.SHORT)
        this.setState({
          loading: false
        })
      })
  }

  _promiseLogin = () => {
    const { phoneNumber } = this.state
    const formData = new FormData()
    formData.append('user_phone', phoneNumber)
    formData.append('user_type', 'Person')
    formData.append('user_device_key', deviceInfoModule.getUniqueId())
    return new Promise((resolve, reject) => {
      fetch(`${KOMA_API_URL}login`, {
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

  constructor(props) {
    super(props)
    this.state = {
      phoneNumber: '',
      loading: false
    }
    this.statusBar = {
      backgroundColor: Color.theme,
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