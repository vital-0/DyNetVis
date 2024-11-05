import * as d3 from 'd3'
// 更改数据集需要换
const dataSet = "workplace_contacts"
const num_timeSlice = 8

// 按照指定顺序遍历对象的属性
const order = ["grow", "contract", "preserve", "merge", "split"];

// 社区演变数据
const evolution = require('../../../server/data/comm_evolution/' + dataSet + '.json');
// 各个时间片的社区数据
const communities = require('../../../server/data/partition/' + dataSet + '.json');

// 圆的最大半径和最小半径
let r_max = 16, r_min = 4;
// 最小社区的大小
let minSize = 10000;
// 计算社区的最大长度
let maxSize = 0;
// 将具有联系的circle对应社区编号放在一个列表中
let CNo_group = []
let CNo_group_p = []//包含具有联系的C_No组
// 社区编号索引列表
let list_CNo = [];
let CNo_gridIndex = {}
// 遍历对象的每个属性值（数组）
let C_No = 0;
for (let key in communities) {
    let j = Number(key) - 1
    if (communities.hasOwnProperty(key)) {
        let arr = communities[key];
        let list_p = [];
        for (let i = 0; i < arr.length; i++) {
            let C = arr[i];
            C_No++;
            list_p.push(C_No - 1);
            CNo_gridIndex[C_No - 1] = [j, i]
            if (i == arr.length - 1) {
                list_CNo.push(list_p)
            }
            // 计算当前数组的长度
            let currentSize = C.length;
            // 更新最大长度
            if (currentSize > maxSize) {
                maxSize = currentSize;
            }
            if (currentSize < minSize) {
                minSize = currentSize;
            }
        }

    }
}


// 每个时间片的社区列表
let CList = []
for (let i = 0; i < num_timeSlice; i++) {
    let comm = communities[i + 1 + '']
    CList.push(comm)
}

// 创建提示框
const createTooltip = () => {
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "white")
        .style("border", "2px solid #537895")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("pointer-events", "none") // 确保提示框不阻挡鼠标事件
        .style("opacity", 0); // 初始隐藏
    return tooltip;
}

function mergeArrays(arrays) {
    let merged = [];
    let visited = new Set();

    // Create adjacency list
    let adjList = new Map();
    arrays.forEach((arr, index) => {
        arr.forEach(num => {
            if (!adjList.has(num)) {
                adjList.set(num, new Set());
            }
            adjList.get(num).add(index);
        });
    });

    function dfs(index, result) {
        visited.add(index);
        arrays[index].forEach(num => {
            result.add(num);
            adjList.get(num).forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    dfs(neighbor, result);
                }
            });
        });
    }

    arrays.forEach((arr, index) => {
        if (!visited.has(index)) {
            let result = new Set();
            dfs(index, result);
            merged.push(Array.from(result).sort((a, b) => a - b));
        }
    });

    return merged;
}

export const drawC = (container, graph) => {
    const containerNode = d3.select(container).node();
    const Width = containerNode.getBoundingClientRect().width;
    const Height = containerNode.getBoundingClientRect().height;
    const margin = { top: 10, right: 0, bottom: 0, left: 10 },
        width = Width - margin.left - margin.right,
        height = Height - margin.top - margin.bottom;

    let svg = d3.select(container).select("svg");
    if (svg.empty()) {
        svg = d3.select(container).append("svg");
        svg.attr("width", width)
            .attr("height", height)
            .attr('fill', 'none');
    }
    else
        d3.select('svg').selectAll('*').remove();

    // 添加一个g元素用于缩放
    const g = svg.append("g");

    // 定义缩放行为
    const zoom = d3.zoom()
        .scaleExtent([0.5, 10]) // 限制缩放范围
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    svg.call(zoom); // 应用缩放行为到SVG

    // 创建提示框
    const tooltip = createTooltip();

    //更换成读取数据集需要更改
    let maxLength = 0;
    // 遍历CList中的所有子数组，找到最长的长度
    CList.forEach(subArray => {
        if (subArray.length > maxLength) {
            maxLength = subArray.length;
        }
    });
    const numRows = maxLength;
    const numCols = num_timeSlice;
    const cellWidth = (width - 50) / numCols;
    const cellHeight = (height - 50) / numRows;
    const aixs_x = 30;//竖虚线向右的偏移距离
    const aixs_y = 30;//横线向下的偏移距离
    const text_gap = 30;//留给刻度文字的间距
    const startChar = 'A'

    // 添加纵轴说明
    g.append("text")
        .attr("class", "axis-label")
        .attr("x", Width / 2)
        .attr("y", margin.top / 2 + (aixs_x / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "black")
        .text("Timeslices");

    // 添加横轴说明
    g.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -Height / 2)
        .attr("y", margin.left / 2 + (aixs_y / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "black")
        .text("Communities");

    // 创建矩阵布局
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            const x = j * cellWidth + margin.left + text_gap;
            const y = i * cellHeight + margin.top + text_gap;

            if (i == 0) {
                // 添加横向刻度文字
                g.append("text")
                    .attr("class", "aixs_text")
                    .attr("x", x + aixs_x - 3)
                    .attr("y", margin.top + text_gap)
                    .attr("text-anchor", "start")
                    .text(j + 1)
                    .style("font-size", "12px")
                    .style("fill", "gray");
            }

            if (j == 0) {
                // 添加纵向刻度文字
                g.append("text")
                    .attr("class", "aixs_text")
                    .attr("x", margin.left + text_gap)
                    .attr("y", y + aixs_y + 3)
                    .attr("text-anchor", "start")
                    .text(String.fromCharCode(startChar.charCodeAt(0) + i))
                    .style("font-size", "12px")
                    .style("fill", "gray");
            }
            // 绘制横线
            g.append("line")
                .attr("x1", x)
                .attr("y1", y + aixs_y)
                .attr("x2", x + cellWidth)
                .attr("y2", y + aixs_y)
                .attr("stroke", "gray")
                .attr("stroke-width", "1.5")
                .attr("stroke-dasharray", "4, 6")
                .attr("opacity", "0.3");
            // 绘制竖线
            g.append("line")
                .attr("x1", x + aixs_x)
                .attr("y1", y)
                .attr("x2", x + aixs_x)
                .attr("y2", y + cellHeight)
                .attr("stroke", "gray")
                .attr("stroke-width", "1.5")
                .attr("stroke-dasharray", "4, 6")
                .attr("opacity", "0.3");/* 虚线样式：5像素实线，5像素间隔 */
        }
    }

    // 处理每个时间片的社区演变
    for (let i = 0; i < num_timeSlice - 1; i++) {
        let key_p = (i + 1) + '-' + (i + 2);
        let obj_evolution = evolution[i][key_p]
        // 时间片i的全部社区
        let communities_i = communities[i + 1]
        let communities_after = communities[i + 2]
        if (obj_evolution) {
            order.forEach(key => {
                if (key in obj_evolution) {
                    let change_list = obj_evolution[key]
                    if (change_list.length > 0) {
                        for (let idx = 0; idx < change_list.length; idx++) {
                            let change = change_list[idx]
                            if (key == "grow" || key == "contract" || key == "preserve") {
                                let C_pre_idx = change[0]
                                let C_later_idx = change[1]
                                let C_pre = communities_i[C_pre_idx]
                                let C_later = communities_after[C_later_idx]
                                let size_pre = C_pre.length
                                let size_after = C_later.length
                                const C_No_pre = list_CNo[i][C_pre_idx]//前序社区编号
                                const C_No_later = list_CNo[i + 1][C_later_idx]//后序社区编号
                                CNo_group_p.push([C_No_pre, C_No_later])
                                // 计算两个圆的直径
                                let diameter_pre = r_max * (size_pre / maxSize) * 2
                                let diameter_after = r_max * (size_after / maxSize) * 2

                                // 计算两个圆的圆心坐标
                                const x1 = i * cellWidth + margin.left + text_gap + aixs_x;
                                const y1 = C_pre_idx * cellHeight + margin.top + text_gap + aixs_y;
                                const x2 = (i + 1) * cellWidth + margin.left + text_gap + aixs_x;
                                const y2 = C_later_idx * cellHeight + margin.top + text_gap + aixs_y;

                                // 计算梯形的上底和下底长度，不超过圆的直径
                                let topWidth_p
                                let bottomWidth_p
                                if (key == "grow") {
                                    topWidth_p = 2
                                    bottomWidth_p = diameter_after * (size_pre / size_after)
                                }
                                else if (key == "contract") {
                                    bottomWidth_p = 2
                                    topWidth_p = diameter_pre * (size_after / size_pre)
                                }
                                else if (key == "preserve") {
                                    topWidth_p = diameter_pre * 0.5
                                    bottomWidth_p = diameter_pre * 0.5
                                }
                                const topWidth = Math.min(diameter_pre, topWidth_p); // 上底
                                const bottomWidth = Math.min(diameter_after, bottomWidth_p); // 下底

                                // 绘制梯形路径
                                let pathData = `
                                M ${x1} ${y1 + topWidth / 2} 
                                L ${x1} ${y1 - topWidth / 2}
                                L ${x2} ${y2 - bottomWidth / 2}
                                L ${x2} ${y2 + bottomWidth / 2}
                                Z`;

                                // 添加梯形到 SVG
                                g.append("path")
                                    .attr("d", pathData)
                                    .attr("fill", "gray")
                                    .attr("class", "trapezoid")
                                    .on("mouseover", function (event) {
                                        d3.select(this)
                                            .attr("opacity", 0.5);  // 悬停时降低不透明度
                                        const mouseX = event.clientX;
                                        const mouseY = event.clientY;
                                        tooltip.style("left", `${mouseX + 20}px`)
                                            .style("top", `${mouseY + 20}px`)
                                            .style("opacity", 1)
                                            .html(`${key} event: comm.${C_No_pre}(${size_pre} nodes) -> comm.${C_No_later}(${size_after} nodes)`);//文本框文字
                                    })
                                    .on("mouseout", function () {
                                        d3.select(this)
                                            .attr("opacity", 1);  // 离开时恢复原来的不透明度
                                        tooltip.style("opacity", 0); // 鼠标移开时隐藏提示框
                                    });

                            }
                            else if (key == "merge") {
                                let mergeList = change[0]
                                let C_later_idx = change[1]
                                for (let index = 0; index < mergeList.length; index++) {
                                    let C_pre_idx = mergeList[index]
                                    let C_pre = communities_i[C_pre_idx]
                                    let C_later = communities_after[C_later_idx]
                                    const C_No_pre = list_CNo[i][C_pre_idx];
                                    const C_No_later = list_CNo[i + 1][C_later_idx];
                                    CNo_group_p.push([C_No_pre, C_No_later])
                                    let size_pre = C_pre.length
                                    let size_after = C_later.length
                                    // 计算两个圆的直径
                                    let diameter_pre = r_max * (size_pre / maxSize) * 2
                                    let diameter_after = r_max * (size_after / maxSize) * 2

                                    // 计算两个圆的圆心坐标
                                    const x1 = i * cellWidth + margin.left + text_gap + aixs_x;
                                    const y1 = C_pre_idx * cellHeight + margin.top + text_gap + aixs_y;
                                    const x2 = (i + 1) * cellWidth + margin.left + text_gap + aixs_x;
                                    const y2 = C_later_idx * cellHeight + margin.top + text_gap + aixs_y;

                                    // 计算梯形的上底和下底长度，不超过圆的直径
                                    let topWidth_p = 2
                                    let bottomWidth_p = diameter_after * (size_pre / size_after)

                                    const topWidth = Math.min(diameter_pre, topWidth_p); // 上底
                                    const bottomWidth = Math.min(diameter_after, bottomWidth_p); // 下底

                                    // 绘制梯形路径
                                    let pathData = `
                                    M ${x1} ${y1 + topWidth / 2} 
                                    L ${x1} ${y1 - topWidth / 2}
                                    L ${x2} ${y2 - bottomWidth / 2}
                                    L ${x2} ${y2 + bottomWidth / 2}
                                    Z`;

                                    // 添加梯形到 SVG
                                    g.append("path")
                                        .attr("d", pathData)
                                        .attr("fill", "gray")
                                        .attr("class", "trapezoid")
                                        .on("mouseover", function (event) {
                                            d3.select(this)
                                                .attr("opacity", 0.5);  // 悬停时降低不透明度
                                            const mouseX = event.clientX;
                                            const mouseY = event.clientY;
                                            tooltip.style("left", `${mouseX + 20}px`)
                                                .style("top", `${mouseY + 20}px`)
                                                .style("opacity", 1)
                                                .html(`${key} event: comm.${C_No_pre}(${size_pre} nodes) -> comm.${C_No_later}(${size_after} nodes)`);//文本框文字
                                        })
                                        .on("mouseout", function () {
                                            d3.select(this)
                                                .attr("opacity", 1);  // 离开时恢复原来的不透明度
                                            tooltip.style("opacity", 0)
                                        });
                                }
                            }
                            else if (key == "split") {
                                let C_pre_idx = change[0]
                                let splitList = change[1]
                                for (let index = 0; index < splitList.length; index++) {
                                    let C_later_idx = splitList[index]
                                    let C_pre = communities_i[C_pre_idx]
                                    let C_later = communities_after[C_later_idx]
                                    const C_No_pre = list_CNo[i][C_pre_idx];
                                    const C_No_later = list_CNo[i + 1][C_later_idx];
                                    CNo_group_p.push([C_No_pre, C_No_later])
                                    let size_pre = C_pre.length
                                    let size_after = C_later.length
                                    // 计算两个圆的直径
                                    let diameter_pre = r_max * (size_pre / maxSize) * 2
                                    let diameter_after = r_max * (size_after / maxSize) * 2

                                    // 计算两个圆的圆心坐标
                                    const x1 = i * cellWidth + margin.left + text_gap + aixs_x;
                                    const y1 = C_pre_idx * cellHeight + margin.top + text_gap + aixs_y;
                                    const x2 = (i + 1) * cellWidth + margin.left + text_gap + aixs_x;
                                    const y2 = C_later_idx * cellHeight + margin.top + text_gap + aixs_y;

                                    // 计算梯形的上底和下底长度，不超过圆的直径
                                    let topWidth_p = diameter_pre * (size_after / size_pre)
                                    let bottomWidth_p = 2

                                    const topWidth = Math.min(diameter_pre, topWidth_p); // 上底
                                    const bottomWidth = Math.min(diameter_after, bottomWidth_p); // 下底

                                    // 绘制梯形路径
                                    let pathData = `
                                    M ${x1} ${y1 + topWidth / 2} 
                                    L ${x1} ${y1 - topWidth / 2}
                                    L ${x2} ${y2 - bottomWidth / 2}
                                    L ${x2} ${y2 + bottomWidth / 2}
                                    Z`;

                                    // 添加梯形到 SVG
                                    g.append("path")
                                        .attr("d", pathData)
                                        .attr("fill", "gray")
                                        .attr("class", "trapezoid")
                                        .on("mouseover", function (event) {
                                            d3.select(this)
                                                .attr("opacity", 0.5);  // 悬停时降低不透明度
                                            const mouseX = event.clientX;
                                            const mouseY = event.clientY;
                                            tooltip.style("left", `${mouseX + 20}px`)
                                                .style("top", `${mouseY + 20}px`)
                                                .style("opacity", 1)
                                                .html(`${key} event: comm.${C_No_pre}(${size_pre} nodes) -> comm.${C_No_later}(${size_after} nodes)`);//文本框文字
                                        })
                                        .on("mouseout", function () {
                                            d3.select(this)
                                                .attr("opacity", 1);  // 离开时恢复原来的不透明度
                                            tooltip.style("opacity", 0)
                                        });
                                }
                            }
                        }
                    }
                }
            });
        }
        else {
            console.log('社区演变数据不存在!')
        }
    }

    CNo_group = mergeArrays(CNo_group_p)

    // 创建颜色比例尺
    const colorScale = d3.scaleLinear()
        .domain([r_min, r_max])
        .range(['#FFFFFF', '#537895']); // 从白色到深蓝色

    // 创建矩阵布局
    for (let j = 0; j < numCols; j++) {
        // 获取每个时间片的社区数
        let numRows = CList[j].length
        for (let i = 0; i < numRows; i++) {
            // 纵轴对应的字母
            let char_Row = String.fromCharCode(startChar.charCodeAt(0) + i)
            const x = j * cellWidth + margin.left + text_gap;
            const y = i * cellHeight + margin.top + text_gap;
            // 第j个时间片的第i个社区
            let community_p = communities[j + 1][i]
            let size_p = community_p.length
            let radius = r_max * (size_p / maxSize)
            // 绘制交叉处的圆圈
            let circle = g.append("circle")
                .attr("cx", x + aixs_x)
                .attr("cy", y + aixs_y)
                .attr("r", radius) // 圆圈半径
                .attr("fill", d => colorScale(radius))
                .attr("color", d => colorScale(radius))//初始颜色
                .attr("stroke", "black") // 添加黑色描边
                .attr("class", "circle") // 添加class以应用CSS样式
                .attr("grid-index", `${j}-${i}`) // 添加grid-index属性
                .on("mouseover", function (event) {
                    const mouseX = event.clientX;
                    const mouseY = event.clientY;
                    tooltip.style("left", `${mouseX + 20}px`)
                        .style("top", `${mouseY + 20}px`)
                        .style("opacity", 1)
                        .html(`comm.${list_CNo[j][i]}<br>
                            Timeslice ${j + 1}<br>
                            Grid Pos: (${j + 1}, ${char_Row})<br>
                            ${size_p} nodes`);//文本框文字
                })
                .on("mouseout", function () {
                    tooltip.style("opacity", 0); // 鼠标移开时隐藏提示框
                })
                .on("click", function (event) {
                    let gridIndex = this.getAttribute("grid-index");
                    let timeSlice = gridIndex.split('-')[0];
                    let index_comm = gridIndex.split('-')[1];
                    //更新绘图信息
                    let tData = {
                        key: "netWork",
                        data: {
                            subKey: "update",
                            timeSlice: timeSlice,
                            comm_No: index_comm
                        }
                    }
                    g_Net.send(tData);

                    //更新社区详情信息
                    let Data = {
                        key: "netWork",
                        data: {
                            subKey: "update detail",
                            timeSlice: timeSlice,
                            comm_No: index_comm
                        }
                    }
                    g_Net.send(Data);

                    let Data_t = {//将社区索引信息保存至服务器
                        key: "netWork",
                        data: {
                            subKey: "remain list_index",
                            dataSet: dataSet,
                            timeSlice: timeSlice,
                            index_CNo: list_CNo
                        }
                    }
                    g_Net.send(Data_t);

                    d3.select(this)
                        .transition()
                        .duration(250)
                        .attr("r", radius * 1.5) // 动画放大到半径10
                        .transition()
                        .duration(250)
                        .attr("r", radius) // 动画恢复原来半径
                    //将具有联系的circle均变为红色
                    const CNo = list_CNo[j][i]

                    // 将元素放入 Set 中
                    const set = new Set(CNo_group.flat());
                    // 判断CNo社区是否不具任何变化
                    const exists = set.has(CNo);
                    if (!exists) {
                        const circle = d3.select(this);
                        let isChooseAttr = circle.attr("isChosen");

                        if (isChooseAttr === null) {//不存在该属性则置为true
                            circle.attr("isChosen", "true")
                            circle.attr("fill", "#ee5253") // 改变颜色为红色
                        } else {//存在属性则判断是否被选择
                            if (isChooseAttr === "true") {//之前已被选择则变回原本颜色
                                circle.attr("isChosen", "false")
                                let color = circle.attr("color")
                                circle.attr("fill", color)
                            }
                            else {//之前未被选择则将属性改为被选择
                                circle.attr("isChosen", "true")
                                circle.attr("fill", "#ee5253") // 改变颜色为红色
                            }
                        }
                    }
                    else {
                        const circle = d3.select(this);
                        circle.attr("fill", "#ee5253") // 改变颜色为红色
                    }
                    for (let arr of CNo_group) {
                        if (arr.includes(CNo)) {
                            for (let C_No_p of arr) {
                                let grid_index = CNo_gridIndex[C_No_p]
                                let circle = d3.select(`circle[grid-index="${grid_index[0]}-${grid_index[1]}"]`)
                                if (C_No_p != CNo) {
                                    circle.attr("fill", "#f5576c") // 改变颜色为浅红色
                                        .attr("opacity", 0.6);
                                }
                                else {
                                    circle.attr("fill", "#ee5253") // 改变颜色为红色
                                        .attr("opacity", 1);
                                }
                            }
                        }
                        else {//将无联系的circle均变为原本颜色
                            for (let C_No_p of arr) {
                                let grid_index = CNo_gridIndex[C_No_p]
                                let circle = d3.select(`circle[grid-index="${grid_index[0]}-${grid_index[1]}"]`)
                                let color = circle.attr("color")
                                circle.attr("fill", color)
                                    .attr("opacity", 1);
                            }
                        }
                    }
                });
        }
    }
}

// 绘制社区大小的图例
export const drawT = (container) => {
    const numSteps = 4;
    const step = (r_max - r_min) / numSteps;
    const marginLeft_text = 140;
    const color_list = ['#FFFFFF', '#D8E3EB', '#B0C7D7', '#89ACC3', '#537895']
    const containerNode = d3.select(container).node();
    const Width = containerNode.getBoundingClientRect().width;
    const Height = containerNode.getBoundingClientRect().height;
    const margin = { top: 10, right: 0, bottom: 0, left: 10 },
        width = Width - margin.left - margin.right,
        height = Height - margin.top - margin.bottom;

    let svg = d3.select(container).select("svg");
    if (svg.empty()) {
        svg = d3.select(container).append("svg");
        svg.attr("width", width)
            .attr("height", height)
            .attr('fill', 'none');
    }
    else
        d3.select('svg').selectAll('*').remove();

    const legendData = [
        { radius: r_min, label: "Community Size: ", gap: 0 },
        { radius: r_min + step, gap: 8 },
        { radius: r_min + step * 2, gap: 6 },
        { radius: r_min + step * 3, gap: 3 },
        { radius: r_max, gap: -3 },
    ];

    svg.selectAll('circle')
        .data(legendData)
        .enter()
        .append('circle')
        .attr('cx', (d, i) => marginLeft_text + i * 50 - d.gap)
        .attr('cy', 25)
        .attr('r', d => d.radius)
        .attr('stroke', 'black')
        .attr('fill', (d, i) => color_list[i]);

    svg.append('text')
        .attr('x', 0)
        .attr('y', 25)
        .attr('dy', '0.35em')
        .text(legendData[0].label)
        .attr('font-size', '15px')
        .attr('fill', '#333');

    svg.append('text')
        .attr('x', marginLeft_text - 20) // Position to the left of the first circle
        .attr('y', 25)
        .attr('dy', '0.35em')
        .text('' + minSize)
        .attr('font-size', '15px')
        .attr('fill', '#333');

    svg.append('text')
        .attr('x', marginLeft_text + (legendData.length - 1) * 50 + 30) // Position to the right of the last circle
        .attr('y', 25)
        .attr('dy', '0.35em')
        .text('' + maxSize)
        .attr('font-size', '15px')
        .attr('fill', '#333');
};




