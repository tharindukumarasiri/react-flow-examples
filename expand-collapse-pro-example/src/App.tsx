import { useCallback, useState } from 'react';
import {
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  ReactFlowProvider,
  MiniMap,
  Background,
  OnNodesChange,
  OnEdgesChange,
  NodeMouseHandler,
  Edge,
} from '@xyflow/react';

// This is used to display a leva (https://github.com/pmndrs/leva) control panel for the example
import { useControls } from 'leva';

import CustomNode from './CustomNode';
import {
  nodes as initialNodes,
  edges as initialEdges,
} from './initialElements';
import useAnimatedNodes from './useAnimatedNodes';
import useExpandCollapse from './useExpandCollapse';

import '@xyflow/react/dist/style.css';
import styles from './styles.module.css';
import { ExpandCollapseNode } from './types';

const proOptions = { account: 'paid-pro', hideAttribution: true };

const nodeTypes = {
  custom: CustomNode,
};

type ExpandCollapseExampleProps = {
  treeWidth?: number;
  treeHeight?: number;
  animationDuration?: number;
};

function ReactFlowPro({
  treeWidth = 220,
  treeHeight = 100,
  animationDuration = 300,
}: ExpandCollapseExampleProps = {}) {
  const [nodes, setNodes] = useState<ExpandCollapseNode[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const { nodes: visibleNodes, edges: visibleEdges } = useExpandCollapse(
    nodes,
    edges,
    { treeWidth, treeHeight }
  );
  const { nodes: animatedNodes } = useAnimatedNodes(visibleNodes, {
    animationDuration,
  });

  const onNodesChange: OnNodesChange<ExpandCollapseNode> = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === node.id) {
            return {
              ...n,
              data: { ...n.data, expanded: !n.data.expanded },
            };
          }

          return n;
        })
      );
    },
    [setNodes]
  );

  return (
    <ReactFlow
      fitView
      nodes={animatedNodes}
      edges={visibleEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      proOptions={proOptions}
      nodeTypes={nodeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      className={styles.viewport}
      zoomOnDoubleClick={false}
      elementsSelectable={false}
    >
      <Background />
      <MiniMap />
    </ReactFlow>
  );
}

function ReactFlowWrapper() {
  // 👇 This hook is used to display a leva (https://github.com/pmndrs/leva) control panel for this example.
  // You can safely remove it, if you don't want to use it.
  const levaProps = useControls({
    treeWidth: {
      value: 220,
      min: 0,
      max: 440,
    },
    treeHeight: {
      value: 100,
      min: 0,
      max: 200,
    },
    animationDuration: {
      value: 300,
      min: 0,
      max: 600,
    },
  });

  return (
    <ReactFlowProvider>
      <ReactFlowPro {...levaProps} />
    </ReactFlowProvider>
  );
}

export default ReactFlowWrapper;
