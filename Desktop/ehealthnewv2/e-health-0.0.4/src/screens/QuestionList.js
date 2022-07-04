import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, Dimensions, Animated, ActivityIndicator, TouchableHighlight } from 'react-native'
import { connect } from 'react-redux'
import { userLoggedIn } from '../../NavigationServices'
import cancellablePromise from '../tools/cancellablePromise'
import Color, { colorYiq } from '../tools/Color'
import { TIMTIK_API_URL } from '../tools/constants'
import dateFormat, { timeFormat } from '../tools/dateFormat'
import isCloseToBottom from '../tools/isCloseToBottom'
import { getTimTimToken, timTikToken } from './Home'
import Icon from 'react-native-vector-icons/Ionicons'
import Button from '../components/Button'

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
    const { data, page, maxPage, fetchStatus } = this.state
    return (
      <View style={{ flex: 1, backgroundColor: Color.white }}>
        <Animated.ScrollView
          onMomentumScrollEnd={({ nativeEvent }) => {
            if (this._timeoutFetch) clearTimeout(this._timeoutFetch)
            if (isCloseToBottom(nativeEvent) && (page <= maxPage)) {
              this._timeoutFetch = setTimeout(() => {
                this._getQuestion()
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
              <Button onPress={() => { this._getQuestion(true) }} title='Coba lagi' color={Color.danger} regular containerStyle={{ marginBottom: 0 }} />
            </View>
          }
          {
            (page > maxPage && data.length === 0) &&
            <View style={{ padding: 20, marginBottom: 20, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 20, color: Color.textMuted }}>Belum ada tanya sehat</Text>
            </View>
          }
          {
            data.map((a, i) => (
              <TouchableHighlight
                key={a.question_id}
                underlayColor={Color.gray}
                style={{ borderRadius: 8 }}
                onPress={() => {
                  this.navigation.navigate('QuestionDetails', {
                    question_id: a.question_id
                  })
                }}
              >
                <View style={{ backgroundColor: Color.white, padding: 10, paddingHorizontal: 20 }}>
                  <View style={{ marginHorizontal: -10, flexDirection: 'row' }}>
                    <View style={{ flex: 1, marginHorizontal: 10 }}>
                      <Text style={{ fontSize: 17, marginBottom: 3, fontWeight: 'bold' }}>{a.question_code}</Text>
                      <Text style={{ fontSize: 13, color: Color.textMuted }}>{a.question_type}</Text>
                    </View>
                    <View style={{ marginHorizontal: 10, paddingTop: 5 }}>
                      <Text style={{ fontSize: 13, color: Color.textMuted, textAlign: 'right' }}>{timeFormat(a.date_answer)}</Text>
                      <Text style={{ textAlign: 'right', fontSize: 11, color: a.question_status === '1' ? Color.success : Color.danger, fontStyle: 'italic' }}>{a.question_status === '1' ? 'Telah dijawab' : 'Belum dijawab'}</Text>
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
      this._getQuestion(true)
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
      this._getQuestion(true)
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

  _getQuestion = (reset = false) => {
    if (reset)
      return this.setState({
        page: 1,
        data: []
      }, () => { this._getQuestion() })
    const { page, maxPage, data } = this.state
    if (page > maxPage) return true
    this.setState({
      fetchStatus: 'FETCHING'
    })
    if (!timTikToken) return getTimTimToken(this._getQuestion, () => { console.log('error') })
    const wrappedPromise = cancellablePromise(this._promiseGetQuestion())
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

  _promiseGetQuestion = () => {
    const { page } = this.state
    const url = `${TIMTIK_API_URL}api/question?user_id=${userLoggedIn.user_id}&page=${page}&limit=10`
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