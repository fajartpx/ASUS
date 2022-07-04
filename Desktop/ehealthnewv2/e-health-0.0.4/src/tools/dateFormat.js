const dateFormat = (s) => {
  if(s === '') return false
  const year = s.substr(0,4)
  const month = parseInt(s.substr(5,2)) - 1
  const date = parseInt(s.substr(8,2))
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

  return date + ' ' + months[month] + ' ' + year
}

export default dateFormat

export function timeFormat(dateTime,now = new Date()) {
  let ynow = (now.getFullYear()).toString()
  let mnow = ('0' + (now.getMonth() + 1).toString()).slice(-2)
  let dnow = ('0' + (now.getDate()).toString()).slice(-2)
  let nowstr = ynow + '-' + mnow + '-' + dnow
  let datenow = new Date(nowstr)
  let datedefine = new Date(dateTime.substr(0,10))
  // To calculate the time difference of two dates
  let Difference_In_Time = datenow.getTime() - datedefine.getTime()
  // To calculate the no. of days between two dates
  let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24)

  let days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
  if (Difference_In_Days < 7) {
    switch (Difference_In_Days) {
      case 0:
        return dateTime.substr(11,5)
      case 1:
        return 'Kemarin'
      default:
        return days[datedefine.getDay()]
    }
  }

  let ydef = dateTime.substr(0,4)
  let mdef = dateTime.substr(5,2)
  let ddef = dateTime.substr(8,2)
  return ddef + '/' + mdef + '/' + ydef.substr(2,2)

}