export interface Idea {
    id: string;
    title: string;
    content: string; // Serialized Lexical state or HTML
}

export interface Path {
    id: string;
    title: string;
    ideas: Idea[]; // Ordered list of ideas in this path
}
