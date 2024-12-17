const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Configuração do banco de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // ajuste conforme seu usuário do MySQL
    password: '',  // ajuste conforme sua senha do MySQL
    database: 'ong_esperanca'
});

// Conexão com o banco de dados
db.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao banco de dados MySQL');
});

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Configuração do Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
// Configuração para servir a pasta 'uploads' como estática
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/slide', express.static(path.join(__dirname, 'views', 'slide')));

// Página inicial (home)
app.get('/home', (req, res) => {
    res.render('home');
});

// Página de Pagamento (Quero Ajudar)
app.get('/pagamento', (req, res) => {
    res.render('pagamento'); // Crie a página pagamento.ejs
});
// Página de Resgate
app.get('/resgate', (req, res) => {
    res.render('resgate'); // Crie a página resgate.ejs
});
// Página FAQ
app.get('/faq', (req, res) => {
    res.render('faq'); // Crie a página faq.ejs
});
// Rota para exibir o formulário e os animais
app.get('/', (req, res) => {
    db.query('SELECT * FROM animais', (err, animaisResults) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Erro ao buscar animais.');
        }
        db.query('SELECT * FROM doacoes ORDER BY data DESC', (err, doacoesResults) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Erro ao buscar doações.');
            }
            res.render('admin', { 
                animais: animaisResults, 
                doacoes: doacoesResults 
            });
        });
    });
});



app.get('/verificar-doacoes', (req, res) => {
    db.query('SELECT * FROM doacoes', (err, doacoesResults) => {
        if (err) throw err;
        res.render('recibos', { doacoes: doacoesResults });
    });
});


// Rota para adicionar um novo animal
app.post('/add-animal', upload.single('foto'), (req, res) => {
    const { nome, idade, sexo, tipo } = req.body;
    const foto = req.file.filename;
    const query = 'INSERT INTO animais (nome, idade, sexo, tipo, foto) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [nome, idade, sexo, tipo, foto], (err, results) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Rota para editar um animal
app.post('/edit-animal', (req, res) => {
    const { id, nome, idade, sexo, tipo } = req.body;
    const query = 'UPDATE animais SET nome = ?, idade = ?, sexo = ?, tipo = ? WHERE id = ?';
    db.query(query, [nome, idade, sexo, tipo, id], (err, results) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Rota para excluir um animal
app.post('/delete-animal', (req, res) => {
    const { id } = req.body;
    const query = 'DELETE FROM animais WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Rota para adotar um animal
app.post('/adopt-animal', (req, res) => {
    const { id } = req.body;
    const query = 'UPDATE animais SET adotado = 1 WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Rota para mostrar os animais disponíveis para adoção
app.get('/animais', (req, res) => {
    db.query('SELECT * FROM animais WHERE adotado = 0', (err, results) => {
        if (err) throw err;
        res.render('animais', { animais: results });
    });
});
// Rota para adotar um animal
app.post('/adotar/:id', (req, res) => {
    const id = req.params.id;

    // Atualizar o banco de dados para marcar o animal como adotado
    db.query('UPDATE animais SET adotado = 1 WHERE id = ?', [id], (err, result) => {
        if (err) throw err;
        res.redirect('/animais'); // Redirecionar para a lista de animais
    });
});


// Rota para a página de animais doados
app.get('/animais-doados', (req, res) => {
    // Agora vamos buscar os animais que foram adotados (adotado = 1)
    db.query('SELECT * FROM animais WHERE adotado = 1', (err, results) => {
        if (err) {
            console.log('Erro ao buscar os animais doados:', err);
            res.status(500).send('Erro ao buscar os animais');
        } else {
            // Passa os resultados para o template EJS
            res.render('doados', { animais: results });
        }
    });
});

// Rota para processar a doação
app.post('/doar', (req, res) => {
    const { valor, nome, email } = req.body;

    // Converte o valor para formato decimal com 2 casas
    const valorConvertido = parseFloat(valor.replace(/\./g, '').replace(',', '.'));

    // Insere os dados na tabela de doações
    db.query('INSERT INTO doacoes (valor, nome, email) VALUES (?, ?, ?)', [valorConvertido, nome, email], (err, result) => {
        if (err) {
            console.error('Erro ao inserir no banco de dados:', err);
            return res.status(500).send('Erro ao processar a doação');
        }

        // Redireciona para uma página de agradecimento ou sucesso
        res.send('Doação registrada com sucesso!');
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
