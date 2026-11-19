# Previsão do Tempo

Aplicação web desenvolvida para a disciplina de **Programação Web** (UESPI, Curso de Tecnologia em Sistemas de Computação, professor Eyder Rios), 2ª Avaliação, Problema 05.

## Integrantes

| Nome | Matrícula |
|---|---|
| Marcos Samuel Cornelio Barros | 2025027554 |
| Ian Caio Pinheiro da Frota | 2025012391 |

## Descrição

Aplicação que permite buscar cidades pelo nome, consultar as condições atuais e a previsão para os próximos 7 dias e manter uma lista de cidades favoritas, com rótulo personalizado.

O backend e o frontend ficam no mesmo projeto Next.js. O frontend se comunica com o backend exclusivamente por requisições HTTP aos endpoints em `app/api/`. Somente o backend acessa a API externa e o banco de dados.

## Principais funcionalidades

- Busca de cidades pelo nome.
- Condições atuais (temperatura, sensação térmica, umidade, vento e descrição) e previsão de 7 dias (data, descrição, temperatura mínima e máxima, amplitude térmica e precipitação).
- Tradução dos códigos meteorológicos WMO para descrições em português.
- Cidades favoritas: adicionar, listar, editar o rótulo (até 30 caracteres) e remover.
- Validação de parâmetros, respostas de erro padronizadas e estados de carregamento, vazio e erro na interface.
- Interface responsiva e acessível, com atribuição da fonte dos dados.

## API externa utilizada

**Open-Meteo** (Forecast API e Geocoding API), com dados licenciados sob [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast: `https://api.open-meteo.com/v1/forecast`
- Documentação: https://open-meteo.com/en/docs

## Endpoints do backend

| Método | Rota | Finalidade |
|---|---|---|
| GET | `/api/cities?name=<texto>` | Buscar cidades pelo nome |
| GET | `/api/weather/[latitude]/[longitude]` | Retornar as condições atuais e a previsão de 7 dias |
| GET | `/api/favorite-cities` | Listar as cidades favoritas |
| POST | `/api/favorite-cities` | Incluir uma cidade favorita |
| PATCH | `/api/favorite-cities/[id]` | Atualizar o rótulo de uma cidade favorita |
| DELETE | `/api/favorite-cities/[id]` | Remover uma cidade favorita |

### Parâmetros

**`GET /api/cities`**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `name` (query) | string | Nome da cidade, obrigatório, com no mínimo 2 caracteres |

**`GET /api/weather/[latitude]/[longitude]`**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `latitude` (rota) | número | Entre -90 e 90 |
| `longitude` (rota) | número | Entre -180 e 180 |

**`POST /api/favorite-cities`** (corpo JSON)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `name` | string | sim | Nome da cidade |
| `region` | string | sim | Estado ou região e país |
| `latitude` | número | sim | Entre -90 e 90 |
| `longitude` | número | sim | Entre -180 e 180 |
| `label` | string ou null | não | Rótulo, até 30 caracteres |

**`PATCH /api/favorite-cities/[id]`** (corpo JSON)

| Campo | Tipo | Descrição |
|---|---|---|
| `label` | string ou null | Único campo editável. Até 30 caracteres; vazio ou `null` remove o rótulo |

O `id` da rota é o identificador do registro no banco local.

### Formato das respostas

Exemplo de `GET /api/cities?name=Teresina`:

```json
[
  { "name": "Teresina", "region": "Piauí, Brasil", "latitude": -5.08917, "longitude": -42.80194 }
]
```

Exemplo de `GET /api/weather/-5.08917/-42.80194`:

```json
{
  "latitude": -5.08917,
  "longitude": -42.80194,
  "current": {
    "time": "2026-11-18T14:00",
    "temperature": 33.1,
    "apparentTemperature": 36.4,
    "humidity": 55,
    "windSpeed": 12.3,
    "description": "Parcialmente nublado"
  },
  "daily": [
    {
      "date": "2026-11-18",
      "description": "Chuva fraca",
      "temperatureMin": 23.4,
      "temperatureMax": 34.2,
      "temperatureRange": 10.8,
      "precipitation": 1.2
    }
  ]
}
```

Os valores acima são ilustrativos. `daily` contém 7 itens e `temperatureRange` é calculada no backend (`temperatureMax - temperatureMin`).

Formato único de erro:

```json
{ "error": "Mensagem descritiva em português" }
```

### Códigos de status

| Código | Situação |
|---|---|
| 200 | Consulta ou atualização realizada com sucesso |
| 201 | Cidade favorita criada |
| 204 | Cidade favorita removida |
| 400 | Parâmetro, corpo ou campo editável ausente ou inválido |
| 404 | Cidade favorita inexistente |
| 409 | Cidade já cadastrada nos favoritos (mesma latitude e longitude) |
| 502 | Falha na comunicação com a Open-Meteo |
| 500 | Erro interno |

## Banco de dados

- **SGBD:** SQLite, por meio da biblioteca `better-sqlite3`.
- **Arquivo:** `data/app.db`, criado automaticamente na primeira execução e ignorado pelo Git.
- **Journal:** modo padrão (`DELETE`). O modo WAL **não** é utilizado, então todo o banco fica em um único arquivo.
- **Consultas:** todas parametrizadas (prepared statements).
- **Reset:** para restaurar o estado inicial, pare a aplicação, apague `data/app.db` e execute `npm run dev` novamente.

### Tabela `favorite_cities`

| Coluna | Tipo | Restrições | Editável |
|---|---|---|---|
| `id` | INTEGER | chave primária, autoincremento | não |
| `name` | TEXT | NOT NULL | não |
| `region` | TEXT | NOT NULL | não |
| `latitude` | REAL | NOT NULL | não |
| `longitude` | REAL | NOT NULL | não |
| `label` | TEXT | opcional, até 30 caracteres | sim |
| `created_at` | TEXT | NOT NULL, padrão `datetime('now')`, preenchido pelo backend | não |

Restrição `UNIQUE (latitude, longitude)`: impede cadastrar a mesma cidade duas vezes.

Apenas dados criados pelo usuário são gravados. Os dados meteorológicos nunca são copiados para o banco: são consultados na Open-Meteo a cada requisição. O banco guarda somente o nome, a região e as coordenadas necessários para listar os favoritos.

### Registros iniciais

Definidos em um único local (`lib/db.ts`, constante `SEED`) e inseridos **somente** quando o arquivo do banco é criado.

| name | region | latitude | longitude | label |
|---|---|---|---|---|
| Parnaíba | Piauí, Brasil | -2.9055 | -41.7734 | Casa |
| Teresina | Piauí, Brasil | -5.08917 | -42.80194 | (vazio) |
| São Paulo | São Paulo, Brasil | -23.5475 | -46.6361 | Trabalho |
| Lisboa | Lisboa, Portugal | 38.7167 | -9.1333 | (vazio) |
| Tóquio | Tóquio, Japão | 35.6895 | 139.6917 | Viagem |

Há registros com rótulo preenchido e vazio.

## Estrutura do projeto

```
app/
  api/
    cities/route.ts                              # GET: busca de cidades
    weather/[latitude]/[longitude]/route.ts      # GET: clima atual e previsão
    favorite-cities/route.ts                     # GET, POST
    favorite-cities/[id]/route.ts                # PATCH, DELETE
  page.tsx                                       # busca de cidades
  favorites/page.tsx                             # cidades favoritas
  weather/[latitude]/[longitude]/                # página da cidade (rota dinâmica)
lib/
  db.ts            # conexão SQLite, criação da tabela e registros iniciais
  open-meteo.ts    # acesso à API externa
  wmo.ts           # códigos WMO -> descrições em português
  validation.ts    # validação de coordenadas, id e rótulo
  http.ts          # resposta de erro padronizada
data/              # app.db (gerado automaticamente)
```

## Tecnologias

- Next.js 16 (App Router, Route Handlers)
- React
- TypeScript (modo estrito, `"strict": true`)
- Tailwind CSS
- SQLite com `better-sqlite3`
- `fetch` nativo

## Versão do Node.js

Node.js **24.11.0**.

## Como executar

```bash
npm install
npm run dev
```

Acesse http://localhost:3000. Na primeira execução, o banco `data/app.db` é criado automaticamente com os registros iniciais.

## Créditos

Dados meteorológicos fornecidos pela [Open-Meteo](https://open-meteo.com/), licenciados sob CC BY 4.0.