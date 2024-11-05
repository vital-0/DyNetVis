let express = require("express");
let express_ws = require("express-ws");

require("./readFile");

global.g_SE = null;
global.g_ws = null;

let g_Moudule = {
    netWork: require("./netWork"),
}

class CSE {
    constructor() {
        this.run();
    }

    run() {
        this.app = express();
        express_ws(this.app);

        //跨域问题，跨域处理是有序的，static被拦截问题：应当把处理跨域的代码放在use之前
        this.app.all('*', function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            next();
        });
        this.app.use(express.static("static"));

        this.app.ws("/vis", (ws, req) => {
            ws.on("message", (data) => {
                this.onMessage(ws, JSON.parse(data));
            })
        });
        this.app.listen(6996);
    }

    dataInit(ws) {//进行每个模块的数据初始化

    }

    onMessage(ws, tData) {
        let key = tData.key;
        let mod = g_Moudule[key];//以key作为模块
        if (mod)
            mod.onMessage(ws, tData);
        else
            console.log('mod不存在')
    }

    send(ws, info) {
        ws.send(JSON.stringify(info));
    }

    getWs(uid) {    //通过uid获取长连接
        return this.m_Client[uid];
    }

}

module.exports = () => {
    console.log("服务器已启动！");
    g_SE = new CSE();
}