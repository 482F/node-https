function getIp(req) {
  return (
    req.headers['x-forwarded-for'] ??
    req.connection?.remoteAddress ??
    req.connection.socket?.remoteAddress ??
    req.socket?.remoteAddress
  )
}

;(async function main() {
  const fs = require('fs').promises
  const httpPort = 14538
  const http = require('http')
  const pass = (await fs.readFile('pass.txt', 'utf-8')).replaceAll(/\n/g, '')
  http
    .createServer((req, res) => {
      const gotPass = req.url.split('/')[1]
      if (gotPass !== pass) {
        return
      }
      process(req, res)
    })
    .listen(httpPort)
})()

function getParams(url) {
  const params = {}
  const [paths, queries] = url.split('?')
  paths
    .split('/')
    .slice(2)
    .forEach((path, i) => (params[i] = path))
  queries
    ?.split('&')
    ?.map((query) => query.split('='))
    ?.forEach(([key, value]) => (params[key] = decodeURIComponent(value)))
  return params
}

async function process(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=UTF-8',
  })

  const funcs = {
    gohome: gohome,
  }

  const params = getParams(req.url)
  res.end(await funcs[params[0]](params))
}

async function gohome(params) {
  const exec = require('child_process').exec
  return await new Promise((resolve) => {
    exec(
      'python3 /home/normal/git/gohome_notify/main.py 東京',
      (err, so, se) => {
        resolve(so)
      }
    )
  })
}
