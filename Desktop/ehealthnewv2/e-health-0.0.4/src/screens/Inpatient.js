import React, { Component } from 'react'
import { ActivityIndicator, Animated, BackHandler, Dimensions, Modal, StatusBar, Text, TextInput, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { getFacility } from '../actions/facility.actions'
import Button from '../components/Button'
import Select from '../components/Select'
import Wrapper from '../components/Wrapper'
import cancellablePromise from '../tools/cancellablePromise'
import Color, { colorYiq } from '../tools/Color'
import { TIMTIK_API_URL } from '../tools/constants'
import isCloseToBottom from '../tools/isCloseToBottom'
import { timTikToken, getTimTimToken } from './Home'
const { width, height } = Dimensions.get('window')

class Inpatient extends Component {
  _timeoutFetch = null
  _pendingPromise = []
  _appendPromise = p => {
    this._pendingPromise = [...this._pendingPromise, p]
  }
  _removePromise = p => {
    this._pendingPromise.filter(promise => promise !== p)
  }

  _timeoutSearch = null
  render() {
    const { data, facilitySelected, inpatientName, filterModalVisible, page, maxPage, error } = this.state
    const facilities = this.props.facility.data.map(a => {
      return {
        value: a.faskes_id,
        title: a.faskes_name
      }
    })
    const _scrollY = new Animated.Value(0)
    const _elevationHeader = _scrollY.interpolate({
      inputRange: [0, 30],
      outputRange: [0, 10],
      extrapolate: 'clamp'
    })
    const dateTimeFormat = (date) => {
      const months = {
        short: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'],
        long: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
      }
      const y = date.substr(0, 4)
      const m = parseInt(date.substr(5, 2)) - 1
      const d = parseInt(date.substr(8, 2))
      const h = date.substr(11, 2)
      const i = date.substr(14, 2)
      const s = date.substr(17, 2)

      return d + ' ' + months.short[m] + ' ' + y + ' ' + h + ':' + i
    }
    return (
      <Wrapper header navigation={this.navigation} contentContainerStyle={{ flex: 1 }} title='Rawat Inap'>
        <View style={{ paddingTop: 5, paddingHorizontal: 20, marginBottom: 0, zIndex: 10 }}>
          <Animated.View style={{ borderRadius: 10, backgroundColor: Color.white, padding: 0, paddingHorizontal: 0, elevation: _elevationHeader, flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <TextInput value={inpatientName} onChangeText={e => {
                if (this._timeoutSearch !== null) clearTimeout(this._timeoutSearch)
                this.setState({
                  inpatientName: e
                }, () => {
                  this._timeoutSearch = setTimeout(() => {
                    this._getInpatient(true)
                  }, 1000)
                })
              }} placeholderTextColor={Color.textMuted} placeholder='Cari nama rawat inap' style={{ paddingVertical: 6, paddingHorizontal: 15, paddingLeft: 35, backgroundColor: 'transparent', color: Color.textColor, borderRadius: 10, fontSize: 13 }} />
              <Icon name='search' size={16} color={Color.textMuted} style={{ position: 'absolute', top: '50%', marginTop: -8, left: 10 }} />
            </View>
            <TouchableOpacity
              onPress={() => {
                this.setState({
                  filterModalVisible: !filterModalVisible
                })
              }}
              style={{
                backgroundColor: Color.warning, justifyContent: 'center', paddingHorizontal: 10, borderTopRightRadius: 8, borderBottomRightRadius: 8
              }}
            >
              <Icon name='filter' color={colorYiq(Color.warning)} size={16} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={{ flex: 1, marginTop: -8 }}>
          <Animated.ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingTop: 28, paddingHorizontal: 20 }}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event([
              { nativeEvent: { contentOffset: { y: _scrollY } } }
            ], { useNativeDriver: false })}
            onMomentumScrollEnd={({ nativeEvent }) => {
              if (this._timeoutFetch !== null) clearTimeout(this._timeoutFetch)
              if (isCloseToBottom(nativeEvent) && (page <= maxPage)) {
                this._timeoutFetch = setTimeout(() => {
                  this._getInpatient()
                }, 1000)
              }
            }}
            onMomentumScrollBegin={({ nativeEvent }) => {
              if (this._timeoutFetch !== null) clearTimeout(this._timeoutFetch)
            }}
          >
            {
              error &&
              <View style={{ padding: 20, backgroundColor: Color.white, borderRadius: 8, marginBottom: 20 }}>
                <Text style={{ textAlign: 'center', fontSize: 18, marginBottom: 5 }}>Gagal mengambil data</Text>
                <Button onPress={() => { this._getInpatient(true) }} title='Coba lagi' color={Color.danger} regular containerStyle={{ marginBottom: 0 }} />
              </View>
            }
            {
              (page > maxPage && data.length === 0) &&
              <View style={{ padding: 20, backgroundColor: Color.white, borderRadius: 8, marginBottom: 20 }}>
                <Text style={{ textAlign: 'center' }}>Data tidak ditemukan</Text>
              </View>
            }
            {
              data.map((a, i) => (
                <View key={a.inpatient_id} style={{ backgroundColor: Color.white, padding: 15, paddingHorizontal: 20, borderRadius: 8, marginBottom: 15 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 2 }}>{a.inpatient_name}</Text>
                  <Text style={{ fontSize: 13, color: Color.textMuted }}>{facilities.filter(b => b.value === a.faskes_id).length > 0 && facilities.filter(b => b.value === a.faskes_id)[0].title || '-'}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 15, marginBottom: 5, marginHorizontal: -10 }}>
                    <View style={{ flex: 1, marginHorizontal: 10, padding: 10, borderRadius: 4, backgroundColor: Color.grayLighter }}>
                      <Text numberOfLines={1} style={{ textAlign: 'center', fontSize: 11, color: Color.textMuted }}>Total</Text>
                      <Text style={{ textAlign: 'center', fontSize: 32 }}>{a.inpatient_total}</Text>
                    </View>
                    <View style={{ flex: 1, marginHorizontal: 10, padding: 10, borderRadius: 4, backgroundColor: Color.danger }}>
                      <Text numberOfLines={1} style={{ textAlign: 'center', fontSize: 11, color: colorYiq(Color.danger) }}>Terisi</Text>
                      <Text style={{ textAlign: 'center', fontSize: 32, color: colorYiq(Color.danger) }}>{a.inpatient_occupied}</Text>
                    </View>
                    <View style={{ flex: 1, marginHorizontal: 10, padding: 10, borderRadius: 4, backgroundColor: Color.success }}>
                      <Text numberOfLines={1} style={{ textAlign: 'center', fontSize: 11, color: colorYiq(Color.success) }}>Kosong</Text>
                      <Text style={{ textAlign: 'center', fontSize: 32, color: colorYiq(Color.success) }}>{a.inpatient_total - a.inpatient_occupied}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 11, marginBottom: 6, textAlign: 'right', color: Color.textMuted }}>Diperbarui pada {dateTimeFormat(a.date_modified)}</Text>
                </View>
              ))
            }
            {
              (page <= maxPage && !error) &&
              <View style={{ padding: 10, backgroundColor: Color.white, borderRadius: 8, marginBottom: 20 }}>
                <ActivityIndicator size={30} color={Color.theme} />
              </View>
            }
          </Animated.ScrollView>
        </View>
        <Modal
          statusBarTranslucent
          transparent
          visible={filterModalVisible}
          onRequestClose={() => {
            this.setState({
              filterModalVisible: false
            })
          }}
          animationType='fade'
        >
          <View style={{ backgroundColor: 'rgba(0,0,0,.35)', flex: 1, justifyContent: 'flex-end' }}>
            <TouchableOpacity onPress={() => { this.setState({ filterModalVisible: false }) }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
            <View style={{ backgroundColor: Color.white, paddingVertical: 20, paddingHorizontal: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
              <Select placeholder='Pilih Rumah Sakit/Puskesmas' items={[{ value: '', title: 'Semua Fasilitas Kesehatan' }, ...facilities]} value={facilitySelected} onChangeValue={e => {
                if (this._timeoutSearch !== null) clearTimeout(this._timeoutSearch)
                this.setState({ facilitySelected: e.value }, () => {
                  this._timeoutSearch = setTimeout(() => {
                    this._getInpatient(true)
                  }, 1000)
                })
              }} selectionStyle={{ borderWidth: 0, backgroundColor: Color.grayLighter, borderRadius: 20 }} />
              <Button regular title='Terapkan' containerStyle={{ marginBottom: 0 }} onPress={() => {
                this.setState({
                  filterModalVisible: false
                })
              }} />
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
    this._getInpatient()
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

  _backHandler = () => {
    return false
  }

  _getInpatient = (reset = false) => {
    if (reset)
      return this.setState({
        page: 1,
        data: []
      }, () => { this._getInpatient() })
    const { page, maxPage, data } = this.state
    if (page > maxPage) return true
    if (!timTikToken) return getTimTimToken(this._getDetailRegistered, () => { console.log('error') })
    const wrappedPromise = cancellablePromise(this._promiseGetInpatient())
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        switch (res.status_string) {
          case 'OK':
            this.setState({
              data: [...data, ...res.data.rows],
              page: page + 1,
              maxPage: parseInt(res.data.max_page)
            })
            break
          case 'NOT FOUND':
            this.setState({
              page: this.state.page + 1,
              maxPage: 1
            })
            break
          default:
            if (res.status_string === 'UNAUTHORIZED' || res.status_string === 'EXPIRED') return getTimTimToken(this._getDetailRegistered, () => { console.log('error') })
            this.setState({
              error: true
            })
        }
      })
      .then(() => {
        this._removePromise(wrappedPromise)
      })
      .catch(e => {
        this.setState({
          error: true
        })
      })
  }

  _promiseGetInpatient = () => {
    const { inpatientName, facilitySelected, page, limit } = this.state
    return new Promise((resolve, reject) => {
      fetch(`${TIMTIK_API_URL}api/rawat_inap?inpatient_name=${inpatientName}&faskes_id=${facilitySelected}&page=${page}&limit=${limit}`, {
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
      filterModalVisible: false,
      facilitySelected: '',
      inpatientName: '',
      data: [],
      page: 1,
      limit: 10,
      maxPage: 1,
      error: false
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

export default connect(mapStateToProps, mapDispatchToProps)(Inpatient)
