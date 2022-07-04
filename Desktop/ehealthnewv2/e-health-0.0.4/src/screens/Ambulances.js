import React, { Component } from 'react'
import { ActivityIndicator, Animated, BackHandler, Dimensions, Image, Linking, StatusBar, Text, TextInput, ToastAndroid, TouchableHighlight, View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Button from '../components/Button'
import Wrapper from '../components/Wrapper'
import cancellablePromise from '../tools/cancellablePromise'
import Color from '../tools/Color'
import { TIMTIK_API_URL } from '../tools/constants'
import isCloseToBottom from '../tools/isCloseToBottom'
import { getTimTimToken, timTikToken } from './Home'
const { width, height } = Dimensions.get('window')

export default class Ambulances extends Component {
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
    const { data, facilityName, page, maxPage, fetchStatus } = this.state
    const _scrollY = new Animated.Value(0)
    const _elevationHeader = _scrollY.interpolate({
      inputRange: [0, 30],
      outputRange: [0, 10],
      extrapolate: 'clamp'
    })
    return (
      <Wrapper header navigation={this.navigation} contentContainerStyle={{ flex: 1 }} title='Telepon Ambulan'>
        <View style={{ paddingTop: 10, paddingHorizontal: 20 }}>
          <Animated.View style={{ backgroundColor: Color.white, borderRadius: 8, padding: 10, paddingHorizontal: 20, elevation: _elevationHeader }}>
            <View style={{ flexDirection: 'row' }}>
              <Image source={require('../images/ambulance-icon.png')} style={{ width: 70, height: 70 }} />
              <View style={{ flex: 1, marginLeft: 20, justifyContent: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 4, textAlign: 'center', textAlignVertical: 'center' }}>Daftar Nomor Telepon Ambulan di Teluk Kuantan</Text>
              </View>
            </View>
            <View style={{ marginTop: 10, marginBottom: 5 }}>
              <TextInput editable={fetchStatus === 'READY'} value={facilityName} onChangeText={e => {
                if(this._timeoutSearch !== null) clearTimeout(this._timeoutSearch)
                this.setState({
                  facilityName: e
                }, () => {
                  this._timeoutSearch = setTimeout(() => {
                    this._getAmbulances(true)
                  }, 1000)
                })
              }} placeholderTextColor={Color.textMuted} placeholder='Cari nama faskes' style={{ paddingVertical: 6, paddingHorizontal: 15, paddingLeft: 35, backgroundColor: fetchStatus === 'READY' ? Color.grayLighter : Color.gray, color: Color.textColor, borderRadius: 8, fontSize: 13 }} />
              <Icon name='search' size={16} color={Color.textMuted} style={{ position: 'absolute', top: '50%', marginTop: -8, left: 10 }} />
            </View>
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
                  this._getAmbulances()
                }, 1000)
              }
            }}
            onMomentumScrollBegin={({ nativeEvent }) => {
              if (this._timeoutFetch !== null) clearTimeout(this._timeoutFetch)
            }}
          >
            {
              fetchStatus === 'ERROR' &&
              <View style={{ padding: 20, marginHorizontal: 20, backgroundColor: Color.white, borderRadius: 8, marginBottom: 20 }}>
                <Text style={{ textAlign: 'center', fontSize: 18, marginBottom: 5 }}>Gagal mengambil data</Text>
                <Button onPress={() => { this._getAmbulances(true) }} title='Coba lagi' color={Color.danger} regular containerStyle={{ marginBottom: 0 }} />
              </View>
            }
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
                    if (!a.faskes_ambulance_phone) return ToastAndroid.show('Tidak memiliki nomor ambulan', ToastAndroid.SHORT)
                    Linking.openURL(`tel:${a.faskes_ambulance_phone}`)
                  }}
                >
                  <View style={{ backgroundColor: Color.white, padding: 15, paddingHorizontal: 20, borderRadius: 8 }}>
                    <View style={{ marginHorizontal: -10, flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ flex: 1, marginHorizontal: 10 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 2 }}>{a.faskes_name}</Text>
                        {
                          !a.faskes_ambulance_phone &&
                          <Text style={{ fontSize: 13, marginBottom: 6, color: Color.textMuted, fontStyle: 'italic' }}>Tidak memiliki nomor ambulan</Text>
                          ||
                          <Text style={{ fontSize: 14, marginBottom: 6 }}>{a.faskes_ambulance_phone}</Text>
                        }
                      </View>
                      <View style={{ width: 60, height: 60, borderRadius: 60 / 2, backgroundColor: !a.faskes_ambulance_phone ? Color.grayLight : Color.success, marginHorizontal: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name='phone' size={28} color={!a.faskes_ambulance_phone ? 'rgba(0,0,0,.25)' : 'rgba(255,255,255,.75)'} />
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
    this._getAmbulances(true)
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

  _getAmbulances = (reset = false) => {
    if (reset)
      return this.setState({
        page: 1,
        data: []
      }, () => { this._getAmbulances() })
    const { page, maxPage, data } = this.state
    if (page > maxPage) return true
    this.setState({
      fetchStatus: 'FETCHING'
    })
    if (!timTikToken) return getTimTimToken(this._getAmbulances, () => { console.log('error') })
    const wrappedPromise = cancellablePromise(this._promiseGetAmbulances())
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
            if (res.status_string === 'UNAUTHORIZED' || res.status_string === 'EXPIRED') return getTimTimToken(this._getAmbulances, () => { console.log('error') })
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

  _promiseGetAmbulances = () => {
    const { facilityName, page } = this.state
    return new Promise((resolve, reject) => {
      fetch(`${TIMTIK_API_URL}api/telepon_ambulan?faskes_name=${facilityName}&page=${page}&limit=10`, {
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
      facilityName: '',
      page: 1,
      maxPage: 1,
      fetchStatus: 'FETCHING',
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
