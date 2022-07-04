import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, TouchableHighlight, Linking, ToastAndroid } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Color, { colorYiq } from '../tools/Color'
import Wrapper from '../components/Wrapper'
import md5 from 'md5'

export class ContactUs extends Component {
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  render() {
    const { contacts } = this.state
    return (
      <Wrapper header navigation={this.navigation} title='Hubungi Kami'
        contentContainerStyle={{ paddingTop: 70 }}
      >
        {
          contacts.map((a, i) => (
            <TouchableHighlight
              key={md5(`${i}${new Date().getTime()}`)}
              underlayColor={Color.gray}
              style={{ marginHorizontal: 20, borderRadius: 8, marginBottom: 15 }}
              onPress={a.onPress}
            >
              <View style={{ backgroundColor: Color.white, padding: 15, paddingHorizontal: 20, borderRadius: 8 }}>
                <View style={{ marginHorizontal: -10, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1, marginHorizontal: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 2 }}>{a.title}</Text>
                    <Text style={{ fontSize: 14, marginBottom: 6 }}>{a.value}</Text>
                  </View>
                  <View style={{ width: 60, height: 60, borderRadius: 60 / 2, backgroundColor: a.color, marginHorizontal: 10, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={a.icon} size={28} color={colorYiq(a.color)} />
                  </View>
                </View>
              </View>
            </TouchableHighlight>
          ))
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

  constructor(props) {
    super(props)
    this.state = {
      contacts: [
        {
          title: 'Dinas Kesehatan Kuansing',
          value: '+62 812-6600-9182',
          icon: 'phone',
          color: Color.warning,
          onPress: () => {
            Linking.openURL(`tel:+62812-6600-9182`)
          }
        },
        {
          title: 'E-MAIL',
          value: 'diskes.kuansing@gmail.com',
          icon: 'envelope',
          color: Color.grayLighter,
          onPress: () => {
            Linking.openURL(`mailto:dinkes.kuansing@gmail.com`)
          }
        },
        {
          title: 'Instagram',
          value: '@kuansinghealth',
          icon: 'instagram',
          color: Color.danger,
          onPress: () => {
            Linking.openURL(`#`)
          }
        },
        {
          title: 'Whatsapp ',
          value: '+62 812-6600-9182',
          icon: 'whatsapp',
          color: Color.success,
          onPress: () => {
            Linking.canOpenURL('whatsapp://send?phone=6281266009182').then(res => {
              if (res) {
                Linking.openURL('whatsapp://send?phone=6281266009182')
              } else {
                ToastAndroid.show('Aplikasi WhatsApp tidak terpasang', ToastAndroid.SHORT)
              }
            })
          }
        }
      ]
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