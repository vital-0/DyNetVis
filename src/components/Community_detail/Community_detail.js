import * as d3 from 'd3'

const rect_height = 60;
const colors = ['#ffffff', '#e6f7ff']; // 颜色数组：白色和浅蓝色

export const draw_detail = (container, data) => {
    const containerNode = d3.select(container).node();
    const Width = containerNode.getBoundingClientRect().width;
    const Height = containerNode.getBoundingClientRect().height;
    const margin = { top: 15, right: 5, bottom: 0, left: 5 },
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

    let yOffset = 0; // 记录垂直方向的偏移量

    // 添加每一行的文字和对应的矩形背景
    data.forEach((d, i) => {
        const fillColor = colors[i % colors.length];
        // 浅蓝色的矩形背景
        svg.append("rect")
            .attr("x", margin.left) // 左边距
            .attr("y", yOffset + margin.top) // 加上上边距和当前偏移量
            .attr("width", width - margin.left - margin.right) // 调整矩形框的宽度
            .attr("height", rect_height) // 固定高度
            .attr("fill", fillColor) // 浅蓝色背景
            .attr("opacity", 0.7);

        // 左侧的 Value 文本
        svg.append("text")
            .attr("x", margin.left + 10) // 文字的左边距
            .attr("y", yOffset + margin.top + rect_height / 2) // 文字的垂直位置
            .attr("dy", "0.35em")
            .attr("font-family", "Arial, sans-serif")
            .attr("font-size", "16px")
            .attr("fill", "#333")
            .text(d.metric);

        // 右侧的 Value 文本
        svg.append("text")
            .attr("x", width - margin.right - 10) // 文字的右边距
            .attr("y", yOffset + margin.top + rect_height / 2) // 文字的垂直位置
            .attr("dy", "0.35em")
            .attr("font-family", "Arial, sans-serif")
            .attr("font-size", "16px")
            .attr("fill", "#333")
            .attr("text-anchor", "end") // 右对齐
            .text(d.value);

        yOffset += rect_height; // 更新偏移量，加上矩形高度和间隔
    });

    // 最后一个矩形框的位置
    svg.append("rect")
        .attr("x", margin.left)
        .attr("y", yOffset + margin.top)
        .attr("width", width - margin.left - margin.right)
        .attr("height", rect_height / 2)
        .attr("fill", "#e6f7ff")
        .attr("opacity", 0.7);
}

