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

---

## Visualização

Acesse `/index.html`

---

## API

### Por data
```
$ node mananciais.js -d 2013-1-2
```
**Resultado**
```
Buscando dados em: 2013-1-2

-----------------------------------------------------------------------------------------------------------------------------------------
| # | data     | manancial           | média histórica do mês | pluviometria acumulada no mês | pluviometria do dia | volume armazenado |
-----------------------------------------------------------------------------------------------------------------------------------------
| 0 | 2013-1-2 | sistemaCantareira   | 259,9 mm               | 0,9 mm                        | 0,1 mm              | 48,8 %            |
| 1 | 2013-1-2 | sistemaAltoTiete    | 246,6 mm               | 7,0 mm                        | 2,8 mm              | 41,5 %            |
| 2 | 2013-1-2 | sistemaGuarapiranga | 228,8 mm               | 0,6 mm                        | 0,6 mm              | 59,4 %            |
| 3 | 2013-1-2 | sistemaCotia        | 234,3 mm               | 3,4 mm                        | 3,4 mm              | 83,2 %            |
| 4 | 2013-1-2 | sistemaRioGrande    | 245,4 mm               | 26,4 mm                       | 26,4 mm             | 92,5 %            |
| 5 | 2013-1-2 | sistemaRioClaro     | 294,4 mm               | 11,6 mm                       | 10,8 mm             | 50,2 %            |
-----------------------------------------------------------------------------------------------------------------------------------------
```

### Por manancial:
```
$ node mananciais.js -d 2013-1-2 -m sistemaCantareira
```
**Resultado**
```
Buscando dados em: 2013-1-2 de sistemaCantareira

---------------------------------------------------------------------------------------------------------------------------------------
| # | data     | manancial         | média histórica do mês | pluviometria acumulada no mês | pluviometria do dia | volume armazenado |
---------------------------------------------------------------------------------------------------------------------------------------
| 0 | 2013-1-2 | sistemaCantareira | 259,9 mm               | 0,9 mm                        | 0,1 mm              | 48,8 %            |
---------------------------------------------------------------------------------------------------------------------------------------
``` 
---
