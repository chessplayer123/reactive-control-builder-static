function newText(text, left, top, fontSize, maxWidth, subscriptStart, subscriptEnd=null) {
    const textObject = new fabric.Text(text, {
        left: left.x, originX: left.origin,
        top:  top.y, originY: top.origin,
        fontSize: fontSize, subscript: {"size": 0.6},
    });
    textObject.setSubscript(subscriptStart, subscriptEnd || text.length);
    textObject.scaleX = Math.min(1.0, maxWidth / textObject.width);
    return textObject;
}

function newHorizontalArrow(y, from, to, caption, thickness=cfg.arrow.thickness) {
    const dx = to - from;

    const arrow = new fabric.Polygon([
        {x: from, y: y - thickness * 0.5},
        {x: from + dx * cfg.arrow.bodyRatio, y: y - thickness * 0.5},
        {x: from + dx * cfg.arrow.bodyRatio, y: y - thickness},
        {x: to, y: y},
        {x: from + dx * cfg.arrow.bodyRatio, y: y + thickness},
        {x: from + dx * cfg.arrow.bodyRatio, y: y + thickness * 0.5},
        {x: from, y: y + thickness * 0.5},
    ], {
        fill: "white",
        stroke: "black",
        strokeWidth: 1
    });

    const text = newText(
        caption,
        {x: (from+to)*0.5, origin: "center"},
        {y: y - thickness, origin: "bottom"},
        cfg.top.height*0.3,
        cfg.top.outerArrowsWidth,
        1
    );

    return new fabric.Group([arrow, text]);
}

function newVerticalArrow(x, from, to, caption, thickness=cfg.arrow.thickness) {
    const dy = to - from;

    const arrow = new fabric.Polygon([
        {x: x - thickness * 0.5, y: from},
        {x: x - thickness * 0.5, y: from + dy * cfg.arrow.bodyRatio},
        {x: x - thickness, y: from + dy * cfg.arrow.bodyRatio},
        {x: x, y: to},
        {x: x + thickness, y: from + dy * cfg.arrow.bodyRatio},
        {x: x + thickness * 0.5, y: from + dy * cfg.arrow.bodyRatio},
        {x: x + thickness * 0.5, y: from},
    ], {
        fill: "white",
        stroke: "black",
        strokeWidth: 1
    });

    const text = newText(
        caption,
        {x: x,                  origin: "center"},
        {y: Math.max(from, to), origin: "top"},
        cfg.bottom.height*0.4,
        4*thickness,
        1
    );

    return new fabric.Group([arrow, text]);
}