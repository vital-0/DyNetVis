import { drawNetWork, remain_graph, drawLegend } from '../components/NetWork/netWorkHelp';
import { draw_detail } from '../components/Community_detail/Community_detail';
import { drawScatter } from '../components/StaticNetwork/StaticNetwork';

// 更改数据集需要换
const dataSet = "workplace_contacts"

window.g_Net = new class CNet {
    constructor() {
        this.app = null;
        this.url = "ws://localhost:6996/vis";
        this.vue = null;
        this.doConnect();
    }
    setVueValue(vue) {
        this.vue = vue;
    }
    doConnect() {
        this.app = new WebSocket(this.url);// 执行此行代码立即开始连接服务器（下一帧）
        this.app.onopen = () => {
            // 连接成功后发送图数据进行存储
            remain_graph(dataSet, 0, "null", "super");
        };
        this.app.onmessage = (event) => {
            this.onMessage(JSON.parse(event.data));
        }
        // 当长连接关闭时，仅调用一次
        this.app.onclose = () => { }
    }

    dataInit() {
        let tData = {
            key: "netWork",
            data: {}
        }
        this.send(tData);
    }

    disConnect() {
        if (this.app) {
            this.app.close();   // 客户端主动关闭长连接(刷新、掉线)
        }
        this.app = null;
    }

    onMessage(tData) {
        let key = tData.key;
        let data = tData.data;
        let subKey = data.subKey;
        if (key == "netWork") {
            if (subKey == "update" || subKey == "change state") {
                let TimeSlice = data.timeSlice;//所绘制的网络所属时间片
                let Comm_No = data.comm_No;//需要高亮的社区
                let state = data.state;
                let dataSet = data.dataSet;
                let hyperGraph = data.hyperGraph;
                this.updateGraph(dataSet, TimeSlice, state, hyperGraph, Comm_No);
            }
            else if (subKey == "update detail") {
                this.updateDetail(data.detail);
            }
            else if (subKey == "update legend") {
                // this.updateLegend(data);
            }
            else if (subKey == "draw scatter") {//更新散点图
                drawScatter('.Heatmap-container', data);
            }
        }
    }

    send(data) {
        if (this.app) {
            this.app.send(JSON.stringify(data));
        }
    }

    updateGraph(dataSet, TimeSlice, state, hyperGraph, Comm_No) {
        let isDetailedGraph = false;
        let graph_name = "hypergraph";
        if (state == "normal") {
            isDetailedGraph = true;
            graph_name = "graph";
        }
        let graph = require('../../server/data/realworlddata/' + dataSet + '/' + graph_name + '_' + TimeSlice + '.json');
        drawNetWork('.NetWork-container', graph, isDetailedGraph, hyperGraph);
    }

    updateDetail(data) {
        draw_detail('.Detail-container', data);
    }

    updateLegend(data) {
        // let graph = data.graph;
        // let list_indexC = data.index_CNo[data.timeSlice]
        drawLegend('.NetWork-legend', graph, list_indexC);
    }
}