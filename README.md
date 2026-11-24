# Projeto final


![Substitua a imagem ao lado por um GIF/WEBP animado mostrando seu projeto](./moho_follow_through2.gif "GIF animado do projeto. Imagem temporária de Moho Animation https://moho.lostmarble.com/products/moho-pro-special-halls-head-college")



## Acesso

[Deploy](http://empresa-frontend.onrender.com)


## Desenvolvedor(a) / Desenvolvedor(es/as)
Lauren Auth Lugoch - Sistemas de Informação

Renata de Souza de Fonseca - Sistemas de Informação


## Proposta

Para o projeto 4, propomos dar continuidade ao desenvolvimento do sistema em colaboração com a equipe no Chile, porém incluindo login federado com Google e IA como serviço dentro dos planos de ação, além de outros módulos extras no EcoSME.


## Desenvolvimento

### Processo

Para o Projeto 4, decidimos dar continuidade à aplicação que desenvolvemos no Projeto 3, mantendo as tecnologias que já utilizávamos e acrescentando novas funcionalidades. Continuamos trabalhando em dupla, dividindo algumas tarefas e mantendo contato com o grupo do Chile, que nos enviou os requisitos das novas funcionalidades. Para as duas principais funcionalidades, implementação do login federado com Google e integração de IA como serviço, pensamos e planejamos juntas como queríamos os fluxos e de que forma desenvolveríamos.

Lauren: Comecei pela implementação do login federado e, como nunca havia trabalhado com esse tipo de autenticação, analisei o exemplo disponibilizado pela professora. Porém, como ele utilizava algumas tecnologias diferentes, precisei adaptar para a nossa estrutura com postgreSQL, prisma e JWT. Eu aprendi que o Google fornece um identificador único para cada usuário, que é chamado de `sub`, e também precisei considerar três situações na hora do login: quando a conta do Google já está associada a uma empresa, quando o email já está cadastrado pelo método tradicional e quando se trata de um novo usuário, que precisa completar os dados da empresa. Durante os testes, tive um problema em que a autenticação pelo Google funcionava, mas o processo não estava sendo concluído. Inicialmente, eu pensei que fosse algum erro nas rotas ou nas configurações do Google, o que me atrapalhou um pouco, mas depois percebi que o problema estava somente com o Docker e a conexão com o banco de dados.

Depois, eu trabalhei na integração de IA como serviço. Decidimos utilizar a API do Gemini para gerar planos de ação mais personalizados, considerando as informações da empresa e os resultados do diagnóstico. Como ainda não havia trabalhado com esse tipo de integração, precisei entender como realizar as requisições pelo backend e também em como elaborar um prompt que orientasse a IA a retornar as recomendações para a empresa. Durante os testes, estava tendo muitos erros em relação aos modelos do Gemini, como alta demanda do serviço ou modelo indisponível, então tive que testar vários modelos diferentes até conseguir obter uma resposta utilizando o `gemini-3.5-flash-lite`.

Além disso, o grupo do Chile também tinha algumas outras requisições quanto ao desenvolvimento de alguns módulos extras. O primeiro era um botão de feedback constante na tela. Além de armazenar os feedbacks no PostgreSQL, eu decidi enviá-los também para uma planilha do google, facilitando o acesso às avaliações. Para isso, eu precisei aprender a usar e configurar a ferramenta do Google Apps Script, mas foi bem simples. Também criei o módulo Academia ODS, um jogo educativo com perguntas sobre sustentabilidade empresarial. O desenvolvimento foi tranquilo, pois foi bem parecido com o formulário de perguntas para o diagnóstico da empresa, que já havíamos desenvolvido no project 3.

### Trechos de código

Substitua este texto por uma indicação de pelo menos 3 trechos de código que você(s) queira(m) destacar para a turma (por exemplo, para explicar algo que aprendeu, para alertar sobre alguma dificuldade de compreensão, para mostrar uma curiosidade, etc).


## Tecnologias

### Linguagens e afins

- Front-end: React, TypeScript e Vite
- Back-end: Node.js, Express e TypeScript
- Autenticação e Banco de dados: OAuth, PostgreSQL e Prisma


### Ambiente de desenvolvimento

- VS Code

## Referências e créditos

- Repositório exemplo: https://github.com/elc1090/demo-auth-profile
- Documentação elaborada pelo grupo do Chile
- Chat GPT Gratuito


---
Projeto entregue para a disciplina de [Desenvolvimento de Software para a Web](http://github.com/andreainfufsm/elc1090-2026b) em 2026b