import React from 'react'
import { View, Text, TouchableHighlight, Dimensions, Image } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Color from '../tools/Color'
const { width, height } = Dimensions.get('window')

export const ListItem = props => {
  return (
    <TouchableHighlight
      underlayColor={Color.grayLighter}
      style={{ ...props.containerStyle }}
      onPress={props.onPress}
    >
      <View style={{ backgroundColor: Color.white, padding: 15, paddingHorizontal: 20, ...props.contentContainerStyle }}>
        <View style={{ marginHorizontal: -10, flexDirection: 'row' }}>
          <View style={{ width: width * 18 / 100, height: width * 18 / 100, borderRadius: (width * 18 / 100) / 2, backgroundColor: Color.grayLight, marginHorizontal: 10, overflow: 'hidden', borderWidth: 4, borderColor: Color.grayLighter }}>
            {
              props.thumbnail &&
              <Image source={props.thumbnail} style={{ width: '100%', height: '100%' }} />
              ||
              <Image source={require('../images/logo-dark.png')} style={{ width: '100%', height: '100%', opacity: 0.15 }} resizeMode='cover' />
            }
          </View>
          <View style={{ flex: 1, marginHorizontal: 10, ...props.infoContainerStyle }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{props.title}</Text>
            <Text style={{ fontSize: 13, marginBottom: 5, color: Color.textMuted }}>{props.subitle}</Text>
            {
              props.optional ?
                typeof props.optional === 'string' &&
                <Text style={{ fontSize: 11, color: Color.textMuted }}>{props.optionalText}</Text>
                ||
                typeof props.optional === 'object' &&
                props.optional
                : null
            }
          </View>
        </View>
      </View>
    </TouchableHighlight>
  )
}