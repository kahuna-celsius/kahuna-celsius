const core = require('@actions/core')
const asciichart = require('asciichart')
const fetch = require('node-fetch')

async function main (API_KEY) {
  const url = new URL('/data/v2/histoday', 'https://min-api.cryptocompare.com/')
  url.searchParams.set('fsym', 'CEL')
  url.searchParams.set('tsym', 'USD')
  url.searchParams.set('limit', 100)
  url.searchParams.set('api_key', API_KEY)

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw Error(`HTTP ${response.status}`)
  }

  const { Data: { Data } } = await response.json()
  const times = Data.map(d => new Date(d.time * 1000).toISOString().split('T')[0])
  const prices = Data.map(d => d.close)
  const chart = asciichart.plot(prices, { height: 20 })
  return `
> ${times[0]} - ${times[times.length - 1]}

${chart}

> Last Refreshed: ${times[times.length - 1]}
  `.trim()
}

if (require.main === module) {
  main(process.env.ALPHA_VANTAGE_API_KEY).then(function (chart) {
    console.log(chart)
    core.setOutput('chart', chart)
    process.exit(0)
  }, function (error) {
    console.error(error)
    process.exit(1)
  })
} else {
  module.exports = main
}
