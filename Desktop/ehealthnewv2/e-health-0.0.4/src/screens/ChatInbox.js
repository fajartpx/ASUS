import React, { Component } from 'react'
import { View, Text, StatusBar, BackHandler, TouchableHighlight, Image } from 'react-native'
import Color, { colorYiq } from '../tools/Color'
import Icon from 'react-native-vector-icons/Ionicons'
import { userLoggedIn } from '../../NavigationServices'
import { connect } from 'react-redux'
import { decrypt } from '../tools/AES'

class ChatInbox extends Component {
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  render() {
    const user = userLoggedIn
    const chats = this.props.chats.data
    const unseen_chats = this.props.chats.unseen_data
    return (
      <View style={{ backgroundColor: Color.white, flex: 1 }}>
        {
          chats.filter(a => a.message_time !== '').length === 0 &&
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {
              <Text style={{ fontSize: 20, textAlign: 'center', fontWeight: 'bold', color: Color.textMuted }}>Belum ada konsultasi</Text>
            }
          </View>
          ||
          chats.filter(a => a.message_time !== '').map((a, i) => {
            let unseen = unseen_chats.map(b => b.chat_id).indexOf(a.chat_id) >= 0 ? parseInt(unseen_chats[unseen_chats.map(b => b.chat_id).indexOf(a.chat_id)].unseen_count) : 0
            return (
              <TouchableHighlight
                key={a.chat_id}
                onPress={() => {
                  this.navigation.navigate('ChatBubble', {
                    user_id: user.user_id,
                    chat_id: a.chat_id,
                    interlocutor: {
                      user_id: a.user_id,
                      user_name: a.user_name,
                      user_picture: a.user_picture
                    }
                  })
                }}
              >
                <View style={{ flexDirection: 'row', paddingLeft: 20, backgroundColor: Color.white }}>
                  <View style={{ marginVertical: 10, width: 55, height: 55, borderRadius: 55 / 2, backgroundColor: Color.grayLight, overflow: 'hidden', borderWidth: 3, borderColor: a.chat_status === '1' && Color.theme || Color.grayLighter }}>
                    {
                      a.user_picture ?
                      <Image source={{ uri: a.user_picture }} resizeMode='cover' style={{ width: '100%', height: '100%' }} />
                      :
                      <Image source={require('../images/logo-dark.png')} style={{ width: '100%', height: '100%', opacity: 0.15 }} resizeMode='cover' />
                    }
                  </View>
                  <View style={{ borderBottomColor: Color.borderColor, borderBottomWidth: 1, flex: 1, marginLeft: 20, marginTop: 10, flexDirection: 'row', paddingRight: 20 }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 3 }}>{a.user_name}</Text>
                      <Text numberOfLines={1} style={{ fontSize: 13, color: Color.textMuted }}>{user.user_id === a.sender_user_id && 'Anda: '}
                        {
                          a.message_attachment_url !== '' && <Text style={{ fontSize: 13 }}><Icon name='camera' color={Color.textMuted} size={15} /> </Text>
                        }
                        {
                          a.message_text !== '' && decrypt(a.message_text)
                        }
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', paddingTop: 5 }}>
                      <Text style={{ color: unseen > 0 ? Color.theme : Color.textMuted, fontSize: 12, marginBottom: 3 }}>{a.message_time !== '' && timeFormat(a.message_time)}</Text>
                      {
                        unseen > 0 &&
                        <View style={{ width: 20, height: 20, borderRadius: 20 / 2, backgroundColor: Color.theme, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ color: colorYiq(Color.theme), fontSize: 10 }}>{unseen}</Text>
                        </View>
                      }
                    </View>
                  </View>
                </View>
              </TouchableHighlight>
            )
          })
        }
      </View>
    )
  }

  _focusedSubscription = null
  _tabPressedSubscription = null
  _bluredSubscription = null
  componentDidMount() {
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
    })

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

  constructor(props) {
    super(props)
    this.statusBar = {
      backgroundColor: Color.theme,
      barStyle: colorYiq(Color.theme, true) ? 'dark-content' : 'light-content',
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

function timeFormat(dateTime, now = new Date()) {
  let ynow = (now.getFullYear()).toString()
  let mnow = ('0' + (now.getMonth() + 1).toString()).slice(-2)
  let dnow = ('0' + (now.getDate()).toString()).slice(-2)
  let nowstr = ynow + '-' + mnow + '-' + dnow
  let datenow = new Date(nowstr)
  let datedefine = new Date(dateTime.substr(0, 10))
  // To calculate the time difference of two dates
  let Difference_In_Time = datenow.getTime() - datedefine.getTime()
  // To calculate the no. of days between two dates
  let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24)

  let days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  if (Difference_In_Days < 7) {
    switch (Difference_In_Days) {
      case 0:
        return dateTime.substr(11, 5)
      case 1:
        return 'Kemarin'
      default:
        return days[datedefine.getDay()]
    }
  }

  let ydef = dateTime.substr(0, 4)
  let mdef = dateTime.substr(5, 2)
  let ddef = dateTime.substr(8, 2)
  return ddef + '/' + mdef + '/' + ydef.substr(2, 2)

}

function mapStateToProps(state) {
  return {
    chats: state.chats
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatInbox)