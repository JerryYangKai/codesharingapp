import axios from "axios";
import { Buffer } from "buffer";
import { CodeCard } from "./codeCard";
import { DefaultLineSetting } from "./constant";

/**
 *
 * @param url GitHub-related url
 * @param useGitHubRendered option to choose whether to get rendered HTML directly from GitHub
 * @returns
 */
export async function reqCodeDataFromGitHubAPI(url: string) {
  // Typically, An GitHub code permalink URL will be
  // `https://github.com/OfficeDev/TeamsFx-Samples/blob/master/test.py#L1-L6?x=a&y=b`
  // Or `https://github.com/OfficeDev/TeamsFx-Samples/blob/master/test.py?x=a&y=b`
  // TODO: using lib or regular expression handle the link
  if (url.includes("?")) {
    url = url.split("?")[0];
  }
  let fileurl = url;
  let startLine = DefaultLineSetting.defaultStartLine;
  let endLine = DefaultLineSetting.defaultEndLine;
  // If the Url specified the Lines
  if (url.includes("#")) {
    const segmentListSharp = url.split("#");
    const lines = segmentListSharp[1];
    const lineNumList = lines.replace(/L/g, "").split("-");
    // Get startLine and endLine
    startLine = Number(lineNumList[0]) - 1;
    endLine =
      lineNumList.length == 1
        ? startLine + endLine
        : Number(lineNumList[1]) - 1;
    fileurl = segmentListSharp[0];
  }
  const segmentList = fileurl
    .replace("https://github.com/", "")
    .replace("blob/", "")
    .split("/");
  // name space is the first element of the segmentList.
  const namespace = segmentList.shift();
  // repo name is the second element of the segmentList.
  const repoName = segmentList.shift();
  // ref is the third part of the segmentList, ref means the name of the commit/branch/tag.
  const ref = segmentList.shift();
  // connect the remaining part to get file path.
  const path = segmentList.reduce((a, b) => a + "/" + b);

  var content: string;
  // Use third-part API to render code to HTML
  // Request whole content from GitHub API with metadata.
  const rawContent = await reqInfoFromGitHubAPI(namespace, repoName, path, ref);
  const contentToRender = segmentContent(rawContent, startLine, endLine);
  const language = getLanguage(path);
  content = await renderContent(language, contentToRender);

  var card = new CodeCard(
    `${namespace}/${repoName}`,
    `Sharing ${path} Lines ${startLine + 1}-${endLine + 1}`,
    content,
    url,
    `https://vscode.dev/github/${namespace}/${repoName}/blob/${ref}/${path}#L${
      startLine + 1
    }-L${endLine + 1}`
  );
  return card;
}

/**
 * Function to request file data from GitHub API.
 * @param namespace namespace
 * @param repoName name of the repository
 * @param path path of the file
 * @param ref name of the commit/branch/tag
 * @returns raw content string of the file
 */
async function reqInfoFromGitHubAPI(
  namespace: string,
  repoName: string,
  path: string,
  ref: string
) {
  if (!ref) {
    ref = "main";
  }
  const reqURL = `https://api.github.com/repos/${namespace}/${repoName}/contents/${path}`;
  var content: string;
  await axios({
    baseURL: reqURL,
    method: "get",
    headers: {
      Accept: "application/vnd.github+json",
    },
    params: {
      ref: ref,
    },
  }).then((response) => {
    // Need to decode with base64
    content = Buffer.from(response.data["content"], "base64").toString("utf-8");
  });
  return content;
}

/**
 *
 * @param url GitHub-related url
 * @param useGitHubRendered option to choose whether to get rendered HTML directly from GitHub
 * @returns
 */
export async function reqCodeDataFromAzDOAPI(url: string, token?: string) {
  // Typically, An Azure DevOps link URL will be
  // `https://org.visualstudio.com/project/_git/repo?path=&version=&line=&lineEnd=`
  // TODO: using lib or regular expression handle the link
  const urlInstance = new URL(url);
  const urlParams = urlInstance.searchParams;
  // version means the name of the commit/branch, commit starts with 'GC', branch starts with 'GB'.
  const version = urlParams.get("version")
    ? urlParams.get("version")
    : "GBmain";
  // ref means the real name of the commit/branch/tag.
  const ref = version.substring(2);
  const path = urlParams.get("path");
  const startLine = urlParams.get("line")
    ? Number(urlParams.get("line")) - 1
    : DefaultLineSetting.defaultStartLine;
  const endLine = urlParams.get("lineEnd")
    ? Number(urlParams.get("lineEnd")) - 1
    : DefaultLineSetting.defaultEndLine;
  const orgName = urlInstance.hostname.split(".")[0];
  const projectName = urlInstance.pathname.split("/")[1];
  const repoName = urlInstance.pathname.split("/")[3];

  var content: string;
  // Use third-part API to render code to HTML
  // Request whole content from GitHub API with metadata.
  const rawContent = await reqInfoFromAzDOAPI(
    orgName,
    projectName,
    repoName,
    path,
    ref,
    token
  );
  const contentToRender = segmentContent(rawContent, startLine, endLine);
  const language = getLanguage(path);
  content = await renderContent(language, contentToRender);

  var card = new CodeCard(
    `${decodeURI(orgName)}/${decodeURI(projectName)}/${decodeURI(repoName)}`,
    `Sharing ${path} Lines ${startLine + 1}-${endLine + 1}`,
    content,
    url,
    `https://vscode.dev/azurerepos/${orgName}/${projectName}/${repoName}?version=${version}&path=${path}&line=${
      startLine + 1
    }&lineEnd=${endLine + 2}`
  );
  return card;
}

/**
 * Function to request file data from GitHub API.
 * @param namespace namespace
 * @param repoName name of the repository
 * @param path path of the file
 * @param ref name of the commit/branch/tag
 * @returns raw content string of the file
 */
async function reqInfoFromAzDOAPI(
  orgName: string,
  projectName: string,
  repoName: string,
  path: string,
  ref: string,
  accessToken?: string
) {
  const token = accessToken ?? getAzDOToken();
  const reqURL = `https://dev.azure.com/${orgName}/${projectName}/_apis/sourceProviders/TfsGit/filecontents?repository=${repoName}&commitOrBranch=${ref}&path=${path}&api-version=7.1-preview.1`;
  var content: string;
  await axios({
    baseURL: reqURL,
    method: "get",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    content = response.data;
  });
  return content;
}

/**
 * Function to get certain lines of a file content.
 * @param content
 * @param startLine the index of the starting line
 * @param endLine the index of the ending line
 * @returns content string of certain lines of a file content
 */
function segmentContent(content: string, startLine: number, endLine: number) {
  // TODO: using lib to get the selected lines
  var retLines: string[] = [];
  var segmentLines = content.split("\n");
  for (let i = startLine; i <= endLine; i++) {
    if (segmentLines[i]) {
      retLines.push(segmentLines[i]);
    }
  }
  // Reduce them to a string connected with `\n`.
  return retLines.reduce((a, b) => a + "\n" + b);
}

/**
 * Naive function to get language type from file suffix.
 * @param path path of the file
 * @returns language type of the file
 */
function getLanguage(path: string) {
  if (path.endsWith(".md")) {
    return "markdown";
  } else {
    return "code";
  }
}

/**
 * Function to render content with its language type.
 * @param language language type of the content.
 * @param contentToRender content to be rendered.
 * @returns HTML string of the content.
 */
async function renderContent(language: string, contentToRender: string) {
  // For MarkDown, GitHub provided API to render.
  if (language === "markdown") {
    return renderWithGitHubMdAPI(contentToRender);
  }
  // Code rendering.
  else {
    return renderCodeWithAPI(contentToRender);
  }
}

/**
 * Function to render MarkDown content to HTML with GitHub API.
 * @param contentToRender MarkDown string to be rendered.
 * @returns HTML string of the content.
 */
async function renderWithGitHubMdAPI(contentToRender: string) {
  var html = await axios({
    baseURL: "https://api.github.com/markdown",
    method: "post",
    headers: {
      Accept: "application/vnd.github+json",
    },
    data: {
      text: contentToRender,
    },
  }).then((response) => {
    return response.data;
  });
  return html;
}

/**
 * Function to render code with API.
 * Only support Python .
 * @param contentToRender content to be rendered.
 * @returns HTML string of the content.
 */
async function renderCodeWithAPI(contentToRender: string) {
  // console.log(contentToRender)
  var content = await axios({
    baseURL: "http://hilite.me/api",
    method: "get",
    params: {
      code: contentToRender,
      lexer: "ts",
      style: "borland",
    },
  }).then((response) => {
    return response.data;
  });
  // console.log(content);
  return content;
}

/**
 * Function to get Azure DevOps Token from process.env
 * Set in `.env.teamsfx.local`
 * @returns github token for authorization.
 */
function getAzDOToken() {
  const accessToken = `Basic ${process.env.AzDO_TOKEN}`;
  return accessToken;
}
