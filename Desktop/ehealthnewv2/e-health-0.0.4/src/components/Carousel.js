import React, { Component } from 'react'
import { View, Text, ScrollView, Dimensions, Animated, TouchableOpacity } from 'react-native'
import Color, { colorYiq } from '../tools/Color'
const { width, height } = Dimensions.get('window')

export default class Carousel extends Component {
  _scrollViewRef = React.createRef()
  _intervalSliding
  _scrollX = new Animated.Value(0)
  _scrollEndX = 0
  _page = 1

  componentDidMount() {
    if (this.props.children.length) {
      this._startSliding()
    }
  }

  _startSliding = () => {
    if (this.props.autoSliding === undefined || this.props.autoSliding === true) {
      const maxLength = this.props.children.length || 1
      if (maxLength > 1) {
        this._intervalSliding = setInterval(() => {
          this._page = this._page === maxLength ? 1 : this._page + 1

          if (this._page === 1) {
            this._scrollEndX = 0
          } else {
            this._scrollEndX += (width - 40) - 12 + 20
          }
          this._scrollViewRef.current.scrollTo({
            x: this._scrollEndX
          })
        }, this.props.sliderTimeout || 5000)
      }
    }
  }

  _stopSliding = () => {
    clearInterval(this._intervalSliding)
  }

  componentWillUnmount() {
    clearInterval(this._intervalSliding)
  }

  render() {
    let xLength = 0
    const offsetXArr = this.props.children.length && this.props.children.map((a, i) => {
      if (i === 0) {
        xLength += 0
      } else if (i === 1 || i === this.props.children.length - 1) {
        xLength += (width - 40) - 12 + 20
      } else {
        xLength += (width - 40) - 12 + 20
      }
      return xLength
    }) || []
    let scaleX = this.props.scale && parseInt(this.props.scale.split(':')[0]) || 16
    let scaleY = this.props.scale && parseInt(this.props.scale.split(':')[1]) || 9
    return (
      <View style={{ marginBottom: 15, ...this.props.containerStyle }}>
        <Animated.ScrollView
          horizontal
          ref={this._scrollViewRef}
          showsHorizontalScrollIndicator={false}
          onScrollBeginDrag={this._stopSliding}
          onScrollEndDrag={({ nativeEvent }) => {
            let page = this._page
            if (nativeEvent.contentOffset.x < this._scrollEndX) {
              page -= Math.floor((this._scrollEndX - nativeEvent.contentOffset.x - 40) / ((width - 40) - 12 + 20)) + 1
              this._scrollEndX = offsetXArr[page - 1]
            } else if (nativeEvent.contentOffset.x > this._scrollEndX && nativeEvent.contentOffset.x - this._scrollEndX >= 40) {
              page += Math.floor((nativeEvent.contentOffset.x - this._scrollEndX - 40) / ((width - 40) - 12 + 20)) + 1
              this._scrollEndX = offsetXArr[page - 1]
            }
            this._page = page
            this._startSliding()
            this._scrollViewRef.current.scrollTo({
              x: this._scrollEndX
            })
          }}
          scrollEventThrottle={16}
          onScroll={Animated.event([
            {
              nativeEvent: { contentOffset: { x: this._scrollX } }
            }
          ], { useNativeDriver: false })}
          decelerationRate={0}
        >
          {
            this.props.children.length &&
            this.props.children.map((a, i) => {
              let outputRangeX = []
              let outputRangeScale = []
              for (let screen = 0; screen < offsetXArr.length; screen++) {
                if (i < screen) {
                  outputRangeScale.push(.9)
                  outputRangeX.push(((width - 40) - ((width - 40) * .9)) / 2)
                } else if (i === screen) {
                  outputRangeScale.push(1)
                  outputRangeX.push(0)
                } else {
                  outputRangeScale.push(.9)
                  outputRangeX.push(((width - 40) - ((width - 40) * .9)) / 2 * -1)
                }
              }

              const translateXAnim = this._scrollX.interpolate({
                inputRange: offsetXArr,
                outputRange: outputRangeX,
                extrapolate: 'clamp'
              })
              const scaleAnim = this._scrollX.interpolate({
                inputRange: offsetXArr,
                outputRange: outputRangeScale,
                extrapolate: 'clamp'
              })

              return (
                <Animated.View key={'content_' + i} style={{ width: width - 40, height: (width - 40) / scaleX * scaleY, marginLeft: i === 0 ? 20 : 4, marginRight: i === this.props.children.length - 1 ? 20 : 4, transform: this.props.contentAnim ? [{ translateX: translateXAnim }, { scale: scaleAnim }] : [] }}>
                  {a}
                </Animated.View>
              )
            })
            ||
            <View style={{ width: width - 40, height: (width - 40) / scaleX * scaleY, backgroundColor: Color.white, marginHorizontal: 20 }}>
              {this.props.children}
            </View>
          }
        </Animated.ScrollView>
        {
          (this.props.nav === undefined || this.props.nav === true) &&
          this.props.children.length &&
          <View style={{ flex: 1, flexDirection: 'row', marginHorizontal: 15, marginTop: 15 }}>
            {
              this.props.children.map((a, item) => {
                let outputRangeWidth = []
                let outputRangeOpacity = []
                let outputRangeTranslateX = []
                let offset = 1
                for (let screen = 0; screen < this.props.children.length; screen++) {
                  if (
                    (screen + 1 <= 3 && item + 1 <= 5) ||
                    (screen + 1 >= this.props.children.length - 2 && item + 1 >= this.props.children.length - 4)
                  ) {
                    outputRangeWidth.push(20)
                  } else if (
                    (screen + 1 <= 3 && item + 1 <= 6) ||
                    (screen + 1 >= this.props.children.length - 2 && item + 1 >= this.props.children.length - 5)
                  ) {
                    outputRangeWidth.push(5)
                  } else if (
                    (screen + 1 >= 4 && screen + 1 <= this.props.children.length - 3) &&
                    (item >= offset && item <= offset + 4)
                  ) {
                    outputRangeWidth.push(20)
                  } else if (
                    (screen + 1 >= 4 && screen + 1 <= this.props.children.length - 3) &&
                    (item === offset - 1 || item === offset + 5)
                  ) {
                    outputRangeWidth.push(5)
                  } else {
                    outputRangeWidth.push(0)
                  }

                  if ((screen + 1 >= 4 && screen + 1 <= this.props.children.length - 3)) {
                    offset += 1
                  }

                  outputRangeOpacity.push(item === screen ? 1 : 0)
                  if (item < screen) {
                    outputRangeTranslateX.push(30)
                  } else if (item === screen) {
                    outputRangeTranslateX.push(0)
                  } else {
                    outputRangeTranslateX.push(-30)
                  }
                }
                const widthAnim = this._scrollX.interpolate({
                  inputRange: offsetXArr,
                  outputRange: outputRangeWidth,
                  extrapolate: 'clamp'
                })
                const marginXAnim = widthAnim.interpolate({
                  inputRange: [0, 5, 20],
                  outputRange: [0, 5, 5],
                  extrapolate: 'clamp'
                })
                const opacityFilled = this._scrollX.interpolate({
                  inputRange: offsetXArr,
                  outputRange: outputRangeOpacity,
                })
                const translateXFilled = this._scrollX.interpolate({
                  inputRange: offsetXArr,
                  outputRange: outputRangeTranslateX,
                })
                return (
                  <TouchableOpacity
                    key={'nav_' + item}
                    onPress={() => {
                      this._stopSliding()
                      this._page = item + 1
                      this._startSliding()
                      this._scrollViewRef.current.scrollTo({
                        x: offsetXArr[item]
                      })
                    }}
                  >
                    <Animated.View style={{ width: widthAnim, height: 5, borderRadius: 5 / 2, backgroundColor: Color.grayLight, marginHorizontal: marginXAnim, overflow: 'hidden' }}>
                      {
                        this.props.navAnimate === 'fillMoving' &&
                        <Animated.View style={{ width: '100%', height: '100%', backgroundColor: Color.theme, borderRadius: 5 / 2, transform: [{ translateX: translateXFilled }] }} />
                        ||
                        <Animated.View style={{ width: '100%', height: '100%', backgroundColor: Color.theme, borderRadius: 5 / 2, opacity: opacityFilled }} />
                      }
                    </Animated.View>
                  </TouchableOpacity>
                )
              })
            }
          </View>
        }
      </View>
    )
  }
}