// class for rendering a code/md-related adaptive card.
export class CodeCard{
    // Title of the content.
    title: string;

    // Subtitle of the content.
    subtitle: string;

    // Rendered html content of the adaptive card.
    text: string;

    // URL to open from adaptive card. 
    originUrl: string;

    // URL to open in vscode.dev. 
    webEditorUrl: string;

    constructor(title:string, subtitle: string, text: string, originUrl: string, webEditorUrl: string){
        this.title = title;
        this.subtitle = subtitle;
        this.text = text;
        this.originUrl = originUrl;
        this.webEditorUrl = webEditorUrl;
    }
}