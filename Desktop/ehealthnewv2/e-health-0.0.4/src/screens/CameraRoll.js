import React from 'react'
import { View, Text, Image, Dimensions, ScrollView, TouchableHighlight, BackHandler, StatusBar, TouchableOpacity, Modal, PermissionsAndroid, ActivityIndicator, Linking, AppState, Animated, ToastAndroid, Alert } from 'react-native'
import CameraRollRN from '@react-native-community/cameraroll'
import Icon from 'react-native-vector-icons/Ionicons'
import Color, { colorYiq } from '../tools/Color'
import Header from '../components/Header'
import isCloseToBottom from '../tools/isCloseToBottom'
import Button from '../components/Button'
const { width, height } = Dimensions.get('window')
import { launchCamera } from 'react-native-image-picker'
import ImageResizer from 'react-native-image-resizer'
import RNFS from 'react-native-fs'

export default class CameraRoll extends React.Component {
  _scrollRef
  _pendingPromise = []
  _appendPromise = (p) => { this._pendingPromise = [...this._pendingPromise, p] }
  _removePromise = (p) => { this._pendingPromise.filter(promise => promise !== p) }
  render() {
    const { photos, albums, albumName, albumPicker, hasPermission, nextPage } = this.state
    const indexed = albums.map(a => a.title).indexOf(albumName)
    const counts = albums.map(a => a.count)
    const sumCounts = counts.length > 0 ? counts.reduce((total, num) => total + num) : 0
    const offsetYWindow = new Animated.Value(0)
    const _requestClose = () => {
      Animated.timing(offsetYWindow, {
        toValue: height,
        duration: 500,
        useNativeDriver: false
      }).start(({ finished }) => {
        if (finished) {
          this.setState({
            albumPicker: false
          })
        }
      })
    }
    return (
      <View style={{ flex: 1, backgroundColor: Color.white }}>
        <ScrollView
          ref={ref => this._scrollRef = ref}
          onMomentumScrollEnd={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent) && (photos.length < (indexed > -1 ? counts[indexed] : sumCounts))) {
              this._getPhotos()
            }
          }}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {
            (hasPermission === 'granted' &&
              nextPage <= 1) &&
            <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 20 }}>
              <ActivityIndicator size={48} color={Color.theme} />
            </View>
            ||
            (hasPermission === 'granted') &&
            (photos.length <= 0 && nextPage > 1) &&
            <View style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
              <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18 }}>Tidak ada foto</Text>
            </View>
            ||
            <View style={{ flexDirection: 'row', flexGrow: 1, flexWrap: 'wrap' }}>
              {
                photos.map((p, i) => (
                  <TouchableHighlight
                    key={i}
                    onPress={() => {
                      this._onPickImage(p.node.image)
                    }}
                    style={{ width: ((width - 4) / 3), height: ((width - 4) / 3), marginRight: (i + 1) % 3 === 0 ? 0 : 2, marginTop: (i + 1) <= 3 ? 0 : 2 }}
                  >
                    <Image style={{ width: '100%', height: '100%', backgroundColor: Color.grayLighter }} source={{ uri: p.node.image.uri }} />
                  </TouchableHighlight>
                ))
              }
            </View>
            ||
            (hasPermission === 'denied') &&
            <View style={{ flex: 1, justifyContent: 'center', marginHorizontal: 20 }}>
              <Icon name='images' color={Color.theme} size={48} style={{ textAlign: 'center', marginBottom: 10 }} />
              <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>Izin tidak diberikan</Text>
              <Text style={{ textAlign: 'center', color: Color.textMuted, marginBottom: 15 }}>Aplikasi butuh izin untuk mengakses galeri foto</Text>
              <Button small containerStyle={{ alignSelf: 'center' }} title='Izinkan' onPress={this._hasAndroidPermission} />
            </View>
            ||
            hasPermission === 'never_ask_again' &&
            <View style={{ flex: 1, justifyContent: 'center', marginHorizontal: 20 }}>
              <Icon name='images' color={Color.theme} size={48} style={{ textAlign: 'center', marginBottom: 10 }} />
              <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>Izin tidak diberikan</Text>
              <Text style={{ textAlign: 'center', color: Color.textMuted, marginBottom: 15 }}>Aplikasi butuh izin untuk mengakses galeri foto</Text>
              <Button small containerStyle={{ alignSelf: 'center' }} title='Izinkan Manual' onPress={() => {
                this.setState({
                  hasBeenSettings: true
                }, () => {
                  Linking.openSettings()
                })
              }} />
            </View>
          }
          {
            (nextPage > 1 && photos.length < (indexed > -1 ? counts[indexed] : sumCounts)) &&
            <View style={{ height: 50, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size={30} color={Color.theme} />
            </View>
          }
        </ScrollView>
        <Header navigation={this.navigation}
          containerStyle={{
            height: 60
          }}
          title={
            hasPermission === 'granted' ?
              <TouchableOpacity
                onPress={() => {
                  this.setState({
                    albumPicker: true
                  })
                }}
                style={{ alignSelf: 'flex-end', height: 40, justifyContent: 'center', paddingHorizontal: 5 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: colorYiq(Color.theme), fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }}>{albumName || 'Terkini'} </Text>
                  <Icon name='chevron-down-outline' size={16} color={colorYiq(Color.theme)} />
                </View>
              </TouchableOpacity>
              : null
          }
          additional={
            <TouchableHighlight
              underlayColor={Color.black}
              style={{ borderRadius: 4 }}
              onPress={() => {
                PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)
                  .then(response => {
                    if (response === 'granted') {
                      let options = {
                        mediaType: 'photo',
                        storageOptions: {
                          skipBackup: true,
                          path: 'images',
                        },
                      }
                      launchCamera(options, (response) => {
                        if (response.didCancel) {
                          console.log('User cancelled image picker')
                        } else if (response.error) {
                          console.log('ImagePicker Error: ', response.error)
                        } else if (response.customButton) {
                          console.log('User tapped custom button: ', response.customButton)
                          alert(response.customButton)
                        } else {
                          this._onPickImage(response.assets[0])
                        }
                      })
                    } else if (response === 'never_ask_again') {
                      Alert.alert(
                        'Permintaan ditolak',
                        'Tidak dapat meminta izin menggunakan kamera secara otomatis lagi',
                        [
                          { text: 'Izinkan manual', onPress: () => { Linking.openSettings() } }
                        ],
                        { cancelable: true }
                      )
                    } else {
                      ToastAndroid.show('Permintaan ditolak', ToastAndroid.SHORT)
                    }
                  })
              }}
            >
              <View style={{ backgroundColor: Color.theme, width: 40, height: 40, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name='camera' size={22} color={colorYiq(Color.theme)} />
              </View>
            </TouchableHighlight>
          }
        />
        <Modal Modal
          visible={albumPicker}
          transparent
          statusBarTranslucent
          animationType='fade'
          onRequestClose={_requestClose}
          onShow={() => {
            Animated.timing(offsetYWindow, {
              toValue: 0,
              duration: 500,
              useNativeDriver: false
            }).start()
          }}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <TouchableOpacity activeOpacity={1} onPress={_requestClose} style={{ backgroundColor: 'rgba(0,0,0,.5)', position: 'absolute', top: 0, bottom: 0, right: 0, left: 0 }} />
            <Animated.View style={{ backgroundColor: Color.white, paddingHorizontal: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: height - StatusBar.currentHeight, transform: [{ translateY: offsetYWindow }] }}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      albumName: '',
                      nextPage: 1
                    }, () => {
                      _requestClose()
                      this._getPhotos()
                    })
                  }}
                >
                  <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 15, color: albumName === '' ? Color.theme : Color.textColor }}>Terkini</Text>
                    <Text style={{ fontSize: 13, color: Color.textMuted }}>{sumCounts} {sumCounts <= 1 ? 'Item' : 'Items'}</Text>
                  </View>
                </TouchableOpacity>
                <View style={{ marginTop: 5, marginBottom: 5 }}>
                  <View style={{ height: 5, width: '100%', backgroundColor: Color.borderColor, position: 'absolute', bottom: 5, left: 0 }} />
                  <Text style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, color: Color.textMuted, fontSize: 13, backgroundColor: Color.white, alignSelf: 'flex-start', paddingRight: 10 }}>Album Saya</Text>
                </View>
                {
                  albums.map((a, i) => (
                    <TouchableOpacity key={'album_name_' + i}
                      onPress={() => {
                        this.setState({
                          albumName: a.title,
                          albumPicker: false,
                          nextPage: 1
                        }, () => {
                          this._getPhotos(() => {
                            this._scrollRef.scrollTo({
                              y: 0, animated: false
                            })
                          })
                        })
                      }}
                    >
                      <View style={{ marginBottom: 10 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 15, color: a.title === albumName ? Color.theme : Color.textColor }}>{a.title}</Text>
                        <Text style={{ fontSize: 13, color: Color.textMuted }}>{a.count} {a.count <= 1 ? 'Item' : 'Items'}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                }
              </ScrollView>
            </Animated.View>
          </View>
        </Modal >
      </View >
    )
  }

  _onPickImage = (e) => {
    const { route } = this.props
    ImageResizer.createResizedImage(e.uri, 600, 600, 'JPEG', 60, 0, null)
      .then(res => {
        RNFS.readFile(res.uri, "base64")
          .then(result => {
            res = {
              ...res,
              type: 'image/jpeg',
              base64: result
            }
            if (route.params) {
              const { onPickImage } = route.params
              if (onPickImage && typeof onPickImage === 'function') onPickImage(res)
            }
          })
          .catch(e => {
            ToastAndroid.show('Gagal mengambil gambar', ToastAndroid.SHORT)
          })
      })
      .catch(e => {
        ToastAndroid.show('Gagal mengambil gambar', ToastAndroid.SHORT)
      })
    if (this.navigation.canGoBack()) this.navigation.goBack()
  }

  _getPhotos = (finisher = null) => {
    const { albumName, nextPage } = this.state
    setTimeout(() => {
      CameraRollRN.getPhotos({
        first: 21 * nextPage,
        assetType: 'Photos',
        include: ['filename', 'fileSize', 'location', 'imageSize'],
        groupName: albumName
      })
        .then(r => {
          this.setState({ photos: r.edges, nextPage: nextPage + 1 }, () => {
            if (finisher && typeof finisher === 'function') finisher()
          })
        })
    }, 1000)
  }

  _getAlbums = () => {
    CameraRollRN.getAlbums({
      assetType: 'Photos'
    })
      .then(r => this.setState({ albums: r }))
  }

  _hasAndroidPermission = async (finisher = null) => {
    const permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    const hasPermission = await PermissionsAndroid.check(permission)
    if (hasPermission) {
      this.setState({
        hasPermission: 'granted'
      }, finisher !== null && typeof finisher === 'function' ? finisher() : null)
      return true
    }
    const getPermission = await PermissionsAndroid.request(permission)
    this.setState({
      hasPermission: getPermission
    }, finisher !== null && typeof finisher === 'function' && getPermission === 'granted' ? finisher() : null)
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this._backHandler)
    StatusBar.setBackgroundColor(this.statusBar.backgroundColor, this.statusBar.isAnimation)
    StatusBar.setBarStyle(this.statusBar.barStyle, this.statusBar.isAnimation)
    StatusBar.setTranslucent(this.statusBar.isTranslucent)
    const { route } = this.props
    if (route.params) {
      const { backHandlerPrevScreen } = route.params
      if (backHandlerPrevScreen) backHandlerPrevScreen.remove()
    }
    this._hasAndroidPermission(() => {
      this._getAlbums()
      this._getPhotos()
    })
    AppState.addEventListener('focus', this._appState)
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this._backHandler)
    const { route } = this.props
    if (route.params) {
      const { setStatusBarStyle, backHandlerPrevScreen } = route.params
      if (setStatusBarStyle) setStatusBarStyle()
      if (backHandlerPrevScreen) backHandlerPrevScreen.add()
    }
    this._pendingPromise.map(p => {
      this._removePromise(p)
    })
    AppState.removeEventListener('focus', this._appState)
  }

  _appState = e => {
    const { hasBeenSettings } = this.state
    if (hasBeenSettings) {
      this._hasAndroidPermission(() => {
        this._getAlbums()
        this._getPhotos()
        this.setState({
          hasBeenSettings: false
        })
      })
    }
  }

  _backHandler = () => {
    return false
  }

  constructor(props) {
    super(props)
    this.state = {
      nextPage: 1,
      photos: [],
      albums: [],
      albumName: '',
      albumPicker: false,
      hasPermission: '',
      hasBeenSettings: false
    }
    this.statusBar = {
      backgroundColor: Color.white,
      barStyle: 'dark-content',
      isAnimation: true,
      isTranslucent: false
    }
    this.navigation = {
      ...this.props.navigation,
      navigate: (screen, params = {}) => {
        this.props.navigation.navigate(screen, {
          ...params,
          setStatusBarStyle: () => {
            StatusBar.setBackgroundColor(this.statusBar.backgroundColor, this.statusBar.isAnimation)
            StatusBar.setBarStyle(this.statusBar.barStyle, this.statusBar.isAnimation)
            StatusBar.setTranslucent(this.statusBar.isTranslucent)
          },
          backHandlerPrevScreen: {
            add: () => {
              BackHandler.addEventListener('hardwareBackPress', this._backHandler)
            },
            remove: () => {
              BackHandler.removeEventListener('hardwareBackPress', this._backHandler)
            }
          }
        })
      }
    }
  }
}