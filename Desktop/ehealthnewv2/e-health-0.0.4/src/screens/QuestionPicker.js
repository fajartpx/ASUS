import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, Dimensions, TouchableHighlight, Linking, Image, Modal, ToastAndroid, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Color, { colorYiq, LightenDarkenColor } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
import Wrapper from '../components/Wrapper'
import Input from '../components/Input'
import Button from '../components/Button'
const { width, height } = Dimensions.get('window')

export default class QuestionPicker extends Component {
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  render() {
    const Complaint = [
      {
        image: require('../images/keluhan_terapi.png'),
        name: 'Terapi',
        id: 'Terapi'
      },
      {
        image: require('../images/keluhan_kandungan.png'),
        name: 'Kandungan',
        id: 'Kandungan'
      },
      {
        image: require('../images/keluhan_gigi.png'),
        name: 'Gigi',
        id: 'Gigi'
      },
      {
        image: require('../images/keluhan_mata.png'),
        name: 'Mata',
        id: 'Mata'
      },
      {
        image: require('../images/keluhan_pencernaan.png'),
        name: 'Pencernaan',
        id: 'Pencernaan'
      },
      {
        image: require('../images/keluhan_pernafasan.png'),
        name: 'Pernafasan',
        id: 'Pernafasan'
      },
      {
        image: require('../images/keluhan_tulang.png'),
        name: 'Cedera',
        id: 'Cedera'
      },
    ]
    const { selected, customText, customTextViewed } = this.state
    return (
      <Wrapper header paper themeColor={Color.theme} navigation={this.navigation} title='Pilih Keluhan'
        afterContent={
          <View style={{ paddingHorizontal: 20, paddingVertical: 15, borderTopColor: Color.borderColor, borderTopWidth: 1 }}>
            <TouchableHighlight
              onPress={() => {
                if(!selected && !customText) return ToastAndroid.show('Pilih jenis keluhan terlebih dahulu', ToastAndroid.SHORT)
                this.navigation.navigate('QuestionForm', {
                  question_type: selected || customText
                })
              }}
              style={{ borderRadius: 20 }}
            >
              <View style={{ paddingVertical: 15, paddingHorizontal: 20, backgroundColor: Color.theme, borderRadius: 20 }}>
                <Text style={{ textAlign: 'center', color: colorYiq(Color.theme), fontSize: 18, fontWeight: 'bold' }}>Selanjutnya</Text>
              </View>
            </TouchableHighlight>
          </View>
        }
      >
        <View style={{ marginHorizontal: 20, marginTop: 20, marginBottom: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 3, textTransform: 'uppercase', letterSpacing: -.6 }}>Keluhan</Text>
          <Text style={{ color: Color.textMuted, fontSize: 13 }}>Pilih keluhan penyakit atau masalah kesehatan yang ingin anda tanyakan</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 20, marginVertical: 10 }}>
          {
            Complaint.map((a, i) => (
              <TouchableHighlight
                key={i}
                style={{ borderRadius: ((width - 70) / 3) / 2, marginVertical: 10, marginRight: (i + 1) % 3 <= 0 ? 0 : 15 }}
                onPress={() => {
                  this.setState({
                    selected: a.id,
                    customText: ''
                  })
                }}
              >
                <View style={{ width: (width - 70) / 3, height: (width - 70) / 3, borderRadius: ((width - 70) / 3) / 2, backgroundColor: Color.grayLighter, alignItems: 'center', justifyContent: 'center', padding: 5, borderWidth: 5, borderColor: selected === a.id ? Color.theme : Color.grayLighter }}>
                  <Image style={{ width: 45, height: 45, marginBottom: 5 }} source={a.image} />
                  <Text style={{ textAlign: 'center', color: Color.textMuted, textTransform: 'uppercase', fontWeight: 'bold', fontSize: 9 }}>{a.name}</Text>
                </View>
              </TouchableHighlight>
            ))
          }
          <TouchableHighlight
            style={{ borderRadius: ((width - 70) / 3) / 2, marginVertical: 10, marginRight: (Complaint.length + 1) % 3 <= 0 ? 0 : 15 }}
            onPress={() => {
              this.setState({
                customTextViewed: true
              })
            }}
          >
            <View style={{ width: (width - 70) / 3, height: (width - 70) / 3, borderRadius: ((width - 70) / 3) / 2, backgroundColor: Color.grayLighter, alignItems: 'center', justifyContent: 'center', padding: 10, borderWidth: 5, borderColor: customText ? Color.theme : Color.grayLighter }}>
              <Image style={{ width: 45, height: 45, marginBottom: 5 }} source={require('../images/keluhan_lain.png')} />
              <Text style={{ textAlign: 'center', color: Color.textMuted, textTransform: 'uppercase', fontWeight: 'bold', fontSize: 9 }}>Lainnya</Text>
            </View>
          </TouchableHighlight>
        </View>
        <Modal
          visible={customTextViewed}
          statusBarTranslucent
          transparent
          onRequestClose={() => {
            this.setState({
              customTextViewed: false
            })
          }}
          animationType='fade'
        >
          <View style={{ backgroundColor: 'rgba(0,0,0,.25)', flex: 1, justifyContent: 'center' }}>
            <TouchableOpacity onPress={() => {
              this.setState({
                customTextViewed: false
              })
            }} style={{ position: 'absolute', top: 0, right: 0, left: 0, bottom: 0 }} />
            <View style={{ marginHorizontal: 20, padding: 20, backgroundColor: Color.white, borderRadius: 8, elevation: 10 }}>
              <Input value={customText} onChangeText={e => {
                this.setState({
                  customText: e
                })
              }} multiline placeholder='Jenis keluhan' containerStyle={{ marginBottom: 15 }} placeholder='Keluhan' />
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: -10 }}>
                <Button title='Batal' onPress={() => {
                  this.setState({
                    customText: '',
                    customTextViewed: false
                  })
                }} regular color={Color.grayLighter} containerStyle={{ marginBottom: 0, flex: 1, marginHorizontal: 10 }} />
                <Button title='Simpan' onPress={() => {
                  this.setState({
                    customTextViewed: false,
                    selected: customText ? '' : selected
                  })
                }} regular containerStyle={{ marginBottom: 0, flex: 1, marginHorizontal: 10 }} />
              </View>
            </View>
          </View>
        </Modal>
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
    this.state = {
      selected: '',
      customText: '',
      customTextViewed: false
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