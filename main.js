const fetch = require('node-fetch')
const parseString = require('xml2js').parseString
const stringify = require('querystring').stringify
const fs = require('fs')

const boardGamesCSV = fs.readFileSync('./board_games.csv')
const boardGames = boardGamesCSV
  .toString()
  .split('\n')
  .filter(line => line)
  .map(line => {
    return line.split(',')[0]
  })

const ratings = []

for (let i = 0; i < boardGames.length; i++) {
  setTimeout(() => {
    console.log(boardGames[i])
    searchId(boardGames[i], id => {
      ratingFromId(id, rating => {
        ratings.push(rating)
        if (i === boardGames.length - 1) {
          fs.writeFileSync('./board_games.csv', boardGames
            .map((game, i) => [game, ratings[i]].join(','))
            .join('\n')
          )
        }
      })
    })
  }, i * 3000)
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
    if (!result.items || !result.items.item || !result.items.item.length) callback('error')
    else callback(result.items.item[0].$.id)
  })
}

function ratingFromId (id, callback) {
  if (id === 'error') callback('error')
  else {
    get('thing', { id: id, type: 'boardgame', stats: 2 }, result => {
      if (!result.items || !result.items.item) callback('error')
      else callback(result.items.item[0].statistics[0].ratings[0].average[0].$.value)
    })
  }
}
