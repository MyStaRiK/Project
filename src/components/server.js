const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');

const app = express();

app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Конфигурация подключения к базе данных
const pool = new Pool({
    user: 'vadev',
    host: 'localhost',
    database: 'epos',
    password: '12345',
    port: 9512
});

// Утилита для выполнения запросов к базе данных
const executeQuery = async (query, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
};

// Предполагается, что вы используете Express.js и функцию executeQuery
app.get('/scenario_authorization/users/:userId', async (req, res) => {
  const { userId } = req.params;

  // Простая валидация: проверка, что userId числовой
  if (!/^\d+$/.test(userId)) {
    return res.status(400).json({ message: 'Неверный формат userId' });
  }

  try {
    const query = `
      SELECT user_id, email 
      FROM scenario_authorization.users
      WHERE user_id = $1
    `;

    const data = await executeQuery(query, [userId]);

    if (data.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(data[0]);
  } catch (err) {
    console.error('Ошибка при получении пользователя:', err);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});


// ===============================
//     SCENARIO_ONTOLOGY
// ===============================

// 1) Все классы
app.get('/scenario_ontology/class', async (req, res) => {
  try {
    const query = 'SELECT id, name FROM scenario_ontology.class';
    const data = await executeQuery(query);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

// 2) Характеристики для класса (связи из characteristic_of_class)
app.get('/scenario_ontology/characteristic_of_class/:class_id', async (req, res) => {
  const { class_id } = req.params;
  try {
    const query = `
      SELECT 
        coc.id AS char_of_class_id,  
        c.id   AS characteristic_id, 
        c.name AS characteristic_name, 
        cl.name AS class_name
      FROM scenario_ontology.characteristic_of_class coc
      JOIN scenario_ontology.characteristic c 
        ON coc.characteristic_id = c.id
      JOIN scenario_ontology.class cl 
        ON coc.class_id = cl.id
      WHERE cl.id = $1;
    `;
    const data = await executeQuery(query, [class_id]);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

app.get('/scenario_ontology/scale_of_char_of_class/:char_of_class_id', async (req, res) => {
  try {
    const { char_of_class_id } = req.params;
    // 1. Ищем characteristic_id в characteristic_of_class
    const [cocRow] = await executeQuery(
      `
        SELECT characteristic_id
        FROM scenario_ontology.characteristic_of_class
        WHERE id = $1
      `,
      [char_of_class_id]
    );

    if (!cocRow) {
      return res.status(404).json({ error: 'Не найдена запись characteristic_of_class с таким ID' });
    }
    const characteristic_id = cocRow.characteristic_id;

    // 2. Ищем все записи scale_of_characteristic, где characteristic_id = тот самый
    const query = `
      SELECT 
        soc.id AS scale_of_char_id, 
        s.id   AS scale_id,
        s.name AS scale_name,
        COALESCE(array_agg(lv.name ORDER BY lv.name) FILTER (WHERE lv.name IS NOT NULL), '{}') AS explanations
      FROM scenario_ontology.scale_of_characteristic soc
      JOIN scenario_ontology.scale s ON soc.scale_id = s.id
      LEFT JOIN scenario_ontology.literal_value_of_scale lvs ON s.id = lvs.scale_id
      LEFT JOIN scenario_ontology.literal_values lv ON lvs.value_id = lv.id
      WHERE soc.characteristic_id = $1
      GROUP BY soc.id, s.id, s.name
      ORDER BY s.name;
    `;
    const data = await executeQuery(query, [characteristic_id]);

    res.json(data);
  } catch (err) {
    console.error('Ошибка при получении шкал:', err);
    res.status(500).send('Ошибка сервера');
  }
});

// Эндпоинт для получения шкал с пояснениями для конкретной характеристики
app.get('/scenario_ontology/scale_of_characteristic/:characteristic_id', async (req, res) => {
  try {
    const { characteristic_id } = req.params;
    const query = `
      SELECT 
        soc.id AS scale_of_char_id, 
        s.id AS scale_id,
        s.name AS scale_name,
        COALESCE(array_agg(lv.name ORDER BY lv.name) FILTER (WHERE lv.name IS NOT NULL), '{}') AS explanations
      FROM scenario_ontology.scale_of_characteristic soc
      JOIN scenario_ontology.scale s ON soc.scale_id = s.id
      LEFT JOIN scenario_ontology.literal_value_of_scale lvs ON s.id = lvs.scale_id
      LEFT JOIN scenario_ontology.literal_values lv ON lvs.value_id = lv.id
      WHERE soc.characteristic_id = $1
      GROUP BY soc.id, s.id, s.name
      ORDER BY s.name;
    `;
    const data = await executeQuery(query, [characteristic_id]);
    res.json(data);
  } catch (err) {
    console.error('Ошибка при получении шкал с пояснениями:', err);
    res.status(500).send('Ошибка сервера при получении шкал с пояснениями');
  }
});

app.get('/scenario_ontology/scale', async (req, res) => {
  try {
    const query = 'SELECT id, name FROM scenario_ontology.scale';
    const data = await executeQuery(query);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

app.get('/scenario_ontology/characteristic', async (req, res) => {
  try {
    const query = 'SELECT id, name FROM scenario_ontology.characteristic';
    const data = await executeQuery(query);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

// список literal_values
app.get('/scenario_ontology/literal_values', async (req, res) => {
  try {
    const query = 'SELECT id, name FROM scenario_ontology.literal_values';
    const data = await executeQuery(query);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

app.get('/scenario_ontology/characteristic_of_class', async (req, res) => {
  try {
    const query = `
      SELECT 
        coc.id,
        c.name AS characteristic_name,
        cl.name AS class_name,
        coc.priority,
        coc.collection
      FROM scenario_ontology.characteristic_of_class coc
      JOIN scenario_ontology.characteristic c ON coc.characteristic_id = c.id
      JOIN scenario_ontology.class cl ON coc.class_id = cl.id;
    `;
    const data = await executeQuery(query);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

app.get('/scenario_ontology/class/:class_id', async (req, res) => {
  const { class_id } = req.params;
  try {
    const query = 'SELECT id, name FROM scenario_ontology.class WHERE id = $1';
    const data = await executeQuery(query, [class_id]);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

// шкалы + их значения
app.get('/scenario_ontology/literal_value_of_scale', async (req, res) => {
  try {
    const query = `
      SELECT 
        coc.id,
        c.name AS literal_values_name,
        cl.name AS scale_name
      FROM scenario_ontology.literal_value_of_scale coc
      JOIN scenario_ontology.literal_values c ON coc.value_id = c.id
      JOIN scenario_ontology.scale cl ON coc.scale_id = cl.id;
    `;
    const data = await executeQuery(query);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

app.get('/scenario_ontology/literal_value_of_scale/:scale_id', async (req, res) => {
  const { scale_id } = req.params;
  try {
    const query = `
      SELECT 
        lv.id AS valueId,
        lv.name AS literal_values_name
      FROM scenario_ontology.literal_value_of_scale lvs
      JOIN scenario_ontology.literal_values lv ON lvs.value_id = lv.id
      WHERE lvs.scale_id = $1
      ORDER BY lv.name;
    `;
    const data = await executeQuery(query, [scale_id]);
    res.json(data); // Возвращаем список пояснений для шкалы
  } catch (err) {
    console.error('Ошибка при получении пояснений шкалы:', err);
    res.status(500).send('Ошибка сервера');
  }
});

app.get('/scenario_ontology/literal_value_of_scale_by_name/:scale_name', async (req, res) => {
  const { scale_name } = req.params;
  try {
    const query = `
      SELECT 
        lv.id AS valueId,
        lv.name AS literal_values_name
      FROM scenario_ontology.literal_value_of_scale lvs
      JOIN scenario_ontology.literal_values lv ON lvs.value_id = lv.id
      JOIN scenario_ontology.scale s ON lvs.scale_id = s.id
      WHERE s.name = $1
      ORDER BY lv.name;
    `;
    const data = await executeQuery(query, [scale_name]);
    
    if (data.length === 0) {
      return res.status(404).json({ message: 'Пояснения для шкалы не найдены' });
    }

    res.json(data); // Возвращаем список пояснений для шкалы
  } catch (err) {
    console.error('Ошибка при получении пояснений шкалы:', err);
    res.status(500).json({ message: 'Внутренняя ошибка сервера', error: err.message });
  }
});


app.get('/scenario_ontology/scale_of_characteristic/:scale_id', async (req, res) => {
  const { scale_id } = req.params;
  try {
    const query = `
      SELECT 
        coc.id,
        c.name AS characteristic_name,
        cl.name AS scale_name
      FROM scenario_ontology.scale_of_characteristic coc
      JOIN scenario_ontology.characteristic c ON coc.characteristic_id = c.id
      JOIN scenario_ontology.scale cl ON coc.scale_id = cl.id
      WHERE cl.id = $1;
    `;
    const data = await executeQuery(query, [scale_id]);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

app.get('/scenario_ontology/characteristic/:characteristic_id', async (req, res) => {
  const { characteristic_id } = req.params;
  try {
    const query = `SELECT id, name FROM scenario_ontology.characteristic WHERE id = $1;`;
    const data = await executeQuery(query, [characteristic_id]);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

app.get('/scenario_ontology/literal_values/:literal_values_id', async (req, res) => {
  const { literal_values_id } = req.params;
  try {
    const query = `SELECT id, name FROM scenario_ontology.literal_values WHERE id = $1;`;
    const data = await executeQuery(query, [literal_values_id]);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

// это был пробный запрос по фильтрации посимвольно
app.get('/scenario_ontology/filter/classes/:key', async (req, res) => {
  const { key } = req.params;
  try {
    const query = `SELECT id, name FROM scenario_ontology.class WHERE name ILIKE '%' || $1 || '%';`;
    const data = await executeQuery(query, [key]);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

app.get('/scenario_data/project_data/:project_id', async (req, res) => {
  const { project_id } = req.params;

  try {

    const query = `
      SELECT 
        scenario_ontology.class.id                     AS "classId",
        scenario_ontology.class.name                   AS "className",
        scenario_ontology.characteristic.name          AS "characteristicName",
        scenario_data.object_data.char_of_class_id     AS "charOfClassId",
        scenario_ontology.scale.name                   AS "scaleName",
        scenario_data.object_data.scale_of_char_id     AS "scaleOfCharId",
        scenario_data.object_data.type_of_text         AS "typeOfText",
        qtc.text_id                                    AS "mainTextOfClassId",
        qt.text                                        AS "mainTextOfClass"
      FROM scenario_data.object_data
      JOIN scenario_data.class_of_project 
          ON scenario_data.object_data.class_in_project_id = scenario_data.class_of_project.id
      JOIN scenario_ontology.class
          ON scenario_data.class_of_project.class_id = scenario_ontology.class.id
      JOIN scenario_ontology.characteristic_of_class coc
          ON scenario_data.object_data.char_of_class_id = coc.id
      JOIN scenario_ontology.characteristic
          ON coc.characteristic_id = scenario_ontology.characteristic.id
      LEFT JOIN scenario_ontology.scale_of_characteristic soc
          ON scenario_data.object_data.scale_of_char_id = soc.id
      LEFT JOIN scenario_ontology.scale
          ON soc.scale_id = scenario_ontology.scale.id
      LEFT JOIN scenario_dialog_ontology.question_text_of_class qtc
          ON scenario_data.object_data.main_text_of_class = qtc.id
      LEFT JOIN scenario_dialog_ontology.question_text qt
          ON qtc.text_id = qt.id
      WHERE scenario_data.class_of_project.project_id = $1
    `;
    const data = await executeQuery(query, [project_id]);
    res.json(data);
  } catch (err) {
    console.error('Ошибка при получении project_data:', err);
    res.status(500).json({ error: 'Ошибка сервера при получении project_data' });
  }
});


// ============= Регистрация / Логин / Профиль пользователей =============
app.post('/scenario_authorization/register', async (req, res) => {
  try {
    const { email, login, password } = req.body;
    // 1) Проверка email
    let query = 'SELECT user_id FROM scenario_authorization.users WHERE email = $1';
    let data = await executeQuery(query, [email]);
    if (data.length > 0) {
      return res.status(400).json({ error: 'Такой Email уже зарегистрирован' });
    }

    // 2) Проверка login
    query = 'SELECT user_id FROM scenario_authorization.users WHERE login = $1';
    data = await executeQuery(query, [login]);
    if (data.length > 0) {
      return res.status(400).json({ error: 'Такой логин уже существует' });
    }

    query = `
      INSERT INTO scenario_authorization.users (email, login, password)
      VALUES ($1, $2, $3)
      RETURNING user_id
    `;
    data = await executeQuery(query, [email, login, password]);
    const newUserId = data[0].user_id;

    // Устанавливаем куку
    res.cookie('userId', newUserId, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, userId: newUserId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

app.post('/scenario_authorization/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let query = `
      SELECT user_id, password, login
      FROM scenario_authorization.users
      WHERE email = $1
    `;
    let data = await executeQuery(query, [email]);
    if (data.length === 0) {
      return res.status(400).json({ error: 'Пользователь с такой почтой не найден' });
    }
    const user = data[0];
    if (user.password !== password) {
      return res.status(400).json({ error: 'Неверный пароль' });
    }

    res.cookie('userId', user.user_id, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, userId: user.user_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

app.get('/scenario_authorization/profile', async (req, res) => {
  const userId = req.cookies.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  try {
    const query = `
      SELECT user_id, email, login, login
      FROM scenario_authorization.users
      WHERE user_id = $1
    `;
    const data = await executeQuery(query, [userId]);
    if (data.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера при получении профиля' });
  }
});

app.put('/scenario_authorization/profile', async (req, res) => {
  const userId = req.cookies.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  try {
    const { newEmail, newLogin, oldPassword, newPassword } = req.body;

    // 1) Проверим текущий пароль
    let query = `
      SELECT password FROM scenario_authorization.users
      WHERE user_id = $1
    `;
    let data = await executeQuery(query, [userId]);
    if (data.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    const currentPass = data[0].password;
    if (oldPassword !== currentPass) {
      return res.status(400).json({ error: 'Старый пароль неверен' });
    }

    // 2) Проверим, что новый Email не занят
    if (newEmail) {
      query = 'SELECT user_id FROM scenario_authorization.users WHERE email = $1';
      data = await executeQuery(query, [newEmail]);
      if (data.length > 0 && data[0].user_id !== Number(userId)) {
        return res.status(400).json({ error: 'Такой Email уже зарегистрирован' });
      }
    }

    // 3) Проверим, что новый login не занят
    if (newLogin) {
      query = 'SELECT user_id FROM scenario_authorization.users WHERE login = $1';
      data = await executeQuery(query, [newLogin]);
      if (data.length > 0 && data[0].user_id !== Number(userId)) {
        return res.status(400).json({ error: 'Такой логин уже существует' });
      }
    }

    // 4) Выполним UPDATE
    let updateEmail = newEmail || null;
    let updateLogin = newLogin || null;
    let updatePass = newPassword || currentPass;

    query = `
      UPDATE scenario_authorization.users
      SET email = COALESCE($1, email),
          login = COALESCE($2, login),
          password = $3
      WHERE user_id = $4
    `;
    await executeQuery(query, [updateEmail, updateLogin, updatePass, userId]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера при обновлении профиля' });
  }
});

app.delete('/scenario_authorization/profile', async (req, res) => {
  const userId = req.cookies.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  try {
    const query = 'DELETE FROM scenario_authorization.users WHERE user_id = $1';
    await executeQuery(query, [userId]);

    // Сразу чистим куку
    res.clearCookie('userId');
    res.clearCookie('userEmail');
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера при удалении профиля' });
  }
});

app.post('/scenario_authorization/logout', (req, res) => {
  res.clearCookie('userId');
  res.clearCookie('userEmail');
  res.json({ success: true });
});

// ============= Запросы на получение/создание проектов =============
app.get('/scenario_authorization/projects', async (req, res) => {
  const userId = req.cookies.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  try {
    const query = `
      SELECT 
        id_project AS id,
        name,
        date_of_create AS "createdAt",
        date_of_edit AS "updatedAt"
      FROM scenario_authorization.projects
      WHERE id_user = $1
      ORDER BY date_of_edit DESC;
    `;
    const projects = await executeQuery(query, [userId]);

    if (projects.length === 0) {
      return res.json({ message: 'У вас пока нет проектов' });
    }

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера при получении проектов' });
  }
});

app.post('/scenario_authorization/projects', async (req, res) => {
  const userId = req.cookies.userId;
  const { name } = req.body;
  const today = new Date().toISOString().split('T')[0];

  if (!userId) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  try {
    const projectName = name || 'Новый проект';
    const query = `
      INSERT INTO scenario_authorization.projects (id_user, name, date_of_create, date_of_edit)
      VALUES ($1, $2, $3, $3)
      RETURNING id_project AS id, name, date_of_create AS createdAt, date_of_edit AS updatedAt;
    `;
    const result = await executeQuery(query, [userId, projectName, today]);
    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Ошибка при создании проекта:', err);
    res.status(500).json({ error: 'Ошибка сервера при создании проекта' });
  }
});

// ============= Обновление названия проекта (PUT) =============
app.put('/scenario_authorization/projects/:projectId', async (req, res) => {
  const userId = req.cookies.userId;
  const { projectId } = req.params;
  const { name } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  try {
    // Проверка принадлежности
    const checkQuery = `
      SELECT id_project
      FROM scenario_authorization.projects
      WHERE id_project = $1 AND id_user = $2
    `;
    const projectCheck = await executeQuery(checkQuery, [projectId, userId]);
    if (projectCheck.length === 0) {
      return res.status(404).json({ error: 'Проект не найден или принадлежит другому пользователю' });
    }

    const updateQuery = `
      UPDATE scenario_authorization.projects
      SET name = $1,
          date_of_edit = NOW()
      WHERE id_project = $2
      RETURNING id_project AS "id", name, date_of_create AS "createdAt", date_of_edit AS "updatedAt";
    `;
    const updatedProject = await executeQuery(updateQuery, [name, projectId]);
    if (updatedProject.length === 0) {
      return res.status(404).json({ error: 'Проект не найден' });
    }

    res.json(updatedProject[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера при обновлении проекта' });
  }
});

// ============= Получение одного проекта =============
app.get('/scenario_authorization/projects/:projectId', async (req, res) => {
  const userId = req.cookies.userId;
  const { projectId } = req.params;

  if (!userId) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  try {
    const query = `
      SELECT 
        id_project AS id,
        name,
        date_of_create AS "createdAt",
        date_of_edit AS "updatedAt"
      FROM scenario_authorization.projects
      WHERE id_project = $1
        AND id_user = $2
    `;
    const result = await executeQuery(query, [projectId, userId]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Проект не найден или не принадлежит пользователю' });
    }

    const project = result[0];
    res.json({
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    });
  } catch (err) {
    console.error('Ошибка при получении проекта:', err);
    res.status(500).json({ error: 'Ошибка сервера при получении проекта' });
  }
});

// ============= Сохранение классов/характеристик (POST /scenario_data/project_data) =============
app.post('/scenario_data/project_data', async (req, res) => {
  const userId = req.cookies.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  const {
    projectId,
    classes // [{ classId, description, characteristics: [{ charOfClassId, scaleOfCharacteristicId, ... }, ... ] }]
  } = req.body;

  if (!projectId || !Array.isArray(classes)) {
    return res.status(400).json({ error: 'Неверные данные для сохранения' });
  }

  const client = await pool.connect();
  try {
    // 1) Проверяем, что проект принадлежит userId
    const checkProjectQuery = `
      SELECT id_project
      FROM scenario_authorization.projects
      WHERE id_project = $1 AND id_user = $2
    `;
    const checkResult = await client.query(checkProjectQuery, [projectId, userId]);
    if (checkResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Проект не найден или не принадлежит пользователю' });
    }

    await client.query('BEGIN');

    // 2) Загружаем текущие class_of_project
    const currentClassesQuery = `
      SELECT id, class_id
      FROM scenario_data.class_of_project
      WHERE project_id = $1
    `;
    const currentClassesResult = await client.query(currentClassesQuery, [projectId]);
    const currentMap = new Map();
    currentClassesResult.rows.forEach(row => {
      currentMap.set(row.class_id, {
        copId: row.id,
        classId: row.class_id
      });
    });

    const newClassIds = classes.map(c => c.classId);

    // 3) Удаляем лишние классы, если какие-то были раньше
    for (const [classId, obj] of currentMap.entries()) {
      if (!newClassIds.includes(classId)) {
        // Удаляем object_data
        await client.query(`
          DELETE FROM scenario_data.object_data
          WHERE class_in_project_id = $1
        `, [obj.copId]);

        await client.query(`
          DELETE FROM scenario_data.class_of_project
          WHERE id = $1
        `, [obj.copId]);
      }
    }

    // 4) Добавляем / обновляем нужные классы
    for (const cls of classes) {
      const { classId, description, characteristics } = cls;
      let classOfProjectId;

      if (!currentMap.has(classId)) {
        // Вставляем новую запись в class_of_project
        const insertCopQuery = `
          INSERT INTO scenario_data.class_of_project (project_id, class_id, description)
          VALUES ($1, $2, $3)
          RETURNING id
        `;
        const ins = await client.query(insertCopQuery, [
          projectId,
          classId,
          description || null
        ]);
        classOfProjectId = ins.rows[0].id;
      } else {
        // Обновляем description, если нужно
        classOfProjectId = currentMap.get(classId).copId;
        const updateCopQuery = `
          UPDATE scenario_data.class_of_project
          SET description = $1
          WHERE id = $2
        `;
        await client.query(updateCopQuery, [description || null, classOfProjectId]);
      }

      if (!Array.isArray(characteristics)) continue;

      // 5) Загружаем текущие object_data
      const currentODQuery = `
        SELECT id, char_of_class_id
        FROM scenario_data.object_data
        WHERE class_in_project_id = $1
      `;
      const currentODResult = await client.query(currentODQuery, [classOfProjectId]);
      const odMap = new Map();
      currentODResult.rows.forEach(row => {
        odMap.set(row.char_of_class_id, row.id);
      });

      const newCharIds = characteristics.map(ch => ch.charOfClassId);

      // Удаляем лишние записи object_data
      for (const [charId, odId] of odMap.entries()) {
        if (!newCharIds.includes(charId)) {
          await client.query(`
            DELETE FROM scenario_data.object_data
            WHERE id = $1
          `, [odId]);
        }
      }

      // 6) Вставляем / обновляем характеристики
      for (const charObj of characteristics) {
        const {
          charOfClassId,          // = coc.id (characteristic_of_class)
          scaleOfCharacteristicId, // = soc.id (scale_of_characteristic)
          typeOfText,
          mainTextOfClass
        } = charObj;

        if (!odMap.has(charOfClassId)) {
          // Новая запись
          const insertODQuery = `
            INSERT INTO scenario_data.object_data
              (char_of_class_id, scale_of_char_id, class_in_project_id, type_of_text, main_text_of_class)
            VALUES ($1, $2, $3, $4, $5)
          `;
          await client.query(insertODQuery, [
            charOfClassId,                 // <== CHAR_OF_CLASS_ID
            scaleOfCharacteristicId || null, // <== SCALE_OF_CHAR_ID
            classOfProjectId,
            typeOfText || null,
            mainTextOfClass || null
          ]);
        } else {
          // Обновляем
          const odId = odMap.get(charOfClassId);
          const updateODQuery = `
            UPDATE scenario_data.object_data
            SET scale_of_char_id = $1,
                type_of_text = $2,
                main_text_of_class = $3
            WHERE id = $4
          `;
          await client.query(updateODQuery, [
            scaleOfCharacteristicId || null,
            typeOfText || null,
            mainTextOfClass || null,
            odId
          ]);
        }
      }
    }

    await client.query('COMMIT');
    client.release();
    return res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    client.release();
    console.error('Ошибка сохранения project_data:', err);
    return res.status(500).json({ error: 'Ошибка сервера при сохранении project_data' });
  }
});

// ============= Полное удаление проекта (с зависимыми данными) =============
app.delete('/scenario_authorization/projects/:projectId', async (req, res) => {
  const userId = req.cookies.userId;
  const { projectId } = req.params;
  if (!userId) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Проверяем принадлежность
    const checkQuery = `
      SELECT id_project
      FROM scenario_authorization.projects
      WHERE id_project = $1 AND id_user = $2
    `;
    const checkRes = await client.query(checkQuery, [projectId, userId]);
    if (checkRes.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ error: 'Проект не найден или не принадлежит пользователю' });
    }

    // Удаляем object_data
    await client.query(`
      DELETE FROM scenario_data.object_data
      USING scenario_data.class_of_project
      WHERE scenario_data.object_data.class_in_project_id = scenario_data.class_of_project.id
        AND scenario_data.class_of_project.project_id = $1
    `, [projectId]);

    await client.query(`
      DELETE FROM scenario_data.class_of_project
      WHERE project_id = $1
    `, [projectId]);

    // Удаляем сам проект
    const delQuery = `
      DELETE FROM scenario_authorization.projects
      WHERE id_project = $1 AND id_user = $2
    `;
    const result = await client.query(delQuery, [projectId, userId]);
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ error: 'Проект не найден или не принадлежит пользователю' });
    }

    await client.query('COMMIT');
    client.release();
    res.json({ success: true, message: 'Проект и все связанные данные успешно удалены' });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    client.release();
    console.error('Ошибка при удалении проекта:', err);
    res.status(500).json({ error: 'Ошибка сервера при удалении проекта' });
  }
});

// Эндпоинт для получения шкал с пояснениями
app.get('/scenario_ontology/scales_with_explanations', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.id, 
        s.name, 
        COALESCE(array_agg(lv.name ORDER BY lv.name) FILTER (WHERE lv.name IS NOT NULL), '{}') AS explanations
      FROM scenario_ontology.scale s
      LEFT JOIN scenario_ontology.literal_value_of_scale lvs ON s.id = lvs.scale_id
      LEFT JOIN scenario_ontology.literal_values lv ON lvs.value_id = lv.id
      GROUP BY s.id, s.name
      ORDER BY s.name;
    `;
    const data = await executeQuery(query);
    res.json(data);
  } catch (err) {
    console.error('Ошибка при получении шкал с пояснениями:', err);
    res.status(500).send('Ошибка сервера при получении шкал с пояснениями');
  }
});

// Новый эндпоинт
app.get('/scenario_ontology/literal_value_of_scale_of_char/:soc_id', async (req, res) => {
  const { soc_id } = req.params;
  try {
    // 1) Находим scale_id из scale_of_characteristic
    const socRows = await executeQuery(
      `SELECT scale_id FROM scenario_ontology.scale_of_characteristic WHERE id = $1`,
      [soc_id]
    );
    if (!socRows.length) {
      return res.status(404).json({ error: 'Не найдена запись scale_of_characteristic.id=' + soc_id });
    }
    const realScaleId = socRows[0].scale_id; // например, 1

    // 2) Ищем пояснения из literal_value_of_scale
    const query = `
      SELECT 
        lv.id AS valueId,
        lv.name AS literal_values_name
      FROM scenario_ontology.literal_value_of_scale lvs
      JOIN scenario_ontology.literal_values lv ON lvs.value_id = lv.id
      WHERE lvs.scale_id = $1
      ORDER BY lv.name;
    `;
    const data = await executeQuery(query, [realScaleId]);
    res.json(data);
  } catch (err) {
    console.error('Ошибка при получении пояснений шкалы по scale_of_char_id:', err);
    res.status(500).send('Ошибка сервера');
  }
});

// Редактор текста

app.get('/scenario_dialog_ontology/questions_of_class/:className', async (req, res) => {
  try {
    const { className } = req.params; // Извлекаем параметр className из req.params
    const query = `
      SELECT 
        qtc.id AS question_text_of_class_id,
        qt.text AS question_text
      FROM 
        scenario_dialog_ontology.question_text_of_class qtc
      JOIN 
        scenario_dialog_ontology.question_text qt ON qtc.text_id = qt.id
      JOIN 
        scenario_ontology.class c ON qtc.class_id = c.id
      WHERE 
        c.name = $1
      ORDER BY 
        qt.text;
    `;
    const data = await executeQuery(query, [className]); // Передаем className как параметр
    res.json(data);
  } catch (err) {
    console.error('Ошибка при получении вопросов по имени класса:', err);
    res.status(500).send('Ошибка сервера при получении вопросов по имени класса');
  }
});

app.get('/scenario_dialog_ontology/questions_of_characteristic/:characteristicName', async (req, res) => {
  try {
    const { characteristicName } = req.params;
    const { typeId } = req.query; // Извлекаем typeId из query-параметров

    // Валидация typeId (если он передан)
    let parsedTypeId;
    if (typeId !== undefined) {
      parsedTypeId = parseInt(typeId, 10);
      if (isNaN(parsedTypeId)) {
        return res.status(400).send('Invalid typeId. It must be a number.');
      }
    }

    // Начинаем формировать SQL-запрос
    let query = `
      SELECT 
          qtr.id AS question_text_of_req_id,
          at.text AS additional_text,
          char_table.name AS characteristic_name
      FROM 
          scenario_dialog_ontology.question_text_of_req qtr
      JOIN 
          scenario_dialog_ontology.additional_text at ON qtr.id_add_text = at.id
      JOIN 
          scenario_ontology.characteristic char_table ON qtr.id_req = char_table.id
      WHERE 
          char_table.name = $1
    `;

    const params = [characteristicName];

    // Если typeId передан, добавляем дополнительное условие
    if (parsedTypeId !== undefined) {
      query += ` AND qtr.id_type_of_question = $2`;
      params.push(parsedTypeId);
    }

    query += ` ORDER BY at.text;`;

    const data = await executeQuery(query, params);
    res.json(data);
  } catch (err) {
    console.error('Ошибка при получении дополнительных текстов по названию характеристики:', err);
    res.status(500).send('Ошибка сервера при получении дополнительных текстов по названию характеристики');
  }
});

// 2. Маршрут для получения дополнительных текстов по названию шкалы с дополнительной фильтрацией по typeId
app.get('/scenario_dialog_ontology/additional_texts_of_scale/:scaleName', async (req, res) => {
  try {
    const { scaleName } = req.params;
    const { typeId } = req.query; // Извлекаем typeId из query-параметров

    // Валидация typeId (если он передан)
    let parsedTypeId;
    if (typeId !== undefined) {
      parsedTypeId = parseInt(typeId, 10);
      if (isNaN(parsedTypeId)) {
        return res.status(400).send('Invalid typeId. It must be a number.');
      }
    }

    let query = `
      SELECT 
          qts.id AS question_text_of_scale_id,
          at.text AS additional_text,
          s.id AS scale_id,
          s.name AS scale_name
      FROM 
          scenario_dialog_ontology.question_text_of_scale qts
      JOIN 
          scenario_dialog_ontology.additional_text at ON qts.id_add_text = at.id
      JOIN 
          scenario_ontology.scale s ON qts.id_scale = s.id
      WHERE 
          s.name = $1
    `;

    const params = [scaleName];

    if (parsedTypeId !== undefined) {
      query += ` AND qts.id_type_of_question = $2`;
      params.push(parsedTypeId);
    }

    query += ` ORDER BY at.text;`;

    const data = await executeQuery(query, params);
    res.json(data);
  } catch (err) {
    console.error('Ошибка при получении дополнительных текстов по названию шкалы:', err);
    res.status(500).send('Ошибка сервера при получении дополнительных текстов по названию шкалы');
  }
});

app.get('/scenario_dialog_ontology/question_types/', async (req, res) => {
  try {
    const {} = req.params;
    const query = `
      SELECT 
        id, text AS type_text
      FROM 
        scenario_dialog_ontology.type_of_question
      ORDER BY 
        text;
    `;
    const data = await executeQuery(query); // Используем ID в качестве параметра
    res.json(data);
  } catch (err) {
    console.error('Ошибка при получении типа вопросов по ID:', err);
    res.status(500).send('Ошибка сервера при получении типа вопросов по ID');
  }
});

app.get('/scenario_dialog_ontology/questions_of_class/id/:questionTextOfClassId', async (req, res) => {
  try {
    const { questionTextOfClassId } = req.params; // Извлекаем параметр questionTextOfClassId из req.params

    // Проверяем, что переданный ID является числом
    const parsedId = parseInt(questionTextOfClassId, 10);
    if (isNaN(parsedId)) {
      return res.status(400).send('Invalid questionTextOfClassId. It must be a number.');
    }

    const query = `
      SELECT 
        qtc.id AS question_text_of_class_id,
        qt.text AS question_text
      FROM 
        scenario_dialog_ontology.question_text_of_class qtc
      JOIN 
        scenario_dialog_ontology.question_text qt ON qtc.text_id = qt.id
      JOIN 
        scenario_ontology.class c ON qtc.class_id = c.id
      WHERE 
        qtc.id = $1
      ORDER BY 
        qt.text;
    `;
    const data = await executeQuery(query, [parsedId]); // Передаем questionTextOfClassId как параметр
    res.json(data);
  } catch (err) {
    console.error('Ошибка при получении вопросов по question_text_of_class_id:', err);
    res.status(500).send('Ошибка сервера при получении вопросов по question_text_of_class_id');
  }
});

// 3. Маршрут для получения вопросов по ID характеристики с дополнительной фильтрацией по typeId
app.get('/scenario_dialog_ontology/questions_of_characteristic/id/:characteristicId', async (req, res) => {
  try {
    const { characteristicId } = req.params;
    const { typeId } = req.query; // Извлекаем typeId из query-параметров

    const parsedCharacteristicId = parseInt(characteristicId, 10);
    if (isNaN(parsedCharacteristicId)) {
      return res.status(400).send('Invalid characteristicId. It must be a number.');
    }

    // Валидация typeId (если он передан)
    let parsedTypeId;
    if (typeId !== undefined) {
      parsedTypeId = parseInt(typeId, 10);
      if (isNaN(parsedTypeId)) {
        return res.status(400).send('Invalid typeId. It must be a number.');
      }
    }

    let query = `
      SELECT 
        qtr.id AS question_text_of_req_id,
        at.text AS additional_text,
        char_table.name AS characteristic_name
      FROM 
        scenario_dialog_ontology.question_text_of_req qtr
      JOIN 
        scenario_dialog_ontology.additional_text at ON qtr.id_add_text = at.id
      JOIN 
        scenario_ontology.characteristic char_table ON qtr.id_req = char_table.id
      WHERE 
        qtr.id = $1
    `;

    const params = [parsedCharacteristicId];

    if (parsedTypeId !== undefined) {
      query += ` AND qtr.id_type_of_question = $2`;
      params.push(parsedTypeId);
    }

    query += ` ORDER BY at.text;`;

    const data = await executeQuery(query, params);
    res.json(data);
  } catch (err) {
    console.error('Ошибка при получении дополнительных текстов по characteristicId:', err);
    res.status(500).send('Ошибка сервера при получении дополнительных текстов по characteristicId');
  }
});

// 4. Маршрут для получения дополнительных текстов по ID шкалы с дополнительной фильтрацией по typeId
app.get('/scenario_dialog_ontology/additional_texts_of_scale/id/:scaleId', async (req, res) => {
  try {
    const { scaleId } = req.params;
    const { typeId } = req.query; // Извлекаем typeId из query-параметров

    const parsedScaleId = parseInt(scaleId, 10);
    if (isNaN(parsedScaleId)) {
      return res.status(400).send('Invalid scaleId. It must be a number.');
    }

    // Валидация typeId (если он передан)
    let parsedTypeId;
    if (typeId !== undefined) {
      parsedTypeId = parseInt(typeId, 10);
      if (isNaN(parsedTypeId)) {
        return res.status(400).send('Invalid typeId. It must be a number.');
      }
    }

    let query = `
      SELECT 
        qts.id AS question_text_of_scale_id,
        at.text AS additional_text,
        s.id AS scale_id,
        s.name AS scale_name
      FROM 
        scenario_dialog_ontology.question_text_of_scale qts
      JOIN 
        scenario_dialog_ontology.additional_text at ON qts.id_add_text = at.id
      JOIN 
        scenario_ontology.scale s ON qts.id_scale = s.id
      WHERE 
        qts.id = $1
    `;

    const params = [parsedScaleId];

    if (parsedTypeId !== undefined) {
      query += ` AND qts.id_type_of_question = $2`;
      params.push(parsedTypeId);
    }

    query += ` ORDER BY at.text;`;

    const data = await executeQuery(query, params);
    res.json(data);
  } catch (err) {
    console.error('Ошибка при получении дополнительных текстов по scaleId:', err);
    res.status(500).send('Ошибка сервера при получении дополнительных текстов по scaleId');
  }
});


app.post('/scenario_data/project_texts/save', async (req, res) => {
  const { texts } = req.body;

  if (!Array.isArray(texts)) {
    return res.status(400).json({ error: 'Неверные данные для сохранения' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const text of texts) {
      const {
        id, // Идентификатор записи, если он существует
        classInProjectId,
        textOfClassId,
        typeOfQuestion,
        textOfCharId,
        textOfScaleId,
      } = text;

      if (id) {
        // Обновление существующей записи
        const updateQuery = `
          UPDATE scenario_data.text_for_class_in_project
          SET
            type_of_question = $1,
            text_of_char_id = $2,
            text_of_scale_id = $3
          WHERE id = $4
        `;

        await client.query(updateQuery, [
          typeOfQuestion || null,
          textOfCharId || null,
          textOfScaleId || null,
          id,
        ]);
      } else {
        // Вставка новой записи
        const insertQuery = `
          INSERT INTO scenario_data.text_for_class_in_project (
            class_in_project_id,
            text_of_class_id,
            type_of_question,
            text_of_char_id,
            text_of_scale_id
          )
          VALUES ($1, $2, $3, $4, $5)
        `;

        await client.query(insertQuery, [
          classInProjectId,
          textOfClassId || null,
          typeOfQuestion || null,
          textOfCharId || null,
          textOfScaleId || null,
        ]);
      }
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Ошибка при сохранении данных проекта:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  } finally {
    client.release();
  }
});

app.get('/Interview/scenario_json/:projectid', async (req, res) => {
  const { projectid } = req.params; // Извлекаем параметр из маршрута
  try {
    const query = `
WITH project_info AS (
  SELECT 
    id_project AS "projectId", 
    name AS "projectName"
  FROM scenario_authorization.projects
  WHERE id_project = $1
),
project_classes AS (
  SELECT 
    cop.id AS "copId",
    cop.project_id,
    cop.class_id,
    cop.description,
    c.name AS "className"
  FROM scenario_data.class_of_project cop
  JOIN scenario_ontology.class c ON cop.class_id = c.id
  WHERE cop.project_id = $1
),
class_selections AS (
  SELECT 
    od.class_in_project_id AS "copId",
    od.char_of_class_id AS "charOfClassId",
    ch.name AS "characteristicName",
    od.scale_of_char_id AS "scaleOfCharId",
    s.name AS "scaleName",
    od.type_of_text AS "typeOfText",
    qtc.id AS "mainTextOfClassId",
    qt.text AS "mainTextOfClass"
  FROM scenario_data.object_data od
  JOIN scenario_ontology.characteristic_of_class coc ON od.char_of_class_id = coc.id
  JOIN scenario_ontology.characteristic ch ON coc.characteristic_id = ch.id
  LEFT JOIN scenario_ontology.scale_of_characteristic soc ON od.scale_of_char_id = soc.id
  LEFT JOIN scenario_ontology.scale s ON soc.scale_id = s.id
  LEFT JOIN scenario_dialog_ontology.question_text_of_class qtc ON od.main_text_of_class = qtc.id
  LEFT JOIN scenario_dialog_ontology.question_text qt ON qtc.text_id = qt.id
),
project_questions AS (
  SELECT 
    q.id AS "questionId",
    q.id_type_of_question,
    tot.text AS "questionType",
    q.id_class_text,
    qt.text AS "classText",
    q.id_req_text,
    at_req.text AS "reqText",
    q.id_scale_text,
    at_scale.text AS "scaleText"
  FROM scenario_dialog_ontology.questions q
  LEFT JOIN scenario_dialog_ontology.type_of_question tot 
    ON q.id_type_of_question = tot.id
  LEFT JOIN scenario_dialog_ontology.question_text_of_class qtc 
    ON q.id_class_text = qtc.id
  LEFT JOIN scenario_dialog_ontology.question_text qt 
    ON qtc.text_id = qt.id
  LEFT JOIN scenario_dialog_ontology.question_text_of_req qtr 
    ON q.id_req_text = qtr.id
  LEFT JOIN scenario_dialog_ontology.additional_text at_req 
    ON qtr.id_add_text = at_req.id
  LEFT JOIN scenario_dialog_ontology.question_text_of_scale qts 
    ON q.id_scale_text = qts.id
  LEFT JOIN scenario_dialog_ontology.additional_text at_scale 
    ON qts.id_add_text = at_scale.id
  WHERE q.project_id = $1
)
SELECT json_build_object(
  'projectId', pi."projectId",
  'projectName', pi."projectName",
  'classes', (
    SELECT json_agg(
      json_build_object(
        'classId', pc.class_id,
        'className', pc."className",
        'selections', (
          SELECT json_agg(
            json_build_object(
              'charOfClassId', cs."charOfClassId",
              'characteristicName', cs."characteristicName",
              'scaleOfCharId', cs."scaleOfCharId",
              'scaleName', cs."scaleName"
            )
          )
          FROM class_selections cs
          WHERE cs."copId" = pc."copId"
        )
      )
    )
    FROM project_classes pc
    WHERE pc.project_id = pi."projectId"
  ),
  'questions', (
    SELECT json_agg(
      json_build_object(
        'questionId', q."questionId",
        'questionTypeId', q.id_type_of_question,
        'questionType', q."questionType",
        'classText', json_build_object(
           'id', q.id_class_text,
           'text', q."classText"
        ),
        'characteristicText', json_build_object(
           'id', q.id_req_text,
           'text', q."reqText"
        ),
        'scaleText', json_build_object(
           'id', q.id_scale_text,
           'text', q."scaleText"
        )
      )
    )
    FROM project_questions q
  )
) AS result
FROM project_info pi;
    `;
    const data = await executeQuery(query, [projectid]); // Передаём projectid как параметр
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No data found for given projectid' });
    }
    res.status(200).json(data[0].result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
