# Collaborative flow

- [Dependencies](#dependencies)
- [Breakdown](#breakdown)
  - [Setting up yjs](#setting-up-yjs)
  - [The `useNodesStateSynced` hook](#the-usenodesstatesynced-hook)
  - [The `useCursorStateSynced` hook](#the-usecursorstatesynced-hook)
  - [Rendering multiple cursors](#rendering-multiple-cursors)
- [Related docs](#related-docs)
- [See also](#see-also)

This example shows how to add collaboration features to React Flow. We're using
[Yjs](https://docs.yjs.dev) to provide shared data types that can be manipulated
concurrently, but any CRDT library could be used instead.

Clients are connected over WebRTC using an example signaling server provided by
Yjs (so please don't use this in production!). You can test this yourself by
opening the page in two tabs and seeing the changes sync between them. Nodes and
edges can be created, moved, and deleted in real time.

## Dependencies

- @xyflow/react
- y-webrtc@10.2.5
- yjs@13.6.8

## Breakdown

### Setting up Yjs

To begin using Yjs we must create a new `Doc` that acts as a "collection of shared
objects that sync automatically". In practical terms, we'll use this doc to store
the nodes and edges in our graph.

```ts
const ydoc = new Doc();

export const provider = new WebrtcProvider('REACTFLOW-COLLAB-EXAMPLE', ydoc);
```

The exported `provider` is an observable that contains properties and configuration
for the WebRTC connection. We don't need to do anything with it in this example,
but it's useful to know about if you want to customize the connection.

### The `useNodesStateSynced` hook

Typically to manage nodes and edges in React Flow, you'd use React's `useState`
hook, the provided `useNodesState` hook`, or a state management library like
[Zustand](https://github.com/pmndrs/zustand). Beacuse we're using Yjs to sync
state across users, we use a `YMap` of nodes as the source of truth instead.

```ts
export const nodesMap = ydoc.getMap<Node>('nodes');
```

As the name implies, the type is a map that maps keys to values. In our case the
key is the node id and the value is the node object. The `YMap` type is a shared
type which means that all users who are connected to the same doc will have the
same state. The `YMap` type is also _observable_: this means that we can subscribe
to changes. Whenever a user adds a new node or drags a node, the change gets sent
to all other users and gets applied to _their_ `nodesMap`. We are using a map,
because it's easier to update via Yja than an array.

The `useNodesStateSynced` hook is then responsible for three things:

1. Storing the local nodes state in an array using `useState`.
2. Returning a custom `onNodesChange` handler that alters the state in the synced
   `YMap`.
3. Subscribing to external changes in the `YMap` and updating the local state.

You'll notice that the `onNodesChange` handler doesn't update the local nodes
state directly. Instead, subscribing to changes in `nodesMap` will also trigger
an update when we modify the map _locally_.`

### The `useCursorStateSynced` hook.

If you open up multiple instances of this example, you'll see that we're showing
a live cursor for every connected client. As with the nodes and edges, a `YMap`
is created to sync the cursor state.

```ts
export type Cursor = {
  id: string;
  color: string;
  x: number;
  y: number;
  timestamp: number;
};
```

The `x` and `y` position of the cursor is relative to the graph container. The
hook provides an `onMouseMove` handler that projects the mouse position from
coordinates relative to window by using the `screenToFlowPosition` utility.

Yjs assigns a unique client id to each consumer of the doc. For this example this
is how we identify each cursor but you may want to use a username or other way
to identify same clients.

A `flush` function is defined to remove any cursors that haven't been updated
in at least 10 seconds. This prevents the map from growing indefinitely as new
clients connect, and also reduces visual clutter from idle clients. In your own
code you may want to take a different approach such as broadcasting when a client
disconnects.

The array of cursors returned by the hook is filtered to exclude the local cursor:

```ts
const cursorsWithoutSelf = useMemo(
  () => cursors.filter(({ id }) => id !== cursorId),
  [cursors]
);
```

### Rendering multiple cursors

To render the cursors onto the graph, we place them inside the `<EdgeLabelRenderer />`.
It is important to style the cursor with a high `z-index` so they remain above
any selected nodes or edges in the graph.

Each cursor is rendered as an `<svg />` element that is then translated to the
cursor's actual `x` and `y` positions. Using CSS transforms is significantly more
performant than setting the `left` and `top` properties directly, as it pushes the
element onto its own layer on the GPU.

Inside the SVG, we scale the cursor by `1 / viewport.zoom`. This ensures the
cursor size remains consistent regardless of the current zoom level.

## Related docs:

You can read more about some of the React Flow feature's we're using in this
example here:

- The [NodeChange](https://reactflow.dev/api-reference/types/node-change) type
- The [EdgeChange](https://reactflow.dev/api-reference/types/edge-change) type
- The [Auto Layout pro example](https://pro.reactflow.dev/examples/auto-layout)
  for guidance on implementing the sidebar

## See also:

- [Yjs docs](https://docs.yjs.dev)
- [y-webrtc provider](https://github.com/yjs/y-webrtc)
  - To use WebRTC in production you will need to set up your own [signalling server](https://github.com/yjs/y-webrtc/blob/master/README.md#signaling)
- [y-websocket provider](https://github.com/yjs/y-websocket)
- [Serverless Yjs](https://medium.com/collaborne-engineering/serverless-yjs-72d0a84326a2)
