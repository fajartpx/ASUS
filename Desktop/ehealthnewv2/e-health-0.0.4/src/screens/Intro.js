import React, { Component } from 'react'
import { View, Text, BackHandler, StatusBar, Dimensions, TouchableHighlight, Linking, Image, ScrollView, Animated } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Color, { colorYiq, LightenDarkenColor } from '../tools/Color'
import cancellablePromise from '../tools/cancellablePromise'
import Header from '../components/Header'
import Button from '../components/Button'
const { width, height } = Dimensions.get('window')

export default class Intro extends Component {
  _scrollView = null
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  render() {
    const _scrollX = new Animated.Value(0)
    const { scrollX } = this.state
    return (
      <View style={{ flex: 1, backgroundColor: Color.white }}>
        <Animated.ScrollView
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: _scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={e => {
            this.setState({
              scrollX: e.nativeEvent.contentOffset.x
            })
          }}
          ref={ref => { this._scrollView = ref }}
          pagingEnabled horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={{ width: width, height: '100%' }}>
            <View style={{ flex: 1, marginHorizontal: 20, alignItems: 'center', justifyContent: 'center' }}>
              <Image style={{ maxHeight: (width - 20), maxWidth: (width - 20) }} source={require('../images/intro-0.png')} />
            </View>

          </View>
          <View style={{ width: width, height: '100%' }}>
            <View style={{ flex: 1, marginHorizontal: 20, alignItems: 'center', justifyContent: 'center' }}>
              <Image style={{ maxHeight: (width - 20), maxWidth: (width - 20) }} source={require('../images/intro-1.png')} />
            </View>
            <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
              <Text style={{ textAlign: 'center', fontSize: 17, marginBottom: 3 }}>Pendaftaran Online</Text>
              <Text style={{ textAlign: 'center', color: Color.textMuted }}>Pendaftaran berobat pada fasilitas kesehatan secara online</Text>
            </View>
          </View>
          <View style={{ width: width, height: '100%' }}>
            <View style={{ flex: 1, marginHorizontal: 20, alignItems: 'center', justifyContent: 'center' }}>
              <Image style={{ maxHeight: (width - 20), maxWidth: (width - 20) }} source={require('../images/intro-2.png')} />
            </View>
            <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
              <Text style={{ textAlign: 'center', fontSize: 17, marginBottom: 3 }}>Homecare</Text>
              <Text style={{ textAlign: 'center', color: Color.textMuted }}>Pelayanan dari jarak jauh dengan chat dokter</Text>
            </View>
          </View>
          <View style={{ width: width, height: '100%' }}>
            <View style={{ flex: 1, marginHorizontal: 20, alignItems: 'center', justifyContent: 'center' }}>
              <Image style={{ maxHeight: (width - 20), maxWidth: (width - 20) }} source={require('../images/intro-3.png')} />
            </View>
            <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
              <Text style={{ textAlign: 'center', fontSize: 17, marginBottom: 3 }}>Info Covid-19</Text>
              <Text style={{ textAlign: 'center', color: Color.textMuted }}>Informasi Seputar Covid-19 di Kabupaten Kuantan Singingi</Text>
            </View>
          </View>
        </Animated.ScrollView>
        <View style={{ flexDirection: 'row', marginHorizontal: 15, marginBottom: 20, justifyContent: 'center' }}>
          <View style={{ width: 50, height: 5, borderRadius: 5 / 2, overflow: 'hidden', backgroundColor: Color.grayLighter, marginHorizontal: 5 }}>
            <Animated.View style={{
              width: '100%', height: '100%', backgroundColor: Color.theme,
              opacity: _scrollX.interpolate({
                inputRange: [width * -1, 0, width * 1],
                outputRange: [0, 1, 0],
                useNativeDriver: false
              })
            }} />
          </View>
          <View style={{ width: 50, height: 5, borderRadius: 5 / 2, overflow: 'hidden', backgroundColor: Color.grayLighter, marginHorizontal: 5 }}>
            <Animated.View style={{
              width: '100%', height: '100%', backgroundColor: Color.theme,
              opacity: _scrollX.interpolate({
                inputRange: [0, width * 1, width * 2],
                outputRange: [0, 1, 0],
                useNativeDriver: false
              })
            }} />
          </View>
          <View style={{ width: 50, height: 5, borderRadius: 5 / 2, overflow: 'hidden', backgroundColor: Color.grayLighter, marginHorizontal: 5 }}>
            <Animated.View style={{
              width: '100%', height: '100%', backgroundColor: Color.theme,
              opacity: _scrollX.interpolate({
                inputRange: [width * 1, width * 2, width * 3],
                outputRange: [0, 1, 0],
                useNativeDriver: false
              })
            }} />
          </View>
        </View>
        <View style={{ marginHorizontal: 20, paddingTop: 10 }}>
          <Button title={scrollX < width * 3 ? 'Selanjutnya' : 'Mulai'} onPress={() => {
            if (scrollX < width * 3) {
              this.setState({
                scrollX: scrollX + width
              }, () => {
                this._scrollView.scrollTo({
                  x: scrollX + width,
                  y: 0,
                  animated: true
                })
              })
            } else {
              this.navigation.replace('Start')
            }
          }} />
        </View>
      </View>
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
    const { scrollX } = this.state
    if (scrollX > 0) {
      this.setState({
        scrollX: scrollX - width
      }, () => {
        this._scrollView.scrollTo({
          x: scrollX - width,
          y: 0,
          animated: true
        })
      })
      return true
    }
    return false
  }

  constructor(props) {
    super(props)
    this.state = {
      scrollX: 0
    }
    this.statusBar = {
      backgroundColor: Color.white,
      barStyle: 'dark-content',
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