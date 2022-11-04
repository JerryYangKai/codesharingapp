import axios  from "axios";
import { Buffer } from 'buffer';
import { CodeCard } from "./codeCard";
import { DefaultLineSetting } from "./constant";

/**
 * 
 * @param url GitHub-related url
 * @param useGithubRendered option to choose whether to get rendered HTML directly from GitHub
 * @returns 
 */
export async function reqCodeDataFromGitHubAPI(url: string, useGithubRendered: boolean){
    // Typically, An GitHub code permlink URL will be 
    // `https://github.com/OfficeDev/TeamsFx-Samples/blob/master/test.py#L1-L6?x=a&y=b` 
    // Or `https://github.com/OfficeDev/TeamsFx-Samples/blob/master/test.py?x=a&y=b`
    if (url.includes("?")){
        url = url.split("?")[0];
    }
    let fileurl = url;
    let startLine = DefaultLineSetting.defaultStartLine;
    let endLine = DefaultLineSetting.defaultEndLine;
    // If the Url specified the startLine and endLine
    if (url.includes("#")){
        const segmentListSharp = url.split("#");
        const lines = segmentListSharp[1];
        const lineNumList = lines.replace(/L/g,"").split("-");
        // Get startLine and endLine
        startLine = Number(lineNumList[0]) -1;
        endLine = Number(lineNumList[1]) -1;  
        fileurl = segmentListSharp[0]
    }
    const segmentList = fileurl.replace("https://github.com/","").replace("blob/","").split("/");
    // name space is the first element of the segmentList.
    const namespace = segmentList.shift();
    // repo name is the second element of the segmentList.
    const repoName = segmentList.shift();
    // ref is the third part of the segmentList, ref means the name of the commit/branch/tag.
    const ref = segmentList.shift();
    // connect the remaining part to get file path.
    const path = segmentList.reduce((a,b) => a + "/" + b);
   
    var content: string;
    // Use third-part API to render code to HTML.
    if (!useGithubRendered){
        // Request whole content from GitHub API with metadata.
        const rawContent = await reqInfoFromGitHubAPI(namespace, repoName, path, ref);
        const contentToRender = segmentContent(rawContent, startLine, endLine);
        const language = getLanguage(path);
        content = await renderContent(language, contentToRender);
    }
    // Directly use GitHub-rendered HTML of the file.
    // Notice: No syntax-highlighting; Hard to get certain lines of code from rendered HTML.
    else {
        content = await reqRenderedHTMLFromGitHub(namespace, repoName, path);
    }

    var card = new CodeCard(`[${ref}]${namespace}/${repoName}/${path}: Lines ${startLine+1} - ${endLine+1}`, content, url);
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
 async function reqInfoFromGitHubAPI(namespace: string, repoName: string, path: string, ref: string){
    if (ref == undefined){
        ref = 'main'
    }
    const reqURL = `https://api.github.com/repos/${namespace}/${repoName}/contents/${path}`;
    var content:string;
    await axios({
        baseURL: reqURL,
        method: 'get',
        headers: {
            'Accept':'application/vnd.github+json'
        },
        params:{
            'ref': ref
        }
    }).then( (response) => {
        // Need to decode with base64
        content = Buffer.from(response.data["content"],'base64').toString('utf-8');    
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
 function segmentContent(content:string, startLine:number, endLine: number){
    var retLines:string[] = [];
    var segmentLines = content.split("\n");
    for (let i = startLine; i <= endLine; i++ ){
        retLines.push(segmentLines[i]);
    }
    // Reduce them to a string connected with `\n`.
    return retLines.reduce((a,b)=>a+"\n"+b);
}

/**
 * Naive function to get language type from file suffix.
 * @param path path of the file
 * @returns language type of the file
 */
function getLanguage(path:string){
    if (path.endsWith(".md")){
        return 'markdown';
    }
    else {
        return 'code'
    }
}

/**
 * Function to render content with its language type.
 * @param language language type of the content.
 * @param contentToRender content to be rendered.
 * @returns HTML string of the content.
 */
async function renderContent(language:string, contentToRender:string){
    // For MarkDown, GitHub provided API to render. 
    if (language === 'markdown'){
        return renderWithGithubMdAPI(contentToRender);
    }
    // Code rendering.
    else{
        return renderCodeWithAPI(contentToRender);
    }
}

/**
 * Function to render MarkDown content to HTML with GitHub API.
 * @param contentToRender MarkDown string to be rendered.
 * @returns HTML string of the content.
 */
async function renderWithGithubMdAPI(contentToRender:string){
    var html = await axios({
        baseURL: 'https://api.github.com/markdown',
        method: 'post',
        headers: {
            'Accept':'application/vnd.github+json'
        },
        data:{
            'text': contentToRender
        }
    }).then( (response) => {       
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
 async function renderCodeWithAPI(contentToRender:string){
    // console.log(contentToRender)
    var content = await axios({
        baseURL: 'http://hilite.me/api',
        method: 'get',
        params:{
            'code': contentToRender,
            'style': 'emacs'
        }
    }).then( (response) => {
        return response.data;     
    });
    // console.log(content);
    return content;
}

/**
 * Function to request rendered HTML of GitHub content.
 * @param namespace namespace
 * @param repoName name of the repository
 * @param path path of the file
 * @returns HTML string of the content
 */
 async function reqRenderedHTMLFromGitHub(namespace: string, repoName: string, path: string){
    const reqURL = `https://api.github.com/repos/${namespace}/${repoName}/contents/${path}`;
    var content = await axios({
        baseURL: reqURL,
        method: 'get',
        // The value of the field `Accept` is required to be set to `application/vnd.github.VERSION.html` to get GitHub-rendered HTML.
        headers: {
            'Accept':'application/vnd.github.VERSION.html'
        },
    }).then( (response) => {
        return response.data;
    });
    return content;
}