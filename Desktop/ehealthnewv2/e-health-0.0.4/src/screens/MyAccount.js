import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, Dimensions, TouchableHighlight, Image, ScrollView, ToastAndroid, ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Color, { colorYiq } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
import Button from '../components/Button'
import Header from '../components/Header'
import AddRelationForm, { OpenForm } from '../components/AddRelationForm'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { updateUserLoggedIn, userLoggedIn } from '../../NavigationServices'
import dateFormat from '../tools/dateFormat'
import { KOMA_API_TOKEN_KEY, KOMA_API_URL } from '../tools/constants'
import EditProfileForm, { OpenForm as OpenEditProfileForm } from '../components/EditProfileForm'
import Clipboard from '@react-native-clipboard/clipboard';
const { width, height } = Dimensions.get('window')
const packageJSON = require('../../package.json')


export default class MyAccount extends Component {
  _focusedSubscription = null
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  render() {
    const { user } = this.state
    return (
      <View style={{ flex: 1 }}>
        <Header title='Akun Saya' color={Color.theme} containerStyle={{ zIndex: 1001 }}
          // additional={
          //   // <TouchableHighlight
          //   //   underlayColor={Color.white}
          //   //   style={{ borderRadius: 4 }}
          //   //   onPress={OpenEditProfileForm}
          //   // >
          //   //   <View style={{ backgroundColor: Color.theme, width: 35, height: 35, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
          //   //     <Icon name='create-outline' size={18} color={colorYiq(Color.theme)} />
          //   //   </View>
          //   // </TouchableHighlight>
          // }
        />
        <ScrollView nestedScrollEnabled
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        >
          <View style={{ height: width / 16 * 6, justifyContent: 'flex-end' }}>
            <View style={{ position: 'absolute', top: 0, left: 0, width: width * 2, height: width / 16 * 9, backgroundColor: Color.theme, transform: [{ rotate: '-15deg' }, { translateX: width / 2 * -1 }, { translateY: width / 16 * 9 / 1.24 * -1 }] }} />
            <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: width / 16 * 9 / 6 }}>
              <View style={{ flex: 1 }}>
                <View style={{ borderWidth: 2, borderColor: Color.white, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
                  {
                    user !== null &&
                    <Text onPress={() => {
                      Clipboard.setString(user.regis_number)
                      ToastAndroid.show('Nomor registrasi tersalin', ToastAndroid.SHORT)
                    }} style={{ color: Color.white, fontWeight: 'bold' }}>{user.regis_number} <Icon color={Color.white} size={16} name='copy-outline' /></Text>
                    ||
                    <ActivityIndicator size={23} style={{ alignSelf: 'flex-start' }} color={Color.white} />
                  }
                  <Text style={{ fontSize: 11, color: Color.white }}>(Nomor registrasi Anda)</Text>
                </View>
              </View>
              <View style={{ width: 95, height: 95, borderRadius: 95 / 2, backgroundColor: Color.white, borderWidth: 4, borderColor: Color.white, backgroundColor: Color.grayLighter, elevation: 10, overflow: 'hidden' }}>
                <Image source={userLoggedIn.user_picture && { uri: userLoggedIn.user_picture } || require('../images/logo-dark.png')} style={{ width: '100%', height: '100%', opacity: !userLoggedIn.user_picture && 0.15 || 1 }} resizeMode='cover' />
              </View>
            </View>
          </View>

          <View style={{ marginHorizontal: 20, marginTop: 15 }}>
            <CardInfo iconName='person-outline' title={userLoggedIn.user_name} />
            <CardInfo iconName='male-female-outline' title={
              user === null &&
              <ActivityIndicator color={Color.theme} style={{ alignSelf: 'flex-start' }} />
              ||
              (user.user_person_gender === '1' && 'Laki-laki' || user.user_person_gender === '2' && 'Perempuan' || '-')
            } />
            <CardInfo iconName='calendar-outline' title={
              user === null &&
              <ActivityIndicator color={Color.theme} style={{ alignSelf: 'flex-start' }} />
              ||
              dateFormat(user.user_person_birthdate)
            } />
            <CardInfo iconName='home-outline' title={
              user === null &&
              <ActivityIndicator color={Color.theme} style={{ alignSelf: 'flex-start' }} />
              ||
              (user.user_person_address || '-')
            } />
            {/* <View style={{ backgroundColor: Color.white, elevation: 10, borderRadius: 4 }}>
              <View style={{ flexDirection: 'row', marginHorizontal: 15, paddingVertical: 10, borderBottomColor: Color.borderColor, borderBottomWidth: 1 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold' }}>Relasi</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon color={Color.theme} name='add-circle' size={22} style={{ textAlignVertical: 'center' }} />
                  <Text onPress={() => { OpenForm() }} style={{ color: Color.theme, textAlignVertical: 'center', fontSize: 13 }}> Tambah Relasi</Text>
                </View>
              </View>
              <View style={{ maxHeight: width / 4 * 2.175 }}>
                <Text style={{ textAlign: 'center', color: Color.textMuted, fontSize: 13, paddingVertical: 20 }}>Belum ada relasi</Text>
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 15,paddingBottom: 5 }}>
                  <ListPerson title='Rosalie Octavius' subtitle='Istri' onPress={() => { console.log('clicked') }} onPressTitle='Lihat Profil' />
                </ScrollView>
              </View>
            </View> */}
          </View>
          <View style={{ marginHorizontal: 20, marginTop: 30 }}>
            <Button regular color={Color.white} buttonStyle={{ borderRadius: 4 }} titleColor={Color.danger} containerStyle={{ marginBottom: 20 }} title='Keluar' onPress={this._logout} />
            <Text style={{ textAlign: 'center', fontSize: 13, color: Color.textMuted, fontWeight: 'bold' }}>E-Health Kuansing {packageJSON.version}</Text>
          </View>
        </ScrollView>
        <AddRelationForm currentBarStyle={this.statusBar.barStyle} />
        <EditProfileForm currentBarStyle={this.statusBar.barStyle} />
      </View>
    )
  }

  _getUserDetails = () => {
    const wrappedPromise = cancellablePromise(this._promiseUserDetails())
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        if (res.status) this.setState({ user: res.data })
      })
      .then(() => {
        this._removePromise(wrappedPromise)
      })
      .catch(e => {
        console.log(e)
      })
  }

  _promiseUserDetails = () => {
    return new Promise((resolve, reject) => {
      fetch(`${KOMA_API_URL}user/${userLoggedIn.user_id}`, {
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

  _logout = () => {
    const wrappedPromise = cancellablePromise(this._promiseLogout())
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        if (res.status) {
          AsyncStorage.removeItem('user_logged_in', e => {
            if (!e) {
              ToastAndroid.show('Sampai jumpa lagi', ToastAndroid.SHORT)
              AsyncStorage.getItem('fcm_token', (e, rs) => {
                if (!e && rs !== null) rs = JSON.parse(rs)
                if (rs !== null) {
                  rs = {
                    ...rs,
                    sent: false
                  }
                  AsyncStorage.setItem('fcm_token', JSON.stringify(rs))
                }
              })
              updateUserLoggedIn()
              AsyncStorage.removeItem('timtik_token')
            }
          })
        } else {
          ToastAndroid.show('Terjadi kesalahan, coba lagi nanti', ToastAndroid.SHORT)
        }
      })
      .then(() => {
        this._removePromise(wrappedPromise)
      })
      .catch(e => {
        ToastAndroid.show('Terjadi kesalahan, coba lagi nanti', ToastAndroid.SHORT)
      })
  }

  _promiseLogout = async () => {
    let user = await AsyncStorage.getItem('user_logged_in')
    if (user !== null) user = JSON.parse(user)
    const body = new FormData()
    body.append('user_id', user.user_id)
    return new Promise((resolve, reject) => {
      fetch(`${KOMA_API_URL}logout`, {
        method: 'POST',
        headers: {
          'Token-Key': KOMA_API_TOKEN_KEY
        },
        body
      })
        .then(res => res.json())
        .then(resolve)
        .catch(reject)
    })
  }

  componentDidMount() {
    this._focusedSubscription = this.navigation.addListener('focus', () => {
      StatusBar.setBackgroundColor(this.statusBar.backgroundColor, this.statusBar.isAnimation)
      StatusBar.setBarStyle(this.statusBar.barStyle, this.statusBar.isAnimation)
      StatusBar.setTranslucent(this.statusBar.isTranslucent)
      this._getUserDetails()
    })
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
    if (this._focusedSubscription !== null) {
      this._focusedSubscription = null
    }
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
      user: null
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

function CardInfo(props) {
  return (
    <View style={{ elevation: 1, backgroundColor: Color.white, flexDirection: 'row', marginBottom: 10, borderRadius: 4, borderRightColor: Color.theme, borderRightWidth: 4 }}>
      <View style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={props.iconName} size={22} color={Color.theme} />
      </View>
      <View style={{ paddingRight: 15, flex: 1, alignSelf: 'center', paddingVertical: 10 }}>
        {
          (props.title && typeof props.title === 'string') &&
          <Text style={{ flexWrap: 'wrap', lineHeight: 22, textTransform: 'uppercase', fontWeight: 'bold' }}>{props.title}</Text>
          ||
          (props.title && typeof props.title === 'object') &&
          props.title
        }
      </View>
    </View>
  )
}

function ListPerson(props) {
  return (
    <View style={{ flexDirection: 'row', marginHorizontal: -6, marginBottom: 10 }}>
      <Icon size={24} name='person' color={Color.theme} style={{ marginHorizontal: 6, marginTop: 6 }} />
      <View style={{ marginHorizontal: 6, flex: 1 }}>
        <Text style={{ fontWeight: 'bold' }}>{props.title}</Text>
        <Text style={{ fontSize: 11, color: Color.textMuted }}>({props.subtitle})</Text>
      </View>
      <View style={{ marginHorizontal: 6 }}>
        {
          props.onPress && typeof props.onPress === 'function' &&
          <Text onPress={props.onPress} style={{ color: Color.theme, fontWeight: 'bold', fontSize: 13, marginTop: 2 }}>{props.onPressTitle || 'Press me'}</Text>
        }
      </View>
    </View>
  )
}