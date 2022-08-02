import {database, getDatabase, ref, set, onValue, child, push, update} from './firebase.connect.js';

const userFormList = document.querySelector('.user_form_js .user_output');
const paginationNav = document.querySelector('.form_pagination nav .pagination');
const addNewUserButton = document.querySelector('.add_new_user_js');
const userModal = document.querySelector('#userPopup');
const statusModal = new bootstrap.Modal(document.getElementById('statusModal'));
const statusModalToggle = document.getElementById('statusModal');
const filterOpt = document.querySelector('.form_settings_js');
const rowsPerPage = 5;

let statusString = document.querySelector('#statusModal .status_string_js');
let defaultRowsArr = new Array();
let currentPage = 1;
let lastUserId = 1;

const doGetCaretPosition = (oField) => {

    // Initialize
    let iCaretPos = 0;
  
    // IE Support
    if (document.selection) {
  
      // Set focus on the element
      oField.focus();
  
      // To get cursor position, get empty selection range
      var oSel = document.selection.createRange();
  
      // Move selection start to 0 position
      oSel.moveStart('character', -oField.value.length);
  
      // The caret position is selection length
      iCaretPos = oSel.text.length;
    } else if (oField.selectionStart || oField.selectionStart == '0')
      iCaretPos = oField.selectionDirection=='backward' ? oField.selectionStart : oField.selectionEnd;
  
    // Return results
    return iCaretPos;
  }


const telPattern = (inputField)=>{
    inputField.addEventListener('focus',(e)=>{
        let field = e.currentTarget;
        if ( field.value == '' ){
            field.value = '+38(';
            field.selectionStart = 4;
        }
    } );
    
    
    inputField.addEventListener('input',(e)=>{
        let field = e.currentTarget,
            currentPosition = doGetCaretPosition(field),
            patternRules = {
                7: ')',
                11: '-',
                14: '-',
            };

        if (patternRules[`${currentPosition}`]){
            field.value += patternRules[`${currentPosition}`];
        }
    });
}

document.onload = telPattern(userModal.querySelector('[name=userTelephone]'));

const updateUserList = (formElement, data)=>{
    // let userDBList = JSON.stringify(data);
    let dataLength = Object.keys(data).length;
    let userRow = ``;
    Object.entries(data).forEach(([key, value]) => {
        let rowDate = new Date(`${value.userBirthday}`);
            rowDate = rowDate.getTime();
        userRow += `
        <div class="user_row d-flex flex-row flex-wrap align-items-center justify-content-around" data-row-id="${key}" data-bday="${rowDate}" data-lname="${value.userLastName
}">
            <div class="mb-3">
                <img src="${value.userAvatar}" class="img-thumbnail" alt="avatar">
            </div>
            <div class="mb-3">
                <label for="userName" class="form-label">Name</label>
                <input type="text" class="form-control" name="userName" placeholder="Name" value="${value.userName}">
            </div>
            <div class="mb-3">
                <label for="userLastName" class="form-label">Last Name</label>
                <input type="text" class="form-control" name="userLastName" placeholder="Last name" value="${value.userLastName
}">
            </div>
            <div class="mb-3">
                <label for="userEmail" class="form-label">Email address</label>
                <input type="email" class="form-control" name="userEmail" placeholder="name@example.com" value="${value.userEmail}">
            </div>
            <div class="mb-3">
                <label for="userTelephone" class="form-label">Telephone</label>
                <input type="text" class="form-control" name="userTelephone" maxlength="17" placeholder="+380(XX)XXX-XX-XX" value="${value.userTelephone}">
            </div>
            <div class="mb-3">
                <label for="userBirthday" class="form-label">Birthday Date</label>
                <input type="text" class="form-control" name="userBirthday" placeholder="YYYY-MM-DD-" value="${value.
userBirthday}">
            </div>
            <div class="mb-3">
                <button type="button" class="update_row_js btn btn-secondary mt-3" disabled>Update</button>
            </div>
        </div>
    `;
    lastUserId = +key;
    });
    // console.log(lastUserId);
    
    formElement.innerHTML = userRow;
}

const pageCounter = () => {
    return userFormList.querySelectorAll('.user_row').length;
}

const createUserRows = () => {
    let userRows = userFormList.querySelectorAll('.user_row');
    let rowsArr = new Array();

    userRows.forEach(row=>{
        rowsArr.push({
            id: `${row.dataset.rowId}`,
            bday: `${row.dataset.bday}`,
            lname: `${row.dataset.lname}`,
            el: row
        });
    });

    // console.log(rowsArr);
    
    return rowsArr;
}

const rowFieldsListener = ()=>{
    let telephoneFields = userFormList.querySelectorAll('[name=userTelephone]');

    telephoneFields.forEach((field)=>{
        telPattern(field);
    });
}

const starCountRef = ref(database, 'users/');
onValue(starCountRef, (snapshot) => {
    const data = snapshot.val();
    updateUserList(userFormList, data);
    showPages();
    rowsListener();
    addNewUserListenerInit();
    updateUserRow();
    resetFilterSelection();
    rowFieldsListener();
});

const deleteChild = el =>{
    [...el.children].forEach(child=>{
        el.removeChild(child);
    });
}

const showPages = (currentPage = 1) =>{
    let rowCount = pageCounter();
    let rows = userFormList.querySelectorAll('.user_row');

    for ( let i = 0; i < rowCount; i++ ){
        showHideEl(rows[i], i < rowsPerPage);
    }

    createPagination();
}

const createPagination = () => {
    let rowCount = pageCounter();

    deleteChild(paginationNav);

    for ( let i = 1; i <= Math.ceil(rowCount / rowsPerPage); i++ ){
        let newPageNumElement = document.createElement('li');
        let anchorElement = document.createElement('a');

        newPageNumElement.classList.add('page-item');
        anchorElement.classList.add('page-link');
        anchorElement.setAttribute('href', '#');
        anchorElement.dataset.num = i;
        anchorElement.innerText = i;

        if ( currentPage === i ){
            newPageNumElement.classList.add('active');
        }

        newPageNumElement.appendChild(anchorElement);
        paginationNav.appendChild(newPageNumElement);
    }

    paginationNav.querySelectorAll('.page-link').forEach((link)=>{
        link.addEventListener('click', (e)=>{
            let pageNum = e.currentTarget.dataset.num;
            pagination(pageNum);
        });
    });
}

const showHideEl = (el, condition) => {
    if ( condition ){
        el.classList.remove('d-none');
    } else {
        el.classList.add('d-none');
    }
}

const pagination = (pageNum) => {
    let rowCount = pageCounter();
    let rows = userFormList.querySelectorAll('.user_row');

    paginationNav.querySelectorAll('.page-item').forEach((item)=>{
        item.classList.remove('active');
    });

    paginationNav.querySelector(`.page-item [data-num='${pageNum}']`).closest('li').classList.add('active');

    for ( let i = 0; i < rowCount; i++ ){
        showHideEl(rows[i], (pageNum*rowsPerPage - 1) >= i && i > (pageNum*rowsPerPage) - rowsPerPage - 1);
    }
}

const rowsListener = () => {
    userFormList.querySelectorAll('.user_row').forEach((row)=>{
        row.querySelectorAll('input').forEach((field)=>{
            field.addEventListener('input', (e)=>{
                let userRowUpdate = e.currentTarget.closest('.user_row').querySelector('.update_row_js');

                userRowUpdate.removeAttribute('disabled');
                userRowUpdate.classList.remove('btn-secondary');
                userRowUpdate.classList.add('btn-primary');
            });
        });
    });
}

const writeUserData = options => {
    const db = getDatabase();

    const {
        userId,
        name,
        lastName,
        email,
        telephone,
        birthday,
        profileImg = '/src/images/noavatar.jpg'
    } = options;

    set(ref(db, 'users/' + userId), {
        userName: name,
        userLastName: lastName,
        userEmail: email,
        userTelephone: telephone,
        userBirthday: birthday,
        userAvatar: profileImg
    }).then(()=>{
        statusString.innerText = 'Succesfully added!';
        statusModal.show(statusModalToggle);
        userModal.querySelectorAll('.new_user_row input').forEach((el)=>{
            el.value = '';
        });
    }).catch((error) => {
        statusString.innerText = 'Error: ' + error;
        statusModal.show(statusModalToggle);
    });
}

const updateUserData = options => {
    const db = getDatabase();

    const {
        userId,
        name,
        lastName,
        email,
        telephone,
        birthday,
        profileImg = '/src/images/noavatar.jpg'
    } = options;

    update(ref(db, 'users/' + userId), {
        userName: name,
        userLastName: lastName,
        userEmail: email,
        userTelephone: telephone,
        userBirthday: birthday,
        userAvatar: profileImg
    }).then(()=>{
        statusString.innerText = 'Succesfully updated!';
        statusModal.show(statusModalToggle);
    }).catch((error) => {
        statusString.innerText = 'Error: ' + error;
        statusModal.show(statusModalToggle);
    });
}

const addNewUserListenerInit = () => {
    addNewUserButton.addEventListener('click', (e)=>{
        let form = document.querySelector('.new_user_row');
        let name = form.querySelector('[name=userName]').value,
            lastName = form.querySelector('[name=userLastName]').value,
            email = form.querySelector('[name=userEmail]').value,
            telephone = form.querySelector('[name=userTelephone]').value,
            birthday = form.querySelector('[name=userBirthday]').value,
            userAvatar = form.querySelector('[name=userAvatar]').files[0],
            formData = new FormData();

            formData.append('fileupload', userAvatar);

            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then((response)=>{
                console.log(response);
            });

        lastUserId += 1;

        const options = {
            userId: lastUserId,
            name,
            lastName,
            email,
            telephone,
            birthday,
            profileImg: userAvatar ? `/src/images/cropped_${userAvatar.name}` : '/src/images/noavatar.jpg'
        }

        writeUserData(options);
    });
}

const updateUserRow = () => {
    let userRowButtons = document.querySelectorAll('.update_row_js');
    userRowButtons.forEach((button)=>{
        button.addEventListener('click', (e) => {
            let userRow = e.currentTarget.closest('.user_row');
            let name = userRow.querySelector('[name=userName]').value,
                lastName = userRow.querySelector('[name=userLastName]').value,
                email = userRow.querySelector('[name=userEmail]').value,
                telephone = userRow.querySelector('[name=userTelephone]').value,
                birthday = userRow.querySelector('[name=userBirthday]').value;
            let userId = e.currentTarget.closest('.user_row').dataset.rowId;

            const options = {
                userId,
                name,
                lastName,
                email, 
                telephone,
                birthday
            }

            updateUserData(options);
        });
    });
}

const filterList = (type) => {
    let rowsArr = createUserRows();
    let sortObj = {
        '0': (a,b) => { return a.id - b.id },
        '1': (a,b) => { return a.bday - b.bday },
        '2': (a,b) => { return b.bday - a.bday },
        '3': (a,b) => { 
                    if (a.lname > b.lname){
                    return -1;
                    } else if (a.lname == b.lastName) {
                    return 0;
                    }
                    return 1;
            },
        '4': (a,b) => { 
                    if (a.lname > b.lname){
                    return 1;
                    } else if (a.lname == b.lastName) {
                    return 0;
                    }
                    return -1;
            }
    }
    rowsArr.sort(sortObj[type])
    outputFilteredUserList(rowsArr);
}

const outputFilteredUserList = (list) => {
    deleteChild(userFormList);
    list.forEach((urow)=>{
        userFormList.append(urow.el);
    });
    showPages();
}

const resetFilterSelection = () =>{
    filterOpt.value = '0';
}

filterOpt.onchange = (el) => {
    filterList(el.currentTarget.value);
}