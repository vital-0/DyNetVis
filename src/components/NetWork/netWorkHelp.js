import * as d3 from 'd3'

let colorScale;

export const drawNetWork = (container, graph, isDetailedGraph = false, hyperGraph = {}) => {
  const containerNode = d3.select(container).node();
  const width = containerNode.getBoundingClientRect().width;
  const height = containerNode.getBoundingClientRect().height;
  let svg = d3.select(container).select("svg");
  if (svg.empty()) {
    svg = d3.select(container).append("svg");
    svg.attr("width", width)
      .attr("height", height)
      .attr('fill', 'white');
  }
  else
    svg.selectAll("g").remove();

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

  // 创建提示框
  const tooltip = createTooltip();

  const nodes = graph["nodes"];
  const links = graph["links"];

  // 按照 id 从小到大排序
  nodes.sort((a, b) => a.id - b.id);

  let hyperNodes;
  if (isDetailedGraph) {
    hyperNodes = hyperGraph.nodes;
    // 按照 id 从小到大排序
    hyperNodes.sort((a, b) => a.id - b.id);
  }

  // 设置颜色比例尺
  colorScale = d3.scaleOrdinal()
    .domain(isDetailedGraph ? hyperNodes.map(d => d.id) : nodes.map(d => d.id))
    .range(d3.schemeCategory10);

  // 使用 setTimeout 延迟调用
  setTimeout(() => {
    let tData = {
      key: "netWork",
      data: {
        subKey: "draw scatter"
      }
    };
    // console.log(tData)
    g_Net.send(tData);
  }, 2000); // 延迟 2000 毫秒（2 秒）

  let linkWidthScale, sizeScale, simulation;

  if (!isDetailedGraph) {
    // 如果是超图，设置边的粗细比例尺和节点大小比例尺
    linkWidthScale = d3.scaleLinear()
      .domain(d3.extent(links, d => d.weight))
      .range([0.5, 6]);

    sizeScale = d3.scaleLinear()
      .domain(d3.extent(nodes, d => d.nodeNum))
      .range([5, 25]);

    // 创建力导向布局
    simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(160))
      .force("charge", d3.forceManyBody().strength(-42))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX().strength(0.1))
      .force("y", d3.forceY().strength(0.1));

    // 绑定力导向布局的 tick 事件
    simulation.on("tick", () => {
      requestAnimationFrame(() => {
        link.attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        node.attr("cx", d => d.x)
          .attr("cy", d => d.y);
      });
    });
  } else {
    // 如果是详细完整图，边的粗细和节点大小固定，或根据其他属性设置
    linkWidthScale = () => 1; // 固定的边粗细
    sizeScale = () => 6; // 固定的节点大小

    // 假设 communityCenters 是已经为每个社区定义的中心点位置
    const communityCenters = {};
    nodes.forEach(d => {
      if (!communityCenters[d.Comm]) {
        communityCenters[d.Comm] = {
          x: (Math.random() * 0.8 + 0.1) * width,
          y: (Math.random() * 0.8 + 0.1) * height
        };
      }
    });

    // 创建力导向布局
    function forceCluster(alpha) {
      nodes.forEach(d => {
        const center = communityCenters[d.Comm];
        d.vx -= (d.x - center.x) * alpha;
        d.vy -= (d.y - center.y) * alpha;
      });
    }

    // 创建力模拟器
    simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-30))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(d => sizeScale(d.nodeNum) + 10))
      .force("x", d3.forceX(width / 2).strength(0.05))  // 控制水平分布
      .force("y", d3.forceY(height / 2).strength(0.05)) // 控制垂直分布
      .force("cluster", alpha => forceCluster(0.15 * alpha)) // 聚集同一社区的节点
      .on("tick", ticked);

    // tick 函数用来更新节点位置
    function ticked() {
      // 在这里更新节点和链接的位置
      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
    }
  }

  // 创建节点和连线
  const link = svg.append("g")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("stroke", "gray")
    .attr("stroke-width", d => linkWidthScale(isDetailedGraph ? 1 : d.weight))
    .attr("opacity", 0.5);

  const node = svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("r", d => sizeScale(isDetailedGraph ? 1 : d.nodeNum))
    .attr("fill", d => colorScale(isDetailedGraph ? d.Comm : d.id))
    .attr("stroke", "black")
    .attr("stroke-width", isDetailedGraph ? "1.5" : "3")
    .on("mouseover", function (event, d) {
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      const tooltipContent = isDetailedGraph
        ? `node.id: ${d.id}<br>Comm: ${d.Comm}` // 详细完整图，显示 id 和 Comm 属性
        : `comm.No: ${d.No}<br>nodes num: ${d.nodeNum}`; // 超图，显示 id 和 nodeNum 属性

      tooltip.style("left", `${mouseX + 20}px`)
        .style("top", `${mouseY + 20}px`)
        .style("opacity", 1)
        .html(tooltipContent);//文本框文字
    })
    .on("mouseout", function (event, d) {
      tooltip.style("opacity", 0); // 鼠标移开时隐藏提示框
    })
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));;



  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}

export const drawButton = (container, updateTitle) => {
  const containerNode = d3.select(container).node();
  const width = containerNode.getBoundingClientRect().width;
  const height = containerNode.getBoundingClientRect().height;
  // 添加左箭头按钮
  const leftArrow = d3.select(container)
    .append("button")
    .attr("class", "left-arrow")
    .style("position", "absolute")
    .style("right", "60px")
    .style("top", `${height - 50}px`)
    .style("display", "inline-block")
    .style("width", "37px")  // 设置宽度和高度相同
    .style("height", "37px")
    .style("border", "2px solid gray") // 添加黑色描边
    .style("border-radius", "50%")
    .style("background-color", "#556677")
    .style("color", "white")
    .style("font-size", "20px")
    .style("box-shadow", "0 4px 8px rgba(0, 0, 0, 0.2)")
    .style("cursor", "not-allowed") // 显示不可点击的光标
    .attr("disabled", true) // 禁用按钮
    .text("←")
    .on("mouseover", function () {
      const isDisabled = d3.select(this).attr("disabled") !== null;
      d3.select(this)
        .style("background-color", isDisabled ? "#556677" : "#7697AE")
        .style("box-shadow", isDisabled ? "none" : "0 6px 12px rgba(0, 0, 0, 0.3)");
    })
    .on("mouseout", function () {
      const isDisabled = d3.select(this).attr("disabled") !== null;
      d3.select(this)
        .style("background-color", isDisabled ? "#556677" : "#89ACC3")
        .style("box-shadow", isDisabled ? "none" : "0 4px 8px rgba(0, 0, 0, 0.2)");
    })

  // 添加右箭头按钮
  const rightArrow = d3.select(container)
    .append("button")
    .attr("class", "right-arrow")
    .style("position", "absolute")
    .style("right", "10px")
    .style("top", `${height - 50}px`)
    .style("display", "inline-block")
    .style("width", "37px")  // 设置宽度和高度相同
    .style("height", "37px")
    .style("border", "2px solid gray")
    .style("border-radius", "50%")
    .style("background-color", "#89ACC3")
    .style("color", "white")
    .style("font-size", "21px")
    .style("box-shadow", "0 4px 8px rgba(0, 0, 0, 0.2)")
    .style("cursor", "pointer")
    .text("→")
    .on("mouseover", function () {
      const isDisabled = d3.select(this).attr("disabled") !== null;
      d3.select(this)
        .style("background-color", isDisabled ? "#556677" : "#7697AE")
        .style("box-shadow", isDisabled ? "none" : "0 6px 12px rgba(0, 0, 0, 0.3)");
    })
    .on("mouseout", function () {
      const isDisabled = d3.select(this).attr("disabled") !== null;
      d3.select(this)
        .style("background-color", isDisabled ? "#556677" : "#89ACC3")
        .style("box-shadow", isDisabled ? "none" : "0 4px 8px rgba(0, 0, 0, 0.2)");
    })
    .on("click", function () {
      // 启用左按钮
      leftArrow
        .style("background-color", "#89ACC3")
        .style("cursor", "pointer")
        .attr("disabled", null);

      // 禁用右按钮并更改其颜色
      d3.select(this)
        .style("background-color", "#556677")
        .style("cursor", "not-allowed")
        .attr("disabled", true);

      updateTitle('Node-link Diagram');//更新图的描述标题

      let tData = {//更改服务器绘图信息为详细力导向图
        key: "netWork",
        data: {
          subKey: "change state",
          state: "normal"
        }
      }
      g_Net.send(tData);
    });

  // 添加左按钮的点击事件，反向处理
  leftArrow.on("click", function () {
    // 启用右按钮
    rightArrow
      .style("background-color", "#89ACC3")
      .style("cursor", "pointer")
      .attr("disabled", null);

    // 禁用左按钮并更改其颜色
    d3.select(this)
      .style("background-color", "#556677")
      .style("cursor", "not-allowed")
      .attr("disabled", true);

    // 绘制社区超图
    updateTitle('(super) Node-link Diagram')

    let tData = {//更改服务器绘图信息为超图
      key: "netWork",
      data: {
        subKey: "change state",
        state: "super"
      }
    }
    g_Net.send(tData);
  });
}

//更新绘图信息至服务器
export const remain_graph = (dataSet, timeSlice, comm_No, state = "super") => {
  let tData = {//更改服务器绘图信息为超图
    key: "netWork",
    data: {
      subKey: "remain graph",
      dataSet: dataSet,
      timeSlice: timeSlice,
      comm_No: comm_No,
      state: state
    }
  }
  g_Net.send(tData);
}

// 绘制社区大小的图例
export const drawLegend = (container, data = {}, list_indexC = []) => {
  // 圆的半径
  let r = 7;
  list_indexC = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

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

  const nodes = data["nodes"];
  // 按照 id 从小到大排序
  nodes.sort((a, b) => a.id - b.id);

  // 设置颜色比例尺
  const colorScale = d3.scaleOrdinal()
    .domain(nodes.map(d => d.id))
    .range(d3.schemeCategory10);

  svg.selectAll('circle')
    .data(list_indexC)
    .enter()
    .append('circle')
    .attr('cx', (d, i) => margin.left + 30 + i * 50)
    .attr('cy', 15)
    .attr('r', r)
    .attr('stroke', 'black')
    .attr('fill', (d, i) => colorScale(i));

  // if (list_indexC.length == 0) {
  //   for (let i in nodes) {
  //     list_indexC.push(i);
  //   }
  // }

  // 添加文本到每个圆圈旁边
  svg.selectAll('text')
    .data(list_indexC)
    .enter()
    .append('text')
    .attr('x', (d, i) => margin.left + 30 + i * 50 - r / 2 - 21) // 文本位置在圆圈右边
    .attr('y', 20) // 调整文本垂直位置
    .attr('font-size', '12px')
    .attr('fill', 'black')
    .text((d, i) => 'C' + i);
};






