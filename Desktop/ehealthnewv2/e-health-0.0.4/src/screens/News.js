import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, Dimensions, TouchableHighlight, Linking, TextInput } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Color, { colorYiq, LightenDarkenColor } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
import Wrapper from '../components/Wrapper'
const { width, height } = Dimensions.get('window')

export default class News extends Component {
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  render() {
    const { data } = this.state
    return (
      <Wrapper header paper textHeaderColor={Color.textColor} themeColor={Color.warning} navigation={this.navigation}
        title={
          <View>
            <TextInput placeholderTextColor={Color.textMuted} placeholder='Cari Berita' style={{ paddingVertical: 6, paddingHorizontal: 15, paddingLeft: 35, backgroundColor: 'rgba(255,255,255,.5)', color: Color.textColor, borderRadius: 10, fontSize: 13 }} />
            <Icon name='search' size={16} color={Color.textMuted} style={{ position: 'absolute', top: '50%', marginTop: -8, left: 10 }} />
          </View>
        }
      >
        {
          data.map((a, i) => (
            <TouchableHighlight
              key={a.id_berita}
              onPress={() => { this.navigation.navigate('NewsDetails') }}
              style={{ borderRadius: 20 }}
            >
              <View style={{ paddingHorizontal: 20, backgroundColor: Color.white }}>
                <View style={{ flexDirection: 'row', paddingVertical: 15, borderBottomColor: Color.borderColor, borderBottomWidth: i + 1 === data.length ? 0 : 1 }}>
                  <View style={{ width: width / 4, height: width / 4, borderRadius: 8, backgroundColor: Color.grayLight, marginRight: 20 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, color: Color.textMuted, marginBottom: 5 }}>{a.tanggal_berita}</Text>
                    <Text numberOfLines={3} style={{ fontSize: 15, fontWeight: 'bold' }}>{a.judul_berita}</Text>
                  </View>
                </View>
              </View>
            </TouchableHighlight>
          ))
        }
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
      data: [
        {
          id_berita: '1',
          judul_berita: '78 Pasien COVID-19 Di Kuansing Dinyatakan Sembuh',
          tanggal_berita: 'Sel 20 Jul 2021'
        },
        {
          id_berita: '2',
          judul_berita: 'Satgas COVID-19 Kuansing Semprot Disinfektan Di Fasilitas Umum',
          tanggal_berita: 'Sel 20 Jul 2021'
        },
        {
          id_berita: '3',
          judul_berita: 'IDI Kuansing Beri Pedoman Isolasi Mandiri Pasien COVID-19',
          tanggal_berita: 'Sel 20 Jul 2021'
        },
        {
          id_berita: '4',
          judul_berita: 'Terjunkan 27 Dokter, IDI Kuansing Buka Konsultasi Gratis Via Whatsapp Untuk Pasien COVID-19',
          tanggal_berita: 'Sel 20 Jul 2021'
        },
        {
          id_berita: '5',
          judul_berita: 'Kuansing Terima Bantuan Oksigen Dan Obat Dari Presiden Dan Gubernur',
          tanggal_berita: 'Sel 20 Jul 2021'
        },
        {
          id_berita: '6',
          judul_berita: 'Operasi Yustisi Gabungan Skala Besar Dilakukan Serentak Se-Kabupaten Kuansing',
          tanggal_berita: 'Sel 20 Jul 2021'
        }
      ]
    }
    this.statusBar = {
      backgroundColor: Color.warning,
      barStyle: 'dark-content',
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