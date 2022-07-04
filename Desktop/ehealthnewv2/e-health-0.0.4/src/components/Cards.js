import React, { Component } from 'react'
import { View, Text, Dimensions, ScrollView, Animated, TouchableHighlight, TouchableOpacity } from 'react-native'
import Color from '../tools/Color'
const { width, height } = Dimensions.get('window')

const Cards = (props) => {
  return (
    <View style={{ ...props.containerStyle }}>
      {
        props.header &&
        <View style={{ flexDirection: 'row', marginHorizontal: 15, marginBottom: 15 }}>
          <Text style={{ marginHorizontal: 5, flex: 1 }}>{props.headerTitle}</Text>
          {
            props.seeMore &&
            <TouchableOpacity
              style={{ marginHorizontal: 5, marginTop: 1 }}
              onPress={props.seeMore}
            >
              <Text style={{ color: Color.theme, fontSize: 13 }}>Lihat Semua</Text>
            </TouchableOpacity>
          }
        </View>
      }
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {
          props.children.length &&
          props.children.map((a, i) => (
            <View key={'card_of_' + i} style={{ marginLeft: i === 0 ? 20 : 5, marginRight: i + 1 === props.children.length ? 20 : 5 }}>
              {a}
            </View>
          ))
          ||
          props.children
        }
      </ScrollView>
    </View>
  )
}
export default Cards

export const Card = (props) => {
  return (
    <TouchableHighlight
      style={{ borderRadius: 8, flexGrow: 1, ...props.containerStyle }}
      onPress={props.onPress}
    >
      <View style={{ width: (width - 70) / 2, borderRadius: 8, backgroundColor: Color.white, borderColor: Color.borderColor, borderWidth: 1, flexGrow: 1 }}>
        <View style={{ width: (width - 70) / 2 - 2, height: (width - 70) / 2, backgroundColor: Color.theme, borderTopLeftRadius: 8, borderTopRightRadius: 8 }} />
        <View style={{ padding: 10 }}>
          <Text style={{ fontSize: 11, color: Color.textMuted, marginBottom: 3 }}>{props.subTitle}</Text>
          <Text numberOfLines={3} style={{ fontSize: 13, fontWeight: 'bold' }}>{props.title}</Text>
        </View>
      </View>
    </TouchableHighlight>
  )
}