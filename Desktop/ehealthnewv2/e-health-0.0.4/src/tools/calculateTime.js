export default (start) => {
  const startY = parseInt(start.substr(0,4))
  const startM = parseInt(start.substr(5,2)) - 1
  const startD = parseInt(start.substr(8,2))
  const startH = parseInt(start.substr(11,2))
  const startI = parseInt(start.substr(14,2))
  const startS = parseInt(start.substr(17,2))
  const nowObj = new Date()
  const startObj = new Date(startY, startM, startD, startH, startI, startS)
  const diff = nowObj.getTime() - startObj.getTime()
  return diff / 1000
}