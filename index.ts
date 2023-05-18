import convert from "xml-js"
import {ElementCompact} from "xml-js/types"
import {readFileSync, readFile, appendFile, writeFileSync, writeFile} from 'fs';
import jsdom from "jsdom";
import ErrnoException = NodeJS.ErrnoException;

const {JSDOM} = jsdom;
global.DOMParser = new JSDOM().window.DOMParser;

interface Product {
    ExternalId: string | null;
    ImageUrl: string;
    ImageUrlLocalized: string;
}
interface Backlog {
    PID: string;
    success: boolean;
}
readFile('pfeedku.xml', (err: ErrnoException | null, data: Buffer): void => {
    if(err){
        throw new Error(err.message);
    }
    const jsObj: Element | ElementCompact = convert.xml2js(data.toString(), {compact: false});
    const productFeed: [] = jsObj.elements[0].elements;
    const productFeedLength: number = productFeed.length;
    let products: [] = [];

    for(let i: number = 0; i < productFeedLength; i++){
        if(productFeed[i]["name"] === "Products"){
            products = productFeed[i]["elements"];
            break;
        }else {
            continue;
        }
    }

    const productsLength: number = products.length;

    for(let i: number = 0; i < productsLength; i++){
        let productElements: any[] = products[i]["elements"];
        let productElementsLength: number = productElements.length;
        let defaultImageUrl: string = '';
        if(productElementsLength !== 0){
            for (let j:number = 0; j < productElementsLength; j++){
                if(productElements[j] !== null){
                    if(productElements[j]["name"] === "ImageUrl"){
                        if(productElements[j]["elements"][0]["text"]) {
                            defaultImageUrl = productElements[j]["elements"][0]["text"];
                        }
                    }
                    if(productElements[j]["name"] === "ImageUrls"){
                        if(productElements[j]["elements"][0]["elements"][0]["text"]){
                            productElements[j]["elements"][0]["elements"][0]["text"] = defaultImageUrl;
                        }
                    }
                }
            }
        }
    }

    try{
        const result = convert.js2xml(jsObj);
        writeFileSync("testXmlFeed.xml", result);
        console.log("File successfully written");
    } catch (err: unknown){
        console.error(err);
    }
});
