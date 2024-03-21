let data = [{
        id: 1,
        text_1: "Root",
        father: null
    }
];

let currentMaxID = 1;

let myTree = Treeviz.create({
    htmlId: "tree",
    idKey: "id",
    hasFlatData: true,
    relationnalField: "father",
    hasPanAndZoom: true,
    nodeWidth: 120,
    nodeHeight: 80,
    mainAxisNodeSpacing: 2,
    isHorizontal: false,
    renderNode: function (node) {
        return result = "<div onclick='onNodeClick(this)' data-id=" + node.data.id + " class='box' style='cursor:pointer;height:" + node.settings.nodeHeight + "px; width:" + node.settings.nodeWidth + "px;display:flex;flex-direction:column;justify-content:center;align-items:center;background-color:" +
            node.data.color +
            ";border-radius:5px;'><div><strong>" +
            node.data.text_1 +
            "</strong></div><div>is</div><div><i>" +
            node.data.text_2 +
            "</i></div></div>";
    },
    linkWidth: (nodeData) => 5,
    linkShape: "curve",
    linkColor: (nodeData) => "#B0BEC5",
});

myTree.refresh(data);

function getElementById(id) {
    return data.find(item => item.id === id);
}

function onNodeClick(node) {
    let id = node.getAttribute('data-id');
    let container = document.querySelector('#level-0');
    container.innerHTML = "";
    container.appendChild(drawLevel(id));
}

function updateEditorById(id) {
    let container = document.querySelector('#level-0');
    container.innerHTML = "";
    container.appendChild(drawLevel(id));
}

function getBorderClass(level) {
    let border_classes = ["border-primary", "border-success", "border-danger", "border-warning", "border-info"];
    return border_classes[level % border_classes.length];
}

function drawLevel(id) {
    const element = data.find(item => item.id == id);
    if (!element) return '';

    let new_div = createNode(element, 1);

    const children = data.filter(item => item.father == id);
    for (const child of children) {
        let child_div = createNode(child, 2);
        new_div.lastChild.appendChild(child_div);
    }

    return new_div;
}

function createNode(node, borderLevel) {
    let new_div = document.createElement('div');
    new_div.classList.add('node', 'card');
    new_div.classList.add(getBorderClass(borderLevel));

    let card_header = document.createElement('div');
    card_header.classList.add("card-header");
    card_header.textContent = node.text_1;
    new_div.appendChild(card_header);

    let new_node_input = document.createElement('div');
    new_node_input.classList.add('node-input', 'mt-2');

    let new_input = document.createElement('input');
    new_input.placeholder = 'Название этого уровня';
    new_input.classList.add('form-control');
    new_node_input.appendChild(new_input);

    let new_btn_group = document.createElement('div');
    new_btn_group.classList.add('buttons');

    let new_button = document.createElement('button');
    new_button.setAttribute('onclick', 'addLevel(' + node.id + ')');
    new_button.classList.add('btn', 'btn-primary');
    new_button.innerHTML = '<i class="fa-solid fa-plus"></i>';
    new_btn_group.appendChild(new_button);

    let delete_button = document.createElement('button');
    delete_button.setAttribute('onclick', 'deleteLevel(' + node.id + ')');
    delete_button.classList.add('btn', 'btn-danger');
    delete_button.innerHTML = '<i class="fa-solid fa-trash"></i>';
    new_btn_group.appendChild(delete_button);

    new_node_input.appendChild(new_btn_group);

    new_div.appendChild(new_node_input);

    let new_childs_div = document.createElement('div');
    new_childs_div.classList.add('node-childs');
    new_div.appendChild(new_childs_div);

    new_div.addEventListener('mouseover', function () {
        let computed_style = window.getComputedStyle(new_div);
        let border_color = computed_style.getPropertyValue('border-top-color');
        new_div.style.boxShadow = "0 0 5px 3px " + border_color;
    });

    new_div.addEventListener('mouseout', function () {
        new_div.style.boxShadow = "none";
    });

    return new_div;
}

function addLevel(parentId) {
    data.push({
        id: ++currentMaxID,
        text_1: "No name",
        father: parentId
    });
    updateEditorById(parentId);
    myTree.refresh(data);
}

function deleteById(data, id) {
    let index = data.findIndex(item => item.id == id);
    while (index !== -1) {
        const element = data[index];
        data.splice(index, 1);
        for (let i = data.length - 1; i >= 0; i--) {
            if (data[i].father == element.id) {
                deleteById(data, data[i].id);
            }
        }
        index = data.findIndex(item => item.id == id);
    }
    
}

function deleteLevel(id) {
    let parentId = getElementById(id).father;
    deleteById(data, id);
    updateEditorById(parentId);
    myTree.refresh(data);
}