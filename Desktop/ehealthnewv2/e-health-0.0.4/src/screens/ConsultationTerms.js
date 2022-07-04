import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, Dimensions, TouchableHighlight, Linking, Image } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Color, { colorYiq, LightenDarkenColor } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
import Wrapper from '../components/Wrapper'
const { width, height } = Dimensions.get('window')

export default class ConsultationTerms extends Component {
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  render() {
    return (
      <Wrapper header paper themeColor={Color.success} navigation={this.navigation} title='Syarat & Ketentuan'
        afterContent={
          <View style={{ paddingHorizontal: 20, paddingVertical: 15, borderTopColor: Color.borderColor, borderTopWidth: 1 }}>
            <TouchableHighlight
              onPress={() => {
                this.navigation.goBack()
              }}
              style={{ borderRadius: 20 }}
            >
              <View style={{ paddingVertical: 15, paddingHorizontal: 20, backgroundColor: Color.success, borderRadius: 20 }}>
                <Text style={{ textAlign: 'center', color: colorYiq(Color.success), fontSize: 18, fontWeight: 'bold' }}>Lanjutkan</Text>
              </View>
            </TouchableHighlight>
          </View>
        }
      >
        <Image style={{ alignSelf: 'center', marginTop: 30, marginBottom: 30 }} resizeMethod='resize' source={require('../images/icon-doctor.png')} />
        <View style={{ marginHorizontal: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', marginBottom: 10 }}><Icon color={Color.textColor} size={18} name='alert-circle-outline' /> Ketentuan Pengguna</Text>
          <Text style={{ textAlign: 'center', lineHeight: 24 }}>Fasilitas ini bisa memberi diagnosis awal untuk
            kondisi penguna, Chat di aplikasi tidak bisa menggantikan interaksi fisik dokter.
            Dokter akan meresekan obat sesuai aturan berdasar indformasi dari pengguna.
            Pada kondisi darurat, temui dokter langsung.</Text>
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