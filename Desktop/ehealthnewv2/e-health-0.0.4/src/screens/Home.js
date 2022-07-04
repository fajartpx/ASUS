import React, { Component } from 'react'
import { StatusBar, BackHandler, View, Text, TextInput,Linking, TouchableHighlight, Dimensions, Image, ToastAndroid } from 'react-native'
import Color, { colorYiq, LightenDarkenColor } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
const { width, height } = Dimensions.get('window')
import Icon from 'react-native-vector-icons/Ionicons'
import Select from '../components/Select'
import Carousel from '../components/Carousel'
import Wrapper from '../components/Wrapper'
import Cards, { Card } from '../components/Cards'
import MessageIcon from '../components/MessageIcon'
import { bindActionCreators } from 'redux'
import { getFacility } from '../actions/facility.actions'
import CardSlider from '../components/CardSlider'
import { connect } from 'react-redux'
import { getPoly } from '../actions/poly.actions'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TIMTIK_API_URL } from '../tools/constants'
import { userLoggedIn } from '../../NavigationServices'

class Home extends Component {
  _focusedSubscription = null
  _pendingPromise = []
  _appendPromise = (p) => {
    this._pendingPromise = [...this._pendingPromise, p]
  }
  _removePromise = (p) => {
    this._pendingPromise = this._pendingPromise.filter(promise => promise !== p)
  }
  render() {
    const facilities = this.props.facility.data.map(a => {
      return {
        value: a.faskes_id,
        title: a.faskes_name
      }
    })
    const polies = this.props.poly.data.map(a => {
      return {
        value: a.poly_id,
        title: a.poly_name
      }
    })
    const { facilitySelected, polySelected, doctorName } = this.state
    return (
      <Wrapper
        header  title={<Text style={{ color: Color.white, fontSize: 20 }}>AKU<Text style={{ fontWeight: 'bold', fontSize: 20, color: Color.white }}>SIGAP</Text></Text>}
        headerAdditional={
          <View style={{ flexDirection: 'row', marginHorizontal: -2, marginRight: -10 }}>
            {/* <MessageIcon onPress={() => { this.navigation.navigate('Notifications') }} /> */}
            {/* <TouchableHighlight
              underlayColor={Color.white}
              style={{ borderRadius: 4, marginHorizontal: 2 }}
              onPress={() => {
                this.navigation.navigate('Favorite')
              }}
            >
              <View style={{ backgroundColor: Color.theme, width: 35, height: 35, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name='heart-outline' size={18} color={colorYiq(Color.theme)} />
              </View>
            </TouchableHighlight> */}
          </View>
        }
      >
        <View style={{ marginBottom: 30, marginTop: 10 }}>
           <View style={{ marginHorizontal: 20, padding: 20, paddingHorizontal: 20, borderRadius: 8, backgroundColor: 'rgba(30,169,210,0.3)' }}>
            <Select small placeholder='Pilih Rumah Sakit/Puskesmas' items={[{ value: '', title: 'Semua Fasilitas Kesehatan' }, ...facilities]} value={facilitySelected} selectableStyle={{ borderWidth: 0 }} onChangeValue={e => { this.setState({ facilitySelected: e.value }) }} />
            <Select small placeholder='Pilih Poli' items={[{ value: '', title: 'Semua Poli' }, ...polies]} value={polySelected} selectableStyle={{ borderWidth: 0 }} onChangeValue={e => { this.setState({ polySelected: e.value }) }} />
            <TextInput placeholderTextColor={Color.textMuted} value={doctorName} onChangeText={doctorName => { this.setState({ doctorName }) }} placeholder='Nama Dokter (optional)' style={{ paddingVertical: 6, paddingHorizontal: 15, backgroundColor: Color.white, color: Color.textColor, borderRadius: 4, fontSize: 13, marginBottom: 20 }} />
            <TouchableHighlight
              underlayColor={Color.black}
              style={{ borderRadius: 4 }}
              onPress={() => {
                this.navigation.navigate('Doctors', {
                  bodyForm: { faskes_id: facilitySelected, poly_id: polySelected, user_name: doctorName }
                })
              }}
            >
              <View style={{ backgroundColor: LightenDarkenColor(Color.greenButton, 0), paddingHorizontal: 15, paddingVertical: 10, borderRadius: 4 }}>
                <Text style={{ textAlign: 'center', color: '#fff', fontWeight:'bold' }}>Cari Dokter</Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
        <View style={{ backgroundColor: Color.white, paddingVertical: 5, marginBottom: 10 }}>
        <MenuItem
        wrapperStyle={{ flexDirection: 'row', paddingHorizontal: 10, flexWrap: 'wrap' }}
          items={[
            { title: 'Pendaftaran', onPress: () => { this.navigation.navigate('MedicalRegistration') }, iconImage: require('../images/register-icon.png') },
            // { title: 'Pendaftaran BPJS', onPress: () => { this.navigation.navigate('BpjsRegister') }, iconImage: require('../images/register-bpjs-icon.png') },
            { title: 'Jadwal Dokter', onPress: () => { this.navigation.navigate('Doctors') }, iconImage: require('../images/schedule-icon.png') },
            { title: 'Rawat Inap', onPress: () => { this.navigation.navigate('Inpatient') }, iconImage: require('../images/inpatient-icon.png') },
            // { title: 'Home Care', onPress: () => { this.navigation.navigate('UnderConstruction') }, iconImage: require('../images/care-icon.png') },
            { title: 'Telepon Ambulan', onPress: () => { this.navigation.navigate('Ambulances') }, iconImage: require('../images/ambulance-icon.png') },
            // { title: 'Tanya Dokter', onPress: () => { this.navigation.navigate('UnderConstruction') }, onPress: () => { this.navigation.navigate('UnderConstruction') }, iconImage: require('../images/ask-icon.png') },
            // { title: 'Buat Janji', onPress: () => { this.navigation.navigate('UnderConstruction') }, iconImage: require('../images/reservation-icon.png') },
            { title: 'Darurat', onPress: () => { this.navigation.navigate('Emergency') }, iconImage: require('../images/emergency-icon.png') },
            { title: 'Faskes Terdekat', onPress: () => { this.navigation.navigate('Nearest') }, iconImage: require('../images/hospital-location-icon.png') },
            { title: 'Hubungi Kami', onPress: () => { this.navigation.navigate('ContactUs') }, iconImage: require('../images/contact-icon.png') },
            { title: 'Tanya Sehat', onPress: () => { this.navigation.navigate('QuestionPicker') }, iconImage: require('../images/ask-icon.png') }
          ]}
          containerStyle={{ marginBottom: 20 }}
        />
       </View>
        {/* <Carousel autoSliding={true} scale='6:2' navAnimate='fillMoving' contentAnim containerStyle={{ marginBottom: 30 }}>
          <View style={{ flex: 1, backgroundColor: Color.theme, borderRadius: 4 }} />
          <View style={{ flex: 1, backgroundColor: Color.tertiary, borderRadius: 4 }} />
          <View style={{ flex: 1, backgroundColor: Color.success, borderRadius: 4 }} />
          <View style={{ flex: 1, backgroundColor: Color.danger, borderRadius: 4 }} />
          <View style={{ flex: 1, backgroundColor: Color.theme, borderRadius: 4 }} />
          <View style={{ flex: 1, backgroundColor: Color.tertiary, borderRadius: 4 }} />
          <View style={{ flex: 1, backgroundColor: Color.success, borderRadius: 4 }} />
          <View style={{ flex: 1, backgroundColor: Color.danger, borderRadius: 4 }} />
        </Carousel> */}
        {/* <Cards containerStyle={{ marginBottom: 20 }} header headerTitle='Berita Kesehatan' seeMore={() => { this.navigation.navigate('News') }}>
          <Card onPress={() => { this.navigation.navigate('NewsDetails') }} subTitle='Sab, 16 Jan 2021' title='78 Pasien COVID-19 Di Kuansing Dinyatakan Sembuh' />
          <Card onPress={() => { this.navigation.navigate('NewsDetails') }} subTitle='Jum, 15 Jan 2021' title='Satgas COVID-19 Kuansing Semprot Disinfektan Di Fasilitas Umum' />
          <Card onPress={() => { this.navigation.navigate('NewsDetails') }} subTitle='Jum, 15 Jan 2021' title='Terjunkan 27 Dokter, IDI Kuansing Buka Konsultasi Gratis Via Whatsapp Untuk Pasien COVID-19' />
        </Cards> */}
        
         <View style={{ backgroundColor: Color.white, paddingVertical: 15 }}>
            <View style={{ flexDirection: 'row', marginBottom: 10, marginHorizontal: 15 }}>
              <View style={{ flex: 1, marginHorizontal: 5 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>Kolaborasi Layanan Dinkes Kuansing</Text>
                <Text style={{ color: Color.textMuted, fontSize: 13 }}>Berbagai aplikasi kesehatan resmi milik pengkab Kuansing</Text>
              </View>
              {/* <TouchableOpacity style={{ marginHorizontal: 5 }} onPress={() => {
                // do something
              }} activeOpacity={1}>
                <Text style={{ color: Color.theme, fontSize: 13, marginTop: 1.5 }}>Lihat semua</Text>
              </TouchableOpacity> */}
            </View>
            <CardSlider sliderTimeout={2500} containerStyle={{ marginBottom: 0 }}>
              <TouchableHighlight
                underlayColor={Color.theme}
                onPress={() => {
                  Linking.openURL('https:google.com/')
                }}
                style={{ flex: 1, borderRadius: 10 }}
              >
                <View style={{ flex: 1, backgroundColor: Color.white }}>
                  <Image resizeMethod='auto' resizeMode='cover' source={require('../images/covid.png')} style={{ width: '100%', height: '100%' }} />
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                underlayColor={Color.theme}
                style={{ flex: 1, borderRadius: 10 }}
              >
                <View style={{ flex: 1, backgroundColor: Color.white }}>
                  <Image resizeMethod='auto' resizeMode='cover' source={require('../images/e-rumah-sakit.png')} style={{ width: '100%', height: '100%' }} />
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                underlayColor={Color.theme}
                style={{ flex: 1, borderRadius: 10 }}
              >
                <View style={{ flex: 1, backgroundColor: Color.white }}>
                  <Image resizeMethod='auto' resizeMode='cover' source={require('../images/e-puskesmas.png')} style={{ width: '100%', height: '100%' }} />
                </View>
              </TouchableHighlight>
            </CardSlider>
          </View>
      </Wrapper>
    )
  }

  componentDidMount() {
    this._focusedSubscription = this.navigation.addListener('focus', () => {
      StatusBar.setBackgroundColor(this.statusBar.backgroundColor, this.statusBar.isAnimation)
      StatusBar.setBarStyle(this.statusBar.barStyle, this.statusBar.isAnimation)
      StatusBar.setTranslucent(this.statusBar.isTranslucent)
    })
    BackHandler.addEventListener('hardwareBackPress', this._backHandler)
    const { route } = this.props
    if (route.params) {
      const { backHandlerPrevScreen } = route.params
      if (backHandlerPrevScreen) backHandlerPrevScreen.remove()
    }
    this._getFacility()
    this._getPoly()
    this._getTimTikToken()
  }

  _getFacility = () => {
    const wrappedPromise = cancellablePromise(this.props.getFacility())
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        console.log('_getFacility', res)
      })
      .then(() => {
        this._removePromise(wrappedPromise)
      })
      .catch(e => {
        console.log('_getFacility', e)
      })
  }

  _getPoly = () => {
    const wrappedPromise = cancellablePromise(this.props.getPoly())
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        console.log('_getPoly', res)
      })
      .then(() => {
        this._removePromise(wrappedPromise)
      })
      .catch(e => {
        console.log('_getPoly', e)
      })
  }

  _getTimTikToken = async (succeed = null, failed = null, newRequest = false) => {
    const token = await AsyncStorage.getItem('timtik_token')
    if (token !== null && newRequest === false) {
      timTikToken = token
      if(succeed !== null && typeof succeed === 'function') succeed()
      return true
    }
    const wrappedPromise = cancellablePromise(this._promiseTimTikToken())
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        if (res.status === 'OK') {
          timTikToken = res.data.token
          if(succeed !== null && typeof succeed === 'function') succeed()
        } else {
          ToastAndroid.show('Unable to get auth token', ToastAndroid.SHORT)
          if(failed !== null && typeof failed === 'function') failed()
        }
      })
      .then(() => {
        this._removePromise(wrappedPromise)
      })
      .catch(() => {
        ToastAndroid.show('Unable to get auth token', ToastAndroid.SHORT)
        if(failed !== null && typeof failed === 'function') failed()
      })
  }

  _promiseTimTikToken = () => {
    const body = new FormData()
    body.append('user_username', userLoggedIn.user_phone)
    return new Promise((resolve, reject) => {
      fetch(`${TIMTIK_API_URL}auth/login`, {
        method: 'POST',
        body
      })
        .then(res => res.json())
        .then(resolve)
        .catch(reject)
    })
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
    getTimTimToken = this._getTimTikToken
    this.state = {
      facilitySelected: '',
      doctorName: '',
      polySelected: ''
    }
    this.statusBar = {
      backgroundColor: Color.theme,
      barStyle: 'light-content',
      isAnimation: true,
      isTranslucent: false,
      
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

function mapStateToProps(state) {
  return {
    facility: state.facility,
    poly: state.poly
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getFacility: bindActionCreators(getFacility, dispatch),
    getPoly: bindActionCreators(getPoly, dispatch)
  }
}

export let getTimTimToken
export let timTikToken = null

export default connect(mapStateToProps, mapDispatchToProps)(Home)

const MenuItem = (props) => {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 15, ...props.containerStyle }}>
      {
        props.items.map((a, i) => (
          <TouchableHighlight
            key={'menu_item' + i + a.title.replace(' ', '').toLowerCase()}
            underlayColor={'rgba(222,222,222,.5)'}
            onPress={a.onPress}
            style={{ marginBottom: i + 1 >= props.items.length - 3 ? -5 : 10, marginRight: (i + 1) % 4 === 0 ? 0 : 15, marginTop: -5, paddingTop: 5, paddingBottom: 5, borderRadius: 4 }}
          >
            <View style={{ width: (width - 75) / 4, alignItems: 'center' }}>
              {
                a.iconImage &&
                <View style={{ width: (width - 75) / 4 - 10, height: (width - 75) / 4 - 10, alignItems: 'center', justifyContent: 'center' }}>
                  <Image fadeDuration={0} source={a.iconImage} style={{ width: '100%', height: '100%' }} resizeMode='center' resizeMethod='resize' />
                </View>
                ||
                <View style={{ width: (width - 75) / 4 - 10, height: (width - 75) / 4 - 10, backgroundColor: Color.white, borderColor: Color.borderColor, borderWidth: 1, borderRadius: 8 }} />
              }
              <Text style={{ textAlign: 'center', fontSize: 11, marginTop: 8 }}>{a.title}</Text>
            </View>
          </TouchableHighlight>
        ))
      }
    </View>
  )
}