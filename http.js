function getIp(req) {
  return (
    req.headers['x-forwarded-for'] ??
    req.connection?.remoteAddress ??
    req.connection.socket?.remoteAddress ??
    req.socket?.remoteAddress
  )
}

function consoleRequest(req, params) {
  console.log(new Date().toLocaleString('ja'), { sourceIp: getIp(req), params })
}

;(async function main() {
  const fs = require('fs').promises
  const httpPort = 14538
  const http = require('http')
  const info = JSON.parse(await fs.readFile('info.json', 'utf-8'))
  http
    .createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Request-Method', '*')
      res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET')
      res.setHeader('Access-Control-Allow-Headers', '*')
      const gotPass = req.url.split('/')[1]
      process(req, res, gotPass === info.pass)
    })
    .listen(httpPort)
})()

function getParams(url) {
  const params = {}
  const [rawPaths, rawQueries] = url.split('?')
  const paths = rawPaths.split('/')
  const queries = rawQueries?.split('&')

  params.pass = paths[1]

  paths.slice(2).forEach((path, i) => (params[i] = path))

  queries
    ?.map((query) => query.split('='))
    ?.forEach(([key, value]) => (params[key] = decodeURIComponent(value)))

  return params
}

async function process(req, res, passMatched) {
  const params = getParams(req.url)
  const funcName = params[0]

  consoleRequest(req, params)

  const hiddenFuncs = {
    gohome,
  }
  const funcs = {
    regalias,
  }

  const func = funcs[funcName] ?? (passMatched && hiddenFuncs[funcName])
  if (!func) return

  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=UTF-8',
  })
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

async function regalias(params) {
  const regalias = await import('regalias-node').then(
    (module) => module.default
  )

  return regalias(params[1] || undefined)
}
