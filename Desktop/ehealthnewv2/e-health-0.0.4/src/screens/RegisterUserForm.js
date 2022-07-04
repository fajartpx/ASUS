import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, Dimensions, TouchableHighlight, Linking, Image, ScrollView, TextInput, ActivityIndicator, ToastAndroid } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Color, { colorYiq, LightenDarkenColor } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
import Wrapper from '../components/Wrapper'
import Input, { CalendarPicker, PickOne } from '../components/Input'
import Select from '../components/Select'
import { KOMA_API_TOKEN_KEY, KOMA_API_URL, TIMTIK_API_URL } from '../tools/constants'
const { width, height } = Dimensions.get('window')
import DeviceInfo from 'react-native-device-info'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { phoneNumberFormat, requestOtp } from '../components/Otp'
import { updateChatFromServer, updateFCM } from '../../App'
import { updateUserLoggedIn } from '../../NavigationServices'

export default class RegisterUserForm extends Component {
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  render() {
    const { selectedDate, genderValue, villageData, villageFetchStatus, personName, relationNumber, idNumber, personStatus, villageSelected, phoneNumber, loadingRegisterFetch } = this.state
    const villageData_ = villageData.map(a => {
      return {
        value: a.id_desa,
        title: a.name
      }
    })
    return (
      <Wrapper paper header themeColor={Color.theme} navigation={this.navigation} title='Daftar'
        afterContent={
          <View style={{ paddingHorizontal: 20, paddingVertical: 15, borderTopColor: Color.borderColor, borderTopWidth: 1 }}>
            <TouchableHighlight
              onPress={() => {
                if (loadingRegisterFetch) return true
                if (personName === '') return ToastAndroid.show('Mohon isi nama Anda', ToastAndroid.SHORT)
                if (relationNumber === '') return ToastAndroid.show('Mohon isi nomor KK Anda', ToastAndroid.SHORT)
                if (relationNumber.length < 16) return ToastAndroid.show('Nomor KK anda kurang dari 16 digit', ToastAndroid.SHORT)
                if (relationNumber.length > 16) return ToastAndroid.show('Nomor KK tidak valid', ToastAndroid.SHORT)
                if (idNumber === '') return ToastAndroid.show('Mohon isi nomor NIK KTP Anda', ToastAndroid.SHORT)
                if (idNumber.length < 16 ) return ToastAndroid.show('Nomor NIK anda kurang dari 16 digit', ToastAndroid.SHORT)
                if (idNumber.length > 16) return ToastAndroid.show('Nomor NIK tidak valid', ToastAndroid.SHORT)
                if (personStatus === '') return ToastAndroid.show('Mohon pilih status Anda di keluarga', ToastAndroid.SHORT)
                if (selectedDate === '') return ToastAndroid.show('Mohon isi tanggal lahir Anda', ToastAndroid.SHORT)
                if (villageSelected === '') return ToastAndroid.show('Mohon pilih desa tempat tinggal Anda', ToastAndroid.SHORT)
                if (genderValue <= 0) return ToastAndroid.show('Mohon pilih jenis kelamin Anda', ToastAndroid.SHORT)
                if (phoneNumber === '') return ToastAndroid.show('Mohon isi nomor telepon Anda', ToastAndroid.SHORT)

                requestOtp({
                  phoneNumber,
                  requestedForExistNumber: false,
                  onRequestBegin: () => {
                    this.setState({
                      loadingRegisterFetch: true
                    })
                  },
                  onSuccess: this._onRegister,
                  onCancel: () => {
                    this.setState({
                      loadingRegisterFetch: false
                    })
                  }
                })
              }}
              style={{ borderRadius: 20 }}
            >
              <View style={{ height: 60, justifyContent: 'center', paddingHorizontal: 20, backgroundColor: Color.theme, borderRadius: 20 }}>
                {
                  loadingRegisterFetch &&
                  <ActivityIndicator size={25} color={colorYiq(Color.theme)} />
                  ||
                  <Text style={{ textAlign: 'center', color: colorYiq(Color.theme), fontSize: 18, fontWeight: 'bold' }}>Daftar</Text>
                }
              </View>
            </TouchableHighlight>
          </View>
        }
      >
        <View style={{ padding: 20 }}>
          <Input placeholder='Masukkan nama sesuai KTP' value={personName} onChangeText={personName => { this.setState({ personName }) }} label='Nama Lengkap' />
          <Input keyboardType='number-pad' placeholder='Masukkan No KK' value={relationNumber} onChangeText={relationNumber => { this.setState({ relationNumber: relationNumber.replace(/[^0-9]/g, '') }) }} label='Nomor Kartu Keluarga' />
          <Input keyboardType='number-pad' placeholder='Masukkan NIK' value={idNumber} onChangeText={idNumber => { this.setState({ idNumber: idNumber.replace(/[^0-9]/g, '') }) }} label='Nomor Induk Kependudukan' />
          <Select label='Status Dalam Keluarga' color={Color.success} items={[
            { value: 1, title: 'Kepala Keluarga' },
            { value: 2, title: 'Istri' },
            { value: 3, title: 'Anak' },
            { value: 4, title: 'Famili Lain' },
          ]} placeholder='Status Dalam Keluarga' value={personStatus} onChangeValue={e => { this.setState({ personStatus: e.value }) }} selectionStyle={{ borderRadius: 8 }} />
          <CalendarPicker label='Tanggal Lahir' selectedDate={selectedDate} onDayPress={e => { this.setState({ selectedDate: e.dateString }) }} placeholder='Tanggal Lahir' />
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginHorizontal: -5 }}>
            <View style={{ flex: 1, paddingHorizontal: 5 }}>
              <Select label='Desa Tempat Tinggal' value={villageSelected} color={Color.success} items={villageData_} placeholder='Desa' onChangeValue={e => { this.setState({ villageSelected: e.value }) }} selectionStyle={{ borderRadius: 8 }} />
            </View>
            {
              villageFetchStatus !== 'READY' &&
              <View style={{ marginBottom: 15, padding: 10, paddingHorizontal: 5 }}>
                {
                  villageFetchStatus === 'FETCHING' &&
                  <ActivityIndicator size={30} color={Color.theme} />
                  ||
                  villageFetchStatus === 'ERROR' &&
                  <Icon onPress={this._getVillage} size={30} name='alert-circle-outline' color={Color.danger} />
                }
              </View>
            }
          </View>
          <PickOne label='Jenis Kelamin' color={Color.success} onChange={(e) => {
            this.setState({
              genderValue: e.value
            })
          }} value={genderValue} items={[{ 'value': 1, 'title': 'Laki-laki' }, { 'value': 2, 'title': 'Perempuan' }]} />
          <Input
            prepend={
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, margin: 5, marginRight: 0, backgroundColor: Color.grayLighter, borderRadius: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>+62</Text>
              </View>
            }
            keyboardType='number-pad'
            value={phoneNumber}
            onChangeText={phoneNumber => { this.setState({ phoneNumber: phoneNumber.replace(/[^0-9]/g, '') }) }}
            textInputStyle={{ paddingLeft: 15 }}
            placeholder='Nomor Ponsel' label='Nomor Ponsel' />
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
    this._getVillage()
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

  _onRegister = async () => {
    const { personName, relationNumber, idNumber, personStatus, selectedDate, villageSelected, genderValue, phoneNumber } = this.state
    this.setState({
      loadingRegisterFetch: true
    })

    const fcmToken = await AsyncStorage.getItem('fcm_token')

    if (!fcmToken)
      return ToastAndroid.show('Terjadi kesalahan, coba lagi', ToastAndroid.SHORT)

    const bodyForm = new FormData()
    bodyForm.append('user_name', personName)
    bodyForm.append('user_relation_number', relationNumber)
    bodyForm.append('user_nik', idNumber)
    bodyForm.append('user_relation_status', personStatus)
    bodyForm.append('user_person_birthdate', selectedDate)
    bodyForm.append('id_desa', villageSelected)
    bodyForm.append('user_person_gender', genderValue)
    bodyForm.append('user_phone', phoneNumberFormat(phoneNumber))
    bodyForm.append('user_device_key', DeviceInfo.getUniqueId())
    bodyForm.append('user_android_fcm_token', JSON.parse(fcmToken).token)

    const wrappedPromise = cancellablePromise(this._promiseRegister(bodyForm))
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        if (res.status_string === 'OK')
          return AsyncStorage.setItem('user_logged_in', JSON.stringify(res.data), e => {
            if (!e) updateFCM()
            if (!e) updateUserLoggedIn()
            if (!e) updateChatFromServer()
            if (!e) ToastAndroid.show('Selamat datang', ToastAndroid.SHORT)
          })
        ToastAndroid.show('Gagal membuat akun', ToastAndroid.SHORT)
      })
      .then(() => {
        this._removePromise(wrappedPromise)
        this.setState({
          loadingRegisterFetch: false
        })
      })
      .catch(e => {
        ToastAndroid.show('Gagal membuat akun', ToastAndroid.SHORT)
        this.setState({
          loadingRegisterFetch: false
        })
      })

  }

  _promiseRegister = (body) => {
    return new Promise((resolve, reject) => {
      fetch(`${TIMTIK_API_URL}auth/register`, {
        method: 'POST',
        body
      })
        .then(res => res.json())
        .then(resolve)
        .catch(reject)
    })
  }

  _getVillage = () => {
    this.setState({
      villageFetchStatus: 'FETCHING'
    })
    const wrappedPromise = cancellablePromise(this._promiseVillage())
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        if (res.status) {
          this.setState({
            villageFetchStatus: 'READY',
            villageData: res.data
          })
        } else {
          this.setState({
            villageFetchStatus: 'ERROR'
          })
        }
      })
      .then(() => {
        this._removePromise(wrappedPromise)
      })
      .catch(e => {
        this.setState({
          villageFetchStatus: 'ERROR'
        })
      })
  }

  _promiseVillage = () => {
    return new Promise((resolve, reject) => {
      fetch(`${KOMA_API_URL}village`, {
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

  _backHandler = () => {
    return false
  }

  constructor(props) {
    super(props)
    this.state = {
      selectedDate: '',
      genderValue: 0,
      villageData: [],
      villageFetchStatus: 'FETCHING',
      villageSelected: '',
      personName: '',
      relationNumber: '',
      idNumber: '',
      personStatus: '',
      phoneNumber: '',
      loadingRegisterFetch: false
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