import React,{ Component } from 'react'
import { View,Text,Image } from 'react-native'
import { NavigationContainer,DefaultTheme } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Color,{ colorYiq } from './src/tools/Color'
const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()
const TopTab = createMaterialTopTabNavigator()
import TabBar from './src/components/TabBar'
import Header from './src/components/Header'

// Screen
import Intro from './src/screens/Intro'
import Start from './src/screens/Start'
import RegisterUserForm from './src/screens/RegisterUserForm'
import LoginForm from './src/screens/LoginForm'
import MyAccount from './src/screens/MyAccount'
import Home from './src/screens/Home'
import ChatInbox from './src/screens/ChatInbox'
import Doctors from './src/screens/Doctors'
import Doctor from './src/screens/Doctor'
import Ambulances from './src/screens/Ambulances'
import Emergency from './src/screens/Emergency'
import Nearest from './src/screens/Nearest'
import News from './src/screens/News'
import NewsDetails from './src/screens/NewsDetails'
import CameraRoll from './src/screens/CameraRoll'
import Consultation from './src/screens/Consultation'
import ConsultationForm from './src/screens/ConsultationForm'
import ConsultationTerms from './src/screens/ConsultationTerms'
import ConsultationTypePicker from './src/screens/ConsultationTypePicker'
import QuestionPicker from './src/screens/QuestionPicker'
import QuestionForm from './src/screens/QuestionForm'
import QuestionDetails from './src/screens/QuestionDetails'
import ChatBubble from './src/screens/ChatBubble'
import MedicalRegistration from './src/screens/MedicalRegistration'
import MedicalRegisteredDetails from './src/screens/MedicalRegisteredDetails'
import Inpatient from './src/screens/Inpatient'
import MedicalRegisteredList from './src/screens/MedicalRegisteredList'
import QuestionList from './src/screens/QuestionList'
import { ContactUs } from './src/screens/ContactUs'
// End Screen

const UnderConstruction = () => {
  return (
    <View style={{ flex: 1,alignItems: 'center',justifyContent: 'center',backgroundColor: Color.white }}>
      <Text style={{ fontSize: 20,textAlign: 'center' }}>Under Construction</Text>
      <Text style={{ textAlign: 'center',color: Color.textMuted }}>Content will be available soon</Text>
    </View>
  )
}

const MainTab = () => {
  return (
    <Tab.Navigator tabBar={props => <TabBar {...props} />}>
      <Tab.Screen name='Home' component={HomeStack} />
      <Tab.Screen name='Consultation' component={Consultation} />
      <Tab.Screen name='Notifications' component={Notifications} />
      <Tab.Screen name='MyAccount' component={MyAccount} />
    </Tab.Navigator>
  )
}

const HomeStack = () => {
  return (
    <Stack.Navigator headerMode='none'>
      <Stack.Screen name='Home' component={Home} />
      <Stack.Screen name='Favorite' component={UnderConstruction} />
    </Stack.Navigator>
  )
}

class Notifications extends Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Header navigation={this.props.navigation} title='Pesan & Notikasi' />
        <TopTab.Navigator
          tabBarOptions={{
            activeTintColor: Color.textColor,
            inactiveTintColor: Color.textMuted,
            labelStyle: { fontFamily: 'PlusJakartaSans',fontSize: 12,letterSpacing: .5 },
            indicatorStyle: { backgroundColor: Color.theme }
          }}
        >
          <TopTab.Screen name='Konsultasi' component={ChatInbox} />
          <TopTab.Screen name='Pendaftaran' component={MedicalRegisteredList} />
          <TopTab.Screen name='Tanya Sehat' component={QuestionList} />
        </TopTab.Navigator>
      </View>
    )
  }

  constructor(props) {
    super(props)
  }
}

export let updateUserLoggedIn
export let userLoggedIn
export default class NavigationServices extends Component {
  _subscription = true
  constructor(props) {
    super(props)
    this.state = {
      userLoggedIn: null,
      ready: false
    }
    this._updateUserLoggedIn()
    updateUserLoggedIn = this._updateUserLoggedIn
  }

  _updateUserLoggedIn = () => {
    if(this._subscription) {
      AsyncStorage.getItem('user_logged_in',(e,rs) => {
        if (rs !== null) rs = JSON.parse(rs)
        userLoggedIn = rs
        this.setState({
          userLoggedIn: rs,
          ready: true
        })
      })
    }
  }

  componentWillUnmount() {
    this._subscription = false
  }

  render() {
    const { userLoggedIn,ready } = this.state
    if (!ready) return <Splash />
    return (
      <NavigationContainer theme={this._myTheme} linking={this._linking} fallback={<Splash />}>
        <Stack.Navigator headerMode='none' animationTypeForReplace='pop'>
          {
            userLoggedIn === null &&
            <>
              <Stack.Screen name='Intro' component={Intro} />
              <Stack.Screen name='Start' component={Start} />
              <Stack.Screen name='RegisterUserForm' component={RegisterUserForm} />
              <Stack.Screen name='LoginForm' component={LoginForm} />
            </>
            ||
            <>
              <Stack.Screen name='Home' component={MainTab} />
              <Stack.Screen name='Doctors' component={Doctors} />
              <Stack.Screen name='Doctor' component={Doctor} />
              <Stack.Screen name='Ambulances' component={Ambulances} />
              <Stack.Screen name='Emergency' component={Emergency} />
              <Stack.Screen name='UnderConstruction' component={UnderConstruction} />
              <Stack.Screen name='Nearest' component={Nearest} />
              <Stack.Screen name='News' component={News} />
              <Stack.Screen name='NewsDetails' component={NewsDetails} />
              <Stack.Screen name='MedicalRegistration' component={MedicalRegistration} />
              <Stack.Screen name='MedicalRegisteredDetails' component={MedicalRegisteredDetails} />
              <Stack.Screen name='ConsultationForm' component={ConsultationForm} />
              <Stack.Screen name='ConsultationTerms' component={ConsultationTerms} />
              <Stack.Screen name='ConsultationTypePicker' component={ConsultationTypePicker} />
              <Stack.Screen name='QuestionPicker' component={QuestionPicker} />
              <Stack.Screen name='QuestionForm' component={QuestionForm} />
              <Stack.Screen name='QuestionDetails' component={QuestionDetails} />
              <Stack.Screen name='CameraRoll' component={CameraRoll} />
              <Stack.Screen name='ChatBubble' component={ChatBubble} />
              <Stack.Screen name='Inpatient' component={Inpatient} />
              <Stack.Screen name='ContactUs' component={ContactUs} />
            </>
          }
        </Stack.Navigator>
      </NavigationContainer>
    )
  }
  _myTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Color.grayLighter
    }
  }
  _linking = {
    prefixes: ['kuansing-sehat://'],
    config: {
      screens: {
        Home: 'home'
      }
    }
  }
}

function Splash(props) {
  return (
    <View style={{ backgroundColor: Color.theme,alignItems: 'center',justifyContent: 'center',flex: 1 }}>
      <Image fadeDuration={300} source={require('./src/images/logo.png')} style={{ width: 100,height: 100,marginBottom: 15 }} resizeMethod='resize' resizeMode='contain' />
      <View style={{ flexDirection: 'row',alignItems: 'center' }}>
        <Text style={{ textTransform: 'uppercase',fontSize: 18,fontWeight: '200',marginBottom: 2,color: colorYiq(Color.theme) }}>AKU<Text style={{ fontWeight: 'bold', fontSize: 18 }}>SIGAP</Text></Text>
      </View>
      <Text style={{ fontSize: 13,color: colorYiq(Color.theme) }}>Kabupaten Kuantan Singingi</Text>
    </View>
  )
}