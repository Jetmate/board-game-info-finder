const fetch = require('node-fetch')
const parseString = require('xml2js').parseString
const stringify = require('querystring').stringify

const boardGames = ['Blokus', 'Blokus 3D', 'Agricola']
let ids = []

for (const game of boardGames) {
  searchId(game, id => {
    ratingFromId(id)
  })
}

function get (endpoint, parameters, callback) {
  fetch(`https://www.boardgamegeek.com/xmlapi2/${endpoint}?` + stringify(parameters))
    .then((response) => {
      return response.text()
    })
    .then((response) => {
      parseString(response, (err, result) => {
        callback(result)
      })
    })
}

function searchId (name, callback) {
  get('search', { query: name, type: 'boardgame' }, result => {
    if (!result.items.item.length) throw new Error('No results for ' + name)
    callback(result.items.item[0].$.id)
  })
}

function ratingFromId (id, callback) {
  get('thing', { id: id, type: 'boardgame', stats: 2 }, result => {
    console.log(result.items.item[0].statistics[0].ratings[0].average[0].$.value)
  })
}
