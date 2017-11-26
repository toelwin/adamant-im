import merge from 'deepmerge'

export default function storeData () {
  return store => {
    var localStorageAvailable = function () {
      var supported = true
      try {
        var ls = window.localStorage
        var test = '__hz-ls-test__'
        ls.setItem(test, test)
        ls.removeItem(test)
      } catch (e) {
        supported = false
      }
      return supported
    }
    var lsStorage = false
    var gsStorage = false
    if (localStorageAvailable()) {
      lsStorage = window.localStorage
    }
    gsStorage = window.sessionStorage
    var mainStorage = lsStorage
    if (!mainStorage) {
      mainStorage = gsStorage
    }
    if (mainStorage.getItem('language')) {
      store.commit('change_lang', mainStorage.getItem('language'))
    }
    if (mainStorage.getItem('storeInLocalStorage')) {
      store.commit('change_storage_method', mainStorage.getItem('storeInLocalStorage'))
    }
    var useStorage = gsStorage
    if (mainStorage.getItem('storeInLocalStorage') && lsStorage) {
      useStorage = lsStorage
    }
    var value = useStorage.getItem('adm-persist')
    if (value !== 'undefined') {
      if (value) {
        value = JSON.parse(value)
      }
    }
    if (typeof value === 'object' && value !== null) {
      store.replaceState(merge(store.state, value, {
        arrayMerge: function (store, saved) { return saved },
        clone: false
      }))
    }
    store.subscribe((mutation, state) => {
      if (mutation.type === 'change_storage_method') {
        if (mutation.payload) {
          useStorage = lsStorage
          lsStorage.setItem('adm-persist', gsStorage.getItem('adm-persist'))
          console.log('using localstorage')
        } else {
          useStorage = gsStorage
          lsStorage.removeItem('adm-persist')
          console.log('using sessionstorage')
        }
        mainStorage.setItem('storeInLocalStorage', mutation.payload)
      } else if (mutation.type === 'change_lang') {
        mainStorage.setItem('language', mutation.payload)
      }
      useStorage.setItem('adm-persist', JSON.stringify(state))
    })
  }
}