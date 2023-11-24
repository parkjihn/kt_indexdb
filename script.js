
let db;

const request = indexedDB.open("myDatabase", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  const tableName = "myTable";


  if (!db.objectStoreNames.contains(tableName)) {
    const objectStore = db.createObjectStore(tableName, {
      keyPath: "id",
      autoIncrement: true,
    });
  
  }
};

request.onsuccess = function (event) {
  db = event.target.result;
  console.log("База данных успешно открыта");
};

request.onerror = function (event) {
  console.error("Ошибка базы данных:", event.target.error);
};

function showAddForm() {
  const addForm = document.getElementById("addForm");
  addForm.style.display = "block";
}


function updateTable() {
  const table = document.getElementById("dataTable");

  table.innerHTML = "<tr><th>ID</th><th>Колонка 1</th><th>Колонка 2</th><th>Действия</th></tr>";

  const transaction = db.transaction(["myTable"], "readonly");
  const objectStore = transaction.objectStore("myTable");

  objectStore.openCursor().onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      const row = table.insertRow();
      row.insertCell(0).textContent = cursor.value.id;
      row.insertCell(1).textContent = cursor.value.column1; // Замените на ваши реальные имена колонок
      row.insertCell(2).textContent = cursor.value.column2;
      const actionsCell = row.insertCell(3);
      actionsCell.innerHTML = `<span class='action' onclick='updateItem(${cursor.value.id})'>Изменить</span>`;
      actionsCell.innerHTML += `<span class='action' onclick='deleteItem(${cursor.value.id})'>Удалить</span>`;
      cursor.continue();
    }
  };
}


function saveItem() {
    const column1Value = document.getElementById("column1Input").value;
    const column2Value = document.getElementById("column2Input").value;
  
    const transaction = db.transaction(["myTable"], "readwrite");
    const objectStore = transaction.objectStore("myTable");
  
    const countRequest = objectStore.count();
  
    countRequest.onsuccess = function () {
      const newItem = {
        id: countRequest.result + 1, 
        column1: column1Value,
        column2: column2Value,
      };
  
      const addRequest = objectStore.add(newItem);
  
      addRequest.onsuccess = function () {
        alert("Запись успешно добавлена");
        updateTable();
      };
  
      addRequest.onerror = function () {
        console.error("Ошибка при добавлении записи:", addRequest.error);
      };
    };
  }

  function updateItem(key) {
    const table = document.getElementById("dataTable");
    const existingEditRow = table.querySelector(`[data-key="${key}"]`);

    if (existingEditRow) {
     
        return;
    }

    const transaction = db.transaction(["myTable"], "readwrite");
    const objectStore = transaction.objectStore("myTable");

    const getRequest = objectStore.get(key);

    getRequest.onsuccess = function () {
        const existingItem = getRequest.result;

  
        const row = table.insertRow();
        row.dataset.key = key; 
        row.insertCell(0).textContent = existingItem.id;
        row.insertCell(1).innerHTML = `<input type="text" value="${existingItem.column1}" id="editColumn1">`;
        row.insertCell(2).innerHTML = `<input type="text" value="${existingItem.column2}" id="editColumn2">`;
        const actionsCell = row.insertCell(3);
        actionsCell.innerHTML = `<span class='action' onclick='saveChanges(${key})'>Сохранить</span>`;
        actionsCell.innerHTML += `<span class='action' onclick='cancelEdit(${key})'>Отмена</span>`;

        const originalRow = document.querySelector(`[onclick='updateItem(${key})']`).closest("tr");
        originalRow.getElementsByTagName("td")[3].innerHTML = "";
    };
}
  
function saveChanges(key) {
    const table = document.getElementById("dataTable");
    const cells = table.querySelector(`[data-key="${key}"]`).getElementsByTagName("td");

    const updatedItem = {
        id: key, 
        column1: document.getElementById("editColumn1").value,
        column2: document.getElementById("editColumn2").value,
    };

    const transaction = db.transaction(["myTable"], "readwrite");
    const objectStore = transaction.objectStore("myTable");

    const updateRequest = objectStore.put(updatedItem);

    updateRequest.onsuccess = function () {
        alert("Запись успешно изменена");
        updateTable();
    };

    updateRequest.onerror = function () {
        console.error("Ошибка при обновлении записи:", updateRequest.error);
    };
}

  
  

  function cancelEdit(key) {
    const table = document.getElementById("dataTable");
    const row = table.querySelector(`[onclick='saveChanges(${key})']`).closest("tr");
  

    row.remove();
  

    const originalRow = document.querySelector(`[onclick='updateItem(${key})']`).closest("tr");
    const actionsCell = originalRow.getElementsByTagName("td")[3];
    actionsCell.innerHTML = `<span class='action' onclick='updateItem(${key})'>Изменить</span>`;
    actionsCell.innerHTML += `<span class='action' onclick='deleteItem(${key})'>Удалить</span>`;
  }
  


function deleteItem(key) {
  const transaction = db.transaction(["myTable"], "readwrite");
  const objectStore = transaction.objectStore("myTable");

  const deleteRequest = objectStore.delete(key);

  deleteRequest.onsuccess = function () {
    alert("Запись успешно удалена");
    updateTable();
  };

  deleteRequest.onerror = function () {
    console.error("Ошибка при удалении записи:", deleteRequest.error);
  };
}
