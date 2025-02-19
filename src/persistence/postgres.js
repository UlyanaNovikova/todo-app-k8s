const { Pool } = require('pg');
let pool;

// Переменные окружения для подключения к базе данных
const {
    PGHOST: HOST,
    PGUSER: USER,
    PGPASSWORD: PASSWORD,
    PGDATABASE: DB,
} = process.env;

// Инициализация пула соединений с PostgreSQL
async function init() {
    // Создание пула соединений с переданными параметрами
    pool = new Pool({
        host: HOST,
        user: USER,
        password: PASSWORD,
        database: DB,
    });

    // Подключение к базе данных и создание таблицы, если она не существует
    await pool.connect();

    return new Promise((acc, rej) => {
        pool.query(
            'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean)',
            (err) => {
                if (err) return rej(err);

                console.log(`Connected to postgres db at host ${HOST}`);
                acc();
            },
        );
    });
}

// Окончание работы с базой данных и закрытие пула соединений
async function teardown() {
    return new Promise((acc, rej) => {
        pool.end((err) => {
            if (err) rej(err);
            else acc();
        });
    });
}

// Получение всех элементов todo из базы данных
async function getItems() {
    return new Promise((acc, rej) => {
        pool.query('SELECT * FROM todo_items', (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.rows.map((item) =>
                    Object.assign({}, item, {
                        completed: item.completed === 1 || item.completed === true,
                    }),
                ),
            );
        });
    });
}

// Получение одного элемента todo по ID
async function getItem(id) {
    return new Promise((acc, rej) => {
        pool.query('SELECT * FROM todo_items WHERE id=$1', [id], (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.rows.map((item) =>
                    Object.assign({}, item, {
                        completed: item.completed === 1 || item.completed === true,
                    }),
                )[0],
            );
        });
    });
}

// Сохранение нового элемента todo в базе данных
async function storeItem(item) {
    return new Promise((acc, rej) => {
        pool.query(
            'INSERT INTO todo_items (id, name, completed) VALUES ($1, $2, $3)',
            [item.id, item.name, item.completed ? 1 : 0],
            (err) => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

// Обновление элемента todo в базе данных по ID
async function updateItem(id, item) {
    return new Promise((acc, rej) => {
        pool.query(
            'UPDATE todo_items SET name=$1, completed=$2 WHERE id=$3',
            [item.name, item.completed ? 1 : 0, id],
            (err) => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

// Удаление элемента todo по ID
async function removeItem(id) {
    return new Promise((acc, rej) => {
        pool.query('DELETE FROM todo_items WHERE id = $1', [id], (err) => {
            if (err) return rej(err);
            acc();
        });
    });
}

module.exports = {
    init,
    teardown,
    getItems,
    getItem,
    storeItem,
    updateItem,
    removeItem,
};
