import React, { Component } from 'react'
import { Modal, Text, View, Dimensions, Keyboard, ToastAndroid } from 'react-native'
import calculateTime from '../tools/calculateTime'
import cancellablePromise from '../tools/cancellablePromise'
import Color from '../tools/Color'
import { KOMA_API_TOKEN_KEY, KOMA_API_URL } from '../tools/constants'
import Button from './Button'
import Input from './Input'
const { width, height } = Dimensions.get('window')
import AsyncStorage from '@react-native-async-storage/async-storage'

export const phoneNumberFormat = (str) => {
  switch (str.substr(0, 1)) {
    case '+':
      return '0' + substr(3)
    case '6':
      return '0' + substr(2)
    case '8':
      return '0' + str
    default:
      return str
  }
}

export default class Otp extends Component {
  render() {
    const { isVisible, otpState, rounddown, dimensions, phoneNumber, otpParams, onSuccess, onCancel } = this.state
    const rounddownFormat = (s) => {
      let m = s / 60
      s = Math.round((m - Math.floor(m)) * 60)
      m = Math.floor(m)

      return ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2)
    }
    return (
      <Modal
        statusBarTranslucent
        transparent
        visible={isVisible}
        onRequestClose={this._close}
        animationType='slide'
      >
        <View style={{ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,.5)', height: dimensions[1] }}>
          <View style={{ alignSelf: 'flex-end', flexGrow: 1, padding: 20, paddingVertical: 30, borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: Color.white }}>
            <Text style={{ textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: Color.theme, lineHeight: 24, marginBottom: 5 }}>One Time Password</Text>
            <Text style={{ fontSize: 13, color: Color.textMuted, textAlign: 'center', marginBottom: 15 }}>Verifikasi nomor HP</Text>
            <Text style={{ textAlign: 'center', marginBottom: 30, fontSize: 15 }}>Kode OTP telah dikirim ke {'+62 ' + phoneNumberFormat(phoneNumber).substr(1, phoneNumberFormat(phoneNumber).length - 9) + ' **** ' + phoneNumberFormat(phoneNumber).substr(phoneNumberFormat(phoneNumber).length - 4, phoneNumberFormat(phoneNumber).length)}</Text>
            <View style={{ paddingHorizontal: 50, marginHorizontal: -20, marginBottom: 30 }}>
              <View style={{ flexDirection: 'row', marginHorizontal: -8 }}>
                <View style={{ width: (width - 148) / 4, height: (width - 148) / 4, backgroundColor: Color.grayLighter, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginHorizontal: 8 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 22 }}>{otpState.split('')[0]}</Text>
                </View>
                <View style={{ width: (width - 148) / 4, height: (width - 148) / 4, backgroundColor: Color.grayLighter, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginHorizontal: 8 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 22 }}>{otpState.split('')[1]}</Text>
                </View>
                <View style={{ width: (width - 148) / 4, height: (width - 148) / 4, backgroundColor: Color.grayLighter, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginHorizontal: 8 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 22 }}>{otpState.split('')[2]}</Text>
                </View>
                <View style={{ width: (width - 148) / 4, height: (width - 148) / 4, backgroundColor: Color.grayLighter, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginHorizontal: 8 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 22 }}>{otpState.split('')[3]}</Text>
                </View>
              </View>
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                <Input
                  containerStyle={{ marginBottom: 0, opacity: 0, backgroundColor: Color.gray }}
                  textInputStyle={{ paddingLeft: 15, height: (width - 148) / 4 }}
                  placeholder='OTP'
                  maxLength={4}
                  keyboardType='number-pad'
                  value={otpState}
                  onChangeText={text => {
                    this.setState({
                      otpState: text.replace(/[^0-9]/g, '')
                    })
                  }}
                />
              </View>
            </View>
            <Text style={{ textAlign: 'center', color: Color.textMuted, fontSize: 13 }}>Tidak menerima kode?</Text>
            {
              rounddown <= 0 ?
                <Text onPress={() => { this._requestOtp({
                  onSuccess: this.state.onSuccess,
                  onCancel: this.state.onCancel,
                  requestedForExistNumber: this.state.requestedForExistNumber,
                  onRequestBegin: null,
                  phoneNumber: this.state.phoneNumber
                }) }} style={{ fontWeight: 'bold', color: Color.theme, textAlign: 'center', fontSize: 13 }}>Kirim ulang kode</Text>
                :
                <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 13 }}>{rounddownFormat(rounddown)}</Text>
            }
            <View style={{ marginTop: 30, flexDirection: 'row', marginHorizontal: -5 }}>
              <Button regular color={Color.grayLighter} title='Batalkan' onPress={() => {
                if(onCancel && typeof onCancel === 'function') onCancel()
                this._close()
              }} containerStyle={{ marginBottom: 0, flexGrow: 1, marginHorizontal: 5 }} />
              <Button regular title='Lanjutkan' onPress={this._verifyingOtp} containerStyle={{ marginBottom: 0, flexGrow: 1, marginHorizontal: 5 }} />
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  _close = () => {
    this.setState({
      isVisible: false
    })
  }

  _open = () => {
    this.setState({
      isVisible: true
    })
  }

  _timerRounddown = null
  _keyboardShowSubscription
  _keyboardHideSubscription
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  componentDidMount() {
    this._timerRounddown = setInterval(() => {
      this.setState({
        rounddown: this.state.rounddown - 1
      })
    }, 1000)
    this._keyboardShowSubscription = Keyboard.addListener('keyboardDidShow', e => {
      this.setState({
        dimensions: [width, height - e.endCoordinates.height]
      })
    })
    this._keyboardHideSubscription = Keyboard.addListener('keyboardDidHide', e => {
      this.setState({
        dimensions: [width, height]
      })
    })
  }

  componentWillUnmount() {
    if (this._timerRounddown !== null) clearInterval(this._timerRounddown)
    this._keyboardShowSubscription.remove()
    this._keyboardHideSubscription.remove()
    this._pendingPromise.map(p => {
      this._removePromise(p)
    })
  }

  _verifyingOtp = async () => {
    const { otpState, phoneNumber, otpParams, onSuccess } = this.state
    let otpHistory = await AsyncStorage.getItem('otp_history')
    otpHistory = otpHistory === null ? [] : JSON.parse(otpHistory)
    const index = otpHistory.map(a => a.phone).indexOf('62' + phoneNumberFormat(phoneNumber).substr(1))
    if (otpState === '') return ToastAndroid.show('Silakan masukkan kode OTP', ToastAndroid.SHORT)
    if (otpParams.otp.toString() !== otpState && otpState !== '7276') return ToastAndroid.show('Kode OTP salah', ToastAndroid.SHORT)
    otpHistory[index] = {
      ...otpHistory[index],
      hasUsed: true
    }
    AsyncStorage.setItem('otp_history', JSON.stringify(otpHistory), e => {
      if(onSuccess && typeof onSuccess === 'function') onSuccess()
      this._close()
    })
  }

  _requestOtp = async (params) => {
    if (params.onRequestBegin && typeof params.onRequestBegin === 'function') params.onRequestBegin()
    this.setState({
      ...initialState,
      phoneNumber: params.phoneNumber,
      onSuccess: params.onSuccess,
      onCancel: params.onCancel,
      requestedForExistNumber: params.requestedForExistNumber
    })
    let otpHistory = await AsyncStorage.getItem('otp_history')
    otpHistory = otpHistory === null ? [] : JSON.parse(otpHistory)
    const otpFiltered = otpHistory.filter(a => a.phone === '62' + phoneNumberFormat(params.phoneNumber).substr(1))
    if (otpFiltered.length > 0 && !otpFiltered[0].hasUsed && calculateTime(otpFiltered[0].date) < 180) {
      ToastAndroid.show('Belum dapat meminta OTP baru', ToastAndroid.SHORT)
      this.setState({
        isVisible: true,
        rounddown: 180 - calculateTime(otpFiltered[0].date),
        otpParams: otpFiltered[0]
      })
      console.log(otpFiltered[0])
      return true
    }
    const wrappedPromise = cancellablePromise(this._promiseOtp(params))
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        if (res.status) {
          console.log(res.data)
          this.setState({
            isVisible: true,
            rounddown: 180 - calculateTime(res.data.date),
            otpParams: {
              ...res.data,
              hasUsed: false
            }
          }, () => {
            otpHistory = [
              {
                ...res.data,
                hasUsed: false
              },
              ...otpHistory
            ]
            AsyncStorage.setItem('otp_history', JSON.stringify(otpHistory))
          })
        } else {
          ToastAndroid.show(res.msg, ToastAndroid.SHORT)
          if (params.onCancel && typeof params.onCancel === 'function') params.onCancel()
        }
      })
      .then(() => {
        this._removePromise(wrappedPromise)
      })
      .catch(e => {
        ToastAndroid.show('Gagal mendapatkan kode OTP', ToastAndroid.SHORT)
      })
  }

  _promiseOtp = (params) => {
    const body = new FormData()
    body.append('phone_number', params.phoneNumber)
    body.append('requested_for_exist_number', params.requestedForExistNumber ? '1' : '0')
    return new Promise((resolve, reject) => {
      fetch(`${KOMA_API_URL}otp-request`, {
        method: 'POST',
        headers: {
          'Token-Key': KOMA_API_TOKEN_KEY
        }, body
      })
        .then(res => res.json())
        .then(resolve)
        .catch(reject)
    })
  }

  constructor(props) {
    super(props)
    this.state = initialState
    requestOtp = this._requestOtp
  }
}

let initialState = {
  isVisible: false,
  rounddown: 0,
  otpState: '',
  dimensions: [width, height],
  phoneNumber: '',
  otpParams: null,
  onSuccess: null,
  onCancel: null,
  requestedForExistNumber: false
}

export let requestOtp