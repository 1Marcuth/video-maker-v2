<h1 align="center">Video Maker V2 - "Evolução"</h1>

<p align="center">
    <img alt="Robot image" src="https://media.discordapp.net/attachments/1112536362411884664/1116188752038088704/image.png">
</p>

---

## Projeto original

O projeto original foi feito pelo YouTuber [Filipe Deschamps](https://www.youtube.com/@FilipeDeschamps) em sua série de vídeos [4 robôs que criam vídeos no YouTube](https://www.youtube.com/watch?v=kjhu1LEmRpY&list=PLMdYygf53DP4YTVeu0JxVnWq01uXrLwHi) onde ele ensina passo a passo do zero de como criar os robôs.

<p align="center">
    <img alt="Video thumbnail" src="https://cdn.discordapp.com/attachments/1042970956928397315/1116386416159621222/68747470733a2f2f692e7974696d672e636f6d2f76692f6b6a6875314c456d5270592f68713732302e6a70673f7371703d2d6f61796d774563434f6743454d6f425346587971347170417734494152554141496843474146774163414242673d3d2672733d414f6e34434c44712d564c7759586e3656356e507338712d32614f44315153657441.png">
</p>

---

## Este projeto

Este projeto foi baseado em uma versão anterior que eu fiz ([aqui](https://github.com/1Marcuth/video-maker)) assistindo a série do [Filipe Deschamps](https://www.youtube.com/@FilipeDeschamps) porém com algumas alterações por conta que eu quis escrever um código mais moderno e não conseguia ter acesso à certas ferramentas como o *Watson*, *Algorithmia*, *Adobe After Effects* seja por indisponibilidade, requirimento de cartão de crédito ou por eu ter que pagar um software em si.
<p align="center">
    <img alt="My YouTube channel" src="https://cdn.discordapp.com/attachments/1042970956928397315/1116385836699754558/image.png">
</p>

---

### Novas funcionalidades

- **Empacotamento:** Agora toda vez que terminar de criar um vídeo a pasta com os arquivos será compactada e liberará espaço para um novo vídeo ser criado.
- **Configuração:** Agora você pode configurar o bot para gerar conteúdos em outros idiomas e demais especificações.
- **Voz sinterizada:** Como o pessoal já havia proposto em algum momento do desenvolvimento do projeto eu decidi implementar isso também.
- **Google Trends:** Essa também o pessoal já havia proposto a implementação, aí eu também implementei aqui.
- **ChatGPT:** Agora isso foi inédito! Eu pensei assim "Cara... isso seria beeemm MASSA! Preciso implementar!!!". Ele funcionará como um segundo provedor de conteúdos.

---

### Novo Robô!

Agora por conta da voz sintética foi necessário criar um robô específico para manipular os áudios do vídeo, a música e a voz. também adicionei mais músicas para ficar mais interessante e a escolha delas é feita de forma aleatória.

---

### Segurança

Por motivos de sergurança optei por usar um aquivo `.env` para armazenar as chaves de API e outros quaisquer dados sensíveis ou de configuração.

---

### Extras

- **`makeLogger()`** Fiz uma função que cria um logger para e usa o nome dele ao invés de toda vez ter que usar o `console.log("> [my-robot] Starting...")` usar o `logger.log("Starting...")`.
- **`getContentFromWikipedia()`** Busca conteúdos do Wikipédia pelo nome da página.
- **`extractKeywords()`** Extrai palavras-chave de um texto usando uma API gratuita.

Consulte a pasta de `utils` para conferir as outras funcionalidades.

---

### Esclarecimentos

- Eu não sou o cara que liga muito da forma que eu faço os commits (tenho preguiça de organizar isso).

---

### Ideias

- [ ] Adicionar IA que gera imagens como o [Stable Diffuson](https://stablediffusionweb.com/) servir como um sergundo provedor de imagens.
- [x] Adicionar um provedor de geração de áudios com uma voz mais realista.
- [ ] Reescrever esse código JavaScript em código TypeScript.
- [ ] Adicionar uma API de traduções para ser usada em caso se não encontrar uma página da Wikipédia na língua desejada, pegando o conteúdo de uma página em outro idioma e traduzindo para o idioma desejado.

---

## Objetivos

- **Por quê?** Cara, implementar isso é muito massa.
- **Para quê?** Gosto de testar novas tecnologias e ver os avanços na nossa área.

---

## Exemplos

Canal no YouTube com exemplos de vídeos gerados: https://www.youtube.com/@knowtheworldwithmarcuth

---

## Como rodar esse projeto?

---

### Clonar projeto

Navegue até a pasta que você deseja que o projeto fique e rode o seguinte comando:

```
git clone https://github.com/1Marcuth/video-maker-v2.git .
```

---

### Instalando bibliotecas

Molezinha! Só rodar esse comando

```
npm i
```

---

### Configurar variáveis de ambiente

Na raiz do projeto crie um arquivo `.env` com o seguinte conteúdo, claro não esquecendo de substituir cada campo pelo seu respectivo valor (não darei detalhes aqui de como conseguir cada um deles, dê uma pesquisada se tiver dúvida). 

```
OPENAI_KEY = "YOUR_API_KEY_HERE"
RAPIDAPI_KEY = "YOUR_API_KEY_HERE"
GOOGLE_SEARCH_KEY = "YOUR_API_KEY_HERE"
GOOGLE_SEARCH_ENGINE_ID = "YOUR_ENGINE_ID_HERE"
RUNNING_IN = "local"
```

Não se esqueça de criar uma pasta na raiz do projeto com o nome de `credentials` para armazenar as credenciais da sua aplicação do YouTube. Use o nome de `google-youtube.json` pra esse arquivo.

---

### Como criar vídeos?

Fácil. Comece executando este comando para começar:

```
npm start
```
