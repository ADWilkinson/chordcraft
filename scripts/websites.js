
import admin from 'firebase-admin'
const serviceAccount = require('./key.json')
import { ServiceAccount } from "./key.json";
const fetch = require('node-fetch')
const Bluebird = require('bluebird')
fetch.Promise = Bluebird

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})
const db = require('firebase-admin').firestore()

const addWebsites = async (websites) => {
  const batch = db.batch()
  websites.forEach((website) => {
    const docRef = db.collection('websites').doc()
    batch.set(docRef, website)
  })
  return batch.commit()
}

const getWebsites = async () => {
  const snapshot = await db.collection('websites').get()
  return snapshot.docs.map((doc) => doc.data())
} 

const getWebsite = async (id) => {
  const snapshot = await db.collection('websites').doc(id).get()
  return snapshot.data()
} 

const updateWebsite = async (id, data) => {
  const docRef = db.collection('websites').doc(id)
  return docRef.update(data)
}

const deleteWebsite = async (id) => {
  const docRef = db.collection('websites').doc(id)
  return docRef.delete()
}

export { addWebsites, getWebsites, getWebsite, updateWebsite, deleteWebsite }