import { CommonActions } from '@react-navigation/native'
const ResetNavigation = (navigationProps, screen = 'Login') => {
    return navigationProps
    .dispatch(
      CommonActions.reset({
        index: 0,
        key: null,
        routes: [
          { name: screen}
        ]
      })
    )
}

export default ResetNavigation