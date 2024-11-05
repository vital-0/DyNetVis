import * as cola from 'webcola';

// 获取 SVG 容器
const svgContainer = document.getElementById('svg-container');

// 创建 WebCola 布局
const layout = cola.d3adaptor()
  .linkDistance(80) // 设置链接距离
  .avoidOverlaps(true); // 避免重叠

// 定义图数据
const graph = {
  nodes: [
    { id: 1, name: 'Node 1' },
    { id: 2, name: 'Node 2' },
    { id: 3, name: 'Node 3' }
  ],
  links: [
    { source: 1, target: 2 },
    { source: 2, target: 3 }
  ]
};

// 将图数据转换为 WebCola 接受的格式
const nodeMap = {};
const nodes = graph.nodes.map(node => {
  const colaNode = layout.addJLNode(node.id);
  nodeMap[node.id] = colaNode;
  return colaNode;
});
graph.links.forEach(link => {
  layout.addJLLink(nodeMap[link.source], nodeMap[link.target]);
});

// 运行布局算法
layout.start();

// 更新节点位置
layout.on('tick', () => {
  svgContainer.innerHTML = ''; // 清空 SVG 容器
  nodes.forEach(node => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', 10); // 设置节点半径
    circle.setAttribute('fill', 'blue'); // 设置节点颜色
    svgContainer.appendChild(circle);
  });
});
