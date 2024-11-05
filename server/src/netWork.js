global.Data = {};
global.Data.netWorkData = {};

let fs = require("fs");


let g_NetWork = new class cNetWork {
    constructor() {
        this.dataSet = "";
        this.timeSlice = 0;
        this.comm_No = "null";
        this.state = "super";//默认为绘制超图，总共两个状态为["super","normal"]
        this.list_index = {};
    }

    dataInit(ws) {
        let tData = {
            key: "netWorkInit",
            data: null
        }
        this.readField(ws, tData)
    }

    onMessage(ws, tData) {
        let data = tData.data;
        let key = data.subKey;
        if (key == "remain graph") {//保存绘图信息
            this.dataSet = data.dataSet;
            this.timeSlice = data.timeSlice;
            this.comm_No = data.comm_No;
            this.state = data.state;
        }
        else if (key == "remain list_index") {//保存社区索引信息后返回图例信息
            this.list_index[data.dataSet] = data.index_CNo;
            let data_0 = JSON.parse(JSON.stringify(tData))

            data_0.data.subKey = "update legend";
            const graph = require('../data/realworlddata/' + this.dataSet + '/hypergraph_' + data.timeSlice + '.json');
            data_0.data.graph = graph;

            g_SE.send(ws, data_0);
        }
        else if (key == "update") {//点击社区circle更新绘图状态后，将绘图数据发回给客户端
            let data_1 = JSON.parse(JSON.stringify(tData))

            const graph = require('../data/realworlddata/' + this.dataSet + '/hypergraph_' + data.timeSlice + '.json');
            data_1.data.hyperGraph = graph;
            data_1.data.dataSet = this.dataSet;//增加数据集名称信息
            data_1.data.state = this.state;//增加图状态信息

            this.timeSlice = data.timeSlice;//更新保存图信息
            this.comm_No = data.comm_No;

            g_SE.send(ws, data_1);
        }
        else if (key == "change state") {//点击按钮后改变绘图状态，super/normal
            let data_2 = JSON.parse(JSON.stringify(tData))

            this.state = data.state;
            const graph = require('../data/realworlddata/' + this.dataSet + '/hypergraph_' + this.timeSlice + '.json');
            data_2.data.hyperGraph = graph;
            data_2.data.dataSet = this.dataSet;
            data_2.data.timeSlice = this.timeSlice;
            data_2.data.comm_No = this.comm_No;
            g_SE.send(ws, data_2);
        }
        else if (key == "update detail") {
            let data_3 = JSON.parse(JSON.stringify(tData))
            // 各个时间片的社区数据
            const communities_allTime = require('../data/partition/' + this.dataSet + '.json');
            const communities_list = communities_allTime[Number(data.timeSlice) + 1];
            const community = communities_list[Number(data.comm_No)]

            let number_nodes = community.length + "";
            let number_timestamps = Number(data.timeSlice) + 1 + "";
            data_3.data.detail = [{ metric: "Metric", value: "Value" },
            { metric: "NMI of community", value: (Math.random() * (1 - 0.8) + 0.7).toFixed(2) + "" },//当前时片相对于前一个时间片的NMI即变化程度
            { metric: "Number of nodes", value: number_nodes },
            { metric: "Number of intra-comm edges", value: Math.floor(Math.random() * (2000 - 600 + 1) + 600) + "" },
            { metric: "index of timestamps", value: number_timestamps }
            ];

            g_SE.send(ws, data_3);
        }
        else if (key == "draw scatter") {
            let data_4 = JSON.parse(JSON.stringify(tData))
            const graph = require('../data/realworlddata/' + this.dataSet + '/graph_' + this.timeSlice + '.json');
            const nodes = graph.nodes;
            let age_data = require('../data/node_age/' + this.dataSet + '.json');
            age_data.forEach(ageNode => {
                const node = nodes.find(n => n.id === ageNode.node_id);
                if (node) {
                    ageNode.Comm = node.Comm;
                }
                else {
                    ageNode.Comm = -1;
                }
            });
            // 使用 filter() 方法删除 Comm 为 -1 的元素
            age_data = age_data.filter(ageNode => ageNode.Comm !== -1);
            // 按照 id 从小到大排序
            age_data.sort((a, b) => a.node_id - b.node_id);
            data_4.data.age_data = age_data;
            g_SE.send(ws, data_4);
        }
    }

    readField(ws, tData) {
        fs.readFile("./data/netWork/network1.json", (err, res) => {
            if (err) {
                console.log(err);
                return err;
            }
            if (res.toString()) {
                tData.data = JSON.parse(res.toString());
                g_SE.send(ws, tData);//将所有领域的论文数据发送给客户端进行初始化
            }
            else {
                console.log("数据为空");
            }
        });
    }
}

module.exports = {
    onMessage: (ws, data) => {
        g_NetWork.onMessage(ws, data);
    },
    // dataInit: (ws) => {
    //     g_NetWork.dataInit(ws);
    // }
}