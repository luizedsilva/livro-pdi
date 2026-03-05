# Livro de Processamento de Imagens

Este repositório contém o material do **livro de Processamento de Imagens**, desenvolvido utilizando **Quarto Book**. O projeto combina texto, figuras vetoriais e exemplos interativos para apoiar o ensino e a compreensão dos conceitos fundamentais da área.

O livro é publicado automaticamente através do **GitHub Pages**.

## Tecnologias utilizadas

O projeto utiliza os seguintes recursos:

* **Quarto Book** — estrutura e geração do livro em HTML e PDF.
* **p5.js** — exemplos interativos e visualizações gráficas em JavaScript.
* **GeoGebra** — gráficos matemáticos interativos incorporados ao conteúdo.
* **Excalidraw** — criação de diagramas e figuras didáticas.

## Quarto Book

O livro é estruturado utilizando o sistema **Quarto Book**, que permite escrever capítulos em arquivos `.qmd` e gerar automaticamente diferentes formatos de saída, como:

* HTML (para visualização online)
* PDF (via LaTeX)

Para compilar o livro localmente:

```bash
quarto render
```

## Exemplos interativos com p5.js

Alguns capítulos incluem exemplos interativos desenvolvidos com **p5.js**. Esses exemplos permitem explorar conceitos de processamento de imagens e matemática de forma visual e dinâmica.

Os códigos podem ser executados diretamente no navegador ou através do editor online do p5.js.

## Gráficos com GeoGebra

O projeto utiliza **GeoGebra** para incorporar gráficos interativos que auxiliam na visualização de funções e conceitos matemáticos importantes para o processamento de imagens.

Esses gráficos são incorporados diretamente nas páginas do livro.

## Criação de diagramas com Excalidraw

As figuras e diagramas utilizados no livro são produzidos com **Excalidraw**.

Neste projeto o Excalidraw é executado **localmente via Docker**, permitindo criar e editar diagramas de forma rápida.

### Construir a imagem Docker

```bash
docker build -t excalidraw/excalidraw .
```

### Executar o Excalidraw

```bash
docker run --rm -dit --name excalidraw -p 5000:80 excalidraw/excalidraw:latest
```

Após iniciar o container, o editor estará disponível em:

```
http://localhost:5000
```

## Estrutura do projeto

Uma estrutura do projeto é:

```
livro-pdi/
│
├── _quarto.yml
├── index.qmd
├── chapters/
├── imgs/
├── referencias.bib
└── .github/workflows/
```

## Publicação

O livro é publicado automaticamente através do **GitHub Actions** e disponibilizado via **GitHub Pages**.

## Licença

Este projeto é destinado a fins educacionais e acadêmicos.
