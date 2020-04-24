import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import {db} from "./db"
import base64 from "./base64"

if (!admin.apps.length) {
  admin.initializeApp()
}

interface EventInfo {
  title: string,
  dateString: string,
  locationString: string,
  description: string
}

interface ReservationData {
  token: string,
  eventId: string,
  eventUrl: string,
  eventInfo: EventInfo,
  email: string,
  name: string,
}
export const makeReservation = functions.https.onCall(async (data:ReservationData, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'Unauthorized access.')
  }
  if (!data.eventId) {
    throw new functions.https.HttpsError('invalid-argument', 'Required filed (Event ID) is empty.')
  }
  if (!data.email) {
    throw new functions.https.HttpsError('invalid-argument', 'Required filed (Email) is empty.')
  }
  const resId = base64(data.email)
  const resData = { ...data, token: randomString() + base64(new Date().getTime().toString()) + resId }
  await db.collection('posts').doc(data.eventId)
    .collection('reservations').doc(resId).set(resData)
  await db.collection('email').add({
    to: data.email,
    message: {
      subject: `${data.eventInfo.title} reservation`,
      html: reservationHTML(resData),
    }
  })
  return resId
})

function reservationHTML (resData: ReservationData): string {
  const url = resData.eventUrl + resData.eventId + `/reservation/` + resData.token
  const eventInfo = resData.eventInfo
  let html = ''
  if (resData.name) {
    html = `Dear ${resData.name},`
  }
  html += `<p>Thank you for your interest in<br>
<span class="title">${eventInfo.title}</span> on <span class='date'>${eventInfo.dateString}</span> at ${eventInfo.locationString}.</p>
<p>To complete your reservation, pleas click on the link below:</p>
<p><a href="${url}">${url}</a></p>
<p class='footnote'>If you haven't requested the reservation, just ignore this email.</p>
<p>ABA</p>`
  return html
}

function randomString (length = 12) {
  const randCharFromStr = (str: string): string => str.charAt(Math.floor(Math.random() * str.length))
  const lows = 'abcdefghijklmnopqrstuvwxyz'
  const caps = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const specials = '~-_@#*+='
  const charset = lows + specials + caps + numbers
  let checkLow, checkCap, checkNum, checkSpecial
  let retVal = ''
  for (let i = 0; i < length; ++i) {
    const char = randCharFromStr(charset)
    if (lows.includes(char)) checkLow = true
    if (caps.includes(char)) checkCap = true
    if (numbers.includes(char)) checkNum = true
    if (specials.includes(char)) checkSpecial = true
    retVal += char
  }
  if (!checkLow) retVal += randCharFromStr(lows)
  if (!checkCap) retVal += randCharFromStr(caps)
  if (!checkNum) retVal += randCharFromStr(numbers)
  if (!checkSpecial) retVal += randCharFromStr(specials)
  return retVal
}
