import React,{ Component } from 'react'
import { View,Text,TouchableNativeFeedback,Dimensions } from 'react-native'
import Color,{ colorYiq } from '../tools/Color'
import Icon from 'react-native-vector-icons/Ionicons'
const { width,height } = Dimensions.get('window')
import NotificationIcon from './NotificationIcon'

export default function TabBar({ state,descriptors,navigation }) {
  const focusedOptions = descriptors[state.routes[state.index].key].options

  if (focusedOptions.tabBarVisible === false) {
    return null
  }

  let renderedTabBar = []

  const PickOne = (label,focused = false,key = 'title') => {
    const IconLabel = [
      {
        name: 'Home',
        iconName: 'home-outline',
        focusedIconName: 'home',
        title: 'Beranda'
      },{
        name: 'MyAccount',
        iconName: 'person-outline',
        focusedIconName: 'person',
        title: 'Akun Saya'
      },{
        name: 'Articles',
        iconName: 'newspaper-outline',
        focusedIconName: 'newspaper',
        title: 'Artikel'
      },{
        name: 'Notifications',
        iconName: 'notifications-outline',
        focusedIconName: 'notifications',
        title: 'Notifikasi'
      },{
        name: 'Consultation',
        iconName: 'chatbubble-ellipses-outline',
        focusedIconName: 'chatbubble-ellipses',
        title: 'Konsultasi'
      }
    ]

    const selectedIndex = IconLabel.map(a => a.name).indexOf(label)
    switch (key) {
      case 'title':
        return selectedIndex > -1 ? IconLabel[selectedIndex].title : label
      case 'icon':
        return selectedIndex > -1 ? (focused ? IconLabel[selectedIndex].focusedIconName : IconLabel[selectedIndex].iconName) : (focused ? 'file-tray' : 'file-tray-outline')
    }
  }

  return (
    <View style={{ flexDirection: 'row',backgroundColor: Color.white,borderTopColor: Color.borderColor,borderTopWidth: 1,paddingHorizontal: 20,justifyContent: 'center' }}>
      {
        state.routes.map((route,index) => {
          const { options } = descriptors[route.key]
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name

          const isFocused = state.index === index

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            })
          }

          renderedTabBar.push(
            <TouchableNativeFeedback
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              useForeground={true}
            >
              <View style={{ width: (width - 40) / 4,alignItems: 'center',paddingVertical: 8 }}>
                {
                  label === 'Notifications' &&
                  <NotificationIcon iconName={PickOne(label,isFocused,'icon')} isFocused={isFocused} />
                  ||
                  <Icon size={24} style={{ textAlign: 'center' }} name={PickOne(label,isFocused,'icon')} color={isFocused ? Color.theme : Color.textMuted} />
                }
                <Text numberOfLines={1} style={{ color: isFocused ? Color.theme : Color.textMuted,fontSize: 11,textAlign: 'center' }}>
                  {PickOne(label)}
                </Text>
              </View>
            </TouchableNativeFeedback>
          )

        })
      }

      {
        renderedTabBar
      }
    </View>
  )
}