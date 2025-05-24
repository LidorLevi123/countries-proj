'use strict'

var gCache = loadFromLocalStorage('cache') || {}

function getCountryBy(type, term) {
    if (gCache[term]) return Promise.resolve(gCache[term])

    const endpoints = _getEndpoints(term)

    return fetch(endpoints[type])
        .then(res => res.json())
        .then(countries => countries[0])
        .then(_refactorBorders)
        .then(country => _saveToCache(term, country))
        .catch(err => console.log('Could not get country', err))
}

function removeCache() {
    gCache = {}
    localStorage.removeItem('cache')
}

function _saveToCache(term, country) {
    gCache[term] = country
    saveToLocalStorage('cache', gCache)
    return country
}

function _getEndpoints(term) {
    return {
        name: `https://restcountries.com/v3.1/name/${term}`,
        code: `https://restcountries.com/v3.1/alpha/${term}`
    }
}

function _refactorBorders(country) {
    if(!country.borders) return country
    
    const prms = country.borders.map(border =>
        fetch(`https://restcountries.com/v3.1/alpha/${border}`)
            .then(res => res.json())
            .then(countries => countries[0].cca2)
    )
    return Promise.all(prms).then(borders => ({ ...country, borders }))
}