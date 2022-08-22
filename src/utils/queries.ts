import { OODBQuery } from "./QueryAdapter";
import { VoyageEntry, VoyagerRecord, VoyagerRecordEx } from "./voyagelog";

export const longestVoyage = (voyages: OODBQuery<VoyageEntry>) : number => 
    voyages
        .map(voyage => voyage.duration)
        .sort(duration => duration, false).first();

export const meanVoyageDuration = (voyages: OODBQuery<VoyageEntry>) : number =>
    voyages
        .map((voyage: VoyageEntry) => voyage.duration)
        .reduce((total, value) => total + value, 0)/voyages.count();

export const mostUsedVoyagers = (voyagers: OODBQuery<[string, OODBQuery<VoyagerRecord>]>) : string[] => 
    voyagers
        .map<[string, number]> (([symbol, voyages]) => [symbol, voyages.count()])
        .sort(([symbol, voyageCount]) => voyageCount, true)
        .limit(12)
        .reduce((best, next) => best.length === 0 || best[0][1] == next[1] ? best.concat([next]) : best, []);

export const totalVoyageTime = (voyages: OODBQuery<VoyagerRecordEx>) : number =>
    voyages
        .map(voyage => voyage.voyage.duration)
        .reduce((total, duration) => total + duration, 0);

export const mostTravelledVoyagers = (voyagers: OODBQuery<[string, OODBQuery<VoyagerRecordEx>]>) : string[] =>
    voyagers                    
        .map<[string, number]>(([symbol, voyages]) => [symbol, totalVoyageTime(voyages)])
        .sort(([symbol, voyageDuration]) => voyageDuration, true)
        .limit(12)
        .reduce((best, next) => best.length === 0 || best[0][1] == next[1] ? best.concat([next]) : best, [])

export const oldestVoyage = (voyages: OODBQuery<VoyageEntry>) : Date =>
    voyages.sort((voy: VoyageEntry) => voy.dateStarted.getTime(), true).first()?.dateStarted;
