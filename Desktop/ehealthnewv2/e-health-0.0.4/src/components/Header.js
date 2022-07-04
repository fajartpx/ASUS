import React, { Component } from 'react'
import { View, Text, TouchableHighlight, Animated } from 'react-native'
import Color, { colorYiq } from '../tools/Color'
import Icon from 'react-native-vector-icons/Ionicons'

const Header = (props) => {
  const color = props.color || Color.theme
  return (
    <View style={{ height: 55, backgroundColor: props.backgroundColor || color, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', ...props.containerStyle }}>
      {
        (props.navigation && (props.navigation && props.navigation.canGoBack()) || props.customPress) &&
        <TouchableHighlight
          underlayColor={'rgba(0,0,0,.15)'}
          onPress={() => {
            (props.navigation && props.navigation.canGoBack()) &&
              props.navigation.goBack()
              ||
              typeof props.customPress === 'function' &&
              props.customPress()
          }}
          style={{ width: 45, height: 45, marginVertical: -7.5, borderRadius: 45 / 2, alignItems: 'center', justifyContent: 'center', marginLeft: -10, marginRight: 5 }}
        >
          <Icon name={props.customBackIcon || 'chevron-back'} size={24} style={{ marginLeft: -3 }} color={props.textColor || colorYiq(color)} />
        </TouchableHighlight>
      }
      <View style={{ marginHorizontal: 5, flex: 1 }}>
        {
          (props.title && typeof props.title === 'string') &&
          <Animated.Text numberOfLines={props.titleNumberOfLines || 0} style={{ color: props.textColor || colorYiq(color), textAlignVertical: 'center', fontWeight: 'bold', fontSize: 16, ...props.titleStyle }}>{props.title}</Animated.Text>
          ||
          (props.title && typeof props.title === 'object') &&
          props.title
        }
      </View>
      {
        (props.additional && typeof props.additional) &&
        props.additional
      }
    </View>
  )
}
export default Header