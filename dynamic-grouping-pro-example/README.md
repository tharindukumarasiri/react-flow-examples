## Usage Instructions

This example shows how to group nodes dynamically. You can drag nodes from the sidebar or the pane and drop them over a group or select multiple nodes and use the "group nodes" button to add them to a group. You can detach a node from a group by selecting it and use the "Detach" button or select the group and use "Ungroup" to detach all child nodes. A group node is resizable and uses its child nodes for its minimal width and height.

## Getting Started

If you are starting from scratch, you need to install `@xyflow/react`.

```sh
npm install @xyflow/react
```

This guide does not explain how to implement the side bar drag and drop bahaviour. For that, please refer to the [auto layout pro example](https://reactflow.dev/examples/auto-layout).

## Subflows and Group Nodes

Since v10 React Flow supports sub flows. A sub flow is a flow that is part of another node. In this example we are using the sub flow feature for grouping nodes. If you want to attach a node to a parent, you have to use the `parentId` option:

```js
const nodeWithParent = {
  id: 'node-id',
  type: 'input',
  data: { label: 'Node with a parent' },
  position: { x: 0, y: 0 },
  // 👇 use this option to attach the node to a parent
  parentId: 'parent-id',
};
```

You can read more about sub flows in the [sub flow guide](https://reactflow.dev/examples/layout/sub-flows).

## Adding a Node to a Group

As explained above you can add a node to a group by dragging it from the sidebar or from the pane. For this we implement an `onDrop` and an `onNodeDragStop` handler. For both handlers we are using the [getIntersectingNodes](https://reactflow.dev/api-reference/types/react-flow-instance#get-intersecting-nodes) helper to find out if there is an intersection with a group node. The tricky part here is to calculate the correct position for the child node (if there is an intersection) because its position is relative to its parent. For this we implemented a helper function called getNodePositionInsideParent that calculates the correct position for the child node based on the group node that it intersects with. There are two conditions that we need to check for the x- and y-coordinate:

1. **Is child node x smaller than group node x?** If yes, we need to set the x of the child node to zero
2. **Is child node x plus its width larger than group node x plus its width?** If yes, we need to set the x-coordinate of the child node to the width of the group node minus the width of the child node.

When none of the above conditions are true, we need to subtract the x- and y-coordinate of the group node from the coordinates of the child node to give it a relative position.

## Custom Nodes With Toolbars and NodeResizer

We create two custom node types for this example: SimpleNode and GroupNode. We need to implement custom nodes, because we want to attach a [NodeToolbar](https://reactflow.dev/api-reference/components/node-toolbar) to add some functionality for detaching and deleting. For the group node we are also adding the [NodeResizer](https://reactflow.dev/api-reference/components/node-resizer) component for resizing the group node.

### Resizing a Group Node

We are using the child nodes for calculating the min width and height of a group. This can be achieved by getting all child nodes and pass them to the [getNodesBounds](https://reactflow.dev/api-reference/utils/get-nodes-bounds) helper function:

```js
const childNodes = Array.from(store.nodeLookup.values()).filter(
  (n) => n.parentId === id
);
const rect = getNodesBounds(childNodes);
```

We can then use `rect.width` and `rect.height` for the `minWidth` and `minHeight` props of the `NodeResizer` component.

### Deleting a Node

This is straight forward, because React Flow exports a helper function [deleteElements](https://reactflow.dev/api-reference/types/react-flow-instance#delete-elements) that handles connected edges and child nodes. The `onDelete` handlers for both node types look the same:

```js
const onDelete = () => deleteElements({ nodes: [{ id }] });
```

### Detaching a Node (or Multiple Ones)

For detaching nodes from a parent, we implemented a helper hook useDetachNodes. This helper can be used to detach a single node or for all nodes and also remove the parent node. Because the node positions are relative to its parent, we need to calculate the correct position for the detached node:

```js
const position: {
  x: n.position.x + parentNode.internals.positionAbsolute.x,
  y: n.position.y + parentNode.internals.positionAbsolute.y,
};
```
