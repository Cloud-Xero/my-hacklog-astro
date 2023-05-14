import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { h } from "hastscript";
import type { Element as HastElement, Root, ElementContent } from "hast";

import { getPicture } from "@astrojs/image";
import { getPlaiceholder } from "plaiceholder";
import type { VFileCompatible } from "vfile";
import type { OutputFormat } from "@astrojs/image/dist/loaders";
import type { GetPictureResult } from "@astrojs/image/dist/lib/get-picture";
import type { HProperties } from "hastscript/lib/core";

interface NodeDetails {
  node: HastElement;
  index: number;
  parent: HastElement & { children: ElementContent[] };
}

const pictureDefault: {
  widths: number[];
  sizes: string;
  formats: OutputFormat[];
} = {
  widths: [640, 750, 828, 1080, 1200, 1920],
  sizes: "(min-width: 720px) 720px, 100vw",
  formats: ["webp", "jpeg"],
};

export default async function imgToPicture(
  html: VFileCompatible | undefined
): Promise<string> {
  // HTMLをhastへ変換
  const hast = unified().use(rehypeParse, { fragment: true }).parse(html);

  // imgノードを抽出
  let imageNodesSet: NodeDetails[] = [];
  visit(
    hast,
    "element",
    (
      node: HastElement,
      index: number | null,
      parent: HastElement | Root | null
    ) => {
      if (
        node.tagName === "img" &&
        index !== null &&
        parent &&
        "tagName" in parent &&
        "children" in parent
      ) {
        imageNodesSet.push({ node, index, parent });
      }
    }
  );

  // 抽出したimgノードに対する処理
  const promises = imageNodesSet.map(async (nodeSet) => {
    // imgノードから、srcとaltを取得
    const {
      node: {
        properties: { src, alt },
      },
      index,
      parent,
    } = nodeSet as NodeDetails & {
      node: HastElement & {
        properties: { src: string; alt: string };
      };
    };

    // 画像のwidthとheightを取得
    const { img } = await getPlaiceholder(src);

    // 取得した情報をもとに、getPictureでpictureの構成要素を取得
    const pictureData: GetPictureResult = await getPicture({
      ...img,
      ...pictureDefault,
      aspectRatio: `${img.width}:${img.height}`,
    });

    // 置換用のnodeの作成
    const srcNodes = pictureData.sources.map((source) => {
      const e = h("source", { ...source });
      return e;
    });

    const imgNode = h("img", { ...(pictureData.image as HProperties), alt });

    const pictureNode = h("picture", [...srcNodes, imgNode]);

    // pictureノードに置換
    parent.children.splice(index, 1, pictureNode);
  });

  await Promise.all(promises);

  // hastをhtmlに戻す
  const newhtml = unified().use(rehypeStringify).stringify(hast);

  return newhtml;
}
