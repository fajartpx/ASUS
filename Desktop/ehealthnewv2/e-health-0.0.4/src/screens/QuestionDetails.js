import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, Dimensions, TouchableHighlight, Linking, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Color, { colorYiq, LightenDarkenColor } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
import Wrapper from '../components/Wrapper'
import Input from '../components/Input'
import { Info, Panel } from '../components/Panel'
import { TIMTIK_API_URL } from '../tools/constants'
import { getTimTimToken, timTikToken } from './Home'
import Button from '../components/Button'
import { timeFormat } from '../tools/dateFormat'
const { width, height } = Dimensions.get('window')

export default class QuestionDetails extends Component {
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  render() {
    const { data, fetchStatus } = this.state
    return (
      <Wrapper header themeColor={Color.theme} navigation={this.navigation} title='Tanya Sehat'
        // afterContent={
        //   <View style={{ paddingHorizontal: 20, paddingVertical: 15, borderTopColor: Color.borderColor, borderTopWidth: 1 }}>
        //     <TouchableHighlight
        //       onPress={() => {
        //         console.log('clicked')
        //       }}
        //       style={{ borderRadius: 20 }}
        //     >
        //       <View style={{ paddingVertical: 15, paddingHorizontal: 20, backgroundColor: Color.theme, borderRadius: 20 }}>
        //         <Text style={{ textAlign: 'center', color: colorYiq(Color.theme), fontSize: 18, fontWeight: 'bold' }}>Beri Ulasan</Text>
        //       </View>
        //     </TouchableHighlight>
        //   </View>
        // }
        contentContainerStyle={{ paddingHorizontal: 20, marginTop: 10 }}
      >
        {
          fetchStatus === 'FETCHING' &&
          <View style={{ padding: 20, backgroundColor: Color.white, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size={50} color={Color.theme} />
            <Text style={{ textAlign: 'center', fontWeight: 'bold', marginTop: 10 }}>Mengambil data...</Text>
          </View>
          ||
          fetchStatus === 'NOT_FOUND' &&
          <View style={{ padding: 20, backgroundColor: Color.white, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name='alert-circle-outline' size={70} color={Color.warning} />
            <Text style={{ textAlign: 'center', fontWeight: 'bold', marginTop: 10 }}>Tidak ditemukan</Text>
          </View>
          ||
          fetchStatus === 'ERROR' &&
          <View style={{ padding: 20, backgroundColor: Color.white, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name='alert-circle-outline' size={70} color={Color.danger} />
            <Text style={{ textAlign: 'center', fontWeight: 'bold', marginTop: 10, marginBottom: 15 }}>Gagal mengambil data</Text>
            <Button regular color={Color.danger} onPress={this._getDetails} title='Coba lagi' containerStyle={{ marginBottom: 0 }} />
          </View>
          ||
          <>
            <Panel title='Pertanyaan'>
              <Info label='Nomor Pertanyaan' value={data.question_code} />
              <Info label='Jenis Keluhan' value={data.question_type} />
              <Info label='Dibuat' value={timeFormat(data.date_added)} />
              <Info label='Detail Pertanyaan' value={data.question_text} />
            </Panel>
            {
              data.answer_text ?
              <Panel containerStyle={{ marginBottom: 30 }} title='Jawaban'>
                <Info label='Dijawab' value={timeFormat(data.date_answer)} />
                <Info label='Detail Jawaban' value={data.answer_text} />
              </Panel>
              :
              <View style={{ borderRadius: 10, backgroundColor: Color.white, padding: 20, marginBottom: 20 }}>
                <Text style={{ textAlign: 'center', color: Color.textMuted }}>Pertanyaan belum dijawab</Text>
              </View>
            }
          </>
        }
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
    this._getDetails()
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

  _getDetails = () => {
    this.setState({
      fetchStatus: 'FETCHING'
    })
    if (!timTikToken) return getTimTimToken(this._getDetails, () => { console.log('error') })
    const wrappedPromise = cancellablePromise(this._promiseGetDetails())
    this._appendPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        if (res.status_string === 'OK') return this.setState({
          fetchStatus: 'READY',
          data: res.data
        })
        if (res.status_string === 'UNAUTHORIZED' || res.status_string === 'EXPIRED') return getTimTimToken(this._getDetails, () => { console.log('error') })
        if (res.status_string === 'NOT FOUND') return this.setState({
          fetchStatus: 'NOT_FOUND'
        })

        this.setState({
          fetchStatus: 'ERROR'
        })
      })
      .then(() => {
        this._removePromise(wrappedPromise)
      })
      .catch(() => {
        this.setState({
          fetchStatus: 'ERROR'
        })
      })
  }

  _promiseGetDetails = () => {
    return new Promise((resolve, reject) => {
      fetch(`${TIMTIK_API_URL}api/question_details?question_id=${this.props.route.params.question_id}`, {
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