import PushNotification from "react-native-push-notification"

export const CreateChannel = (channelId, channelName, channelDescription = "A channel to categorise your notifications", playSound = true, vibrate = true, importance = 4) => {
  PushNotification.createChannel(
    {
      channelId, // (required)
      channelName, // (required)
      channelDescription, // (optional) default: undefined.
      playSound, // (optional) default: true
      soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
      importance, // (optional) default: 4. Int value of the Android notification importance
      vibrate, // (optional) default: true. Creates the default vibration patten if true.
    },
    (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
  )
}

export const LocalNotification = (notif) => {
  PushNotification.localNotification({
    channelId: notif.channelId || '',
    autoCancel: true,
    bigText: notif.bigText || '',
    subText: notif.subText || '',
    title: notif.title || '',
    message: notif.message || '',
    vibrate: true,
    vibration: 300,
    playSound: true,
    soundName: 'default',
    actions: notif.actions || ''
  })
}

export const LocalNotificationSchedule = (notif) => {
  PushNotification.localNotificationSchedule({
    channelId: notif.channelId || '',
    bigText: notif.bigText || '',
    subText: notif.subText || '',
    title: notif.title || '',
    message: notif.message || '',
    date: notif.date,
    allowWhileIdle: false, // (optional) set notification to work while on doze, default: false
  })
}