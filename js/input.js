let data = new Map([
    [1, {
        id: 1,
        text_1: "Root",
        father: null,
        selected: true,
        subselected: false,
        index: 0,
        depth: 0,
        children: new Set()
    }]
]);

const builder = new Builder("canvas", data);

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
        return result = getNodeElement(node);
    },
    linkWidth: (nodeData) => 5,
    linkShape: "curve",
    linkColor: (nodeData) => "#B0BEC5",
});

const notification = document.getElementById('notification')

function getCurrentSelected() {
    return data.values().find((e) => e.selected).id;
}

function downloadAll() {
    const currentTime = getCurrentTimeString();
    for (const [id, node] of data.entries()) {
        if (node.children.size == 0) continue;

        builder.draw(id);
        const link = document.createElement('a');
        link.download = `rcd_${currentTime}_${node.text_1}.png`;
        builder.canvas.renderAll();
        link.href = builder.canvas.toDataURL({
            format: "png"
        });
        link.click();
        URL.revokeObjectURL(link.href)
    }
}

function downloadOne() {
    const currentNode = data.get(getCurrentSelected());
    const link = document.createElement('a');
    link.download = `rcd_${getCurrentTimeString()}_${currentNode.text_1}.png`;
    builder.canvas.renderAll();
    link.href = builder.canvas.toDataURL({
        format: "png"
    });
    link.click();
    URL.revokeObjectURL(link.href)
}

function getNodeElement(node) {
    const styleString = `
    cursor: pointer;
    height: ${node.settings.nodeHeight}px; 
    width: ${node.settings.nodeWidth}px; 
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
  `;

    let classList = 'card';
    if (node.data.selected == true) {
        classList += ' border-success bg-success text-light';
    }
    if (node.data.subselected == true) {
        classList += ' border-danger bg-danger text-light';
    }

    const htmlString = `
    <div 
      onclick='onNodeClick(this)' 
      data-id=${node.data.id}
      class="${classList}"
      style="${styleString}"
    >
      <div>
        <strong>${node.data.text_1}</strong>
      </div>
    </div>
  `;

    return htmlString;
}

function selectById(id) {
    for (const node of data.values()) {
        node.selected = (node.id == id);
        node.subselected = (node.father == id);
    }
    myTree.refresh(data.values());
}

function onNodeClick(node) {
    let id = node.getAttribute('data-id');
    let container = document.querySelector('#level-0');
    container.innerHTML = "";
    container.appendChild(drawLevel(parseInt(id)));
    selectById(id);
    builder.draw(getCurrentSelected());
}

function updateEditorById(id) {
    if (id == null) return;

    let container = document.querySelector('#level-0');
    container.innerHTML = "";
    container.appendChild(drawLevel(id));
    selectById(id);
    builder.draw(getCurrentSelected());
}

function getBorderClass(level) {
    let borderClasses = ["border-primary", "border-success", "border-danger", "border-warning", "border-info"];
    return borderClasses[level % borderClasses.length];
}

function drawLevel(id) {
    const element = data.get(id);
    if (!element) return '';

    let newDiv = createNode(element, 1);

    const children = data.values().filter(item => item.father == id);
    for (const child of children) {
        let childDiv = createNode(child, 2);
        newDiv.lastChild.appendChild(childDiv);
    }

    return newDiv;
}

function createNode(node, borderLevel) {
    let newDiv = document.createElement('div');
    newDiv.classList.add('node', 'card');
    newDiv.classList.add(getBorderClass(borderLevel));

    let cardHeader = document.createElement('div');
    cardHeader.classList.add("card-header", "d-flex", "flex-row", "justify-content-between");
    cardHeader.setAttribute('role', 'button');
    let innerText = "перейти на этот уровень";
    if (borderLevel == 1) innerText = "перейти на уровень выше";
    cardHeader.innerHTML = `<div id="name">${node.text_1}</div><div class="text-end text-primary small">${innerText}</div>`;
    newDiv.appendChild(cardHeader);

    let newNodeInput = document.createElement('div');
    newNodeInput.classList.add('node-input', 'mt-2');

    let newInput = document.createElement('input');
    newInput.placeholder = 'Название этого уровня';
    newInput.classList.add('form-control');
    newInput.addEventListener("input", (event) => {
        node.text_1 = event.target.value;
        cardHeader.querySelector("#name").textContent = event.target.value;
        myTree.refresh(data.values());
        builder.draw(getCurrentSelected());
    });
    newNodeInput.appendChild(newInput);

    let newBtnGroup = document.createElement('div');
    newBtnGroup.classList.add('buttons');

    let newButton = document.createElement('button');
    newButton.setAttribute('onclick', `addLevel(${node.id})`);
    newButton.classList.add('btn', 'btn-primary');
    newButton.innerHTML = '<i class="fa-solid fa-plus"></i>';
    newBtnGroup.appendChild(newButton);

    let deleteButton = document.createElement('button');
    deleteButton.setAttribute('onclick', `deleteLevel(${node.id})`);
    deleteButton.classList.add('btn', 'btn-danger');
    deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
    newBtnGroup.appendChild(deleteButton);

    newNodeInput.appendChild(newBtnGroup);

    newDiv.appendChild(newNodeInput);

    let newChildrenDiv = document.createElement('div');
    newChildrenDiv.classList.add('node-childs');
    newDiv.appendChild(newChildrenDiv);

    newDiv.addEventListener('mouseover', function () {
        let computedStyle = window.getComputedStyle(newDiv);
        let borderColor = computedStyle.getPropertyValue('border-top-color');
        newDiv.style.boxShadow = "0 0 5px 3px " + borderColor;
    });

    newDiv.addEventListener('mouseout', function () {
        newDiv.style.boxShadow = "none";
    });

    cardHeader.addEventListener('click', (event) => {
        if (borderLevel == 1) {
            updateEditorById(node.father);
        }
        if (borderLevel == 2) {
            updateEditorById(node.id);
        }
    });

    return newDiv;
}

function addLevel(parentId) {
    let parent = data.get(parentId);
    data.set(++currentMaxID, {
        id: currentMaxID,
        text_1: "No name",
        father: parentId,
        depth: parent.depth + 1,
        children: new Set(),
        index: parent.children.add(currentMaxID).size,
    });
    myTree.refresh(data.values());
    updateEditorById(parentId);
}

function deleteById(id) {
    const element = data.get(id);
    for (const childId of element.children) {
        deleteById(childId);
    }
    data.delete(id);
}

function deleteLevel(id) {
    if (id == 1) {
        showErrorNotification("Невозможно удалить корневой элемент");
        return
    }

    let current = data.get(id);
    let parent = data.get(current.father);
    parent.children.delete(id);
    for (let childId of parent.children) {
        const child = data.get(childId);
        if (child.index >= current.index) {
            --child.index;
        }
    };
    deleteById(id);
    updateEditorById(parent.id);
}

function getCurrentTimeString() {
    const currentDate = new Date();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');

    return `${month}${day}_${hours}${minutes}`;
}

function mapToJson(map) {
    const obj = {};
    for (const [key, value] of map) {
        obj[key] = value;
        obj[key].children = [...value.children];
    }
    return JSON.stringify(obj);
}

function jsonToMap(jsonStr) {
    const obj = JSON.parse(jsonStr);
    const map = new Map();
    for (const key in obj) {
        obj[key].children = new Set(obj[key].children);
        map.set(parseInt(key), obj[key]);
    }
    return map;
}

function download() {
    let jsonText = mapToJson(data);
    let a = document.createElement("a");
    let file = new Blob([jsonText], {
        type: "text/plain"
    });
    a.href = URL.createObjectURL(file);
    a.download = "rcb_save_" + getCurrentTimeString() + ".json";
    a.click();
    URL.revokeObjectURL(a.href)
}

function findMaxId(data) {
    let maxId = -Infinity;
    for (let node of data.values()) {
        if (node.id > maxId) {
            maxId = node.id;
        }
    }
    return maxId;
}

function restoreSave() {
    const input = document.getElementById('fileInput');
    input.accept = '.json';
    input.onchange = function (e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = function (readerEvent) {
            try {
                data.clear();
                const loadedData = jsonToMap(readerEvent.target.result);
                for (const [key, value] of loadedData) {
                    data.set(key, value);
                }
                currentMaxID = findMaxId(data) + 1;
                // does not catch error if data is corrupted, treeviz.refresh is asyc
                updateEditorById(1);
                showSuccessNotification("Сохранение востановленно");
            } catch (error) {
                console.error('Error parsing JSON:', error);
                showErrorNotification("Не удалось востановить сохранение: " + error);
            }
        };
        e.target.value = ""
    };
    input.click();
}

function showSuccessNotification(text) {
    const alert = bootstrap.Toast.getOrCreateInstance(notification);
    alert._element.querySelector('.toast-body').innerHTML = text;
    alert._element.classList.remove('text-bg-danger');
    alert._element.classList.add('text-bg-success');
    alert.show();
}

function showErrorNotification(text) {
    const alert = bootstrap.Toast.getOrCreateInstance(notification);
    alert._element.querySelector('.toast-body').innerHTML = text;
    alert._element.classList.remove('text-bg-success');
    alert._element.classList.add('text-bg-danger');
    alert.show();
}

updateEditorById(1);