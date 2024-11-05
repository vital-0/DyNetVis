global.g_Global = {}
global.g_data = {}

let fs = require("fs");

global.g_readF = null;

class cReadF {

    readField() {
        fs.readFile("./data/Field/Field CountNum.json", (err, res) => {
            if (err) {
                console.log(err);
                return err;
            }
            if (res.toString()) {
                global.g_Global.fieldNum = JSON.parse(res.toString());
                // console.log("数据为：", global.g_Global.fieldNum);
            }
            else {
                console.log("数据为空");
            }
        });
    }
}

module.exports = () => {
    g_readF = new cReadF();
}

