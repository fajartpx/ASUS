import React, { Component } from 'react'
import { StatusBar, BackHandler, View, Text, TouchableHighlight, ScrollView, Dimensions, ActivityIndicator, Image } from 'react-native'
import Color, { colorYiq } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
import Wrapper from '../components/Wrapper'
import { getDoctorDetails } from '../actions/doctors.actions'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
const { width } = Dimensions.get('window')
import dateFormat from '../tools/dateFormat'
import Icon from 'react-native-vector-icons/Ionicons'

class Doctor extends Component {
  _pendingPromise = []
  _appendPromise = (p) => {
    this._pendingPromise = [...this._pendingPromise, p]
  }
  _removePromise = (p) => {
    this._pendingPromise = this._pendingPromise.filter(promise => promise !== p)
  }
  render() {
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
    const { selectedDay } = this.state
    const themeColor = Color.theme
    const { data } = this.props.doctors.picked
    if (data === null) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size={50} color={themeColor} /></View>
    return (
      <Wrapper header themeColor={themeColor} navigation={this.navigation} title={
        <View>
          <Text style={{ fontWeight: 'bold', color: colorYiq(themeColor) }}>{data.user_name}</Text>
          <Text style={{ fontSize: 11, color: colorYiq(themeColor) }}>{data.specialist_name}</Text>
        </View>
      }
        afterContent={
          data.user_doctor_chat === '1' &&
          <View style={{ paddingHorizontal: 20, paddingVertical: 15, borderTopColor: Color.borderColor, borderTopWidth: 1, backgroundColor: Color.white }}>
            <TouchableHighlight
              onPress={() => {
                this.navigation.navigate('ConsultationForm', {
                  send_to_user_id: this.props.route.params.id
                })
              }}
              style={{ borderRadius: 20 }}
            >
              <View style={{ paddingVertical: 15, paddingHorizontal: 20, backgroundColor: themeColor, borderRadius: 20 }}>
                <Text style={{ textAlign: 'center', color: colorYiq(themeColor), fontSize: 18, fontWeight: 'bold' }}>Buat Konsultasi</Text>
              </View>
            </TouchableHighlight>
          </View>
        }
      >

        <View style={{ paddingTop: (width / 3.5) / 2 + 10, paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ backgroundColor: Color.white, borderRadius: 8, elevation: 10, padding: 20, paddingHorizontal: 20 }}>
            <View style={{ width: width / 3.5, height: width / 3.5, borderRadius: (width / 3.5) / 2, backgroundColor: Color.grayLight, elevation: 10, marginTop: (width / 3.5 / 2 * -1) - 20, alignSelf: 'center', borderWidth: 4, borderColor: Color.white, marginBottom: 10, overflow: 'hidden' }}>
              <Image source={data.user_picture && { uri: data.user_picture } || require('../images/logo-dark.png')} style={{ width: '100%', height: '100%', opacity: !data.user_picture && 0.15 || 1 }} resizeMode='cover' />
            </View>
            <Text style={{ textAlign: 'center', fontSize: 22, fontWeight: 'bold' }}>{data.user_name || '-'}</Text>
            <Text style={{ textAlign: 'center', color: Color.textMuted, marginBottom: 8 }}>{data.specialist_name || '-'}</Text>
          </View>
        </View>

        <View style={{ marginHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Color.danger, paddingHorizontal: 10, paddingVertical: 10, marginBottom: 15, borderRadius: 8 }}>
            <Icon name='alert-circle' color={colorYiq(Color.danger)} style={{ marginRight: 10 }} size={18} />
            <Text style={{ color: colorYiq(Color.danger), fontSize: 13 }}>Jadwal dokter tidak tersedia</Text>
          </View>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: Color.textMuted, fontSize: 13, fontWeight: 'bold', marginBottom: 3 }}>Tempat Praktik</Text>
            <Text style={{ fontWeight: 'bold' }}>{data.faskes_name || '-'}</Text>
          </View>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: Color.textMuted, fontSize: 13, fontWeight: 'bold', marginBottom: 3 }}>Nomor STR</Text>
            <Text style={{ fontWeight: 'bold' }}>{data.user_doctor_str || '-'}</Text>
          </View>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: Color.textMuted, fontSize: 13, fontWeight: 'bold', marginBottom: 3 }}>Jenis Kelamin</Text>
            <Text style={{ fontWeight: 'bold' }}>{data.user_doctor_gender === '1' && 'Laki-laki' || data.user_doctor_gender === '2' && 'Perempuan' || '-'}</Text>
          </View>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: Color.textMuted, fontSize: 13, fontWeight: 'bold', marginBottom: 3 }}>Tanggal Lahir</Text>
            <Text style={{ fontWeight: 'bold' }}>{dateFormat(data.user_doctor_birthdate || '') || '-'}</Text>
          </View>
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
    this._getDoctorDetails()
  }

  _getDoctorDetails = () => {
    const id = this.props.route.params.id
    const wrappedPromise = cancellablePromise(this.props.getDoctorDetails(id))
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        console.log('_getDoctorDetails', res)
      })
      .then(() => {
        this._removePromise(wrappedPromise)
      })
      .catch(e => {
        console.log('_getDoctorDetails', e)
      })
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
      selectedDay: 1
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

function mapStateToProps(state) {
  return {
    doctors: state.doctors
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getDoctorDetails: bindActionCreators(getDoctorDetails, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Doctor)