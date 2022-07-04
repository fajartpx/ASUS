import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, Dimensions, TouchableHighlight, Linking, Animated, ScrollView, ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Color, { colorYiq, LightenDarkenColor } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
import Wrapper from '../components/Wrapper'
import SetByCategories from '../components/SetByCategories'
import { getDoctors } from '../actions/doctors.actions'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ListItem } from '../components/Item'
import isCloseToBottom from '../tools/isCloseToBottom'
import Button from '../components/Button'
const { width, height } = Dimensions.get('window')

class Consultation extends Component {
  _focusedSubscription = null
  _bluredSubscription = null
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  _wrapperTranslateY = new Animated.Value(50)
  _timeoutFetch = null
  _timeoutSearch = null
  render() {
    const { data, status, max_length } = this.props.doctors.all
    const { searchKeyword, selectedCategory, ready } = this.state
    const polies = this.props.poly.data.map(a => {
      return {
        value: a.poly_id,
        title: a.poly_name
      }
    })
    return (
      <Wrapper header themeColor={Color.success} navigation={this.navigation} title='Konsultasi'>
        <Animated.View style={{ flexGrow: 1, borderRadius: 10, elevation: 1, backgroundColor: Color.white, marginBottom: 15, marginHorizontal: 20, everflow: 'hidden', transform: [{ translateY: this._wrapperTranslateY }] }}>
          <View style={{ paddingVertical: 20, paddingBottom: 10, paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: 65, height: 65, borderRadius: (65) / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: Color.theme }}>
                <Icon name='chatbubble-ellipses' size={30} color={colorYiq(Color.theme)} />
              </View>
              <View style={{ flex: 1, marginLeft: 20 }}>
               <Text style={{ fontWeight: 'bold', fontSize: 15 }}>Chat Bersama Dokter</Text>
                <Text numberOfLines={2} style={{ fontSize: 13, color: Color.textMuted, lineHeight: 20 }}>Chat bersama dokter</Text>
              </View>
            </View>
          </View>
          <SetByCategories containerStyle={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20, overflow: 'hidden' }} searchKeyword={searchKeyword}
            onChangeSearch={(text) => {
              this.setState({ searchKeyword: text }, () => {
                this._timeoutSearch = setTimeout(() => {
                  this._getDoctors(true)
                }, 1000)
              })
            }}
            selectedCategory={selectedCategory} categories={[{ value: '', title: 'Semua Poli' }, ...polies]}
            onChangeCategory={(e) => {
              this.setState({ selectedCategory: e }, () => {
                this._getDoctors(true)
              })
            }}
          >
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}
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
                <View style={{ marginBottom: 10 }}>
                  <View style={{ marginHorizontal: 20, padding: 20, borderRadius: 8, backgroundColor: Color.white }}>
                    <Icon style={{ textAlign: 'center', marginBottom: 5 }} size={50} name='alert-circle' color={Color.danger} />
                    <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Terjadi kesalahan</Text>
                    <Button onPress={this._getDoctors} regular title='Coba lagi' containerStyle={{ marginBottom: 0 }} color={Color.danger} />
                  </View>
                </View>
                ||
                (!ready || (data.length === 0 && (status === 'FETCHING' || status === ''))) &&
                <View style={{ marginBottom: 10 }}>
                  <View style={{ marginHorizontal: 20, padding: 20, borderRadius: 8, backgroundColor: Color.white, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size={50} color={Color.theme} />
                  </View>
                </View>
                ||
                data.length > 0 && data.map(a => (
                  <ListItem key={a.user_id} onPress={() => {
                    this.navigation.navigate('ConsultationForm', {
                      send_to_user_id: a.user_id
                    })
                  }} title={a.user_name} thumbnail={a.user_picture ? { uri: a.user_picture } : false} subitle={a.specialist_name} infoContainerStyle={{ justifyContent: 'center' }} optional={
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 8, height: 8, borderRadius: 8 / 2, backgroundColor: a.user_doctor_available === '1' ? Color.success : Color.gray }} />
                      <Text style={{ fontSize: 13, marginLeft: 5 }}>{a.user_doctor_available === '1' ? 'Tersedia' : 'Tidak Tersedia'}</Text>
                    </View>
                  } />
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
                (ready && data.length < max_length) &&
                <View style={{ height: 50, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size={30} color={Color.theme} />
                </View>
              }
            </ScrollView>
          </SetByCategories>
        </Animated.View>
      </Wrapper>
    )
  }

  componentDidMount() {
    this._focusedSubscription = this.navigation.addListener('focus', () => {
      StatusBar.setBackgroundColor(this.statusBar.backgroundColor, this.statusBar.isAnimation)
      StatusBar.setBarStyle(this.statusBar.barStyle, this.statusBar.isAnimation)
      StatusBar.setTranslucent(this.statusBar.isTranslucent)
      BackHandler.addEventListener('hardwareBackPress', this._backHandler)
      const { route } = this.props
      if (route.params) {
        const { backHandlerPrevScreen } = route.params
        if (backHandlerPrevScreen) backHandlerPrevScreen.remove()
      }
      Animated.timing(this._wrapperTranslateY, {
        toValue: 0,
        delay: 500,
        duration: 500,
        useNativeDriver: false
      }).start()
      this._getDoctors(true)
    })
    this._bluredSubscription = this.navigation.addListener('blur', () => {
      this.setState({
        ready: false
      })
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
      Animated.timing(this._wrapperTranslateY, {
        toValue: 50,
        delay: 500,
        duration: 500,
        useNativeDriver: false
      }).start()
    })
  }

  _getDoctors = (reset = false) => {
    const { searchKeyword, selectedCategory } = this.state
    const { next_page, current_page, max_page, max_length, data, status } = this.props.doctors.all
    const bodyForm = { user_name: searchKeyword, poly_id: selectedCategory, page: next_page, user_doctor_chat: '1' }
    const wrappedPromise = cancellablePromise(this.props.getDoctors(bodyForm, reset))
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        console.log('_getDoctors', res)
      })
      .then(() => {
        this._removePromise(wrappedPromise)
        this.setState({
          ready: true
        })
      })
      .catch(e => {
        console.log('_getDoctors', e)
      })
  }

  componentWillUnmount() {
    if (this._focusedSubscription !== null)
      this._focusedSubscription = null
    if (this._bluredSubscription !== null)
      this._bluredSubscription = null
  }

  _backHandler = () => {
    return false
  }

  constructor(props) {
    super(props)
    this.state = {
      searchKeyword: '',
      selectedCategory: '',
      ready: false
    }
    this.statusBar = {
      backgroundColor: Color.success,
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
    poly: state.poly
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getDoctors: bindActionCreators(getDoctors, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Consultation)