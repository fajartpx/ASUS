import React,{ Component } from 'react'
import { View,Text,Dimensions } from 'react-native'
import Color,{ colorYiq } from '../tools/Color'
import Icon from 'react-native-vector-icons/Ionicons'
import { connect } from 'react-redux'

class NotificationIcon extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const unseenChatTotal = this.props.chats.unseen_count
    return (
      <View>
        <Icon size={24} style={{ textAlign: 'center' }} name={this.props.iconName} color={this.props.isFocused ? Color.theme : Color.textMuted} />
        {
          unseenChatTotal > 0 &&
          <View style={{ width: 12,height: 12,borderRadius: 12 / 2,backgroundColor: Color.danger,position: 'absolute',top: -5,right: -6,alignItems: 'center',justifyContent: 'center' }}>
            <Text style={{ color: colorYiq(Color.danger),fontSize: 8 }}>{unseenChatTotal.toString()}</Text>
          </View>
        }
      </View>
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

export default connect(mapStateToProps,mapDispatchToProps)(NotificationIcon)