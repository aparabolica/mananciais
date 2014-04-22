# Mananciais

Ferramenta para armazenar dados publicados no site da SABESP e visualizar.

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

Veja por data:
```
node mananciais.js --date 2013-2-1
``` 

Veja por manancial:
```
node mananciais.js --date 2013-2-1 --manancial sistemaCantareira
``` 

Visualize acessando o index.html