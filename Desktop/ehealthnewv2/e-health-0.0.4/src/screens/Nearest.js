import React, { Component } from 'react'
import { ActivityIndicator, Animated, BackHandler, Dimensions, Image, Linking, PermissionsAndroid, StatusBar, Text, TextInput, TouchableHighlight, View } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Button from '../components/Button'
import Wrapper from '../components/Wrapper'
import Color, { colorYiq, LightenDarkenColor } from '../tools/Color'
const { width, height } = Dimensions.get('window')
import Geolocation from 'react-native-geolocation-service'
import { TIMTIK_API_URL } from '../tools/constants'
import { getTimTimToken, timTikToken } from './Home'
import cancellablePromise from '../tools/cancellablePromise'

export default class Nearest extends Component {
  _pendingPromise = []
  _appendPromise = p => {
    this._pendingPromise = [...this._pendingPromise, p]
  }
  _removePromise = p => {
    this._pendingPromise.filter(promise => promise !== p)
  }
  _timeoutFetch = null
  _timeoutSearch = null
  render() {
    const { data, permissionStatus, coordinates, getLocationStatus, fetchStatus, page, maxPage, facilityName } = this.state
    const _scrollY = new Animated.Value(0)
    const _elevationHeader = _scrollY.interpolate({
      inputRange: [0, 30],
      outputRange: [0, 10],
      extrapolate: 'clamp'
    })
    return (
      <Wrapper header contentContainerStyle={{ flex: 1 }} navigation={this.navigation} title='Faskes Terdekat'>
        <View style={{ paddingTop: 10, paddingHorizontal: 20 }}>
          <Animated.View style={{ backgroundColor: Color.white, borderRadius: 8, padding: 10, paddingHorizontal: 20, elevation: _elevationHeader }}>
            <View style={{ flexDirection: 'row' }}>
              {
                (permissionStatus === 'denied' || permissionStatus === 'never_ask_again') ||
                fetchStatus === 'ERROR' &&
                <Icon name='alert-circle-outline' color={Color.danger} size={70} />
                ||
                (permissionStatus === 'granted' || permissionStatus === '') &&
                (fetchStatus === '' || fetchStatus === 'FETCHING') &&
                <ActivityIndicator size={70} color={Color.theme} />
                ||
                <Image source={require('../images/hospital-location-icon.png')} style={{ width: 70, height: 70 }} />
              }
              <View style={{ flex: 1, marginLeft: 20, paddingVertical: 5, justifyContent: 'center' }}>
                {
                  permissionStatus === '' &&
                  <>
                    <Text style={{ fontWeight: 'bold' }}>Meminta izin</Text>
                    <Text style={{ fontSize: 13, color: Color.textMuted }}>Meminta izin untuk mendapatkan lokasi Anda</Text>
                  </>
                  ||
                  (permissionStatus === 'denied' || permissionStatus === 'never_ask_again') &&
                  <>
                    <Text style={{ fontWeight: 'bold' }}>Permintaan ditolak</Text>
                    <Text style={{ fontSize: 13, color: Color.textMuted }}>Aplikasi membutuhkan izin untuk mendapatkan lokasi Anda</Text>
                    <Button small onPress={() => {
                      permissionStatus === 'never_ask_again' &&
                        Linking.openSettings()
                        ||
                        this._requestPermission()
                    }} title={permissionStatus === 'never_ask_again' && 'Izinkan Manual' || 'Izinkan'} color={Color.danger} containerStyle={{ marginTop: 10, marginBottom: 0, alignSelf: 'flex-start' }} />
                  </>
                  ||
                  getLocationStatus === 'GETTING' &&
                  <>
                    <Text style={{ fontWeight: 'bold' }}>Mencari lokasi</Text>
                    <Text style={{ fontSize: 13, color: Color.textMuted }}>Aplikasi sedang mencoba mendapatkan lokasi Anda</Text>
                  </>
                  ||
                  getLocationStatus === 'ERROR' &&
                  <>
                    <Text style={{ fontWeight: 'bold' }}>Gagal mendapatkan lokasi</Text>
                    <Text style={{ fontSize: 13, color: Color.textMuted }}>Aplikasi tidak berhasil mendapatkan lokasi Anda</Text>
                    <Button small onPress={this._getLocation} title='Coba lagi' color={Color.danger} containerStyle={{ marginTop: 10, marginBottom: 0, alignSelf: 'flex-start' }} />
                  </>
                  ||
                  getLocationStatus === 'SUCCESS' &&
                  (fetchStatus === '' && fetchStatus === 'FETCHING') &&
                  <>
                    <Text style={{ fontWeight: 'bold' }}>Mengambil data</Text>
                    <Text style={{ fontSize: 13, color: Color.textMuted }}>Mencoba mengambil data berdasarkan lokasi Anda</Text>
                  </>
                  || fetchStatus === 'ERROR' &&
                  <>
                    <Text style={{ fontWeight: 'bold' }}>Gagal mendapatkan data</Text>
                    <Text style={{ fontSize: 13, color: Color.textMuted }}>Terjadi kesalahan, tidak berhasil mendapatkan data</Text>
                    <Button small onPress={this._getData} title='Coba lagi' color={Color.danger} containerStyle={{ marginTop: 10, marginBottom: 0, alignSelf: 'flex-start' }} />
                  </>
                  || fetchStatus === 'FETCHING' &&
                  <>
                    <Text style={{ fontWeight: 'bold' }}>Faskes Terdekat</Text>
                    <Text style={{ fontSize: 13, color: Color.textMuted }}>Mengambil data faskes terdekat dari lokasi Anda</Text>
                  </>
                  ||
                  <>
                    <Text style={{ fontWeight: 'bold' }}>Faskes Terdekat</Text>
                    <Text style={{ fontSize: 13, color: Color.textMuted, marginBottom: 5 }}>Menampilkan data faskes terdekat dari lokasi Anda</Text>
                    <Text onPress={() => {
                      Linking.openURL('https://maps.google.com/?q=' + coordinates.latitude + ',' + coordinates.longitude)
                    }} style={{ fontSize: 11, color: Color.primary, fontStyle: 'italic' }}>Lihat lokasi Anda di Maps</Text>
                    <Text onPress={() => {
                      this._getLocation(true)
                    }} style={{ fontSize: 11, color: Color.danger, fontStyle: 'italic', marginBottom: -10 }}>Perbarui lokasi</Text>
                  </>
                }
              </View>

            </View>
            {
              <View style={{ marginTop: 15, marginBottom: 5 }}>
                <TextInput value={facilityName} onChangeText={e => {
                  if (this._timeoutSearch !== null) clearTimeout(this._timeoutSearch)
                  this.setState({
                    facilityName: e
                  }, () => {
                    this._timeoutSearch = setTimeout(() => {
                      this._getData(true)
                    }, 1000)
                  })
                }} editable={(permissionStatus === 'granted' || fetchStatus === 'READY')} placeholderTextColor={Color.textMuted} placeholder='Cari nama faskes' style={{ paddingVertical: 6, paddingHorizontal: 15, paddingLeft: 35, backgroundColor: (permissionStatus === 'granted' || fetchStatus === 'READY') && Color.grayLighter || Color.gray, color: Color.textColor, borderRadius: 8, fontSize: 13 }} />
                <Icon name='search' size={16} color={(permissionStatus === 'granted' || fetchStatus === 'READY') && Color.textMuted || Color.grayDarker} style={{ position: 'absolute', top: '50%', marginTop: -8, left: 10 }} />
              </View>
            }
          </Animated.View>
        </View>
        <View style={{ flex: 1, marginTop: -8 }}>
          <Animated.ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingTop: 28 }}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event([
              { nativeEvent: { contentOffset: { y: _scrollY } } }
            ], { useNativeDriver: false })}
            onMomentumScrollEnd={({ nativeEvent }) => {
              if (this._timeoutFetch !== null) clearTimeout(this._timeoutFetch)
              if (isCloseToBottom(nativeEvent) && (page <= maxPage)) {
                this._timeoutFetch = setTimeout(() => {
                  this._getData()
                }, 1000)
              }
            }}
            onMomentumScrollBegin={({ nativeEvent }) => {
              if (this._timeoutFetch !== null) clearTimeout(this._timeoutFetch)
            }}
          >
            {
              (page > maxPage && data.length === 0) &&
              <View style={{ padding: 20, marginHorizontal: 20, backgroundColor: Color.white, borderRadius: 8, marginBottom: 20 }}>
                <Text style={{ textAlign: 'center' }}>Data tidak ditemukan</Text>
              </View>
            }
            {
              data.map((a, i) => (
                <TouchableHighlight
                  key={a.faskes_id}
                  underlayColor={Color.grayLighter}
                  style={{ marginHorizontal: 20, borderRadius: 8, marginBottom: 15 }}
                  onPress={() => {
                    Linking.openURL('https://maps.google.com/?q=' + a.latitude + ',' + a.longitude)
                  }}
                >
                  <View style={{ backgroundColor: Color.white, padding: 15, paddingHorizontal: 20, borderRadius: 8 }}>
                    <View style={{ marginHorizontal: -10, flexDirection: 'row' }}>
                      <View style={{ width: 60, height: 60, backgroundColor: Color.grayLight, borderRadius: 60 / 2, marginHorizontal: 10, alignSelf: 'center', justifyContent: 'center' }}>
                        <Text style={{ textAlign: 'center', letterSpacing: 1, fontWeight: 'bold', fontSize: 18, color: Color.textMuted }}>{a.faskes_name.split(' ')[0].substr(0, 1) + (a.faskes_name.split(' ').length > 1 ? a.faskes_name.split(' ')[1].substr(0, 1) : '')}</Text>
                      </View>
                      <View style={{ flex: 1, marginHorizontal: 10 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>{a.faskes_name}</Text>
                        <Text style={{ color: Color.textMuted, fontSize: 13 }}>{'Sekitar ' + numberWithCommas(parseInt(a.distance)) + ' km dari lokasi Anda'}</Text>
                      </View>
                      <View style={{ marginHorizontal: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon color={Color.danger} name='compass-outline' size={40} />
                      </View>
                    </View>
                  </View>
                </TouchableHighlight>
              ))
            }
            {
              (page <= maxPage && fetchStatus !== 'ERROR') &&
              <View style={{ padding: 10, marginHorizontal: 20, backgroundColor: Color.white, borderRadius: 8, marginBottom: 20 }}>
                <ActivityIndicator size={30} color={Color.theme} />
              </View>
            }
          </Animated.ScrollView>
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
    this._requestPermission()
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
    if (this._timeoutFetch !== null) clearTimeout(this._timeoutFetch)
    if (this._timeoutSearch !== null) clearTimeout(this._timeoutSearch)
  }

  _requestPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Allow "E-Health" to use your location?',
          message: 'To allow the application to find your location.',
          buttonPositive: 'OK'
        }
      )
      this.setState({
        permissionStatus: granted
      }, () => {
        if (granted === 'granted') this._getLocation()
      })
    } catch (err) {
      console.log(err)
    }
  }

  _getLocation = (reset = false) => {
    this.setState({
      getLocationStatus: 'GETTING'
    }, () => {
      Geolocation.getCurrentPosition(
        position => {
          this.setState({
            getLocationStatus: 'SUCCESS',
            coordinates: position.coords
          }, () => {
            this._getData(reset)
          })
        },
        error => {
          this.setState({
            getLocationStatus: 'ERROR'
          })
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      )
    })
  }

  _getData = (reset = false) => {
    if (reset)
      return this.setState({
        page: 1,
        data: []
      }, () => { this._getData() })
    const { page, maxPage, data } = this.state
    if (page > maxPage) return true
    this.setState({
      fetchStatus: 'FETCHING'
    })
    if (!timTikToken) return getTimTimToken(this._getData, () => { console.log('error') })
    const wrappedPromise = cancellablePromise(this._promiseGetData())
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        switch (res.status_string) {
          case 'OK':
            this.setState({
              page: page + 1,
              data: [...data, ...res.data.rows],
              maxPage: parseInt(res.data.max_page),
              fetchStatus: 'READY'
            })
            break
          case 'NOT FOUND':
            this.setState({
              page: page + 1,
              maxPage: 1,
              fetchStatus: 'READY'
            })
            break
          default:
            if (res.status_string === 'UNAUTHORIZED' || res.status_string === 'EXPIRED') return getTimTimToken(this._getData, () => { console.log('error') })
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

  _promiseGetData = () => {
    const { coordinates, facilityName, page } = this.state
    return new Promise((resolve, reject) => {
      fetch(`${TIMTIK_API_URL}api/faskes_terdekat?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&faskes_name=${facilityName}&page=${page}&limit=10`, {
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

  _backHandler = () => {
    return false
  }

  constructor(props) {
    super(props)
    this.state = {
      permissionStatus: '',
      coordinates: null,
      getLocationStatus: '',
      fetchStatus: '',
      facilityName: '',
      page: 1,
      maxPage: 1,
      data: []
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

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}