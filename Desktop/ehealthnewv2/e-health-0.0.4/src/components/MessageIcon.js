import React,{ Component } from 'react'
import { View,Text,TouchableHighlight } from 'react-native'
import Color,{ colorYiq } from '../tools/Color'
import Icon from 'react-native-vector-icons/Ionicons'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

class MessageIcon extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const unseenChatTotal = this.props.chats.unseen_count
    return (
      <TouchableHighlight
        underlayColor={Color.white}
        style={{ borderRadius: 4,marginHorizontal: 2 }}
        onPress={this.props.onPress}
      >
        <View style={{ backgroundColor: Color.theme,width: 35,height: 35,borderRadius: 4,alignItems: 'center',justifyContent: 'center' }}>
          <Icon name='mail-outline' size={18} color={colorYiq(Color.theme)} />
          {
            unseenChatTotal > 0 &&
            <View style={{ width: 12,height: 12,borderRadius: 12 / 2,backgroundColor: Color.danger,position: 'absolute',top: 5,right: 5,alignItems: 'center',justifyContent: 'center' }}>
              <Text style={{ color: colorYiq(Color.danger),fontSize: 8 }}>{unseenChatTotal.toString()}</Text>
            </View>
          }
        </View>
      </TouchableHighlight>
    )
  }
}


function mapStateToProps(state) {
  return {
    chats: state.chats
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps,mapDispatchToProps)(MessageIcon)