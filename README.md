# Mananciais

Ferramenta para armazenar e visualizar dados publicados no site da [SABESP](http://www2.sabesp.com.br/mananciais/DivulgacaoSiteSabesp.aspx).

---

## Instalação

Instale as dependências executando:

```
npm install
```

Atualize a base de dados:
```
node mananciais.js --update
```

## Servidor

Dentro desta aplicação também existe um servidor que atualiza a base de 3 em 3 horas e serve os dados com [CORS](http://pt.wikipedia.org/wiki/Cross-origin_resource_sharing) ativado.

Rode o servidor:
```
node mananciais.js serve
```

URL dos dados: `http://localhost:3000/data.csv`


---

## Visualização

Acesse `/index.html`

---
