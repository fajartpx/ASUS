import React from 'react'
import { View, Text, Animated, Modal, TextInput, Dimensions, ScrollView, TouchableHighlight, TouchableOpacity } from 'react-native'
import Color, { colorYiq } from '../tools/Color'
import Icon from 'react-native-vector-icons/Ionicons'
import { ListItem } from './Item'
const { width, height } = Dimensions.get('window')

const SetByCategories = (props) => {
  const [visible, setVisibe] = React.useState(false)
  return (
    <View style={{ flexGrow: 1, ...props.containerStyle }}>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 5, paddingHorizontal: 20 }}
          >
            {
              props.categories.slice(0, 10).map((c, i) => (
                <Text onPress={() => { props.onChangeCategory(c.value) }} key={c.value} style={{ paddingVertical: 4, paddingHorizontal: 20, fontSize: 11, marginRight: i === props.categories.length - 1 ? 0 : 10, backgroundColor: c.value === props.selectedCategory ? Color.success : Color.grayLighter, color: c.value === props.selectedCategory ? Color.white : Color.textMuted, borderRadius: 20, textAlignVertical: 'center' }}>{c.title}</Text>
              ))
            }
          </Animated.ScrollView>
        </View>
        {
          props.categories.length > 10 &&
          <TouchableHighlight
            onPress={() => { setVisibe(true) }}
            style={{ borderBottomLeftRadius: 8, borderTopLeftRadius: 8 }}
          >
            <View style={{ paddingVertical: 10, paddingHorizontal: 10, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, backgroundColor: Color.danger, alignItems: 'center', justifyContent: 'center', elevation: 5 }}>
              <Icon name='ellipsis-horizontal' color={colorYiq(Color.danger)} size={18} />
            </View>
          </TouchableHighlight>
        }
      </View>
      <View>
        <TextInput value={props.searchKeyword} onChangeText={props.onChangeSearch} placeholderTextColor={Color.textMuted} placeholder='Cari nama dokter' style={{ paddingVertical: 6, paddingHorizontal: 20, paddingRight: 55, backgroundColor: Color.white, color: Color.textColor, fontSize: 13, borderWidth: 0, borderTopWidth: 1, borderBottomWidth: 1, borderTopColor: Color.borderColor, borderBottomColor: Color.borderColor }} />
        <Icon name='search' size={16} color={Color.textMuted} style={{ position: 'absolute', top: '50%', marginTop: -8, right: 20 }} />
      </View>
      <View style={{ maxHeight: height - 332 }}>
        {props.children}
      </View>
      <Modal
        statusBarTranslucent
        transparent
        animationType='fade'
        visible={visible}
        onRequestClose={() => {
          setVisibe(false)
        }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.5)', justifyContent: 'flex-end' }}>
          <TouchableOpacity onPress={() => { setVisibe(false) }} style={{ flex: 1 }} />
          <View style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: Color.white, maxHeight: height / 2 }}>
            <ScrollView
              contentContainerStyle={{ padding: 20 }}
            >
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5, marginBottom: -10 }}>
                {
                  props.categories.slice(0, 6).map((c, i) => (
                    <Text onPress={() => { props.onChangeCategory(c.value) }} key={c.value} style={{ paddingVertical: 10, paddingHorizontal: 20, marginHorizontal: 5, marginBottom: 10, backgroundColor: c.value === props.selectedCategory ? Color.success : Color.grayLighter, color: c.value === props.selectedCategory ? Color.white : Color.textMuted, borderRadius: 20, textAlignVertical: 'center' }}>{c.title}</Text>
                  ))
                }
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default SetByCategories