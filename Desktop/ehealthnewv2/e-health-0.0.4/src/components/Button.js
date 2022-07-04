import React from 'react'
import { TouchableHighlight, View, Text } from 'react-native'
import Color, { colorYiq } from '../tools/Color'
import Icon from 'react-native-vector-icons/Ionicons'

const Button = (props) => {
  const disabled = props.disabled || false
  const color = props.color || Color.primary
  return (
    <TouchableHighlight
      underlayColor={'rgba(0,0,0,.0)'}
      onPress={!disabled && props.onPress || null}
      style={{ borderRadius: (props.buttonStyle) ? props.buttonStyle.borderRadius : 20, marginBottom: 15, ...props.containerStyle }}
    >
      <View style={{ paddingVertical: props.small && 5 || props.regular && 10 || 15, paddingHorizontal: props.small && 10 || props.regular && 15 || 20, backgroundColor: !disabled ? color : Color.grayLighter, borderRadius: 20, ...props.buttonStyle }}>
        {
          props.icon &&
          <Icon color={props.textColor || !disabled ? colorYiq(color) : Color.gray} size={props.textSize || props.small && 13 || props.regular && 15 || 18} name={typeof props.icon === 'string' && props.icon || 'arrow-forward'} />
          ||
          <Text style={{ textAlign: 'center', color: !disabled ? props.titleColor || colorYiq(color) : props.titleColor || Color.gray, fontSize: props.textSize || props.small && 13 || props.regular && 15 || 18, fontWeight: 'bold', ...props.titleStyle }}>{props.title}</Text>
        }
      </View>
    </TouchableHighlight>
  )
}

export default Button