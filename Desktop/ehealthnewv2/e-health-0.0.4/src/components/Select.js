import React, { Component } from 'react'
import { View, Text, TouchableOpacity, Modal, TouchableHighlight, ScrollView, Dimensions, Keyboard, StatusBar } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Color, { colorYiq } from '../tools/Color'
import Input from './Input'
const { width, height } = Dimensions.get('window')

const Select = (props) => {
  const [visible, setVisible] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [window, setWindow] = React.useState([width, height])
  const value = props.items && props.items.filter(a => a.value === props.value) || null

  React.useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", (e) => {
      setWindow([width, height - e.endCoordinates.height])
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", (e) => {
      setWindow([width, height])
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [])

  const items = props.items && (search !== '' ? props.items.filter(a => a.title.toLowerCase().indexOf(search.toLowerCase()) >= 0) : props.items) || null
  return (
    <View>
      {
        (props.label && typeof props.label === 'string') &&
        <Text style={{ marginBottom: 10 }}>{props.label}</Text>
        ||
        (props.label && typeof props.label === 'object') &&
        props.label
      }
      <View style={{ marginBottom: 15 }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            if (props.selectable === undefined || props.selectable === true) setVisible(true)
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: props.small && 10 || props.large && 18 || 15, paddingHorizontal: props.small && 15 || 20, backgroundColor: (props.selectable === undefined || props.selectable === true) ? Color.white : Color.grayLighter, borderRadius: 4, borderWidth: 1, borderColor: Color.borderColor, ...props.selectionStyle }}>
            {
              (value !== null && value.length > 0) &&
              <Text numberOfLines={1} style={{ fontSize: props.small && 13 || props.large && 18 || 14, flex: 1 }}>{value[0].title}</Text>
              ||
              <Text numberOfLines={1} style={{ color: Color.textMuted, fontSize: props.small && 13 || props.large && 18 || 14, flex: 1 }}>{props.placeholder}</Text>
            }
            <Icon name='caret-down' color={Color.textColor} size={props.small && 13 || props.large && 20 || 16} />
          </View>
        </TouchableOpacity>
        {
          props.info &&
          <View style={{ marginTop: 5 }}>{props.info}</View>
        }
      </View>
      <Modal
        transparent
        statusBarTranslucent
        animationType='fade'
        visible={visible}
        onRequestClose={() => {
          setVisible(false)
        }}
      >
        <View style={{ backgroundColor: 'rgba(0,0,0,.5)', justifyContent: 'flex-end', height: window[1] }}>
          <TouchableOpacity onPress={() => { setVisible(false) }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <View style={{ backgroundColor: Color.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: window[1] / 2, overflow: 'hidden' }}>
            {
              (props.search === undefined || props.search === true) &&
              <Input placeholder={props.placeholderSearch || 'Pencarian'} value={search} onChangeText={(text) => { setSearch(text) }} containerStyle={{ marginBottom: 0, marginHorizontal: 20, marginTop: 20 }} inputableStyle={{ borderRadius: 50 }} />
              ||
              props.placeholder &&
              <View style={{ borderTopStartRadius: 20, backgroundColor: props.color || Color.theme, paddingHorizontal: 20 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 17, paddingVertical: 10, color: colorYiq(props.color || Color.theme) }}>{props.placeholder}</Text>
              </View>
            }
            <ScrollView showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10 }}
            >
              {
                items !== null &&
                <View>
                  {
                    items.map((a, i) => {
                      return (
                        <TouchableHighlight
                          key={a.value}
                          onPress={() => {
                            setVisible(false)
                            if (props.onChangeValue && typeof props.onChangeValue === 'function') {
                              props.onChangeValue(a)
                            }
                          }}
                        >
                          <View style={{ paddingHorizontal: (props.search !== undefined && props.search === false) ? 20 : 40, backgroundColor: Color.white }}>
                            <View style={{ paddingVertical: 15, borderBottomWidth: (i + 1) === props.items.length ? 0 : 1, borderBottomColor: Color.borderColor }}>
                              <Text style={{ color: (value !== null && value.length > 0 && value[0].value === a.value) ? props.color || Color.theme : Color.textColor }} numberOfLines={1}>{a.title}</Text>
                            </View>
                          </View>
                        </TouchableHighlight>
                      )
                    })
                  }
                </View>
                ||
                (items !== null && items.length === 0 && search !== '') &&
                <View style={{ paddingVertical: 20, marginHorizontal: 20 }}>
                  <Text style={{ textAlign: 'center', color: Color.textMuted, fontSize: 13, fontStyle: 'italic' }}>Pilihan sesuai kata kunci tidak ditemukan</Text>
                </View>
                ||
                <View style={{ paddingVertical: 20, marginHorizontal: 20 }}>
                  <Text style={{ textAlign: 'center', color: Color.textMuted, fontSize: 13, fontStyle: 'italic' }}>Tidak ada pilihan yang tersedia</Text>
                </View>
              }
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default Select