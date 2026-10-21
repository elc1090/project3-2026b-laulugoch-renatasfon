# Projeto: Aplicação com cadastro e autenticação de usuários integrando frontend, backend e persistência


<img width="1340" height="576" alt="ecosme" src="https://github.com/user-attachments/assets/5b77c08f-177f-4a3e-a603-6a20c31e11a2" />



## Acesso

[Deploy](http://empresa-frontend.onrender.com)


## Desenvolvedoras
Lauren Auth Lugoch - Sistemas de Informação

Renata de Souza de Fonseca - Sistemas de Informação


## Proposta
Sistema de informações em colaboração com turma de Administração (Chile):

A proposta é desenvolver o SOSTENPYME, uma plataforma web pensada para apoiar pequenas e médias empresas na identificação de oportunidades de melhoria relacionadas à sustentabilidade. Por meio de um diagnóstico, a empresa poderá compreender melhor sua situação em diferentes dimensões e, a partir dos resultados, definir ações de melhoria que poderão ser organizadas e acompanhadas pela própria plataforma.


## Desenvolvimento

### Processo

Trabalhamos em dupla, dividindo as tarefas para desenvolver partes diferentes da aplicação e depois integrá-las, porém estudamos e idealizamos juntas a parte da autenticação dos usuários. Mantivemos contato com o grupo do Chile, onde eles nos mandavam os requisitos desejados e nós implementávamos. Também mandamos uma versão intermediária da aplicação, onde recebemos feedbacks e pedidos de algumas alterações na lógica principal das perguntas e cálculo do dignóstico. Quando a especificação mudou na etapa final, ajustamos o backend e as telas para atender ao novo escopo.

Lauren: Decidimos utilizar Docker, por recomendação da professora, o que facilita o acesso ao banco sem precisar instalar nada na mão. Fiquei responsável pela criação do back e front iniciais, bem como a implementação inicial do banco e Prisma. Tive um pouco de dificuldade com o Prisma a principio, pois estava dando erro com a versão que eu havia instalado, mas logo consegui resolver o problema. 

Eu não sabia como um login funciona por dentro, então fui procurando entender como cada parte funcionava. Aprendi que a senha nunca é guardada, mas que o banco guarda só uma versão embaralhada dela, que não dá para desfazer. Quando a pessoa entra, o servidor entrega o token, que o navegador mostra a cada pedido seguinte. Também entendi como funciona a proteção, e que o servidor confere o token antes de responder qualquer coisa privada. Para ter certeza de que funcionava eu testei de propósito alguns casos que deveriam dar errado, como pedir dados sem estar logada, usar um token inexistente, cadastrar o mesmo e-mail duas vezes e tentar ver o diagnóstico de outra empresa, e todos foram bloqueados.

Com a estrutura do sistema funcionando, comecei a desenvolver a lógica do diagnóstico. Na primeira versão, trabalhei com a estrutura inicial do diagnóstico e com o cálculo das pontuações. Depois, precisei adaptar a implementação quando o grupo do Chile enviou a especificação definitiva. O número de perguntas mudou de 25 para 9, as dimensões passaram de cinco para três e a escala de respostas foi alterada para 0, 5 e 10 pontos. Para isso, precisei atualizar os dados armazenados, as regras de validação e as fórmulas que estavam sendo utilizadas para calcular os resultados.

Depois do diagnóstico, implementei a lógica que transforma os pontos obtidos em um plano de ação. A ideia é verificar a pontuação em cada uma das dimensões e, quando ela estiver abaixo de 60, associar uma ação corretiva com descrição da atividade. Quando a pontuação atinge ou ultrapassa esse limite, foi decidido pelo grupo parceiro em apenas apresentar uma mensagem de reforço positivo para a empresa.

Renata: Além de estudar e implementar junto com a Lauren a parte de autenticação e autorização, também conversamos sobre como criar e manter a lógica de pontuação do diagnóstico. Fiquei responsável principalmente pelo desenvolvimento do frontend, incluindo as telas de login e cadastro de empresas. Durante essa etapa, aprendi melhor como o token de autenticação é utilizado na aplicação. Após o login, o token recebido do backend fica armazenado no navegador por meio do `sessionStorage`. Quando a empresa tenta acessar uma funcionalidade protegida, como o diagnóstico, o frontend envia esse token junto com a requisição ao backend. O servidor, por sua vez, verifica se o token é válido e identifica a empresa que está fazendo a solicitação, permitindo ou negando o acesso conforme as permissões. Com isso, compreendi melhor como o frontend participa do processo de autenticação e como o token permite controlar o acesso às funcionalidades do sistema.

Também fui responsável pelo deploy inicial da aplicação, para disponibilizar um protótipo ao grupo do Chile. Escolhemos utilizar o Render porque tanto eu quanto a Lauren já tínhamos familiaridade com a plataforma. Durante esse processo, descobri que o frontend, o backend e o banco de dados eram disponibilizados separadamente, algo que eu ainda não entendia. Por esse motivo, inicialmente tive dificuldades para carregar as perguntas do diagnóstico, pois a URL de conexão com o banco de dados não estava configurada corretamente no ambiente de produção. Para compreender o problema, utilizei a IA como apoio na tradução e interpretação das mensagens de erro, o que me ajudou a identificar a necessidade de corrigir a URL nas variáveis de ambiente do backend. Após esse ajuste, consegui estabelecer a conexão corretamente e permitir que o sistema acessasse e processasse as perguntas do diagnóstico

### Trechos de código

1. Autorização pelo dono do dado

O empresaId vem do token (colocado em res.locals.userId pelo middleware) e nunca do corpo da requisição. Se a empresa B pedir o diagnóstico da empresa A, a consulta não encontra nada e a resposta é 404, como se ele não existisse:

```ts
const diagnostico = await prisma.diagnostico.findFirst({
  where: { id, empresaId: res.locals.userId },
  include: { respostas: { include: { pergunta: true } } },
});

if (!diagnostico) {
  res.status(404).json({ error: "Diagnóstico não encontrado" });
  return;
}
```

2. Middleware de autenticação

Barra qualquer requisição sem token válido antes de a rota executar. Esconder botões no React não protege nada, e é aqui que a proteção de fato acontece:

```ts
const userId = verifyToken(header.slice(7));

if (userId === null) {
  res.status(401).json({ error: "Token inválido ou expirado" });
  return;
}

res.locals.userId = userId;
next();
```

3. Migration que remove valores de um enum

O PostgreSQL não remove valores de um enum, então o Prisma recria o tipo, e isso falha se ainda houver dados com os valores antigos. Acrescentei à mão, no topo do arquivo gerado, a limpeza dos dados do modelo antigo (a ordem respeita as chaves estrangeiras):

```sql
DELETE FROM "Resposta";
DELETE FROM "Diagnostico";
DELETE FROM "Pergunta";
```

## Tecnologias

### Linguagens e afins

Substitua este texto por uma lista detalhada de tecnologias utilizadas:
- React + TypeScript + Vite
- Node.js + Express + TypeScript
- PostgreSQL + Prisma

### Autenticação e autorização

A aplicação utiliza autenticação baseada em tokens JWT, sem manter uma sessão tradicional no servidor.

No cadastro, o backend valida os dados recebidos, gera um hash da senha com bcryptjs e armazena as informações da empresa no PostgreSQL. No login, compara a senha informada com o hash armazenado e, se as credenciais forem válidas, gera um token JWT.

O frontend armazena o token na sessionStorage e o envia nas requisições protegidas por meio do cabeçalho Authorization: Bearer. Ao recarregar a página, consulta o backend para verificar a autenticação e recuperar os dados da empresa.

A autorização é realizada no backend. Um middleware verifica o token antes de permitir o acesso às rotas protegidas, e as consultas aos diagnósticos consideram o identificador da empresa autenticada. Assim, uma empresa não pode acessar os diagnósticos de outra apenas alterando o identificador enviado na requisição.


### Ambiente de desenvolvimento

- VS Code


## Referências e créditos

Substitua este trecho por uma lista bem detalhada de todo material consultado para ajudar no projeto, por exemplo:  URLs de vídeos ou outro material consultado, créditos para colegas que colaboraram, geradores de código, etc.
- ...
- ...




---
Projeto entregue para a disciplina de [Desenvolvimento de Software para a Web](http://github.com/andreainfufsm/elc1090-2026b) em 2026b
