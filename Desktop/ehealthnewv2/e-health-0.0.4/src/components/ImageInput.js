import { useNavigation } from '@react-navigation/core'
import React from 'react'
import { View,Text,TouchableHighlight,Dimensions,Modal,TouchableOpacity,Animated, Image } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Color from '../tools/Color'
const { width,height } = Dimensions.get('window')


const ImageInput = props => {
  const navigation = useNavigation()
  return (
    <View style={{ marginBottom: 15,...props.containerStyle }}>
      <TouchableHighlight
        onPress={() => {
          navigation.navigate('CameraRoll',{
            onPickImage: props.onPickImage || null
          })
        }}
        style={{ borderRadius: 10 }}
      >
        <View style={{ width: width - 40,height: (width - 40) / 16 * 9,backgroundColor: Color.grayLighter,padding: props.value ? 0 : 20,borderRadius: 10,alignItems: 'center',justifyContent: 'center',overflow: 'hidden', ...props.containerStyle }}>
          {
            props.value &&
            <Image source={{ uri: props.value.uri }} resizeMode='contain' style={{ width: '100%', height: '100%' }} />
            ||
            props.imageDefault &&
            <Image source={{ uri: props.imageDefault }} resizeMode='contain' style={{ width: '100%', height: '100%' }} />
            ||
            <>
              <Icon name='add-circle' size={48} style={{ marginBottom: 5 }} color={Color.textMuted} />
              <Text style={{ textAlign: 'center',fontWeight: 'bold' }}>Tambahkan Foto</Text>
            </>
          }
        </View>
      </TouchableHighlight>
    </View>
  )
}

export default ImageInput