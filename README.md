# Projeto: Aplicação com cadastro e autenticação de usuários integrando frontend, backend e persistência


![Substitua a imagem ao lado por um GIF/WEBP animado mostrando seu projeto](./moho_follow_through2.gif "GIF animado do projeto. Imagem temporária de Moho Animation https://moho.lostmarble.com/products/moho-pro-special-halls-head-college")



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

Renata:

### Trechos de código

Substitua este texto por uma indicação de pelo menos 3 trechos de código que você(s) queira(m) destacar para a turma (por exemplo, para explicar algo que aprendeu, para alertar sobre alguma dificuldade de compreensão, para mostrar uma curiosidade, etc).


## Tecnologias

### Linguagens e afins

Substitua este texto por uma lista detalhada de tecnologias utilizadas:
- React + TypeScript + Vite
- Node.js + Express + TypeScript
- PostgreSQL + Prisma

### Autenticação e autorização

Substitua este texto por uma descrição de como foram implementadas a autenticação e a autorização (session? token?).

### Ambiente de desenvolvimento

- VS Code
- ...

## Referências e créditos

Substitua este trecho por uma lista bem detalhada de todo material consultado para ajudar no projeto, por exemplo:  URLs de vídeos ou outro material consultado, créditos para colegas que colaboraram, geradores de código, etc.
- ...
- ...




---
Projeto entregue para a disciplina de [Desenvolvimento de Software para a Web](http://github.com/andreainfufsm/elc1090-2026b) em 2026b