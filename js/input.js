function addLevel(current) {
    let current_level_tree = current.getAttribute('data-level-tree');
    let current_level = parseInt(current.getAttribute('data-level'));
    let current_level_cat = document.getElementsByClassName('class_level_' + (current_level + 1));
    current_level_cat = current_level_cat.length;
    let parent = document.getElementById('level_' + current_level_tree);
    let new_div = document.createElement('div');
    let new_div_id = (current_level + 1) + '_' + (current_level_cat + 1);
    new_div.setAttribute('id', 'level_' + new_div_id);
    new_div.setAttribute('class', 'class_level_' + (current_level + 1));
    new_div.classList.add('node', 'card');
    new_div.classList.add(getBorderClass(current_level));
    parent.getElementsByClassName('node-childs')[0].appendChild(new_div);

    let card_header = document.createElement('div');
    card_header.classList.add("card-header");
    card_header.textContent = "Уровень " + (current_level + 1);
    new_div.appendChild(card_header);

    let new_node_input = document.createElement('div');
    new_node_input.classList.add('node-input', 'mt-2');

    let new_input = document.createElement('input');
    new_input.setAttribute('name', 'cate_' + new_div_id);
    new_input.placeholder = 'Название этого уровня';
    new_input.classList.add('form-control');
    new_node_input.appendChild(new_input);

    let new_btn_group = document.createElement('div');
    new_btn_group.classList.add('buttons');

    let new_button = document.createElement('button');
    new_button.setAttribute('onclick', 'addLevel(this)');
    new_button.setAttribute('data-level-tree', new_div_id);
    new_button.setAttribute('data-level', (current_level + 1));
    new_button.classList.add('btn', 'btn-primary');
    new_button.innerHTML = '<i class="fa-solid fa-plus"></i>';
    new_btn_group.appendChild(new_button);

    let delete_button = document.createElement('button');
    delete_button.setAttribute('onclick', 'deleteLevel(this)');
    delete_button.classList.add('btn', 'btn-danger');
    delete_button.innerHTML = '<i class="fa-solid fa-trash"></i>';
    new_btn_group.appendChild(delete_button);

    new_node_input.appendChild(new_btn_group);

    new_div.appendChild(new_node_input);

    let new_childs_div = document.createElement('div');
    new_childs_div.classList.add('node-childs');
    new_div.appendChild(new_childs_div);

    new_div.addEventListener('mouseover', function() {
        let computed_style = window.getComputedStyle(new_div);
        let border_color = computed_style.getPropertyValue('border-top-color');
        new_div.style.boxShadow = "0 0 5px 3px " + border_color;
    });

    new_div.addEventListener('mouseout', function() {
        new_div.style.boxShadow = "none";
    });
}

function deleteLevel(current) {
    let current_level_tree = current.parentNode.parentNode.parentNode.getAttribute('id');
    let parent = document.getElementById(current_level_tree);
    parent.parentNode.removeChild(parent);
}

function getBorderClass(level) {
    let border_classes = ["border-primary", "border-success", "border-danger", "border-warning", "border-info"];
    return border_classes[level % border_classes.length];
}