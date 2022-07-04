import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, Dimensions, TouchableHighlight, Linking, Image, Animated } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Color, { colorYiq, LightenDarkenColor } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
import Wrapper from '../components/Wrapper'
const { width, height } = Dimensions.get('window')

export default class NewsDetails extends Component {
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  render() {
    const scrollY = new Animated.Value(0)
    const beforeContentOpacity = scrollY.interpolate({
      inputRange: [0, 55 + StatusBar.currentHeight],
      outputRange: [1, 0],
      extrapolate: 'clamp'
    })
    const titleHeaderOpacity = scrollY.interpolate({
      inputRange: [0, 55 + StatusBar.currentHeight],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    })
    return (
      <Wrapper header paper='in' background='image' themeColor={Color.theme} sourceImage={require('../images/naruto.jpg')} isStatusBarTranslucent={this.statusBar.isTranslucent} navigation={this.navigation} title='78 Pasien COVID-19 Di Kuansing Dinyatakan Sembuh'
        titleHeaderStyle={{ opacity: titleHeaderOpacity }}
        titleHeaderNumberOfLines={1}
        backgroundRatio={[4, 3]}
        beforeContent={
          <Animated.View style={{ height: width / 4 * 3 - (55 + StatusBar.currentHeight), marginBottom: -20, paddingBottom: 20, justifyContent: 'flex-end', paddingHorizontal: 20, opacity: beforeContentOpacity }}>
            <Text style={{ fontSize: 13, color: Color.white, marginBottom: 3 }}>Sel 20 Jul 2021</Text>
            <Text numberOfLines={3} style={{ fontSize: 20, color: Color.white, fontWeight: 'bold', marginBottom: 20 }}>78 Pasien COVID-19 Di Kuansing Dinyatakan Sembuh</Text>
          </Animated.View>
        }
        onScrollListener={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={{padding: 20}}>
          <Text style={{ fontSize: 16, lineHeight: 22, marginBottom: 10 }}>Tim Satgas COVID-19 Kabupaten Kuantan Singingi mendata untuk hari ini, Kamis (12/8/2021) ada sebanyak 78 pasien COVID-19 yang dinyatakan sembuh, sedangkan yang terpapar hanya 16 kasus.</Text>
          <Text style={{ fontSize: 16, lineHeight: 22, marginBottom: 10 }}>Dari 78 pasien yang sembuh tersebut tersebar di beberapa kecamatan; Kuantan Tengah 27 orang, Singingi 12 orang, Singingi Hilir 10 orang, Benai 8 orang, Gunung Toar 7 orang, Inuman 4 orang, Logas Tanah Darat 3 orang, Sentajo Raya 2 orang, Kuantan Mudik 2 orang, Pangean, Hulu Kuantan, dan Pucuk Rantau masing-masing 1 orang.</Text>
          <Text style={{ fontSize: 16, lineHeight: 22, marginBottom: 10 }}>Juru Bicara COVID-19 Kabupaten Kuantan Singingi, Dr. Agus Mandar, S.Sos. M.Si. menjelaskan untuk yang terkonfirmasi COVID-19 sebanyak 16 kasus yang tersebar di beberapa kecamatan diantaranya Kuantan Singingi Hilir 3, Cerenti 2, Kuantan Hilir 2, Sentajo Raya, Kuantan Tengah, Gunung Toar, Hulu Kuantan, Pucuk Rantau, dan Singingi masing-masing 1 kasus.</Text>
          <Text style={{ fontSize: 16, lineHeight: 22, marginBottom: 10 }}>"Total terkonfirmasi COVID-19 hingga saat ini mencapai 5.045 kasus dengan rincian isolasi mandiri 482 orang, rawat di rumah sakit 27 orang, sembuh 4.407 orang dan meninggal dunia 129 orang," kata Agusmandar.</Text>
          <Text style={{ fontSize: 16, lineHeight: 22, marginBottom: 10 }}>Menurut Agusmandar, Untuk suspek dengan total mencapai 249 orang terdiri dari 221 orang dinyatakan sembuh, dan meninggal 28 orang. Sementara untuk spesimen yang diperiksa mencapai 14.731 sampel dengan rincian 9.172 haisl negatif dan 5.559 hasil positif.</Text>
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