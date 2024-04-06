let data = new Map();

data.set(1, {
    id: 1,
    text_1: "Root",
    father: null,
    selected: true,
    subselected: false,
    depth: 0,
    localIndex: null,
    globalIndex: "",
    childrenCount: 0,
    isRoot: function () {
        return this.father == null;
    },
    isLeaf: function () {
        return this.childrenCount == 0;
    }
});

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
        if (node.id == id) {
            node.selected = true;
        } else {
            node.selected = false;
        }
        if (node.father == id) {
            node.subselected = true;
        } else {
            node.subselected = false;
        }
    }
    myTree.refresh(data.values());
}

function getElementById(id) {
    return data.get(id);
}

function onNodeClick(node) {
    let id = node.getAttribute('data-id');
    let container = document.querySelector('#level-0');
    container.innerHTML = "";
    container.appendChild(drawLevel(parseInt(id)));
    selectById(id);
    build();
}

function updateEditorById(id) {
    if (id == null) return;

    let container = document.querySelector('#level-0');
    container.innerHTML = "";
    container.appendChild(drawLevel(id));
    selectById(id);
    build();
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
    cardHeader.classList.add("card-header")
    cardHeader.setAttribute('role', 'button');
    cardHeader.textContent = node.text_1;
    newDiv.appendChild(cardHeader);

    let newNodeInput = document.createElement('div');
    newNodeInput.classList.add('node-input', 'mt-2');

    let newInput = document.createElement('input');
    newInput.placeholder = 'Название этого уровня';
    newInput.classList.add('form-control');
    newInput.addEventListener("input", (event) => {
        node.text_1 = event.target.value;
        cardHeader.textContent = event.target.value;
        myTree.refresh(data.values());
        build();
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
    let parent = getElementById(parentId);
    data.set(++currentMaxID, {
        id: currentMaxID,
        text_1: "No name",
        father: parentId,
        depth: parent.depth + 1,
        localIndex: ++parent.childrenCount,
        globalIndex: `${parent.globalIndex}${parent.childrenCount}`,
        childrenCount: 0,
        isRoot: function () {
            return this.father == null;
        },
        isLeaf: function () {
            return this.childrenCount == 0;
        }
    });
    myTree.refresh(data.values());
    updateEditorById(parentId);
}

function deleteById(data, id) {

    const element = data.get(id);
    for (let child of data.values()) {
        if (child.father == id) {
            deleteById(data, child.id);
        }
    }
    data.delete(id);
}

function deleteLevel(id) {
    if (id == 1) {
        alert("Невозможно удалить корневой элемент");
        return
    }
    
    
    let current = getElementById(id);
    let parent = getElementById(current.father);
    --parent.childrenCount;
    for (let [id, node] of data.entries()) {
        console.log(node.father, node.localIndex)
        if (node.father == current.father && node.localIndex >= current.localIndex) {
            --node.localIndex;
        }
        console.log(node.father, node.localIndex)
    };
    console.log(data)
    deleteById(data, id);
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

function download() {
    let jsonText = JSON.stringify(data);
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
    for (let i = 0; i < data.length; i++) {
        if (data[i].id > maxId) {
            maxId = data[i].id;
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
                data = JSON.parse(readerEvent.target.result);
                currentMaxID = findMaxId(data) + 1;
                // does not catch error if data is corrupted, treeviz.refresh is asyc
                updateEditorById(1);
                showSuccessNotification("Сохранение востановленно");
            } catch (error) {
                console.error('Error parsing JSON:', error);
                showErrorNotification("Не удалось востановить сохранение: " + error);
            }
        };
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