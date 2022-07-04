import React, { Component } from 'react'
import { View, Text, Modal, TouchableOpacity, StatusBar, Animated, Dimensions, ScrollView } from 'react-native'
import Color, { colorYiq, convertHex, LightenDarkenColor } from '../tools/Color'
import Icon from 'react-native-vector-icons/Ionicons'
import Button from './Button'
const { width, height } = Dimensions.get('window')

export let OpenNotify
export let CloseNotify
export let SetNotify

export default class NotifyContainer extends Component {
  _opacityAnimate = new Animated.Value(0)
  _scaleAnimate = new Animated.Value(.5)
  _scrollY = new Animated.Value(0)
  render() {
    const { isVisible, primaryButtonOnPress, secondaryButtonOnPress, primaryButtonTitle, secondaryButtonTitle, title, description, iconName, themeColor, close } = this.state
    const opacityBar = this._scrollY.interpolate({
      inputRange: [0, StatusBar.currentHeight + 20],
      outputRange: [0, 1]
    })
    return (
      <Modal
        statusBarTranslucent
        transparent
        animationType='fade'
        visible={isVisible}
        onRequestClose={this._closeNotify}
      >
        <View style={{ flex: 1 }}>
          <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight, backgroundColor: themeColor, opacity: opacityBar, zIndex: 1 }} />
          <Animated.ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', ...this.props.containerStyle }}
            onScroll={Animated.event([
              { nativeEvent: { contentOffset: { y: this._scrollY } } }
            ], { useNativeDriver: false })}
          >
            <TouchableOpacity activeOpacity={.35} onPress={close ? this._closeNotify : null} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: Color.black, opacity: .35 }} />
            <Animated.View style={{ marginTop: StatusBar.currentHeight + 20, marginBottom: 20, marginHorizontal: 50, borderRadius: 8, backgroundColor: Color.white, elevation: 10, opacity: this._opacityAnimate, transform: [{ scale: this._scaleAnimate }] }}>
              <View style={{ padding: 15, paddingVertical: 50 }}>
                <Icon name={iconName} style={{ textAlign: 'center', fontSize: width / 3, marginBottom: 15 }} color={themeColor} />
                {
                  title !== '' &&
                  <Text style={{ textAlign: 'center', fontSize: 17, fontWeight: 'bold', marginBottom: 15 }}>{title}</Text>
                }
                {
                  description !== '' &&
                  <Text style={{ textAlign: 'center', fontSize: 13, color: Color.textMuted, lineHeight: 20 }}>{description}</Text>
                }
              </View>
              <View style={{ flexDirection: 'row', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, overflow: 'hidden' }}>
                {
                  secondaryButtonOnPress &&
                  <Button onPress={() => {
                    secondaryButtonOnPress()
                    if (close) this._closeNotify()
                  }} regular color={convertHex(themeColor, 10)} titleColor={themeColor} buttonStyle={{ borderRadius: 0 }} containerStyle={{ marginBottom: 0, flex: 1 }} titleStyle={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: .5 }} title={secondaryButtonTitle} />
                }
                <Button onPress={() => {
                  primaryButtonOnPress !== null && primaryButtonOnPress()
                  if (close) this._closeNotify()
                }} regular color={themeColor} buttonStyle={{ borderRadius: 0 }} containerStyle={{ marginBottom: 0, flex: 1 }} titleStyle={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: .5 }} title={primaryButtonTitle} />
              </View>
            </Animated.View>
          </Animated.ScrollView>
        </View>
      </Modal>
    )
  }

  _openNotify = (finisher = null) => {
    this.setState({
      isVisible: true
    }, () => {
      if (!this.props.currentBarStyle || this.props.currentBarStyle !== 'light-content') StatusBar.setBarStyle(colorYiq(this.state.themeColor, true) ? 'dark-content' : 'light-content', true)
      if (this.state.onOpen) this.state.onOpen()
      Animated.timing(this._scaleAnimate, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false
      }).start()
      Animated.timing(this._opacityAnimate, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false
      }).start()
      if (finisher && typeof finisher === 'function') finisher()
    })
  }

  _closeNotify = (finisher = null) => {
    Animated.timing(this._scaleAnimate, {
      toValue: .5,
      duration: 300,
      useNativeDriver: false
    }).start()
    Animated.timing(this._opacityAnimate, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false
    }).start()
    setTimeout(() => {
      this.setState({
        isVisible: false
      }, () => {
        if (this.props.currentBarStyle) StatusBar.setBarStyle(this.props.currentBarStyle, true)
        if (this.state.onClose) this.state.onClose()
        if (finisher && typeof finisher === 'function') finisher()
      })
    }, 300)
  }

  _setNotify = (settings, finisher = null) => {
    this.setState({
      ...this.state,
      ...settings
    }, () => {
      if (finisher && typeof finisher === 'function') finisher()
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      isVisible: false,
      primaryButtonOnPress: null,
      secondaryButtonOnPress: () => { console.log('clicked!') },
      onClose: null,
      onOpen: null,
      primaryButtonTitle: 'OK',
      secondaryButtonTitle: 'Cancel',
      title: '',
      description: '',
      iconName: 'notifications-outline',
      themeColor: Color.primary,
      close: true
    }

    OpenNotify = this._openNotify
    CloseNotify = this._closeNotify
    SetNotify = this._setNotify
  }
}