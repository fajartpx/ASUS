let Color = {
  theme: '#2b3964',
  blue: '#1EA9D2',
  yellow: '#FFD371',
  greenButton : '#2FBDBA',
  green: '#1EA68D',
  red: '#D83A56',
  teal: '#38A3A5',
  black: '#1B262C',
  grayDarker: '#33313B',
  grayDark: '#5E6073',
  gray: '#CFD3CE',
  grayLight: '#E6E6E6',
  grayLighter: '#F1F1F1',
  white: '#fff'
}

Color = {
  ...Color,
  theme: Color.blue,
  tertiary: '#F4C983',
  primary: Color.blue,
  info: Color.teal,
  default: Color.grayDarker,
  success: Color.green,
  warning: Color.yellow,
  danger: Color.red,
  textColor: Color.black,
  textMuted: '#70757a',
  borderColor: '#DCDDE7'
}

export default Color

export function colorYiq(hex, isBoolean = false) {
  if (hex === Color.white) {
    return Color.textColor
  } else if (hex === Color.textColor || hex === Color.black) {
    return Color.white
  }

  let r = parseInt(hex.substr(1, 2), 16),
    g = parseInt(hex.substr(3, 2), 16),
    b = parseInt(hex.substr(5, 2), 16),
    yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 196) ? (isBoolean ? true : Color.textColor) : (isBoolean ? false : Color.white);
}

export function LightenDarkenColor(colorCode, amount) {
  var usePound = false;

  if (colorCode[0] == "#") {
    colorCode = colorCode.slice(1);
    usePound = true;
  }

  var num = parseInt(colorCode, 16);

  var r = (num >> 16) + amount;

  if (r > 255) {
    r = 255;
  } else if (r < 0) {
    r = 0;
  }

  var b = ((num >> 8) & 0x00FF) + amount;

  if (b > 255) {
    b = 255;
  } else if (b < 0) {
    b = 0;
  }

  var g = (num & 0x0000FF) + amount;

  if (g > 255) {
    g = 255;
  } else if (g < 0) {
    g = 0;
  }

  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}


export function convertHex(hexCode, opacity) {
  var hex = hexCode.replace('#', '');

  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  var r = parseInt(hex.substring(0, 2), 16),
    g = parseInt(hex.substring(2, 4), 16),
    b = parseInt(hex.substring(4, 6), 16);

  return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
}