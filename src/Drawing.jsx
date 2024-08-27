import React, { useLayoutEffect, useState } from "react";
import rough from "roughjs";
const generator = rough.generator();
const createElement = (id, x1, y1, x2, y2, type) => {
  let roughElement;
  if (type === "line") roughElement = generator.line(x1, y1, x2, y2);
  else if (type === "rectangle")
    roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
  else if (type === "circle") roughElement = generator.circle(x1, y1,x2-x1);
  return { id, x1, y1, x2, y2, roughElement, type };
};
const distance = (a, b) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
const isWithinElement = (x, y, element) => {
  const { type, x1, x2, y1, y2 } = element;
  if (type === "rectangle") {
    const minX = Math.min(x1, x2);
    const minY = Math.min(y1, y2);
    const maxX = Math.max(x1, x2);
    const maxY = Math.max(y1, y2);
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  } else if(type === "line") {
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y };
    const offset = distance(a, b) - (distance(a, c) + distance(b, c));
    return Math.abs(offset) < 1;
  }
  else if(type === "circle"){
    const startx = x1-(x2-x1)/2;
    const endx = x1+(x2-x1)/2;
    const starty = y1 - (y2 - y1) / 2;
    const endy = y1 + (y2 - y1) / 2;   
    return x >= startx && x <= endx && y >= starty && y <= endy ;
  }
};
const getElementAtPosition = (x, y, elements) => {
  return elements.find((e) => isWithinElement(x, y, e));
};
function Drawing() {
  const [action, setAction] = useState("none");
  const [elements, setElements] = useState([]);
  const [tool, setTool] = useState("line");
  const [selectedElement, setSelectedElement] = useState(null);
  const handelMouseDown = (event) => {
    if (tool === "selection") {
      const { clientX, clientY } = event;
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        const offsetX = clientX - element.x1;
        const offsetY = clientY - element.y1;
        setAction("moving");
        setSelectedElement({ ...element, offsetX, offsetY });
      }
    } else {
      setAction("drawing");
      const { clientX, clientY } = event;
      const index = elements.length - 1;

      const element = createElement(
        index,
        clientX,
        clientY,
        clientX,
        clientY,
        tool
      );
      setElements((prevState) => [...prevState, element]);
    }
  };
  const updateElements = (id, x1, y1, x2, y2, tool) => {
    const updatedElement = createElement(id, x1, y1, x2, y2, tool);
    const elementsCopy = [...elements];
    elementsCopy[id] = updatedElement;
    setElements(elementsCopy);
  };
  const handelMouseMove = (event) => {
    const { clientX, clientY } = event;

    if(tool === "selection"){
        event.target.style.cursor = getElementAtPosition(clientX,clientY,elements)?"move":"default"
    }


    if (action === "moving") {
      const { id, x1, x2, y1, y2, type, offsetX, offsetY } = selectedElement;
      const width = x2 - x1;
      const height = y2 - y1;
      const nexX = clientX - offsetX;
      const nexY = clientY - offsetY;
      updateElements(id, nexX, nexY, nexX + width, nexY + height, type);
    }
    if (action === "drawing" && elements) {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      updateElements(index, x1, y1, clientX, clientY, tool);
    }
  };

  const handelMouseUp = (event) => {
    setAction(false);
    setSelectedElement(null);
  };
  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    const roughCanvas = rough.canvas(canvas);
    elements.forEach(({ roughElement }) => roughCanvas.draw(roughElement));
  }, [elements]);
  return (
    <div>
      <div style={{ position: "fixed" }}>
        <input
          type="radio"
          id="line"
          checked={tool === "selection"}
          onChange={() => setTool("selection")}
        />
        <label for="Selection">Selection</label>

        <input
          type="radio"
          id="line"
          checked={tool === "line"}
          onChange={() => setTool("line")}
        />
        <label for="line">Line</label>
        <input
          type="radio"
          id="rectangle"
          checked={tool === "rectangle"}
          onChange={() => setTool("rectangle")}
        />
        <label for="rectangle">Rectangle</label>
        <input
          type="radio"
          id="circle"
          checked={tool === "circle"}
          onChange={() => setTool("circle")}
        />
        <label for="circle">Circle</label>
      </div>
      <canvas
        id="canvas"
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handelMouseDown}
        onMouseMove={handelMouseMove}
        onMouseUp={handelMouseUp}
      >
        Canvas
      </canvas>
    </div>
  );
}

export default Drawing;
