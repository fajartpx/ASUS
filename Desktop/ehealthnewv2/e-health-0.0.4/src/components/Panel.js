import React from 'react'
import { View, Text, TouchableHighlight } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Color, { colorYiq } from '../tools/Color'


export const Info = props => {
  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={{ marginBottom: 5, fontSize: 13, color: Color.textMuted }}>{props.label}</Text>
      {
        (props.value && typeof props.value === 'string') &&
        <Text style={{ fontSize: 17, fontWeight: 'bold' }}>{props.value}</Text>
        ||
        props.value
      }
    </View>
  )
}

export const Panel = props => {
  return (
    <View style={{ backgroundColor: Color.white, borderRadius: 10, padding: 20, paddingBottom: 5, marginBottom: 20, ...props.containerStyle }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: -5 }}>
        <Text numberOfLines={1} style={{ flex: 1, fontSize: 16, letterSpacing: .75, fontWeight: 'bold', paddingRight: 5 }}>{props.title}</Text>
        {
          props.onSideButtonPress &&
          <TouchableHighlight
            style={{ borderRadius: 35 / 2 }}
            onPress={props.onSideButtonPress}
          >
            <View style={{ width: 35, height: 35, borderRadius: 35 / 2, backgroundColor: Color.theme, justifyContent: 'center', elevation: 10 }}>
              <Icon name={props.iconName} size={18} style={{ textAlign: 'center' }} color={colorYiq(Color.theme)} />
            </View>
          </TouchableHighlight>
        }
      </View>
      <View style={{ paddingLeft: 10 }}>
        {props.children}
      </View>
    </View>
  )
}