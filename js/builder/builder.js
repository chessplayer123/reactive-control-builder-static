fabric.Object.prototype.lockRotation = true;

let cfg = {
    top: {
        width: 100,
        height: 33,
        outerArrowsWidth: 50,
    },
    bottom: {
        width: 90,
        height: 16,
    },
    arrow: {
        thickness: 90*0.08,
        bodyRatio: 0.75,
    },
    description: {
        width: 100,
        height: 16,
    },
    image: {
        maxNodesOnSameLine: 2,
        vSpacing: 50,
        hSpacing: 50,
        leftMargin: 10,
        rightMargin: 10,
    },
    font: "arial",
    outlineColor: "black",
    abc: "ijklmnoprstqwe"
};

function loadConfig() {
    cfg.top.width = 150;
    cfg.top.height = cfg.top.width * 0.4;
    cfg.bottom = {
        width: cfg.top.width * 0.9,
        height: cfg.top.height * 0.75,
    }
    cfg.top.outerArrowsWidth = (cfg.top.height + cfg.bottom.height) * 0.5
    cfg.arrow.thickness = cfg.bottom.width * 0.08;
    cfg.description.height = cfg.bottom.height

    return cfg;
}

function build() {
    loadConfig();
    let builder = new Builder("canvas", data);
    builder.draw(data.find((e) => e.selected).id);
}

class Builder {
    constructor(canvasId, data) {
        this.canvas = new fabric.StaticCanvas(canvasId);
        this.tree = prepareDataTree(data);
        this.connections = new Map();

        this.canvas.on("object:moving", this.onObjectMove);
    }

    onObjectMove(element) {
        // TODO: update connections
    }

    newBottomRect(left, top, index, fillColor="white") {
        const rect = new fabric.Rect({
            top: top, left: left,
            width: cfg.bottom.width, height: cfg.bottom.height,
            fill: fillColor, stroke: "black"
        });

        const inArrow = newVerticalArrow(
            left + 1.5 * cfg.arrow.thickness,
            top+cfg.bottom.height*0.5, top-cfg.top.height*0.5,
            `y${index}`
        );
        const outArrow = newVerticalArrow(
            left + cfg.bottom.width - 1.5 * cfg.arrow.thickness,
            top-cfg.top.height*0.5, top+cfg.bottom.height*0.5,
            `x${index}`
        );

        const text = newText(
            `МО${index}`,
            {x: rect.getCenterPoint().x, origin: "center"},
            {y: rect.getCenterPoint().y, origin: "center"},
            rect.height*0.5, cfg.bottom.width - 4 * cfg.arrow.thickness,
            2,
        );

        return new fabric.Group([rect, inArrow, outArrow, text]);
    }

    newDescriptionSection(vertLineX, horLineY, node) {
        const outerIndex = (node.isRoot() ? "P" : "u") + cfg.abc.charAt(Math.max(0, node.depth-1)) + node.globalIndex;
        // Horizontal delimiter
        const horLine = new fabric.Line([
            vertLineX - cfg.top.outerArrowsWidth, horLineY,
            vertLineX + cfg.description.width, horLineY
        ], {stroke: "black"});

        // Vertical delimiter
        const vertLine = new fabric.Line([
            vertLineX, horLineY - cfg.top.height,
            vertLineX, horLineY + cfg.bottom.height
        ], {stroke: "black"});

        // Top section
        const nameSection = new fabric.Textbox(`${outerIndex}\n${node.name}`, {
            left: vertLineX+1, top: horLineY-cfg.top.height,
            stroke: "black", strokeWidth: 0,
            width: cfg.description.width, fontSize: cfg.top.height * 0.3,
        });
        nameSection.setSubscript(1, outerIndex.length);
        nameSection.scaleX = Math.min(1.0, cfg.description.width / nameSection.width);
        nameSection.scaleY = Math.min(1.0, cfg.top.height / nameSection.height);

        // Bottom section
        let children = []
        for (let i = 1; i <= node.childrenCount; ++i) {
            children.push(`u${node.globalIndex}${i}`);
        }
        const childrenSection = new fabric.Textbox(children.join("\n"), {
            left: vertLineX+1, top: horLineY,
            stroke: "black", strokeWidth: 0,
            fontSize: cfg.top.height * 0.2,
            width: cfg.description.width,
        });

        return new fabric.Group([horLine, vertLine, nameSection, childrenSection]);
    }

    newSubjectNode(node) {
        const index = cfg.abc.charAt(node.depth-1) + node.globalIndex;
        return new fabric.Group([
            this.newBottomRect(0, 0, index, "yellow"),
            newText(
                `u${index} ${node.name}`,
                {x: cfg.bottom.width * 0.5, origin: "center"},
                {y: cfg.bottom.height,       origin: "top"},
                cfg.bottom.height*0.35, cfg.bottom.width - 4 * cfg.arrow.thickness,
                1, 1 + index.length
            )], {
                name: "subject",
            }
        );
    }

    newObjectNode(node) {
        // "МУ" top rect
        const topRect = new fabric.Rect({
            top: 0, left: cfg.top.outerArrowsWidth,
            width: cfg.top.width, height: cfg.top.height,
            fill: "yellow", stroke: "black"
        });
        const innerIndex = cfg.abc.charAt(node.depth) + node.globalIndex;
        // Outer arrows ->[]->
        const inArrow = newHorizontalArrow(
            topRect.height * 0.5,
            0, topRect.left,
            `X${innerIndex}`
        );
        const outArrow = newHorizontalArrow(
            topRect.top + cfg.top.height * 0.5,
            topRect.left + cfg.top.width, topRect.left + cfg.top.width + cfg.top.outerArrowsWidth,
            `Y${innerIndex}`
        );
        const name = newText(
            `МО${innerIndex}`,
            {x: topRect.getCenterPoint().x, origin: "center"},
            {y: topRect.getCenterPoint().y, origin: "center"},
            topRect.height*0.5, cfg.bottom.width - 4 * cfg.arrow.thickness,
            2,
        );

        // "МО" bottom rect
        const bottomRect = this.newBottomRect(
            topRect.left + (cfg.top.width - cfg.bottom.width) * 0.5,
            topRect.top + topRect.height,
            innerIndex
        );

        const description = this.newDescriptionSection(
            topRect.left + topRect.width + cfg.top.outerArrowsWidth,
            topRect.top + topRect.height,
            node
        );

        return new fabric.Group([outArrow, inArrow, topRect, name, bottomRect, description], {
            name: "object",
        });
    }

    getInCoords(node) {
        if (node.name == "object") {
            return {
                x: node.left+cfg.top.outerArrowsWidth,
                y: node.top+cfg.top.height*0.5
            };
        } else if (node.name == "subject") {
            return {
                x: node.left+cfg.bottom.width-1.5*cfg.arrow.thickness,
                y: node.top
            };
        }
    }

    getOutCoords(node) {
        if (node.name == "object") {
            return {
                x: node.left+cfg.top.width+2*cfg.top.outerArrowsWidth,
                y: node.top+cfg.top.height*0.5
            };
        } else if (node.name == "subject") {
            return {
                x: node.left+1.5*cfg.arrow.thickness,
                y: node.top
            };
        }
    }

    connectObjects(src, dst) {
        if (src.name != "object") return;

        const srcInPoint = {
            x: src.left+cfg.top.outerArrowsWidth+(cfg.top.width-cfg.bottom.width)/2+cfg.arrow.thickness*1.5,
            y: src.top+cfg.top.height*0.5
        };
        const srcOutPoint = {
            x: src.left+cfg.top.outerArrowsWidth+cfg.top.width-cfg.arrow.thickness*1.5,
            y: src.top+cfg.top.height*0.5
        };
        let dstInPoint = this.getInCoords(dst);
        let dstOutPoint = this.getOutCoords(dst);

        const inLine = new fabric.Line([srcInPoint.x, srcInPoint.y, dstOutPoint.x, dstOutPoint.y], {
            stroke: "green",
            selectable: false,
        });
        const outLine = new fabric.Line([srcOutPoint.x, srcOutPoint.y, dstInPoint.x, dstInPoint.y], {
            stroke: "red",
            selectable: false,
        });
        this.canvas.add(inLine);
        this.canvas.add(outLine);
    }

    resizeCanvasToFit(root, subjects) {
        let width = cfg.image.leftMargin + root.width + cfg.image.rightMargin;
        let height = cfg.image.vSpacing + root.height + cfg.image.vSpacing;
;
        let columnsWidth = new Array(cfg.image.maxNodesOnSameLine).fill(0);
        let currentHeight = 0;
        for (let i = 0; i < subjects.length; ++i) {
            const col = i % cfg.image.maxNodesOnSameLine;
            columnsWidth[col] = Math.max(columnsWidth[col], subjects[i].width);
            currentHeight = Math.max(currentHeight, subjects[i].height);

            if (col == cfg.image.maxNodesOnSameLine - 1) {
                height += currentHeight + cfg.image.vSpacing;
                currentHeight = 0;
            }
        }

        this.canvas.setHeight(height + currentHeight + cfg.image.vSpacing);
        this.canvas.setWidth(Math.max(
            width,
            cfg.image.leftMargin +
                cfg.image.hSpacing * (cfg.image.maxNodesOnSameLine - 1) +
                columnsWidth.reduce((a, b) => a + b) +
                cfg.image.rightMargin
        ));

        return columnsWidth;
    }

    placeSubjects(columnsWidth, rootObject, subjects) {
        let currentLineWidth = cfg.image.leftMargin;
        let height = rootObject.top + rootObject.height + cfg.image.vSpacing;
        let maxLineHeight = 0;
        for (let i = 0; i < subjects.length; ++i) {
            const colWidth = columnsWidth[i % cfg.image.maxNodesOnSameLine];

            subjects[i].setPositionByOrigin({
                x: currentLineWidth + colWidth*0.5, y: height
            }, "center", "top");
            this.canvas.add(subjects[i]);
            this.connectObjects(rootObject, subjects[i]);

            currentLineWidth += colWidth + cfg.image.hSpacing;
            maxLineHeight = Math.max(maxLineHeight, subjects[i].height);
            if ((i + 1) % cfg.image.maxNodesOnSameLine == 0) {
                currentLineWidth = cfg.image.leftMargin;
                height += maxLineHeight + cfg.image.vSpacing;
            }
        }
    }

    draw(rootId) {
        const rootNode = this.tree.get(rootId);
        if (rootNode.isLeaf()) {
            const subject = this.newSubjectNode(rootNode);
            subject.setPositionByOrigin({x: 0, y: 0}, "left", "top");
            this.canvas.add(subject);
            this.canvas.setWidth(subject.width);
            this.canvas.setHeight(subject.height);
            return;
        }

        const rootObject = this.newObjectNode(rootNode);
        const subjects = Array.from(this.tree
            .values()
            .filter((node) => node.parent == rootId)
        , (child) => (child.isLeaf() ? this.newSubjectNode(child) : this.newObjectNode(child)));
        const columns = this.resizeCanvasToFit(rootObject, subjects);

        rootObject.setPositionByOrigin(
            {x: this.canvas.width*0.5, y: cfg.image.vSpacing},
            "center", "top"
        );
        this.canvas.add(rootObject);
        this.placeSubjects(columns, rootObject, subjects);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('applyChangesBtn').addEventListener('click', function() {
        cfg.image.maxNodesOnSameLine = parseInt(document.getElementById('maxNodesOnSameLine').value);
        cfg.image.vSpacing = parseInt(document.getElementById('vSpacing').value);
        cfg.image.hSpacing = parseInt(document.getElementById('hSpacing').value);
        cfg.image.leftMargin = parseInt(document.getElementById('leftMargin').value);
        cfg.image.rightMargin = parseInt(document.getElementById('rightMargin').value);

        showSuccessNotification("Настройки применены");
        build();
    });
});