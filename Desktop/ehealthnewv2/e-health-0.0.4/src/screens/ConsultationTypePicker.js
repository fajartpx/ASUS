import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, Dimensions, TouchableHighlight, Linking, Image } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Color, { colorYiq, LightenDarkenColor } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
import Wrapper from '../components/Wrapper'
const { width, height } = Dimensions.get('window')

export default class ConsultationTypePicker extends Component {
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  render() {
    return (
      <Wrapper header themeColor={Color.success} navigation={this.navigation} title='Buat Konsultasi'>
        <View style={{ marginVertical: 20, marginHorizontal: 20 }}>
          <TouchableHighlight
            onPress={() => {
              this.navigation.navigate('ConsultationForm')
            }}
            style={{ borderRadius: 20, elevation: 10, marginBottom: 20 }}
          >
            <View style={{ borderRadius: 20, backgroundColor: Color.white, overflow: 'hidden' }}>
              <View style={{ borderBottomColor: Color.borderColor, borderBottomWidth: 1, alignItems: 'flex-start', backgroundColor: Color.tertiary }}>
                <Image style={{ height: 150, maxWidth: width - 40 }} resizeMode='contain' source={require('../images/consultation-chat.png')} />
              </View>
              <View style={{ paddingVertical: 10, paddingHorizontal: 20 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 3 }}>Chat Dokter</Text>
                <Text style={{ color: Color.textMuted, lineHeight: 20, fontSize: 13 }}>Mulai percakapan secara langsung dengan dokter untuk konsultasi</Text>
              </View>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={() => {
              this.navigation.navigate('QuestionPicker')
            }}
            style={{ borderRadius: 20, elevation: 10 }}
          >
            <View style={{ borderRadius: 20, backgroundColor: Color.white, overflow: 'hidden' }}>
              <View style={{ borderBottomColor: Color.borderColor, borderBottomWidth: 1, alignItems: 'flex-end', backgroundColor: Color.primary }}>
                <Image style={{ height: 150, maxWidth: width - 40 }} resizeMode='contain' source={require('../images/consultation-question.png')} />
              </View>
              <View style={{ paddingVertical: 10, paddingHorizontal: 20 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 3 }}>Ajukan Pertanyaan</Text>
                <Text style={{ color: Color.textMuted, lineHeight: 20, fontSize: 13 }}>Kirim pertanyaan seputar masalah kesehatan lalu dapatkan jawaban dari ahlinya</Text>
              </View>
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