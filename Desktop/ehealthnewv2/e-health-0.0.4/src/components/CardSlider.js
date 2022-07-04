import React, { Component } from 'react'
import { View, Text, ScrollView, Dimensions, Animated, TouchableOpacity } from 'react-native'
import { Color, colorYiq } from '../variables'
const { width, height } = Dimensions.get('window')

export default class CardSlider extends Component {
  _scrollViewRef = React.createRef()
  _intervalSliding
  _scrollX = new Animated.Value(0)
  _scrollEndX = 0
  constructor(props) {
    super(props)
    this.state = {
      page: 1
    }
  }

  componentDidMount() {
    if (this.props.children.length) {
      this._startSliding()
    }
  }

  _startSliding = () => {
    const maxLength = this.props.children.length || 1
    if (maxLength > 1) {
      this._intervalSliding = setInterval(() => {
        this.setState({
          page: this.state.page === maxLength ? 1 : this.state.page + 1
        }, () => {
          this._scrollViewRef.current.scrollTo({
            x: (this.state.page - 1) * (width - 50)
          })
          this._scrollEndX = (this.state.page - 1) * (width - 50)
        })
      }, this.props.sliderTimeout || 5000)
    }
  }

  _stopSliding = () => {
    clearInterval(this._intervalSliding)
  }

  componentWillUnmount() {
    clearInterval(this._intervalSliding)
  }

  render() {
    return (
      <View style={{ marginBottom: 15, ...this.props.containerStyle }}>
        <Animated.ScrollView
          horizontal
          ref={this._scrollViewRef}
          showsHorizontalScrollIndicator={false}
          onScrollBeginDrag={this._stopSliding}
          onScrollEndDrag={({ nativeEvent }) => {
            let page = this.state.page
            if (nativeEvent.contentOffset.x < this._scrollEndX && this._scrollEndX - nativeEvent.contentOffset.x >= 40) {
              page -= 1
            } else if (nativeEvent.contentOffset.x > this._scrollEndX && nativeEvent.contentOffset.x - this._scrollEndX >= 40) {
              page += 1
            }
            this.setState({ page }, () => {
              this._startSliding()
              this._scrollViewRef.current.scrollTo({
                x: (page - 1) * (width - 50)
              })
              this._scrollEndX = (page - 1) * (width - 50)
            })
          }}
          scrollEventThrottle={16}
          onScroll={Animated.event([
            {
              nativeEvent: { contentOffset: { x: this._scrollX } }
            }
          ], { useNativeDriver: false })}
          style={{ marginBottom: this.props.children.length ? 15 : 0 }}
          decelerationRate={0}
        >
          {
            this.props.children.length &&
            this.props.children.map((a, i) => (
              <View key={'content_' + i} style={{ width: width - 70, height: (width - 70) / 2 * 1, backgroundColor: Color.white, marginLeft: 20, marginRight: i === this.props.children.length - 1 ? 20 : 0 }}>
                {a}
              </View>
            ))
            ||
            <View style={{ width: width - 40, height: (width - 40) / 2 * 1, backgroundColor: Color.white, marginHorizontal: 20 }}>
              {this.props.children}
            </View>
          }
        </Animated.ScrollView>
        <View style={{ flex: 1, flexDirection: 'row-reverse', marginHorizontal: 20, alignItems: 'center' }}>
          <View style={{ flex: 1, marginHorizontal: -5, flexDirection: 'row', alignItems: 'center' }}>
            {
              this.props.children.length &&
              this.props.children.map((a, i) => {
                const inputRange = []
                let outputRange = [0, 5, 20, 20, 20, 20, 20, 5, 0]
                let k = 0
                let offset = -4
                if (this.props.children.length > 5 && this.state.page - 1 >= this.props.children.length - 3) {
                  if (i === this.props.children.length - 6) {
                    offset += 1
                    outputRange = [0, 5, 20, 20, 20, 20, 5, 5, 5]
                  } else if (i === this.props.children.length - 5) {
                    outputRange = [0, 5, 20, 20, 20, 20, 20, 20, 20]
                  } else if (i === this.props.children.length - 4) {
                    outputRange = [0, 5, 20, 20, 20, 20, 20, 20, 20]
                  }
                } else if (this.props.children.length > 5 && this.state.page - 1 < 3) {
                  if (i >= 3 && i <= 5) {
                    offset -= 2
                    if (i === 5) {
                      outputRange = [0, 5, 5, 5, 20, 20, 20, 5, 0]
                    }
                  }
                } else if (this.props.children.length > 5) {
                  offset = -4
                  outputRange = [0, 5, 20, 20, 20, 20, 20, 5, 0]
                } else {
                  outputRange = [20, 20, 20, 20, 20, 20, 20, 20, 20]
                }

                for (let j = offset; j < offset + 9; j++) {
                  if (i + j >= this.props.children.length - 1) {
                    k += 1
                  }
                  inputRange.push(((i + j) * (width - 50)) - (30 * k))
                }
                const widthAnim = this._scrollX.interpolate({
                  inputRange,
                  outputRange,
                  extrapolate: 'clamp'
                })
                const marginHzAnim = widthAnim.interpolate({
                  inputRange: [0, 5, 20],
                  outputRange: [0, 5, 5],
                  extrapolate: 'clamp'
                })

                return (
                  <TouchableOpacity
                    key={'nav_' + i}
                    onPress={() => {
                      this._stopSliding()
                      this.setState({
                        page: (i + 1)
                      }, () => {
                        this._startSliding()
                        this._scrollViewRef.current.scrollTo({
                          x: (this.state.page - 1) * (width - 50)
                        })
                      })
                    }}
                  >
                    <Animated.View style={{ width: widthAnim, height: 5, borderRadius: 5 / 2, backgroundColor: i + 1 === this.state.page ? Color.theme : Color.grayLight, marginHorizontal: marginHzAnim }} />
                  </TouchableOpacity>
                )
              })
            }
          </View>
        </View>
      </View>
    )
  }
}