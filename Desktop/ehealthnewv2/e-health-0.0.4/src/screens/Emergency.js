import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, Dimensions, TouchableHighlight, Linking, ToastAndroid } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Color, { colorYiq, LightenDarkenColor } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
import Wrapper from '../components/Wrapper'
const { width, height } = Dimensions.get('window')

export default class Emergency extends Component {
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  render() {
    return (
      <Wrapper header paper themeColor={Color.danger} navigation={this.navigation} title='Darurat'>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20 }}>
          <Icon name='hospital-symbol' size={96} style={{marginBottom: 8}} color={Color.danger} />
          <Text style={{textAlign: 'center', fontSize: 36, fontWeight: 'bold', marginBottom: 4}}>Telepon Darurat</Text>
          <Text style={{textAlign: 'center', fontSize: 18, color: Color.textMuted}}>Mohon lakukan panggilan hanya untuk keadaan darurat</Text>
        </View>
        <View style={{ padding: 20 }}>
          <TouchableHighlight
            underlayColor={Color.black}
            style={{ borderRadius: 10 }}
            onPress={() => {
              ToastAndroid.show('Fitur saat ini belum tersedia', ToastAndroid.SHORT)
              this.navigation.replace('Ambulances')
            }}
          >
            <View style={{ backgroundColor: LightenDarkenColor(Color.danger, -20), paddingHorizontal: 20, paddingVertical: 20, borderRadius: 10, elevation: 10 }}>
              <Text style={{ textAlign: 'center', color: colorYiq(Color.danger), fontSize: 18, fontWeight: 'bold' }}><Icon name='phone-alt' color={colorYiq(Color.danger)} size={18} /> Lakukan Panggilan Darurat</Text>
            </View>
          </TouchableHighlight>
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
      backgroundColor: Color.danger,
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