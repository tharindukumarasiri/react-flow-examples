## Usage Instructions

The expand and collapse example consists of a predefined tree. If a node has direct children, it can be expanded or collapsed by clicking the node body. Additionally, it is possible to add child nodes to a node by clicking the button below the node. If the layout of the graph changes (for example by adding a new child node), the nodes will animate to their new position.

## Getting Started

This example is built with the help of the [d3-hierarchy](https://github.com/d3/d3-hierarchy) package for the expand/collapse functionality and the tree layout. It depends on the [d3-timer](https://github.com/d3/d3-timer) package for doing the animation of the node positions. To install the dependencies, you can run:

```sh
npm install @xyflow/react d3-hierarchy d3-timer
```

If you want to run the example locally please download the example, unzip it and run the following commands in your terminal:

```
cd expand-collapse-example
npm install
npm start
```

This will start a development server and run the example.

## Core Concept

In this example, we are adding a flag to the [node data object](https://reactflow.dev/api-reference/types/node#data) that controls if a node is expanded or collapsed:

```tsx
// this is how a node object looks like in our example
const ExpandedNode = {
  id: 'someId',
  position: { x: 0, y: 0 },
  data: { expanded: true },
};
```

Expanded means that the direct child nodes of the node are visible, whereas they are hidden when the node is collapsed (`expanded: false`). To achieve this, we are constructing a hierarchical data structure from the nodes and edges. Within the hierarchy, we are adding child nodes to a node if the node is expanded and removing the child nodes when the node is collapsed.

The current hierarchy is then rendered using React Flow. Whenever a node is collapsed or expanded by changing the node data object or if a new node is added, the hierarchy is computed again and re-rendered.

Additionally, the nodes are being animated whenever they change their position in the graph to avoid jumping of the layout.

## App.tsx

The first thing that we need to add to our app is a local state for our nodes and edges:

```tsx
const [nodes, setNodes] = useState<Node[]>(initialNodes);
const [edges, setEdges] = useState<Edge[]>(initialEdges);
```

These two states are always storing the whole graph and are initialized from the `initialElements.ts`. If we are passing these nodes directly to the `<ReactFlow />` component, we will just see all nodes and edges as expected.

Because we want to only display the child nodes of the expanded nodes together with their edges, we are passing our nodes state through a hook called `useExpandCollapse`. This hook returns a subset of our `nodes` and `edges` and computes the layout if needed. After that, we are passing the returned nodes through another hook called `useAnimatedNodes` which will take care of transitioning the nodes from their last to the new positions.

The hooks that transform the nodes and edges are being called like this:

```tsx
const { nodes: visibleNodes, edges: visibleEdges } = useExpandCollapse(
  nodes,
  edges,
  { treeWidth, treeHeight }
);
const { nodes: animatedNodes } = useAnimatedNodes(visibleNodes, {
  animationDuration,
});
```

So, in the end we have `animatedNodes` and `visibleEdges` which can be passed to the `<ReactFlow />` component to render:

```tsx
<ReactFlow nodes={animatedNodes} edges={visibleEdges} {...rest} />
```

For expanding and collapsing a node, we are adding a `onNodeClick` callback that toggles the `expanded` flag within the node data object:

```tsx
data: { ...n.data, expanded: !n.data.expanded }
```

## useExpandCollapse

The job of the `useExpandCollapse` hook is to return only the nodes and edges that are currently visible. That means removing the child nodes from collapsed nodes and their outgoing edges. To do this, we first create a d3-hierarchy object from our nodes and edges for being able to traverse the tree more easily:

```tsx
const hierarchy = stratify<ExpandCollapseNode>()
  .id((d) => d.id)
  .parentId((d: Node) => edges.find((e: Edge) => e.target === d.id)?.source)(
  nodes
);
```

We are using the `stratify` function from the `d3-hierarchy` package to turn a flat data structure (like the nodes and edges in React Flow) into a traversable object. In the next step, we are going through all nodes and removing their children (setting it to `undefined`) from the hierarchy if the node is collapsed (that means `node.data.expanded === false`):

```tsx
hierarchy.descendants().forEach((d) => {
  d.data.data.expandable = !!d.children?.length;
  d.children = d.data.data.expanded ? d.children : undefined;
});
```

As you might notice, we are also adding a `expandable` flag that tells the node if it has child nodes or not. This can be used within your custom node to display a label or disable the node click event for example.

After constructing and adjusting the hierarchy, we want to layout the current nodes. Therefore, we are using the `tree` layout function, again from the `d3-hierarchy` package:

```tsx
const layout = tree<ExpandCollapseNode>()
  .nodeSize([treeWidth, treeHeight])
  .separation(() => 1);

const root = layoutNodes ? layout(hierarchy) : hierarchy;
```

Now we have the graph with expanded and collapsed nodes plus their positions from the layout algorithm. From the hierarchy object, we are returning the nodes by transforming them back to React Flow node objects. Additionally, we are returning the edges by filtering out the edges that don't have a valid connection within the expanded and collapsed graph.

## useAnimatedNodes

To create a smooth animation from one tree layout to the next, we are creating a hook called `useAnimatedNodes`. This hook accepts the next nodes to display (the result of `useExpandCollapse`) and compares their position to the currently rendered nodes. If the position is different, the function interpolates between the last and the current position.

The most important piece of this hook is how the transitions are being defined:

```tsx
const transitions = nodes.map((node) => ({
  id: node.id,
  from: getNode(node.id)?.position ?? node.position,
  to: node.position,
  node,
}));
```

Basically, for every node we are checking with the `getNode` function from React Flow if it already exists in the state. If it exists, we are transitioning from the current position to the new desired position. If it doesn't exist, we are just putting it directly at the desired position.

Once we have the transitions, we can create a timing function and interpolate between `from` and `to`:

```tsx
const t = timer((elapsed) => {
  const s = elapsed / animationDuration;

  const currNodes = transitions.map(({ node, from, to }) => {
    return {
      ...node,
      position: {
        x: from.x + (to.x - from.x) * s,
        y: from.y + (to.y - from.y) * s,
      },
    };
  });

  setTmpNodes(currNodes);

  if (elapsed > animationDuration) {
    // it's important to set the final nodes here to avoid glitches
    setTmpNodes(nodes);
    t.stop();
  }
});
```

**Note:** If you don't want your nodes to be animated, you can just remove the hook call from `App.tsx`.

## CustomNode.tsx

The custom node component in this example is just for demo purposes. It displays the label according to the expanded state of the node (which is stored in the node data object). It's also used to add a button below the node to add child nodes easily for demonstrating the example with a dynamically changed graph.

---

## Notes

Previously, this example was built using a static dataset and adding the collapse and expand mechanism on mount only. You can access the old example code [here](https://pro.reactflow.dev/examples/expand-collapse-deprecated).
