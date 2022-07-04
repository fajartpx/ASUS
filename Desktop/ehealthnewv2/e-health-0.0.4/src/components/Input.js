import React from 'react'
import { View, Text, TextInput, Dimensions, Modal, TouchableHighlight, TouchableOpacity, ToastAndroid } from 'react-native'
import Color, { colorYiq } from '../tools/Color'
const { width, height } = Dimensions.get('window')
import Icon from 'react-native-vector-icons/Ionicons'
import { Calendar } from 'react-native-calendars'

const Input = props => {
  const disabled = props.disabled || false
  return (
    <View style={{ marginBottom: 15, ...props.containerStyle }}>
      {
        (props.label && typeof props.label === 'string') &&
        <Text style={{ marginBottom: 10 }}>{props.label}</Text>
        ||
        (props.label && typeof props.label === 'object') &&
        props.label
      }
      <View style={{ borderRadius: 8, borderWidth: 1, borderColor: Color.borderColor, flexDirection: 'row', backgroundColor: !disabled ? Color.white : Color.grayLighter, ...props.inputableStyle }}>
        {
          props.prepend &&
          props.prepend
        }
        <TextInput
          placeholderTextColor={Color.textMuted}
          placeholder={props.placeholder}
          style={{ flex: 1, paddingVertical: props.multiline ? 15 : 10, paddingHorizontal: 20, color: Color.textColor, height: props.multiline ? 100 : null, textAlignVertical: props.multiline ? 'top' : 'center', ...props.textInputStyle }}
          value={props.value}
          onChangeText={props.onChangeText}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          onChange={props.onChange}
          multiline={props.multiline}
          keyboardType={props.keyboardType}
          maxLength={props.maxLength}
          editable={!disabled}
        />
        {
          props.append &&
          props.append
        }
      </View>
    </View>
  )
}

export default Input

const dateFormat = (date, format = 'd M Y') => {
  if (!date) {
    return ''
  }
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const monthsShort = ['Jan', 'Feb', 'Mar', 'Aprl', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  let d, m, y
  let returnStr = ''
  if (typeof date === 'string') {
    if (date === '') {
      return ''
    }
    y = date.substr(0, 4)
    m = parseInt(date.substr(5, 2)) - 1
    d = parseInt(date.substr(8, 2))
  } else {
    y = date.getFullYear()
    m = date.getMonth()
    d = date.getDate()
  }

  for (let i = 0; i < format.length; i++) {
    switch (format[i]) {
      case 'y':
        returnStr += y
        break
      case 'Y':
        returnStr += y
        break
      case 'M':
        returnStr += months[m]
        break
      case 'm':
        returnStr += monthsShort[m]
        break
      case 'd':
        returnStr += d
        break
      case 'D':
        returnStr += ('0' + d).slice(-2)
        break
      default:
        returnStr += format[i]
    }
  }

  return returnStr

}

export const CalendarPicker = props => {
  const [visible, setVisible] = React.useState(false)
  const [mode, setMode] = React.useState('FULL')
  const markedDates = {}
  markedDates[props.selectedDate || ''] = { selected: true }
  const nowadays = new Date()
  const yearNow = nowadays.getFullYear()
  const [current, setCurrent] = React.useState(props.selectedDate || new Date())
  const currentYear = typeof current === 'string' ? parseInt(current.substr(0, 4)) : current.getFullYear()
  const currentMonth = typeof current === 'string' ? parseInt(current.substr(5, 2)) - 1 : current.getMonth()
  const [year, setYear] = React.useState(currentYear - 8)
  const [yearStart, setYearStart] = React.useState(year)
  const yearArr = []
  for (let i = yearStart; i <= (yearStart + 8 > yearNow ? yearNow : (yearStart + 8)); i++) {
    yearArr.push(i)
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return (
    <View style={{ marginBottom: 15, ...props.containerStyle }}>
      {
        (props.label && typeof props.label === 'string') &&
        <Text style={{ marginBottom: 10 }}>{props.label}</Text>
      }
      <TouchableHighlight
        style={{ borderRadius: 8 }}
        onPress={() => {
          setYearStart(year)
          if (props.selectedDate && props.selectedDate !== '') {
            setCurrent(props.selectedDate)
          }
          setVisible(true)
        }}
      >
        <View style={{ paddingHorizontal: 20, paddingVertical: 15, borderRadius: 8, borderWidth: 1, borderColor: Color.borderColor, backgroundColor: Color.white, flexDirection: 'row', alignItems: 'center', ...props.inputableStyle }}>
          {
            (props.placeholder && typeof props.placeholder === 'string' && !props.selectedDate || props.selectedDate === '') &&
            <Text style={{ flex: 1, color: Color.textMuted }}>{props.placeholder}</Text>
            ||
            <Text style={{ flex: 1 }}>{dateFormat(props.selectedDate, 'd m y')}</Text>
          }
          <View>
            <Icon name='calendar' size={18} color={Color.textMuted} />
          </View>
        </View>
      </TouchableHighlight>
      <Modal
        statusBarTranslucent
        transparent
        visible={visible}
        animationType='fade'
        hardwareAccelerated={true}
        onDismiss={(e) => {
          // console.log(e)
        }}
        onRequestClose={() => {
          if (mode === 'YEAR') {
            setMode('FULL')
          } else if (mode === 'MONTH') {
            setMode('YEAR')
          } else {
            setVisible(false)
          }
        }}
        onShow={(e) => {
          // console.log(e)
        }}
      >
        <View style={{ justifyContent: 'center', flex: 1 }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setVisible(false)
              setMode('FULL')
            }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,.5)' }}
          />
          {
            mode === 'FULL' &&
            <Calendar
              style={{
                borderWidth: 1,
                borderColor: Color.borderColor,
                borderRadius: 10,
                marginHorizontal: 20
              }}
              // Initially visible month. Default = Date()
              current={current}
              markedDates={markedDates}
              // Handler which gets executed on day press. Default = undefined
              onDayPress={day => {
                setVisible(false)
                setCurrent(day.dateString)
                if (props.onDayPress && typeof props.onDayPress === 'function') {
                  props.onDayPress(day)
                }
              }}
              // Handler which gets executed on day long press. Default = undefined
              // onDayLongPress={(day) => { console.log('selected day', day) }}
              // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
              monthFormat={'yyyy MM'}
              // Handler which gets executed when visible month changes in calendar. Default = undefined
              // onMonthChange={(month) => { console.log('month changed', month) }}
              // Hide month navigation arrows. Default = false
              // Replace default arrows with custom ones (direction can be 'left' or 'right')
              renderArrow={(direction) => {
                return (
                  <Icon name={direction === 'left' ? 'chevron-back' : 'chevron-forward'} size={22} color={Color.theme} />
                )
              }}
              // Do not show days of other months in month page. Default = false
              hideExtraDays={false}
              // If hideArrows = false and hideExtraDays = false do not switch month when tapping on greyed out
              // day from another month that is visible in calendar page. Default = false
              disableMonthChange={false}
              // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday
              firstDay={1}
              // Handler which gets executed when press arrow icon left. It receive a callback can go back month
              onPressArrowLeft={subtractMonth => subtractMonth()}
              // Handler which gets executed when press arrow icon right. It receive a callback can go next month
              onPressArrowRight={addMonth => addMonth()}
              // Disable all touch events for disabled days. can be override with disableTouchEvent in markedDates
              disableAllTouchEventsForDisabledDays={true}
              // Replace default month and year title with custom one. the function receive a date as parameter
              renderHeader={(date) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setMode('YEAR')
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: Color.textColor }}>{dateFormat(date, 'M Y')} <Icon name='create-outline' size={22} color={Color.textColor} /></Text>
                  </TouchableOpacity>
                )
              }}
              // Enable the option to swipe between months. Default = false
              enableSwipeMonths={true}
              theme={{
                textDayFontFamily: 'PlusJakartaSans',
                textMonthFontFamily: 'PlusJakartaSans',
                textDayHeaderFontFamily: 'PlusJakartaSans',
                todayTextColor: Color.theme,
                dayTextColor: Color.textColor,
                selectedDayBackgroundColor: Color.theme,
                selectedDayTextColor: colorYiq(Color.theme),
              }}
            />
            ||
            mode === 'YEAR' &&
            <View style={{ padding: 20, borderRadius: 8, backgroundColor: Color.white, marginHorizontal: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: -10, marginTop: -10, marginBottom: 15 }}>
                <Text style={{ textAlign: 'center', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, paddingHorizontal: 45, textAlignVertical: 'center', fontWeight: 'bold', letterSpacing: 1, fontSize: 15 }}>Pilih Tahun</Text>
                <TouchableOpacity
                  onPress={() => {
                    setMode('FULL')
                  }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name='chevron-back' color={Color.theme} size={22} />
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: -10, height: 50 * 3 }}>
                {
                  yearArr.map((y, i) => (
                    <TouchableOpacity
                      key={y}
                      onPress={() => {
                        let currentCurrent = current
                        if (typeof currentCurrent === 'object') {
                          currentCurrent.setFullYear(y)
                        }
                        const setDate = typeof current === 'string' ? current.replace(current.substr(0, 4), y.toString()) : currentCurrent
                        setCurrent(setDate)
                        setMode('MONTH')
                        setYearStart(yearArr[0])
                      }}
                    >
                      <View style={{ backgroundColor: currentYear === y ? Color.theme : Color.grayLighter, paddingHorizontal: 20, width: (width - 100) / 3, height: 40, borderRadius: 8, marginRight: (i + 1) % 3 === 0 ? 0 : 10, marginBottom: 10, justifyContent: 'center' }}>
                        <Text style={{ color: currentYear === y ? colorYiq(Color.theme) : Color.textMuted, textAlign: 'center' }}>{y}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                }
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15, backgroundColor: Color.grayLight, borderRadius: 20 }}>
                <TouchableOpacity
                  onPress={() => {
                    setYearStart(yearStart - 9)
                  }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 4, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name='chevron-back' color={Color.theme} size={22} />
                  </View>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18 }}>{yearArr[0] + ' - ' + yearArr[yearArr.length - 1]}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    if (yearArr.indexOf(yearNow) <= -1) {
                      setYearStart(yearStart + 9)
                    }
                  }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name='chevron-forward' color={yearArr.indexOf(currentYear) <= -1 ? Color.theme : Color.textMuted} size={22} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            ||
            mode === 'MONTH' &&
            <View style={{ padding: 20, borderRadius: 8, backgroundColor: Color.white, marginHorizontal: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: -10, marginTop: -10, marginBottom: 15 }}>
                <Text style={{ textAlign: 'center', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, paddingHorizontal: 45, textAlignVertical: 'center', fontWeight: 'bold', letterSpacing: 1, fontSize: 15 }}>Pilih Bulan</Text>
                <TouchableOpacity
                  onPress={() => {
                    setMode('YEAR')
                  }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name='chevron-back' color={Color.theme} size={22} />
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: -10, height: 50 * 4 }}>
                {
                  months.map((m, i) => (
                    <TouchableOpacity
                      onPress={() => {
                        let currentCurrent = current
                        let newDate = ''
                        if (typeof currentCurrent === 'object') {
                          currentCurrent.setMonth(i)
                        } else if (typeof currentCurrent === 'string') {
                          currentCurrent = currentCurrent.split('-')
                          currentCurrent[1] = ('0' + (i + 1)).slice(-2)
                          for (let i = 0; i < currentCurrent.length; i++) {
                            newDate += currentCurrent[i] + '-'
                          }

                          newDate = newDate.substr(0, newDate.length - 1)
                        }

                        const setDate = typeof current === 'string' ? newDate : currentCurrent
                        setCurrent(setDate)
                        setMode('FULL')
                      }}
                      key={m}
                    >
                      <View style={{ backgroundColor: currentMonth === i ? Color.theme : Color.grayLighter, paddingHorizontal: 20, width: (width - 100) / 3, height: 40, borderRadius: 8, marginRight: (i + 1) % 3 === 0 ? 0 : 10, marginBottom: 10, justifyContent: 'center' }}>
                        <Text style={{ color: currentMonth === i ? colorYiq(Color.theme) : Color.textMuted, textAlign: 'center' }}>{m}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                }
              </View>
            </View>
          }
        </View>
      </Modal>
    </View>
  )
}

export const PickOne = (props) => {
  const color = props.color || Color.theme
  return (
    <View style={{ marginBottom: 15, ...props.containerStyle }}>
      {
        (props.label && typeof props.label === 'string') &&
        <Text style={{ marginBottom: 10 }}>{props.label}</Text>
      }
      <TouchableHighlight
        onPress={() => {
          if (props.pickable !== undefined && props.pickable === false) return ToastAndroid.show('Unable to pick', ToastAndroid.SHORT)
          if (!props.value || (props.items && props.items.map(a => a.value).indexOf(props.value) < 0)) {
            if (props.onChange && typeof props.onChange === 'function') props.onChange(props.items[0])
          } else if (props.value && (props.items && props.items.map(a => a.value).indexOf(props.value) >= 0)) {
            if (props.onChange && typeof props.onChange === 'function') props.onChange(props.items.filter(a => a.value !== props.value).length > 0 && props.items.filter(a => a.value !== props.value)[0] || {})
          }
        }}
        style={{ borderRadius: (props.wrapperStyle && props.wrapperStyle.borderRadius) ? props.wrapperStyle.borderRadius : 8 }}
      >
        <View style={{ backgroundColor: Color.grayLighter, padding: 2.5, flexDirection: 'row', borderRadius: 8, ...props.wrapperStyle }}>
          {
            props.items.map((a, i) => (
              <View key={'pick_one_item_' + i} style={{ flex: 1, margin: 2.5, padding: 10, borderRadius: 4, backgroundColor: a.value === props.value ? color : 'transparent', elevation: a.value === props.value ? 5 : 0, ...props.itemStyle }}>
                <Text style={{ textAlign: 'center', color: a.value === props.value ? colorYiq(color) : Color.textMuted }}>{a.title}</Text>
              </View>
            ))
          }
        </View>
      </TouchableHighlight>
    </View>
  )
}