export const Color = {
  theme: '#2b3964',
  secondary: '#e6b566',
  primary: '#0f73ee',
  info: '#1ec3b3',
  default: '#363e49',
  success: '#32c752',
  warning: '#d8b815',
  danger: '#d83915',
  black: '#000',
  textColor: '#212529',
  textMuted: '#868e96',
  gray: '#d4d4d4',
  grayLight: '#e8e8e8',
  grayLighter: '#f5f5f5',
  borderColor: 'rgba(0,0,0,.055)',
  white: '#fff'
}

export const TextSize = {
  default: 14,
  heading: 18,
  title: 16,
  subtitle: 13,
  small: 11
}

export function colorYiq(hex) {
  var r = parseInt(hex.substr(1, 2), 16),
      g = parseInt(hex.substr(3, 2), 16),
      b = parseInt(hex.substr(5, 2), 16),
      yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? Color.textColor : Color.white;
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

export function adjustSaturate(color, range){
  var col = hexToRgb(color);
  var sat = Number(range)/100;
  var gray = col.r * 0.3086 + col.g * 0.6094 + col.b * 0.0820;

  col.r = Math.round(col.r * sat + gray * (1-sat));
  col.g = Math.round(col.g * sat + gray * (1-sat));
  col.b = Math.round(col.b * sat + gray * (1-sat));

  var out = rgbToHex(col.r,col.g,col.b);
  
  return out
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}

export function convertHex(hexCode,opacity){
  var hex = hexCode.replace('#','');

  if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  var r = parseInt(hex.substring(0,2), 16),
      g = parseInt(hex.substring(2,4), 16),
      b = parseInt(hex.substring(4,6), 16);

  return 'rgba('+r+','+g+','+b+','+opacity/100+')';
}