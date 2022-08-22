import React from 'react';
import { Data } from 'dataclass';
import fetch  from 'node-fetch';

export const loadCrew  = (callback : (crew: Crew[]) => void) => {
    fetch(`data/crew.json`)
        .then((response) => {
            response.json().then((data) => callback(data.map(crew => Crew.create(crew))));
            console.log(response);
        });
}

export class Crew extends Data {
    static symbolNamePart = /^.*?(?=_crew)/;

    static parseNameFromSymbol(symbol: string) : string {
        const namePart = Crew.symbolNamePart.exec(symbol);
        return namePart ? namePart[0].replace('_', ' ').replaceAll(/\b\w/g, match => match.toUpperCase()) : symbol;
    }

    symbol: string;
    name: string;
    rarity: number;
    traits: string[];
    fullBodyUrl: string;
    iconUrl: string;
    portraitUrl: string;
    
};

export const symbolToCrew = (symbol: string, allCrew: Crew[]) : Crew => allCrew.find((crew => crew.symbol === symbol)); 
export const CrewContext = React.createContext([]);
export default Crew;