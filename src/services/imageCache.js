const DB_NAME = 'wte_images'
const STORE_NAME = 'food_images'
const DB_VERSION = 1

let _db = null

function openDB() {
  if (_db) return Promise.resolve(_db)
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = e => {
      e.target.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = e => { _db = e.target.result; resolve(_db) }
    req.onerror = e => reject(e.target.error)
  })
}

export async function getImageCache(foodName) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(foodName)
      req.onsuccess = e => resolve(e.target.result || null)
      req.onerror = e => reject(e.target.error)
    })
  } catch { return null }
}

export async function setImageCache(foodName, blob) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const req = tx.objectStore(STORE_NAME).put(blob, foodName)
      req.onsuccess = () => resolve()
      req.onerror = e => reject(e.target.error)
    })
  } catch {}
}

export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
