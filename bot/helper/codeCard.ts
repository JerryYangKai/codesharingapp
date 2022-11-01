// class for rendering a code/md-related adaptive card.
export class CodeCard{
    // Title of the content.
    title: string;

    // Rendered html content of the adaptive card.
    text: string;

    // URL to open from adaptive card. 
    uri: string;

    constructor(title:string, text: string, uri: string){
        this.title = title;
        this.text = text;
        this.uri = uri;
    }
}