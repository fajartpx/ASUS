import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, Dimensions, TouchableHighlight, Linking, Image, ScrollView, TextInput, ToastAndroid, ActivityIndicator, Modal } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Color, { colorYiq, LightenDarkenColor } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
import Wrapper from '../components/Wrapper'
import Input, { CalendarPicker, PickOne } from '../components/Input'
import Select from '../components/Select'
import ImageInput from '../components/ImageInput'
import { getTimTimToken, timTikToken } from './Home'
import { TIMTIK_API_URL, KOMA_API_URL, KOMA_API_TOKEN_KEY } from '../tools/constants'
import { userLoggedIn } from '../../NavigationServices'
import { bindActionCreators } from 'redux'
import { getFacility } from '../actions/facility.actions'
import { connect } from 'react-redux'
const { width, height } = Dimensions.get('window')

class MedicalRegistration extends Component {
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  render() {
    const { medicalType, personPicked, facilityPicked, relationData, relationFetchStatus, checkFetchStatus, patriarch, bpjsNumber, bpjsImageNew, bpjsImageOld, loadingRegisterFetch, errorPost } = this.state
    const relationSelectable = relationData.map(a => {
      return {
        value: a.regis_number,
        title: a.user_name
      }
    })
    const facilitySelectable = this.props.facility.data.map(a => {
      return {
        value: a.faskes_id,
        title: a.faskes_name
      }
    })
    return (
      <View style={{ flex: 1 }}>
        <Wrapper paper header themeColor={Color.theme} navigation={this.navigation} title='Pendaftaran Berobat'
          afterContent={
            <View style={{ paddingHorizontal: 20, paddingVertical: 15, borderTopColor: Color.borderColor, borderTopWidth: 1 }}>
              <TouchableHighlight
                onPress={() => {
                  if (loadingRegisterFetch) return true
                  if (medicalType === 'BPJS' && (bpjsNumber === '' || bpjsImageNew === null || bpjsImageOld === null)) return ToastAndroid.show('Mohon isi informasi BPJS', ToastAndroid.SHORT)
                  if (personPicked === '') return ToastAndroid.show('Mohon pilih nama pendaftar', ToastAndroid.SHORT)
                  if (facilityPicked === '') return ToastAndroid.show('Mohon pilih faskes', ToastAndroid.SHORT)
                  if (patriarch === '') return ToastAndroid.show('Mohon isi nama kepala keluarga', ToastAndroid.SHORT)
                  if (medicalType === '') return ToastAndroid.show('Mohon pilih jenis berobat', ToastAndroid.SHORT)
                  this._postMedicalReg()
                }}
                style={{ borderRadius: 20 }}
              >
                <View style={{ height: 60, justifyContent: 'center', paddingHorizontal: 20, backgroundColor: errorPost ? Color.danger : Color.theme, borderRadius: 20 }}>
                  {
                    loadingRegisterFetch &&
                    <ActivityIndicator size={25} color={colorYiq(errorPost ? Color.danger : Color.theme)} />
                    ||
                    <Text style={{ textAlign: 'center', color: colorYiq(errorPost ? Color.danger : Color.theme), fontSize: 18, fontWeight: 'bold' }}>{errorPost ? 'Coba lagi' : 'Daftar'}</Text>
                  }
                </View>
              </TouchableHighlight>
            </View>
          }
        >
          <View style={{ padding: 20 }}>
            <Select selectable={relationFetchStatus === 'READY'} label='Nama Pendaftar' color={Color.success} items={relationSelectable} value={personPicked} onChangeValue={e => {
              this.setState({
                personPicked: e.value
              }, () => {
                if (facilityPicked !== '') this._checkRegistration()
              })
            }} placeholder='Pilih nama pendaftar' info={
              relationFetchStatus === 'FETCHING' &&
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size={11} color={Color.theme} />
                <Text style={{ fontSize: 11 }}> Memuat nama pendaftar</Text>
              </View>
              ||
              relationFetchStatus === 'ERROR' &&
              <Text onPress={this._getRelasi} style={{ fontSize: 11, color: Color.danger }}><Icon name='alert-circle' size={11} color={Color.danger} /> Coba lagi</Text>

            } />
            <Select label='Nama Fasilitas Kesehatan' color={Color.success} items={facilitySelectable} value={facilityPicked} onChangeValue={e => {
              this.setState({
                facilityPicked: e.value
              }, () => {
                if (personPicked !== '') this._checkRegistration()
              })
            }} placeholder='Pilih nama fasilitas kesehatan' />
            <Input disabled={checkFetchStatus !== 'READY'} label='Nama Kepala Keluarga' value={patriarch} onChangeText={patriarch => { this.setState({ patriarch }) }} placeholder='Masukkan nama kepala keluarga' />
            <PickOne pickable={checkFetchStatus === 'READY'} label='Jenis Berobat' color={Color.success} onChange={(e) => {
              if (personPicked === '' || facilityPicked === '') return ToastAndroid.show('Pilih nama pendaftar & faskes', ToastAndroid.SHORT)
              this.setState({
                medicalType: e.value
              })
            }} value={medicalType} items={[{ 'value': 'Umum', 'title': 'Umum' }, { 'value': 'BPJS', 'title': 'BPJS' }]} />
            {
              medicalType === 'BPJS' &&
              <View>
                <Input keyboardType='number-pad' value={bpjsNumber} onChangeText={bpjsNumber => { this.setState({ bpjsNumber: bpjsNumber.replace(/[^0-9]/g, '') }) }} placeholder='Nomor kartu BPJS' label='Nomor Kartu BPJS' />
                <ImageInput imageDefault={bpjsImageOld} value={bpjsImageNew} onPickImage={e => {
                  this.setState({
                    bpjsImageNew: e
                  })
                }} />
              </View>
            }
          </View>
        </Wrapper>
        <Modal
          statusBarTranslucent
          transparent
          visible={checkFetchStatus === 'FETCHING'}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.35)', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ padding: 20, alignItems: 'center', backgroundColor: Color.white, borderRadius: 20, justifyContent: 'center' }}>
              <ActivityIndicator size={50} color={Color.theme} />
              <Text style={{ textAlign: 'center', color: Color.textMuted, fontSize: 13, marginTop: 10 }}>Mengecek registrasi</Text>
            </View>
          </View>
        </Modal>
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
    this._getRelasi()
  }

  _postMedicalReg = () => {
    this.setState({
      loadingRegisterFetch: true,
      errorPost: false
    })
    const wrappedPromise = cancellablePromise(this._promiseMedicalReg())
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        if (res.status) ToastAndroid.show('Pendaftaran berobat berhasil', ToastAndroid.SHORT)
        if (res.status) return this.navigation.replace('MedicalRegisteredDetails', {
          patient_id: res.data.patient_id
        })

        this.setState({
          errorPost: true
        }, () => {
          ToastAndroid.show('Pendaftaran berobat gagal, coba lagi', ToastAndroid.SHORT)
        })
      })
      .then(() => {
        this._removePromise(wrappedPromise)
        this.setState({
          loadingRegisterFetch: false
        })
      })
      .catch(e => {
        this.setState({
          loadingRegisterFetch: false
        })
      })
  }

  _promiseMedicalReg = () => {
    const { medicalType, personPicked, facilityPicked, patriarch, bpjsNumber, bpjsImageNew } = this.state
    const body = new FormData()
    body.append('patient_medic_type', medicalType)
    body.append('regis_number', personPicked)
    body.append('faskes_id', facilityPicked)
    body.append('head_of_familyname', patriarch)
    body.append('bpjs_number', bpjsNumber)
    body.append('bpjs_image', bpjsImageNew !== null && bpjsImageNew.base64 || '')
    return new Promise((resolve, reject) => {
      fetch(`${KOMA_API_URL}medical-registration/save`, {
        method: 'POST',
        headers: {
          'Token-Key': KOMA_API_TOKEN_KEY
        },
        body
      })
        .then(res => res.json())
        .then(resolve)
        .catch(reject)
    })
  }

  _checkRegistration = () => {
    this.setState({
      checkFetchStatus: 'FETCHING'
    })
    if (!timTikToken) return getTimTimToken(this._checkRegistration, () => { console.log('error') })
    const wrappedPromise = cancellablePromise(this._promiseCheckRegistration())
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        if(res.status === 'OK' && res.data.has_registered) ToastAndroid.show('Sudah terdaftar di faskes tersebut sebelumnya', ToastAndroid.SHORT)
        if(res.status === 'OK' && !res.data.has_registered) ToastAndroid.show('Belum terdaftar di faskes tersebut sebelumnya', ToastAndroid.SHORT)
        if (res.status === 'OK') return this.setState({
          checkFetchStatus: 'READY',
          patriarch: res.data.head_of_familyname,
          bpjsNumber: res.data.bpjs_number,
          bpjsImageOld: res.data.bpjs_image
        })
        if (res.status === 'UNAUTHORIZED') return getTimTimToken(this._checkRegistration, () => { console.log('error') })
        if (res.status === 'EXPIRED') return getTimTimToken(this._checkRegistration, () => { console.log('error') })
        this.setState({
          checkFetchStatus: 'ERROR'
        })
      })
      .then(() => {
        this._removePromise(wrappedPromise)
      })
      .catch(e => {
        this.setState({
          checkFetchStatus: 'ERROR'
        })
      })
  }

  _promiseCheckRegistration = () => {
    const body = new FormData()
    const { personPicked, facilityPicked } = this.state
    body.append('regis_number', personPicked)
    body.append('faskes_id', facilityPicked)
    return new Promise((resolve, reject) => {
      fetch(`${TIMTIK_API_URL}api/cek_registrasi`, {
        method: 'POST',
        headers: {
          Token: timTikToken
        },
        body
      })
        .then(res => res.json())
        .then(resolve)
        .catch(reject)
    })
  }

  _getRelasi = () => {
    this.setState({
      relationFetchStatus: 'FETCHING'
    })
    if (!timTikToken) return getTimTimToken(this._getRelasi, () => { console.log('error') })
    const wrappedPromise = cancellablePromise(this._promiseGetRelasi())
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        if (res.status_string === 'OK') return this.setState({
          relationData: res.data,
          relationFetchStatus: 'READY'
        })
        if (res.status_string === 'UNAUTHORIZED') return getTimTimToken(this._getRelasi, () => { console.log('error') })
        if (res.status_string === 'EXPIRED') return getTimTimToken(this._getRelasi, () => { console.log('error') })
        this.setState({
          relationFetchStatus: 'ERROR'
        })
      })
      .then(() => {
        this._removePromise(wrappedPromise)
      })
      .catch(e => {
        this.setState({
          relationFetchStatus: 'ERROR'
        })
      })
  }

  _promiseGetRelasi = () => {
    return new Promise((resolve, reject) => {
      fetch(`${TIMTIK_API_URL}api/relasi?user_id=${userLoggedIn.user_id}`, {
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
      personPicked: '',
      medicalType: '',
      facilityPicked: '',
      relationData: [],
      patriarch: '',
      hasRegistered: false,
      bpjsNumber: '',
      bpjsImageNew: null,
      bpjsImageOld: null,
      relationFetchStatus: 'FETCHING',
      checkFetchStatus: '',
      loadingRegisterFetch: false,
      errorPost: false
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
    facility: state.facility
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getFacility: bindActionCreators(getFacility, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MedicalRegistration)