import express from 'express';
import dotenv from 'dotenv';
import os from 'os';
import fs from 'fs';
import https from 'https';

dotenv.config();

const app = express();
const port = process.env.PORT || 443;

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

app.get('/7kzwhaJ02z.txt', (req, res) => {
  res.sendFile(`${process.cwd()}/7kzwhaJ02z.txt`, {
    headers: {
      'Content-Type': 'text/plain'
    }
  });
});
// app.listen(80, '0.0.0.0', () => {
//   console.log('Listening on port 80');
// });
// 

app.get('/amazon-login', (req, res) => {
  const debug = req.query.state;

  if (!debug) {
    // 没有指定 debug 参数时返回一段 HTML
    res.setHeader('Content-Type', 'text/html');
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Amazon SSO Login Test</title>
        </head>
        <body>
          <h3>测试 Amazon SSO Login</h3>
          <p>调试中...</p>
        </body>
      </html>
    `);
  }

  const clientId = process.env.LWA_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.LWA_REDIRECT_URI);
  const scope = encodeURIComponent(process.env.LWA_SCOPE || 'profile');
  const state = encodeURIComponent(req.query.state || 'wx_default');

  const amazonLoginUrl = `https://www.amazon.com/ap/oa?client_id=${clientId}&scope=${scope}&response_type=code&redirect_uri=${redirectUri}&state=${state}`;

  const ip = (req.headers['x-forwarded-for'] || '').split(',').shift().trim()
           || req.connection.remoteAddress
           || req.socket.remoteAddress
           || req.ip;

  console.log(`[Redirect] Client IP: ${ip} → ${amazonLoginUrl}`);

  res.redirect(302, amazonLoginUrl);
});

// 读取证书文件
const sslOptions = {
  key: fs.readFileSync('./cert/wuyiling.vip.key'),
  cert: fs.readFileSync('./cert/wuyiling.vip_bundle.crt'),
};

// 用 https 启动服务器
https.createServer(sslOptions, app).listen(port, () => {
  console.log(`✅ Amazon login redirect service running at https://${getLocalIp()}:${port}`);
});
