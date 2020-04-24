export default function (str:string):string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes (match, p1) {
    return String.fromCharCode(Number('0x' + p1))
  }))
}
