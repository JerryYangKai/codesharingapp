// class for rendering a code/md-related adaptive card.
export class CodeCard{
    // Title of the content.
    title: string;

    // Rendered html content of the adaptive card.
    text: string;

    // The source of the code/md.
    source: string;

    // URL to open from adaptive card. 
    uri: string;

    constructor(title:string, text:string, source: string, uri: string){
        this.title = title;
        this.text = text;
        this.source = source;
        this.uri = uri;
    }
}