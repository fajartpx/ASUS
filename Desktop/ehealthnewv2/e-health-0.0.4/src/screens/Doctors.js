import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, Dimensions, TouchableHighlight, TextInput, Animated, Image, TouchableOpacity, Modal, ToastAndroid, ActivityIndicator } from 'react-native'
import Color, { colorYiq } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
import Icon from 'react-native-vector-icons/Ionicons'
import Select from '../components/Select'
import Button from '../components/Button'
import Wrapper from '../components/Wrapper'
import { getDoctors } from '../actions/doctors.actions'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import isCloseToBottom from '../tools/isCloseToBottom'
const { width, height } = Dimensions.get('window')

class Doctors extends Component {
  _pendingPromise = []
  _appendPromise = (p) => {
    this._pendingPromise = [...this._pendingPromise, p]
  }
  _removePromise = (p) => {
    this._pendingPromise = this._pendingPromise.filter(promise => promise !== p)
  }
  _timeoutSearch = null
  _timeoutFetch = null
  render() {
    const { next_page, current_page, max_page, max_length, data, status } = this.props.doctors.all
    const _scrollY = new Animated.Value(0)
    const _elevationHeader = _scrollY.interpolate({
      inputRange: [0, 30],
      outputRange: [0, 10],
      extrapolate: 'clamp'
    })
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
    const { doctorName, polySelected, facilitySelected, filterModalVisible } = this.state
    return (
      <Wrapper contentContainerStyle={{ flex: 1 }} header navigation={this.navigation} title='Pilih Dokter'>
        <View style={{ paddingTop: 5, paddingHorizontal: 20, marginBottom: 0, zIndex: 10 }}>
          <Animated.View style={{ borderRadius: 10, backgroundColor: Color.white, padding: 0, paddingHorizontal: 0, elevation: _elevationHeader, flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <TextInput placeholderTextColor={Color.textMuted} placeholder='Cari nama dokter' style={{ paddingVertical: 6, paddingHorizontal: 15, paddingLeft: 35, backgroundColor: 'transparent', color: Color.textColor, borderRadius: 10, fontSize: 13 }} value={doctorName} onChangeText={doctorName => {
                if (this._timeoutSearch !== null) clearTimeout(this._timeoutSearch)
                this.setState({ doctorName }, () => {
                  this._timeoutSearch = setTimeout(() => {
                    this._getDoctors(true)
                  }, 1000)
                })
              }} />
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
            contentContainerStyle={{ flexGrow: 1, paddingTop: 28, paddingBottom: 10 }}
            onScroll={Animated.event([
              { nativeEvent: { contentOffset: { y: _scrollY } } }
            ], { useNativeDriver: false })}
            onMomentumScrollEnd={({ nativeEvent }) => {
              if (this._timeoutFetch !== null) clearTimeout(this._timeoutFetch)
              if (isCloseToBottom(nativeEvent) && (data.length < max_length)) {
                this._timeoutFetch = setTimeout(() => {
                  this._getDoctors()
                }, 1000)
              }
            }}
            onMomentumScrollBegin={({ nativeEvent }) => {
              if (this._timeoutFetch !== null) clearTimeout(this._timeoutFetch)
            }}
          >
            {
              status === 'ERROR' &&
              <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 10 }}>
                <View style={{ marginHorizontal: 20, padding: 20, borderRadius: 8, backgroundColor: Color.white }}>
                  <Icon style={{ textAlign: 'center', marginBottom: 5 }} size={50} name='alert-circle' color={Color.danger} />
                  <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Terjadi kesalahan</Text>
                  <Button onPress={this._getDoctors} regular title='Coba lagi' containerStyle={{ marginBottom: 0 }} color={Color.danger} />
                </View>
              </View>
              ||
              (data.length === 0 && (status === 'FETCHING' || status === '')) &&
              <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 10 }}>
                <View style={{ marginHorizontal: 20, padding: 20, borderRadius: 8, backgroundColor: Color.white, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size={50} color={Color.theme} />
                </View>
              </View>
              ||
              data.length > 0 && data.map((a, i) => (
                <TouchableHighlight
                  key={a.user_id}
                  underlayColor={Color.grayLighter}
                  style={{ marginHorizontal: 20, borderRadius: 8, marginBottom: 10 }}
                  onPress={() => {
                    this.navigation.navigate('Doctor', {
                      id: a.user_id
                    })
                  }}
                >
                  <View style={{ backgroundColor: Color.white, padding: 15, paddingHorizontal: 20, borderRadius: 8 }}>
                    <View style={{ marginHorizontal: -10, flexDirection: 'row' }}>
                      <View style={{ width: width * 18 / 100, height: width * 18 / 100, borderRadius: (width * 18 / 100) / 2, backgroundColor: Color.grayLight, marginHorizontal: 10, overflow: 'hidden' }}>
                        <Image source={a.user_picture && { uri: a.user_picture } || require('../images/logo-dark.png')} style={{ width: '100%', height: '100%', opacity: !a.user_picture && 0.15 || 1 }} resizeMode='cover' />
                      </View>
                      <View style={{ flex: 1, marginHorizontal: 10 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 0 }}>{a.user_name}</Text>
                        <Text style={{ fontSize: 13, marginBottom: 10 }}>{a.specialist_name}</Text>
                        <Text style={{ fontSize: 11, color: Color.textMuted }}><Icon name='pin' color={Color.textMuted} /> {a.faskes_name}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableHighlight>
              ))
              ||
              <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 10 }}>
                <View style={{ marginHorizontal: 20, padding: 20, borderRadius: 8, backgroundColor: Color.white }}>
                  <Icon style={{ textAlign: 'center', marginBottom: 5 }} size={50} name='alert-circle' color={Color.warning} />
                  <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>Dokter tidak ditemukan</Text>
                </View>
              </View>
            }
            {
              (data.length < max_length) &&
              <View style={{ height: 50, alignItems: 'center', justifyContent: 'center' }}>
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
              <Select placeholder='Pilih Rumah Sakit/Puskesmas' items={[{ value: '', title: 'Semua Fasilitas Kesehatan' }, ...facilities]} value={facilitySelected} onChangeValue={e => { this.setState({ facilitySelected: e.value }) }} selectionStyle={{ borderWidth: 0, backgroundColor: Color.grayLighter, borderRadius: 20 }} />
              <Select placeholder='Pilih Poli' items={[{ value: '', title: 'Semua Poli' }, ...polies]} value={polySelected} onChangeValue={e => { this.setState({ polySelected: e.value }) }} selectionStyle={{ borderWidth: 0, backgroundColor: Color.grayLighter, borderRadius: 20, marginBottom: 20 }} />
              <Button regular title='Terapkan' containerStyle={{ marginBottom: 0 }} onPress={() => {
                this._getDoctors(true)
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
    this._getDoctors(true)
  }

  _getDoctors = (reset = false) => {
    const { doctorName, polySelected, facilitySelected } = this.state
    const { next_page, current_page, max_page, max_length, data, status } = this.props.doctors.all
    if (!reset && status === 'REACHED') return true
    const bodyForm = { user_name: doctorName, poly_id: polySelected, faskes_id: facilitySelected, page: next_page } || {}
    const wrappedPromise = cancellablePromise(this.props.getDoctors(bodyForm, reset))
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        console.log('_getDoctors', res)
      })
      .then(() => {
        this._removePromise(wrappedPromise)
      })
      .catch(e => {
        console.log('_getDoctors', e)
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
    if (this._timeoutFetch !== null) clearTimeout(this._timeoutFetch)
    if (this._timeoutSearch !== null) clearTimeout(this._timeoutSearch)
  }

  _backHandler = () => {
    return false
  }

  constructor(props) {
    super(props)
    this.state = {
      polySelected: this.props.route.params.bodyForm && this.props.route.params.bodyForm.poly_id || '',
      facilitySelected: this.props.route.params.bodyForm && this.props.route.params.bodyForm.faskes_id || '',
      doctorName: this.props.route.params.bodyForm && this.props.route.params.bodyForm.user_name || '',
      filterModalVisible: false,
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
    doctors: state.doctors,
    poly: state.poly,
    facility: state.facility
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getDoctors: bindActionCreators(getDoctors, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Doctors)