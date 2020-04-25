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
export const make = functions.https.onCall(async (data:ReservationData, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'Unauthorized access.')
  }
  if (!data.eventId) {
    throw new functions.https.HttpsError('invalid-argument', 'Required filed (Event ID) is empty.')
  }
  if (!data.email) {
    throw new functions.https.HttpsError('invalid-argument', 'Required filed (Email) is empty.')
  } else if (!emailIsValid(data.email)) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is not valid.')
  }
  const userId = context.auth.uid
  const reservationId = base64(data.email)
  const resData = {
    uid: context.auth.uid,
    name: data.name || null,
    email: data.email,
    token: randomString() + base64(new Date().getTime().toString()) + reservationId,
    status: 'pending',
  }
  const reservationDocRef = db.collection('posts').doc(data.eventId).collection('reservations').doc(reservationId)
  const mailDocRef = db.collection('mail').doc(userId)

  await reservationDocRef.get()
    .then((resDoc):any => {
      if (resDoc.exists) {
        const reservation = resDoc.data() || {}
        if (reservation.status === 'pending') {
          return mailDocRef.get()
            .then(mailDoc => {
              if (mailDoc.exists) {
                const mail = mailDoc.data() || {}
                switch (mail.state) {
                  case 'PENDING':
                  case 'PROCESSING':
                    throw new functions.https.HttpsError('already-exists', 'Email is on the way.')
                  case 'ERROR':
                    throw new functions.https.HttpsError('already-exists', 'Email delivery error: ' + mail.error)
                  case 'SUCCESS':
                  default:
                    return mailDocRef.update({state: 'RETRY'})
                }
              } else {
                return mailDocRef.set(emailDoc({...data, token: resData.token}))
              }
            })
        } else if (reservation.status === 'confirmed') {
          throw new functions.https.HttpsError('already-exists', 'Reservation already confirmed.')
        }
      }
      return Promise.all([
        reservationDocRef.set(resData),
        mailDocRef.set(emailDoc({...data, token: resData.token}))
      ])
    })
  return reservationId
})

function emailIsValid (email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function emailDoc (data: ReservationData) {
  return {
    to: data.email,
    message: {
      subject: `${data.eventInfo.title} reservation`,
      html: reservationHTML(data),
    }
  }
}

function reservationHTML (resData: ReservationData): string {
  const url = resData.eventUrl + `/reservation/` + resData.token
  const eventInfo = resData.eventInfo
  let html = ''
  if (resData.name) {
    html = `Dear ${resData.name},`
  }
  html += `<p>Thank you for your interest in our event:<br>
<h2 class="title">${eventInfo.title}</h2>
<div class='date'>${eventInfo.dateString}</div> at ${eventInfo.locationString}.</p>
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
