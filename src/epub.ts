import rehypeDocument from "rehype-document";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import { read } from "to-vfile";
import { unified } from "unified";
import { reporter } from "vfile-reporter";
import { EPub, type EpubOptions } from "@lesjoursfr/html-to-epub";
import { fromString } from "hast-util-from-string";
import { toString } from "hast-util-to-string";
import { select } from "hast-util-select";
import type { Nodes } from "hast-util-select/lib";
import { matter } from "vfile-matter";
import path from "node:path";
import { VFile } from "vfile-matter/lib";

interface FrontMatter {
  title?: string;
  description?: string;
}

interface Meta {
  title: string;
  description: string;
  /**
   * css file path
   */
  cssFile?: string;
  books: string[];
}

const meta: Meta = {
  title: "hello",
  description: "",
  cssFile: "resources/css/styles.css",
  books: [
    "resources/body/translated_01.md",
    "resources/body/translated_02.md",
    "resources/body/translated_03.md",
    "resources/body/translated_04.md",
    "resources/body/translated_05.md",
    "resources/body/translated_06_security.md",
  ],
};

const frontmatter = () => (_tree: Nodes, file: VFile) => {
  matter(file);
};

async function getHtml(bodyPath: string) {
  const body = await read(bodyPath);
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeDocument)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .use(remarkFrontmatter, ["yaml"])
    .use(frontmatter)
    .process(body);
  console.error(reporter(file));
  const { matter } = file.data;
  return { html: String(file), matter: matter as FrontMatter };
}

async function main() {
  const { title, description, cssFile } = meta;
  const css = cssFile ? String(await read(cssFile)) : undefined;
  const content = await Promise.all(
    meta.books.map(async (book) => {
      const { html, matter } = await getHtml(book);
      const { title, description } = (() => {
        if (!matter) return { title: "Untitled", description: "" };
        const { title, description } = matter;
        return { title: title || "Untitled", description: description || "" };
      })();
      return { title, description, data: html };
    })
  );
  const epub = new EPub(
    {
      title,
      description,
      css,
      fonts: [path.resolve(process.cwd(), "resources/fonts/SeoulNamsanM.ttf")],
      content: content,
    },
    path.resolve(process.cwd(), "public/book.epub")
  );
  const result = await epub.render();
  console.log(result);
}
main();
