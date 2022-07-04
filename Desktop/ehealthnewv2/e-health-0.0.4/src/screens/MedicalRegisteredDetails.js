import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, Dimensions, Linking, ScrollView, ToastAndroid, Image } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Color, { colorYiq } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
import Header from '../components/Header'
import { TIMTIK_API_URL } from '../tools/constants'
import { getTimTimToken, timTikToken } from './Home'
import dateFormat from '../tools/dateFormat'
import Button from '../components/Button'
const { width } = Dimensions.get('window')

export default class MedicalRegisteredDetails extends Component {
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  render() {
    const Info = props => {
      return (
        <View style={{ marginBottom: 15 }}>
          {
            props.plain &&
            <View>
              <Text style={{ alignSelf: 'flex-start', marginBottom: 3, fontSize: 13, color: 'transparent', backgroundColor: Color.grayLighter, borderRadius: 50 }}>Lorem ipsum</Text>
              <Text style={{ alignSelf: 'flex-start', fontWeight: 'bold', color: 'transparent', backgroundColor: Color.grayLighter, borderRadius: 50 }}>Lorem ipsum dolor sit amet</Text>
            </View>
            ||
            <>
              <Text style={{ marginBottom: 3, fontSize: 13, color: Color.textMuted }}>{props.label}</Text>
              {
                (props.value && typeof props.value === 'string') &&
                <Text style={{ fontWeight: 'bold' }}>{props.value}</Text>
                ||
                props.value
              }
            </>
          }
        </View>
      )
    }
    const { fetchStatus, data } = this.state
    return (
      <View style={{ flex: 1, backgroundColor: Color.white }}>
        <Header navigation={this.navigation} color={Color.white} title='Detail Pendaftaran Berobat' />
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, flexGrow: 1, paddingTop: 10 }}
        >
          <View style={{ borderRadius: 15, padding: 20, backgroundColor: fetchStatus === 'READY' && (data.patient_medic_type === 'BPJS' ? Color.success : Color.theme) || fetchStatus === 'FETCHING' && Color.grayLighter || Color.danger, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colorYiq(Color.theme), fontSize: 13, marginBottom: 5, opacity: fetchStatus === 'READY' && 1 || 0 }}>Nomor Rekam Medis</Text>
                <Text style={{ color: colorYiq(Color.theme), fontSize: 22, fontWeight: 'bold', letterSpacing: 1, opacity: fetchStatus === 'READY' && 1 || 0 }}>{fetchStatus === 'READY' && data.number_medic_record || 'PSN1307AC'}</Text>
              </View>
              {/* <View style={{ width: (width - 40) / 4, height: (width - 40) / 4, backgroundColor: Color.white, borderRadius: 4, overflow: 'hidden' }}>
                <Image source={require('../images/qr.jpg')} style={{ width: '100%', height: '100%' }} />
              </View> */}
            </View>
          </View>
          <View style={{ marginBottom: 10 }}>
            <View style={{ borderBottomColor: Color.borderColor, borderBottomWidth: 1, paddingBottom: 10, marginBottom: 15 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: -5 }}>
                <Text style={{ marginHorizontal: 5, fontWeight: 'bold' }}>Detail Pendaftar</Text>
              </View>
            </View>
            <Info plain={fetchStatus !== 'READY'} label='Nama Lengkap' value={fetchStatus === 'READY' ? data.user_name : 'Nahh'} />
            <Info plain={fetchStatus !== 'READY'} label='Jenis Kelamin' value={fetchStatus === 'READY' ? (data.user_person_gender === '1' && 'Laki-laki' || data.user_person_gender === '2' && 'Perempuan' || '-') : 'Nahh'} />
            <Info plain={fetchStatus !== 'READY'} label='Tanggal Lahir' value={fetchStatus === 'READY' ? (data.user_person_birthdate && dateFormat(data.user_person_birthdate) || '-') : 'Nahh'} />
            <Info plain={fetchStatus !== 'READY'} label='Alamat Lengkap' value={fetchStatus === 'READY' ? (data.user_person_address || '-') : 'Nahh'} />
          </View>
          <View style={{ marginBottom: 10 }}>
            <View style={{ borderBottomColor: Color.borderColor, borderBottomWidth: 1, paddingBottom: 10, marginBottom: 15 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: -5 }}>
                <Text style={{ marginHorizontal: 5, fontWeight: 'bold' }}>Detail Fasilitas Kesehatan</Text>
              </View>
            </View>
            <Info plain={fetchStatus !== 'READY'} label='Nama Fasilitas Kesehatan' value={fetchStatus === 'READY' ? (data.faskes_name || '-') : 'Nahh'} />
            <Info plain={fetchStatus !== 'READY'} label='Alamat Fasilitas Kesehatan' value={fetchStatus === 'READY' ? (data.faskes_address || '-') : 'Nahh'} />
            <Info plain={fetchStatus !== 'READY'} label='Telepon Fasilitas Kesehatan' value={
              fetchStatus === 'READY' ?
                (
                  data.faskes_phone &&
                  <Text onPress={() => { Linking.openURL('tel:' + data.faskes_phone) }} style={{ fontWeight: 'bold', alignSelf: 'flex-start' }}><Icon name='call' color={Color.success} size={16} /> 082211882277</Text>
                  ||
                  '-'
                )
                :
                'nahh'
            } />
          </View>
          <View>
            <View style={{ borderBottomColor: Color.borderColor, borderBottomWidth: 1, paddingBottom: 10, marginBottom: 15 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: -5 }}>
                <Text style={{ marginHorizontal: 5, fontWeight: 'bold' }}>Detail Pendaftaran</Text>
              </View>
            </View>
            <Info plain={fetchStatus !== 'READY'} label='Jenis Berobat' value={fetchStatus === 'READY' ? (data.patient_medic_type && ('Pasien ' + data.patient_medic_type) || '-') : 'Nahh'} />
          </View>
          {
            (fetchStatus === 'READY' && data.patient_medic_type === 'BPJS') &&
            <View style={{ marginTop: 10 }}>
              <View style={{ borderBottomColor: Color.borderColor, borderBottomWidth: 1, paddingBottom: 10, marginBottom: 15 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: -5 }}>
                  <Text style={{ marginHorizontal: 5, fontWeight: 'bold' }}>Detail BPJS</Text>
                </View>
              </View>
              <Info label='Nomor BPJS' value={data.bpjs_number || '-'} />
              {
                data.bpjs_image &&
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ marginBottom: 8, fontSize: 13, color: Color.textMuted }}>Foto Kartu BPJS</Text>
                  <Image source={{ uri: data.bpjs_image }} style={{ width: (width - 40), height: (width - 40) / 850 * 522, backgroundColor: Color.grayLighter, borderRadius: 8 }} />
                </View>
              }
            </View>
          }
        </ScrollView>
        {/* <View style={{ paddingHorizontal: 20, paddingVertical: 15, borderTopColor: Color.borderColor, borderTopWidth: 1, backgroundColor: Color.white }}>
          <TouchableHighlight
            onPress={() => {
              console.log('clicked!!')
            }}
            style={{ borderRadius: 20 }}
          >
            <View style={{ paddingVertical: 15, paddingHorizontal: 20, backgroundColor: Color.success, borderRadius: 20 }}>
              <Text style={{ textAlign: 'center', color: colorYiq(Color.success), fontSize: 18, fontWeight: 'bold' }}><Icon name='cloud-download-outline' size={18} color={colorYiq(Color.success)} /> Unduh PDF</Text>
            </View>
          </TouchableHighlight>
        </View> */}
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
    this._getDetailRegistered()
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

  _getDetailRegistered = () => {
    this.setState({
      fetchStatus: 'FETCHING'
    })
    const patient_id = this.props.route.params.patient_id
    if (!patient_id) {
      this.navigation.goBack()
      ToastAndroid.show('Bad request!', ToastAndroid.SHORT)
    }
    if (!timTikToken) return getTimTimToken(this._getDetailRegistered, () => { console.log('error') })
    const wrappedPromise = cancellablePromise(this._promiseGetDetailRegistered(patient_id))
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        switch (res.status_string) {
          case 'UNAUTHORIZED':
            if (!timTikToken) return getTimTimToken(this._getDetailRegistered, () => { console.log('error') }, true)
            break
          case 'EXPIRED':
            if (!timTikToken) return getTimTimToken(this._getDetailRegistered, () => { console.log('error') }, true)
            break
          case 'OK':
            this.setState({
              data: res.data,
              fetchStatus: 'READY'
            })
            break
          case 'NOT FOUND':
            this.setState({
              fetchStatus: 'EMPTY'
            })
            break
          default:
            this.setState({
              fetchStatus: 'ERROR'
            })
        }
      })
      .then(() => {
        this._removePromise(wrappedPromise)
      })
      .catch(e => {
        this.setState({
          fetchStatus: 'ERROR'
        })
      })
  }

  _promiseGetDetailRegistered = (patient_id) => {
    return new Promise((resolve, reject) => {
      fetch(`${TIMTIK_API_URL}api/detail_berobat?patient_id=${patient_id}`, {
        method: 'GET',
        headers: {
          Token: timTikToken
        }
      })
        .then(res => res.json())
        .then(resolve)
        .catch(reject)
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      fetchStatus: 'FETCHING',
      data: null
    }
    this.statusBar = {
      backgroundColor: Color.white,
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