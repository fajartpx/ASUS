import React,{ Component } from 'react'
import { View,Image, Dimensions } from 'react-native'
const {width} = Dimensions.get('window')

export default class ImageView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      widthImage: this.props.width || (width / 2),
      heightImage: (this.props.width || (width / 2)) / 4 * 3
    }
  }
  render() {
    const { widthImage,heightImage } = this.state
    return (
      <View style={{ borderRadius: 4, overflow: 'hidden' }}>
        <Image style={{ width: widthImage, height: heightImage }} resizeMode='cover' source={{ uri: this.props.uri }} onLoad={e => {
          this.setState({
            widthImage: this.props.width,
            heightImage: this.props.width / e.nativeEvent.source.width * e.nativeEvent.source.height
          })
        }} />
      </View>
    )
  }
}