# File Uploader

Aplicação de transferência de arquivos por TCP, desenvolvida em Node.js com os módulos nativos `net` e `fs`.

O projeto possui um cliente que envia um arquivo para um servidor e um servidor que recebe os dados, acompanha o progresso e salva o arquivo no diretório `storage`.

## Funcionalidades

- Transferência de arquivos por uma conexão TCP.
- Envio do nome e do tamanho do arquivo antes dos dados.
- Exibição do progresso do upload no cliente.
- Gravação do arquivo recebido no servidor.
- Controle de fluxo com `pause`, `resume` e `drain` para evitar sobrecarga dos streams.
- Nenhuma dependência externa.

## Tecnologias

- Node.js
- JavaScript
- Módulo `net`
- Módulo `fs/promises`

## Estrutura do projeto

```text
.
├── client.js       # Cliente responsável pelo envio do arquivo
├── server.js       # Servidor TCP responsável pelo recebimento
├── constants.js    # Endereço do servidor utiligitzado pelo cliente
└── storage/        # Diretório onde os arquivos recebidos são salvos
```

## Pré-requisitos

- Node.js instalado.
- Conectividade de rede entre o cliente e o servidor.
- Permissão para ler o arquivo no cliente.
- Permissão para criar e gravar arquivos no servidor.

Não é necessário executar `npm install`, pois o projeto utiliza apenas módulos nativos do Node.js.

## Configuração

### Endereço do servidor

O cliente utiliza o endereço definido em [`constants.js`](./constants.js):

```js
module.exports.BASE_URL = "ec2-54-232-112-116.sa-east-1.compute.amazonaws.com";
```

Substitua esse valor pelo hostname ou endereço IP da máquina que executará o servidor.

O servidor está configurado em [`server.js`](./server.js) para escutar na porta `5050` e no endereço `172.31.29.201`. Esse endereço também deve ser ajustado quando necessário para refletir a rede do ambiente de execução.

### Diretório de armazenamento

Antes de iniciar o servidor, crie o diretório `storage` na raiz do projeto caso ainda não exista:

```bash
mkdir storage
```

Os arquivos recebidos serão salvos nessa pasta.

## Como executar

### 1. Inicie o servidor

Na máquina que receberá os arquivos, execute:

```bash
node server.js
```

Quando iniciado corretamente, o servidor ficará aguardando conexões TCP na porta `5050`.

### 2. Envie um arquivo pelo cliente

Em outro terminal, execute:

```bash
node client.js caminho/para/o/arquivo.ext
```

Exemplo:

```bash
node client.js ./files/documento.pdf
```

O cliente exibirá as mensagens de progresso retornadas pelo servidor:

```text
Progress: 25.00%
Progress: 50.00%
Progress: 75.00%
Progress: 100.00%
File sucessfully uploaded
```

Após o término da transferência, o arquivo estará disponível no diretório `storage` do servidor.

## Protocolo de comunicação

O cliente inicia a comunicação enviando um cabeçalho no formato:

```text
nome-do-arquivo|tamanho-em-bytes-----
```

Por exemplo:

```text
documento.pdf|1048576-----
```

O separador `-----` indica o fim do cabeçalho e o início do conteúdo do arquivo. Em seguida, o cliente envia os dados em blocos TCP. O servidor grava os blocos e envia o percentual de progresso de volta ao cliente.

## Funcionamento dos componentes

### Servidor

O [`server.js`](./server.js):

1. Cria um servidor TCP.
2. Aceita uma conexão na porta `5050`.
3. Interpreta o nome e o tamanho do arquivo.
4. Abre um stream de escrita em `storage`.
5. Grava os dados recebidos.
6. Informa o progresso do upload.
7. Finaliza o arquivo quando a conexão é encerrada.

### Cliente

O [`client.js`](./client.js):

1. Recebe o caminho do arquivo pela linha de comando.
2. Obtém o nome e o tamanho do arquivo.
3. Abre uma conexão TCP com o servidor.
4. Envia o cabeçalho e o conteúdo do arquivo.
5. Exibe as mensagens recebidas do servidor.
6. Encerra a conexão após concluir o envio.

## Limitações conhecidas

Esta versão é uma implementação inicial e ainda não possui:

- Autenticação ou autorização.
- Criptografia dos dados.
- Validação de nomes e caminhos de arquivos.
- Recuperação ou retomada de uploads interrompidos.
- Verificação de integridade do arquivo recebido.
- Tratamento completo de erros de rede e de sistema de arquivos.
- Configuração por variáveis de ambiente.
- Testes automatizados.
- Suporte a múltiplos uploads simultâneos com controle de sessão.

Por isso, a aplicação deve ser utilizada em um ambiente controlado e não deve ser exposta diretamente à internet sem camadas adicionais de segurança.
