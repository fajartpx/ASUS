import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, Dimensions, Animated, ActivityIndicator, TouchableHighlight } from 'react-native'
import { connect } from 'react-redux'
import { userLoggedIn } from '../../NavigationServices'
import Button from '../components/Button'
import cancellablePromise from '../tools/cancellablePromise'
import Color, { colorYiq } from '../tools/Color'
import { TIMTIK_API_URL } from '../tools/constants'
import dateFormat, { timeFormat } from '../tools/dateFormat'
import isCloseToBottom from '../tools/isCloseToBottom'
import { getTimTimToken, timTikToken } from './Home'

class MedicalRegisteredList extends Component {
  _pendingPromise = []
  _appendPromise = p => {
    this._pendingPromise = [...this._pendingPromise, p]
  }
  _removePromise = p => {
    this._pendingPromise = this._pendingPromise.map(promise => promise !== p)
  }
  _timeoutFetch
  render() {
    const { data, facilitySelected, polySelected, page, maxPage, fetchStatus } = this.state
    return (
      <View style={{ flex: 1, backgroundColor: Color.white }}>
        <Animated.ScrollView
          onMomentumScrollEnd={({ nativeEvent }) => {
            if (this._timeoutFetch) clearTimeout(this._timeoutFetch)
            if (isCloseToBottom(nativeEvent) && (page <= maxPage)) {
              this._timeoutFetch = setTimeout(() => {
                this._getRegister()
              }, 1000)
            }
          }}
          onMomentumScrollBegin={({ nativeEvent }) => {
            if (this._timeoutFetch) clearTimeout(this._timeoutFetch)
          }}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {
            fetchStatus === 'ERROR' &&
            <View style={{ padding: 20, marginBottom: 20, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ textAlign: 'center', fontSize: 18, marginBottom: 10 }}>Gagal mengambil data</Text>
              <Button onPress={() => { this._getRegister(true) }} title='Coba lagi' color={Color.danger} regular containerStyle={{ marginBottom: 0 }} />
            </View>
          }
          {
            (page > maxPage && data.length === 0) &&
            <View style={{ padding: 20, marginBottom: 20, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 20, color: Color.textMuted }}>Belum ada pendaftaran</Text>
            </View>
          }
          {
            data.map((a, i) => (
              <TouchableHighlight
                key={a.patient_id}
                underlayColor={Color.gray}
                style={{ borderRadius: 8 }}
                onPress={() => {
                  this.navigation.navigate('MedicalRegisteredDetails', {
                    patient_id: a.patient_id
                  })
                }}
              >
                <View style={{ backgroundColor: Color.white, padding: 10, paddingHorizontal: 20 }}>
                  <View style={{ marginHorizontal: -10, flexDirection: 'row' }}>
                    <View style={{ flex: 1, marginHorizontal: 10 }}>
                      <Text style={{ fontSize: 18, marginBottom: 3, fontWeight: 'bold' }}>{timeFormat(a.date_added)}</Text>
                      <Text style={{ fontSize: 13, color: Color.textMuted, marginBottom: 5 }}>{a.faskes_name}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', marginHorizontal: 10 }}>
                      <View style={{ padding: 5, marginTop: 5, paddingHorizontal: 10, backgroundColor: a.patient_medic_type === 'BPJS' ? Color.success : Color.primary, alignItems: 'center', justifyContent: 'center', borderRadius: 20 }}>
                        <Text style={{ fontSize: 11, color: colorYiq(a.patient_medic_type === 'BPJS' ? Color.success : Color.primary) }}>{a.patient_medic_type}</Text>
                      </View>
                      <Text style={{ textAlign: 'right', fontSize: 11, marginTop: 5, color: a.visit_status === '1' ? Color.success : Color.danger, fontStyle: 'italic' }}>{a.visit_status === '1' ? 'Telah digunakan' : 'Belum digunakan'}</Text>
                    </View>
                  </View>
                </View>
              </TouchableHighlight>
            ))
          }
          {
            (page <= maxPage && fetchStatus !== 'ERROR') &&
            <View style={{ padding: 20, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size={50} color={Color.theme} />
            </View>
          }
        </Animated.ScrollView>
      </View>
    )
  }

  _focusedSubscription = null
  _tabPressedSubscription = null
  _bluredSubscription = null
  componentDidMount() {
    this._tabPressedSubscription = this.navigation.addListener('tabPress', () => {
      BackHandler.addEventListener('hardwareBackPress', this._backHandler)
      StatusBar.setBackgroundColor(this.statusBar.backgroundColor, this.statusBar.isAnimation)
      StatusBar.setBarStyle(this.statusBar.barStyle, this.statusBar.isAnimation)
      StatusBar.setTranslucent(this.statusBar.isTranslucent)
      const { route } = this.props
      if (route.params) {
        const { backHandlerPrevScreen } = route.params
        if (backHandlerPrevScreen) backHandlerPrevScreen.remove()
      }
      this._getRegister(true)
    })

    this._focusedSubscription = this.navigation.addListener('focus', () => {
      BackHandler.addEventListener('hardwareBackPress', this._backHandler)
      StatusBar.setBackgroundColor(this.statusBar.backgroundColor, this.statusBar.isAnimation)
      StatusBar.setBarStyle(this.statusBar.barStyle, this.statusBar.isAnimation)
      StatusBar.setTranslucent(this.statusBar.isTranslucent)
      const { route } = this.props
      if (route.params) {
        const { backHandlerPrevScreen } = route.params
        if (backHandlerPrevScreen) backHandlerPrevScreen.remove()
      }
      this._getRegister(true)
    })
    
    this._bluredSubscription = this.navigation.addListener('blur', () => {
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
      if (this._timeoutFetch) clearTimeout(this._timeoutFetch)
    })
  }

  componentWillUnmount() {
    if (this._focusedSubscription !== null)
      this._focusedSubscription = null
    if (this._tabPressedSubscription !== null)
      this._tabPressedSubscription = null
    if (this._bluredSubscription !== null)
      this._bluredSubscription = null
  }

  _backHandler = () => {
    return false
  }

  _getRegister = (reset = false) => {
    if (reset)
      return this.setState({
        page: 1,
        data: []
      }, () => { this._getRegister() })
    const { page, maxPage, data } = this.state
    if (page > maxPage) return true
    this.setState({
      fetchStatus: 'FETCHING'
    })
    if (!timTikToken) return getTimTimToken(this._getRegister, () => { console.log('error') })
    const wrappedPromise = cancellablePromise(this._promiseGetRegister())
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

  _promiseGetRegister = () => {
    const { facilitySelected, polySelected, page } = this.state
    const url = `${TIMTIK_API_URL}api/data_berobat?user_id=${userLoggedIn.user_id}&faskes_id=${facilitySelected}&poly_id=${polySelected}&page=${page}&limit=10`
    return new Promise((resolve, reject) => {
      fetch(url, {
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
      facilitySelected: '',
      polySelected: '',
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

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(MedicalRegisteredList)