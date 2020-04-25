export default function (str:string):string {
  return Buffer.from(str, 'binary').toString('base64')
}
