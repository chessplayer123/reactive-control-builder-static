function getDepth(tree, id) {
    const currentNode = tree.get(id);
    if (currentNode.depth != null) {
        return currentNode.depth;
    } else if (currentNode.isRoot()) {
        return currentNode.depth = 0;
    }
    return currentNode.depth = 1 + getDepth(tree, currentNode.parent);
}

function getGlobalIndex(tree, id) {
    const currentNode = tree.get(id);
    if (currentNode.globalIndex != null) {
        return currentNode.globalIndex;
    } else if (currentNode.isRoot()) {
        return currentNode.globalIndex = "";
    }
    const parentGlobalIndex = getGlobalIndex(tree, currentNode.parent);
    return currentNode.blockIndex = `${parentGlobalIndex}${currentNode.localIndex}`;
}

function prepareDataTree(data) {
    let tree = new Map();

    for (const element of data) {
        tree.set(element.id, {
            parent:         element.father,
            name:           element.text_1,
            depth:          null,
            localIndex:     null,
            globalIndex:    null,
            childrenCount:  0,
            isRoot:         function() {
                return this.parent == null;
            },
            isLeaf:         function() {
                return this.childrenCount == 0;
            }
        });
    }

    for (let [id, node] of tree.entries()) {
        node.depth = getDepth(tree, id);
        if (node.parent != null) {
            node.localIndex = ++tree.get(node.parent).childrenCount;
        }
    }

    for (let [id, node] of tree.entries()) {
        node.globalIndex = getGlobalIndex(tree, id);
    }

    return tree;
}
