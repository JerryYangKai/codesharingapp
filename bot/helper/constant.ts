export class DefaultLineSetting {
  public static readonly defaultStartLine = 0;
  public static readonly defaultEndLine = 9;
}

export class DefaultCodeStyle {
  public static readonly vsStyle =
    '<style type="text/css">pre code.hljs{display:block;overflow-x:auto;padding:1em}code.hljs{padding:3px 5px}.hljs{background:#fff;color:#000}.hljs-comment,.hljs-quote,.hljs-variable{color:green}.hljs-built_in,.hljs-keyword,.hljs-name,.hljs-selector-tag,.hljs-tag{color:#00f}.hljs-addition,.hljs-attribute,.hljs-literal,.hljs-section,.hljs-string,.hljs-template-tag,.hljs-template-variable,.hljs-title,.hljs-type{color:#a31515}.hljs-deletion,.hljs-meta,.hljs-selector-attr,.hljs-selector-pseudo{color:#2b91af}.hljs-doctag{color:grey}.hljs-attr{color:red}.hljs-bullet,.hljs-link,.hljs-symbol{color:#00b0e8}.hljs-emphasis{font-style:italic}.hljs-strong{font-weight:700}</style>';
}

export enum ActivityName {
  submitAction = "composeExtension/submitAction",
  queryLink = "composeExtension/queryLink",
}

export enum CommandId {
  createCard = "createCard"
}

export enum Domains {
  github = "github.com",
  azdo = ".visualstudio.com",
}
