// 引入必要的模块
const express = require('express');
const axios = require('axios');
const querystring = require('querystring');

// 创建Express应用程序
const app = express();

// 环境变量
const IPINFO_TOKEN = process.env.IPINFO_TOKEN;
const SENDCLOUD_API_USER = process.env.SENDCLOUD_API_USER;
const SENDCLOUD_API_KEY = process.env.SENDCLOUD_API_KEY;
const TO_EMAIL = process.env.RECIPIENT_EMAIL; // 从环境变量中获取A的邮箱地址

// 中间API端点
app.get('/proxy', async (req, res) => {
  try {
    // 转发请求到ipinfo.io并获取响应
    const response = await axios.get(`https://ipinfo.io`, {
      params: { token: IPINFO_TOKEN }
    });

    // 准备发送邮件的数据
    const mailData = {
      apiUser: SENDCLOUD_API_USER,
      apiKey: SENDCLOUD_API_KEY,
      to: TO_EMAIL,
      from: 'no-reply@sendcloud.net',
      subject: '从B用户获得的数据',
      html: `<p>以下是B用户的数据：</p><pre>${JSON.stringify(response.data, null, 2)}</pre>`
    };

    // 发送邮件
    await axios.post('https://api.sendcloud.net/apiv2/mail/send', querystring.stringify(mailData));

    // 返回成功信息给B用户
    res.send('数据已成功发送到A的邮箱！');
  } catch (error) {
    console.error(error);
    res.status(500).send('出现错误，请稍后再试。');
  }
});

// 监听端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器正在运行在端口 ${PORT}`);
});
