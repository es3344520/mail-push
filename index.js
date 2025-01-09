// 导入必要的模块
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const querystring = require('querystring');

// 初始化Express应用
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 环境变量设置
const IPINFO_TOKEN = process.env.IPINFO_TOKEN;
const SENDCLOUD_API_USER = process.env.SENDCLOUD_API_USER;
const SENDCLOUD_API_KEY = process.env.SENDCLOUD_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// 定义处理B请求的路由
app.get('/proxy', async (req, res) => {
  try {
    // 获取B的真实IP地址
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // 调用ipinfo.io API获取详细信息
    const ipInfoResponse = await axios.get(`https://ipinfo.io/${clientIp}?token=${IPINFO_TOKEN}`);
    const ipData = ipInfoResponse.data;

    // 构建邮件内容
    const emailContent = `
      <p>B用户访问信息:</p>
      <pre>${JSON.stringify(ipData, null, 2)}</pre>
    `;

    // 调用SendCloud API发送邮件
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

    // 返回响应给B
    res.send('感谢您的访问！');
  } catch (error) {
    console.error(error);
    res.status(500).send('服务器错误，请稍后再试。');
  }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器正在运行在端口 ${PORT}`);
});
