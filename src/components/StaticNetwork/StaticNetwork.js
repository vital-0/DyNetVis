import * as d3 from 'd3'

//时间片个数，更改数据集后需要更改
const num_timeSlice = 8

const Axis_gap = 18

export const drawScatter = (container, data = {}) => {
  const containerNode = d3.select(container).node();
  const Width = containerNode.getBoundingClientRect().width;
  const Height = containerNode.getBoundingClientRect().height;
  const margin = { top: 7, right: 0, bottom: 0, left: 30 },
    width = Width - margin.left - margin.right,
    height = Height - margin.top - margin.bottom;

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

  // 加载 JSON 数据
  const data_age = data.age_data;

  // 设置颜色比例尺
  const colorScale = d3.scaleOrdinal()
    .domain(data_age.map(d => d.Comm))
    .range(d3.schemeCategory10);

  // 设置比例尺
  const xScale = d3.scaleLinear()
    .domain([d3.min(data_age, d => d.age) - 1, d3.max(data_age, d => d.age) + 1]) // 根据年龄范围设置比例尺
    .range([Axis_gap, width - 10]);

  const yScale = d3.scaleLinear()
    .domain([0, (num_timeSlice + 1) / 2]) // 根据时间平均范围设置比例尺
    .range([height - Axis_gap, 10]); // 注意 y 轴是从下到上的


  // const x_max = d3.max(data_age, d => d.age) + 1;
  // const y_max = d3.max(data_age, d => d.time_average) + 1;

  // 创建轴
  const xAxis = d3.axisBottom(xScale)
    .tickSize(-3) // 设置刻度线的长度


  const yAxis = d3.axisLeft(yScale)
    .tickSize(-2) // 设置刻度线的长度

  // 添加轴到 SVG
  svg.append("g")
    .attr("transform", `translate(0, ${height - Axis_gap})`)
    .call(xAxis)
    .append("text") // 添加 x 轴标签
    .attr("x", width / 2)
    .attr("y", margin.bottom + 15)
    .style("font-size", "12px")
    .attr("text-anchor", "middle")
    .text("Age")
    .style("fill", "black");

  svg.append("g")
    .attr("transform", `translate(${Axis_gap}, 0)`)
    .call(yAxis)
    .append("text") // 添加 y 轴标签
    .attr("transform", "rotate(-90)")
    .attr("x", -Height / 2)
    .attr("y", margin.left / 2)
    .style("font-size", "12px")
    .attr("text-anchor", "middle")
    .text("Time_Average")
    .style("fill", "black");


  // 创建抖动函数
  const jitter = d3.randomNormal(1, 12); // 抖动的幅度和标准差


  console.log(data_age)
  // 绘制散点图
  svg.selectAll("circle")
    .data(data_age)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.age) + jitter()) // 使用节点的年龄作为 x 坐标
    .attr("cy", d => yScale(d.time_average) + jitter()) // 使用工作场所的联系数量作为 y 坐标
    .attr("r", 4) // 点的半径
    .style("fill", d => colorScale(d.Comm)) // 点的颜色
    .on("mouseover", function (event, d) {
      // 显示提示框
      tooltip.style("opacity", 1)
        .html(`node_id: ${d.node_id}<br>Age: ${d.age}<br>time_averages: ${d.time_average}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function () {
      // 隐藏提示框
      tooltip.style("opacity", 0);
    });

}


