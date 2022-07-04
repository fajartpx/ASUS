import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, TouchableHighlight, TouchableOpacity, ToastAndroid, ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Color, { colorYiq } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
import Wrapper from '../components/Wrapper'
import Input from '../components/Input'
import { TIMTIK_API_URL } from '../tools/constants'
import { getTimTimToken, timTikToken } from './Home'
import { userLoggedIn } from '../../NavigationServices'

export default class QuestionForm extends Component {
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  render() {
    const { questionText, error, loading } = this.state
    return (
      <Wrapper header paper themeColor={Color.theme} navigation={this.navigation} title='Pertanyaan'
        afterContent={
          <View style={{ paddingHorizontal: 20, paddingVertical: 15, borderTopColor: Color.borderColor, borderTopWidth: 1 }}>
            <TouchableHighlight
              onPress={() => {
                if (loading) return true
                if (questionText === '') return ToastAndroid.show('Mohon isi pertanyaan Anda', ToastAndroid.SHORT)
                this._send()
              }}
              style={{ borderRadius: 20 }}
            >
              <View style={{ height: 60, justifyContent: 'center', paddingHorizontal: 20, backgroundColor: !error && Color.theme || Color.danger, borderRadius: 20 }}>
                {
                  loading &&
                  <ActivityIndicator size={25} color={colorYiq(!error && Color.theme || Color.danger)} />
                  ||
                  <Text style={{ textAlign: 'center', color: colorYiq(!error && Color.theme || Color.danger), fontSize: 18, fontWeight: 'bold' }}>{error && 'Coba lagi' || 'Kirim'}</Text>
                }
              </View>
            </TouchableHighlight>
          </View>
        }
      >
        <View style={{ marginVertical: 20, marginHorizontal: 20 }}>
          <TouchableOpacity
            onPress={() => {
              this.navigation.goBack()
            }}
            style={{ marginBottom: 20 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text numberOfLines={1} style={{ fontSize: 18, fontWeight: 'bold' }}>{this.props.route.params.question_type}</Text>
              <Icon name='chevron-down' size={18} color={Color.textColor} />
            </View>
          </TouchableOpacity>
          <Input multiline placeholder='Masukkan pertanyaan' value={questionText} onChangeText={e => { this.setState({ questionText: e }) }} />
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

  _send = () => {
    this.setState({
      loading: true,
      error: false
    })
    if (!timTikToken) return getTimTimToken(this._send, () => { console.log('error') })
    const wrappedPromise = cancellablePromise(this._promiseSend())
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        if (res.status_string === 'OK')
          return this.navigation.replace('QuestionDetails', {
            question_id: res.data.question_id
          })
        if (res.status_string === 'UNAUTHORIZED' || res.status_string === 'EXPIRED')
          return getTimTimToken(this._send, () => { console.log('error') })

        this.setState({
          error: true
        })
      })
      .then(() => {
        this.setState({
          loading: false
        })
      })
      .catch(() => {
        this.setState({
          error: true
        })
      })
  }

  _promiseSend = () => {
    const { questionText } = this.state
    const body = new FormData()
    body.append('question_type', this.props.route.params.question_type)
    body.append('question_text', questionText)
    body.append('user_id', userLoggedIn.user_id)
    return new Promise((resolve, reject) => {
      fetch(`${TIMTIK_API_URL}api/question`, {
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

  constructor(props) {
    super(props)
    this.state = {
      questionText: '',
      error: false,
      loading: false
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