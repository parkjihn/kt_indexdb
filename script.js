
let db;
const dbReq = indexedDB.open("myDB", 1);

dbReq.onupgradeneeded = (event) => {
    db = event.target.result;

    if (!db.objectStoreNames.contains("notes")) {
        const notesStore = db.createObjectStore("notes", {
            autoIncrement: true,
        });

        notesStore.createIndex("timestamp", "timestamp", { unique: false });
    }
};

dbReq.onsuccess = (event) => {
    db = event.target.result;
    getAndDisplayNotes(db);
};

dbReq.onerror = (event) => {
    console.error("Ошибка при открытии базы данных " + event.target.errorCode);
};

const updateTable = () => {
    getAndDisplayNotes(db);
};

const addStickyNote = (message) => {
    if (!db) {
        console.error("База данных не готова.");
        return;
    }

    const tx = db.transaction(["notes"], "readwrite");
    const store = tx.objectStore("notes");

    const note = { text: message, timestamp: Date.now() };
    store.add(note);

    tx.oncomplete = () => {
        getAndDisplayNotes(db);
    };

    tx.onerror = (event) => {
        console.error("Ошибка при сохранении заметки " + event.target.errorCode);
    };
};

const submitNote = () => {
    const message = document.getElementById("newmessage").value;
    addStickyNote(message);
    document.getElementById("newmessage").value = "";

    alert("Запись успешно добавлена.");
};



const getAndDisplayNotes = (db) => {
    if (!db) {
        console.error("База данных не готова.");
        return;
    }

    const tx = db.transaction(["notes"], "readonly");
    const store = tx.objectStore("notes");

    const req = store.openCursor();
    const allNotes = [];

    req.onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
            allNotes.push(cursor.value);
            cursor.continue();
        } else {
            displayNotes(allNotes);
        }
    };

    req.onerror = (event) => {
        console.error("Ошибка при запросе курсора " + event.target.errorCode);
    };
};

const displayNotes = (notes) => {
    const listHTML =
        "<ul>" +
        notes
            .map(
                (note) => `
    <li>${note.text} Время: ${new Date(note.timestamp).toLocaleString("ru-RU")}
      <button onclick="deleteNote(${note.timestamp})">X</button>
    </li>`
            )
            .join("") +
        "</ul>";

    document.getElementById("notes").innerHTML = listHTML;
};

const deleteNote = (timestamp) => {
    if (!db) {
        console.error("База данных не готова.");
        return;
    }

    const tx = db.transaction(["notes"], "readwrite");
    const store = tx.objectStore("notes");

    const req = store.index("timestamp").getKey(timestamp);

    req.onsuccess = (event) => {
        const key = req.result;

        if (key !== undefined) {
            store.delete(key);

            tx.oncomplete = () => {
                getAndDisplayNotes(db);
                alert("Запись успешно удалена.");
            };

            tx.onerror = (event) => {
                console.error("Ошибка при удалении заметки " + event.target.errorCode);
            };
        }
    };
};
