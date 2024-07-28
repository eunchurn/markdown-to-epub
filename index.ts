import rehypeDocument from "rehype-document";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { read } from "to-vfile";
import { unified } from "unified";
import { reporter } from "vfile-reporter";
import { EPub } from "@lesjoursfr/html-to-epub";
import { fromString } from "hast-util-from-string";
import { toString } from "hast-util-to-string";
import { select } from "hast-util-select";
import type { Nodes } from "hast-util-select/lib";

import path from "node:path";

const getTitle = () => (tree: Nodes) => {
  var h1 = select("h1", tree);
  var title = select("title", tree);
  if (h1 && title) {
    fromString(title, toString(h1));
  }
};

async function getHtml(bodyPath: string) {
  const body = await read(bodyPath);
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeDocument)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(body);
  console.error(reporter(file));
  console.log(file)
  // const data = await unified()
  //   .use(remarkParse)
  //   .use(remarkRehype)
  //   .use(rehypeDocument)
  //   .use(rehypeFormat)
  //   .use(rehypeStringify)
  //   .process(body);
  // console.log(data);
  return { html: String(file) };
}

async function main() {
  const { html } = await getHtml("resources/body/test.md");
  const css = await read("resources/css/styles.css");
  const epub = new EPub(
    {
      title: "test",
      description: "test",
      css: String(css),
      fonts: [path.resolve(__dirname, "resources/fonts/SeoulNamsanM.ttf")],
      content: [{ title: "서비스 배포를 위한 코드 개선 방향", data: html }],
    },
    "example.epub"
  );
  const result = await epub.render();
  console.log(result);
}
main();
