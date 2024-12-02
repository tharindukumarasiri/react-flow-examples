## Usage Instructions

The example app starts with an empty canvas. You can add nodes by clicking anywhere on the canvas (which will create a node at your mouse position). To connect the nodes, you can use the handles on the nodes. Once you have added or connected nodes in the graph, you can use the undo button to undo any performed action. If you have used the undo button, you can redo the same thing by using the redo button.

## Core Concepts

There are many different approaches for implementing an undo and redo functionality for your application. They can range from very simple (for example storing the entire application state every time a piece of the state changes) to very advanced (for example just storing migrations that transform the application state to the previous or next state). If you want to learn more about different strategies for undo and redo operations, you can check out [this article](http://gamepipeline.com/8-different-strategies-for-implementing-undoable-actions/).

Because of React Flow being low-level and flexible we thought about how a flexible undo and redo implementation can look like. It turns out that storing the entire state every time something changes is not an option (because that would mean to store a new state slice as soon as a node gets moved by one pixel). Storing undoable actions can get very complicated fast as you need to implement the undo and redo operation for every possible action that you want to enable. So, we picked something in between: Implementing a helper function that stores the current nodes and edges whenever you call it. This means, you can decide on your own in which cases you want to create a new snapshot of the graph that the user can visit again.

The implementation is based on the approach described in [this tutorial](https://redux.js.org/usage/implementing-undo-history).

## Getting Started

This example has no third party dependencies, so the only dependency that you need to install is `reactflow` itself (in case you don't have it already):

```sh
npm install @xyflow/react
```

In App.tsx, we start by setting up the UI for our example. That includes an external state for the nodes and edges of our graph and a function that adds nodes whenever the user clicks on the React Flow pane. All of this boilerplate will probably replaced by your own event handlers and UI components.

## Implementing the `useUndoRedo` hook

The core piece of this example is the useUndoRedo hook. It returns three helper functions that you can use in your app: `undo`, `redo` and `takeSnapshot`. Within the hook, we are storing the current `past` and `future` states as array. By default, these are empty arrays and you can fill the past array by using the `takeSnapshot` method which reads the current nodes and edges from the React Flow state and pushes it to the `past` array.

The `undo` method works like this: It reads the last available state from the `past` array and sets the nodes and edges of React Flow to the nodes and edges of the past state. Before doing that, it pushes the current nodes and edges to the `future` state so that we can revert to the current state by using the `redo` method.

The `redo` method does exactly the opposite: It checks if there is a future state that we can revert to and sets the nodes and edges accordingly while storing the current state in the `past` array.

## Using the `useUndoRedo` hook and helpers

In our App, we can now make use of the helper methods to store specific states of our React Flow graph to make them undoable. Basically, you can use the `takeSnapshot` method whenever you like and for any action you want to being able to undo. In our example app, we are calling the function in several event handlers before manipulating the state further. It is important to call the function **before** other event handlers.

## Jumping back and forth between states

The example consists of two buttons that lets you jump back and forth between states whenever it is possible. The buttons are disabled when there are no past or future states available. For disabling and enabling the buttons, we are returning the boolean properties `canUndo` and `canRedo` from the `useUndoRedo` hook.

The buttons are calling our previously defined `undo` and `redo` methods on click.

## Adding keyboard shortcuts

It is very common to have Ctrl+z and Ctrl+Shift+z keyboard shortcuts for doing undo and redo operations in any application. Inside of the `useUndoRedo` hook, we are attaching keyboard listeners to the `document` to achieve this functionality:

```tsx
const keyDownHandler = (event: KeyboardEvent) => {
  if (event.key === 'z' && (event.ctrlKey || event.metaKey) && event.shiftKey) {
    redo();
  } else if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
    undo();
  }
};

document.addEventListener('keydown', keyDownHandler);
```

## Summary

This example was designed so that it can be easily adapted to your use case. You can customize the actions that you want to make undoable, add more functionality and integrate it with your UI. If you need help or have any questions regarding this example, please reach out!
