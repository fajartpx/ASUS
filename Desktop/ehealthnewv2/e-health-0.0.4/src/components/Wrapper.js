import React, { Component } from 'react'
import { View, Animated, Dimensions, Image, StatusBar } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Color from '../tools/Color'
const { width, height } = Dimensions.get('window')
import Header from './Header'

const Wrapper = (props) => {
  const ScrollY = new Animated.Value(0)
  const backgroundRatio = props.backgroundRatio || [16, 9]
  const headerHeight = props.isStatusBarTranslucent && typeof props.isStatusBarTranslucent === 'boolean' ? (55 + StatusBar.currentHeight) : 55
  const backgroundHeight = ScrollY.interpolate({
    inputRange: [0, (width / backgroundRatio[0] * backgroundRatio[1] - headerHeight) * (props.paper ? 1 : (1 - 0.5))],
    outputRange: [width / backgroundRatio[0] * backgroundRatio[1], headerHeight],
    extrapolate: 'clamp'
  })
  const opacityBackgroundHeader = ScrollY.interpolate({
    inputRange: [0, (width / backgroundRatio[0] * backgroundRatio[1] - headerHeight) * (1 - 0.75)],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  })
  const borderRadiusPaper = ScrollY.interpolate({
    inputRange: [0, props.background === 'image' ? (width / backgroundRatio[0] * backgroundRatio[1]) - headerHeight : 20],
    outputRange: [20, 0],
    extrapolate: 'clamp'
  })

  return (
 <View style={{ flex: 1 }}>
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: backgroundHeight }} >
        {
          props.background === 'image' &&
          <View style={{ flex: 1 }}>
            <Image source={props.sourceImage} style={{ width: width, height: '100%' }} />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,.25)', Color.black]} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          </View>
          ||
          <LinearGradient colors={[props.themeColor || Color.theme, props.themeColor || Color.theme, props.themeColor ||  Color.theme ]} style={{ flex: 1, borderBottomRightRadius:30, borderBottomLeftRadius:30 }} />
        }
      </Animated.View>
      {
        (props.header && typeof props.header === 'boolean') &&
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
          <Animated.View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, backgroundColor: props.themeColor || Color.theme, opacity: opacityBackgroundHeader }} />
          <Header titleStyle={props.titleHeaderStyle} titleNumberOfLines={props.titleHeaderNumberOfLines} backgroundColor={'transparent'} textColor={props.textHeaderColor || Color.white} navigation={props.navigation} title={props.title} additional={props.headerAdditional} containerStyle={{ height: headerHeight, paddingTop: props.isStatusBarTranslucent && typeof props.isStatusBarTranslucent === 'boolean' ? StatusBar.currentHeight : 0 }} />
        </View>
        ||
        (props.header && typeof props.header === 'object') &&
        props.header
      }
      <Animated.View style={[{ flex: 1 }, props.paper && typeof props.paper === 'boolean' || props.paper === 'out' ? { marginTop: props.paper ? headerHeight : 0, backgroundColor: props.paper ? Color.white : null, borderTopLeftRadius: props.paper ? borderRadiusPaper : 0, borderTopRightRadius: props.paper ? borderRadiusPaper : 0, overflow: 'hidden' } : {}]}>
        <Animated.ScrollView
          nestedScrollEnabled={true}
          contentContainerStyle={{ flexGrow: 1, paddingTop: props.paper && typeof props.paper === 'boolean' || props.paper === 'out' ? 0 : headerHeight, ...props.contentContainerStyle }}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: ScrollY } } }],
            { useNativeDriver: false, listener: props.onScrollListener }
          )}
        >
          {props.beforeContent}
          <Animated.View style={[{ flexGrow: 1 }, props.paper && props.paper === 'in' ? { marginTop: props.paper && typeof props.paper === 'boolean' || props.paper === 'out' ? headerHeight : 0, backgroundColor: props.paper ? Color.white : null, borderRadius: props.paper ? borderRadiusPaper : 0, overflow: 'hidden' } : {}]}>
            {props.children}
          </Animated.View>
        </Animated.ScrollView>
        {
          props.afterContent
        }
      </Animated.View>
    </View>
  )
}

export default Wrapper