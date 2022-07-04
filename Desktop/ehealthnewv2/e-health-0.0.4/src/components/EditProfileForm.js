import React, { Component } from 'react'
import { View, Text, Modal, TouchableOpacity, TouchableHighlight, Keyboard, Dimensions, ScrollView, StatusBar, Animated } from 'react-native'
import Button from '../components/Button'
import ImageInput from '../components/ImageInput'
import Input, { CalendarPicker, PickOne } from '../components/Input'
import Select from '../components/Select'
import Color from '../tools/Color'
const { width, height } = Dimensions.get('window')
import Icon from 'react-native-vector-icons/Ionicons'

export let OpenForm
export let CloseForm

export default class EditProfileForm extends Component {
  _scrollY = new Animated.Value(0)
  render() {
    const { dimensions, isVisible, genderValue } = this.state
    const opacityBar = this._scrollY.interpolate({
      inputRange: [0, StatusBar.currentHeight + 20],
      outputRange: [0, 1]
    })
    return (
      <View>
        <Modal
          statusBarTranslucent
          transparent
          animationType='fade'
          visible={isVisible}
          onRequestClose={this._closeForm}
        >
          <View style={{ backgroundColor: 'rgba(0,0,0,.5)', height: dimensions[1] }}>
            <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StatusBar.currentHeight, backgroundColor: Color.theme, opacity: opacityBar, zIndex: 1 }} />
            <Animated.ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
              onScroll={Animated.event([
                { nativeEvent: { contentOffset: { y: this._scrollY } } }
              ], { useNativeDriver: false })}
            >
              <TouchableOpacity onPress={this._closeForm} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
              <View style={{ backgroundColor: Color.white, padding: 15, borderRadius: 8, marginHorizontal: 20, marginVertical: 20, marginTop: StatusBar.currentHeight + 20, elevation: 10 }}>
                <View style={{ borderBottomColor: Color.borderColor, borderBottomWidth: 1, paddingBottom: 15, marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold' }}>Edit Profil</Text>
                  </View>
                  <TouchableOpacity
                    onPress={this._closeForm}
                  >
                    <Icon name='close' size={15} color={Color.textMuted} />
                  </TouchableOpacity>
                </View>
                <Input placeholder='Nomor KK' inputableStyle={{ backgroundColor: Color.grayLighter, borderWidth: 0 }} />
                <Input placeholder='Nomor Induk Kependudukan' inputableStyle={{ backgroundColor: Color.grayLighter, borderWidth: 0 }} />
                <Input placeholder='Nama Lengkap' inputableStyle={{ backgroundColor: Color.grayLighter, borderWidth: 0 }} />
                <CalendarPicker placeholder='Tanggal Lahir' inputableStyle={{ backgroundColor: Color.grayLighter, borderWidth: 0 }} />
                <PickOne color={Color.success} onChange={(e) => {
                  this.setState({
                    genderValue: e.value
                  })
                }} value={genderValue} items={[{ 'value': 1, 'title': 'Laki-laki' }, { 'value': 2, 'title': 'Perempuan' }]} />
                <Select color={Color.success} search={false} items={[
                  { value: 0, title: 'Tidak Ditentukan' },
                  { value: 1, title: 'Kepala Keluarga' },
                  { value: 2, title: 'Istri' },
                  { value: 3, title: 'Famili Lain' },
                ]} placeholder='Status Dalam Keluarga' selectionStyle={{ borderWidth: 0, backgroundColor: Color.grayLighter, borderRadius: 8 }} />
                <Select color={Color.success} items={[
                  { value: 1, title: 'Desa 1' },
                  { value: 2, title: 'Desa 2' },
                  { value: 3, title: 'Desa 3' },
                ]} placeholder='Desa Tempat Tinggal' selectionStyle={{ borderWidth: 0, backgroundColor: Color.grayLighter, borderRadius: 8 }} />
                <Input multiline placeholder='Alamat Lengkap' inputableStyle={{ backgroundColor: Color.grayLighter, borderWidth: 0 }} />
                <View style={{ borderTopColor: Color.borderColor, borderTopWidth: 1, paddingTop: 20, paddingBottom: 5, marginTop: 5 }}>
                  <Button regular title='Simpan' color={Color.success} buttonStyle={{ borderRadius: 8 }} containerStyle={{ marginBottom: 0 }} />
                </View>
              </View>
            </Animated.ScrollView>
          </View>
        </Modal>
      </View>
    )
  }

  _keyboardShowSubscription
  _keyboardHideSubscription
  componentDidMount() {
    this._keyboardShowSubscription = Keyboard.addListener('keyboardDidShow', e => {
      this.setState({
        dimensions: [width, height - e.endCoordinates.height]
      })
    })
    this._keyboardHideSubscription = Keyboard.addListener('keyboardDidHide', e => {
      this.setState({
        dimensions: [width, height]
      })
    })
  }

  componentWillUnmount() {
    this._keyboardShowSubscription.remove()
    this._keyboardHideSubscription.remove()
  }

  _openForm = () => {
    this.setState({
      isVisible: true
    }, () => {
      if (!this.props.currentBarStyle || this.props.currentBarStyle !== 'light-content') StatusBar.setBarStyle('light-content', true)
    })
  }

  _closeForm = () => {
    this.setState({
      isVisible: false
    }, () => {
      if (this.props.currentBarStyle) StatusBar.setBarStyle(this.props.currentBarStyle, true)
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      isVisible: false,
      genderValue: null,
      dimensions: [width, height]
    }
    OpenForm = this._openForm
    CloseForm = this._closeForm
  }
}