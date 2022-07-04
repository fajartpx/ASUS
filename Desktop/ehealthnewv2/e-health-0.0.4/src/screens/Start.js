import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, Dimensions, TouchableHighlight, Linking, Image, ScrollView } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Color, { colorYiq, LightenDarkenColor } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
import Header from '../components/Header'
import Button from '../components/Button'
const { width, height } = Dimensions.get('window')

export default class Start extends Component {
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: Color.theme }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: width - 60 }}>
          <View style={{ marginTop: 60, marginBottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Image source={require('../images/logo.png')} resizeMode='contain' style={{ width: 80, height: 80, marginBottom: 15 }} />
            <Text style={{ textAlign: 'center', fontWeight: '200', fontSize: 26, color: colorYiq(Color.theme) }}>AKU<Text style={{ fontWeight: 'bold', fontSize: 26, color: Color.white }}>SIGAP</Text></Text>
            <Text style={{ textAlign: 'center', fontWeight: '100', fontSize: 14, color: colorYiq(Color.theme) }}>Aplikasi Kuansing Sehat Inovatif Siaga dan Pelayanan Prima</Text>
          </View>
          <Image source={require('../images/overlay.png')} resizeMode='contain' style={{ width: width, height: width / 478 * 71, position: 'absolute', bottom: -1 }} />
          <Image source={require('../images/open.png')} resizeMode='cover' style={{ width: width + 40, height: width, marginLeft: -20, position: 'absolute', bottom: -60 }} />
        </ScrollView>
        <View style={{ paddingHorizontal: 20, paddingVertical: 20, backgroundColor: Color.white, marginBottom: -15 }}>
          <Button color={Color.theme} onPress={() => { this.navigation.navigate('LoginForm') }} title={<Text style={{ color: Color.white, fontSize: 14 }}>MASUK</Text>} />
          <Button color={Color.grayLighter} onPress={() => { this.navigation.navigate('RegisterUserForm') }} title={<Text style={{ color: Color.black, fontSize: 16, fontWeight: '300' }}>Belum punya akun?<Text style={{ color: Color.black, fontSize: 16, fontWeight:"bold" }}> Daftar</Text> </Text>} />

        </View>
      </View>
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

  constructor(props) {
    super(props)
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