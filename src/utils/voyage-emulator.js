// Based on Chewable C++'s STT Voyage Estimator
//  https://codepen.io/somnivore/pen/Nabyzw
//
// Adapted by Josh Andrews

const ticksPerCycle = 28;
const secondsPerTick = 20;
const secondsInMinute = 60;
const minutesInHour = 60;
const hazardTick = 4;
const rewardTick = 7;
const hazardAsRewardTick = 28;
const ticksPerMinute = secondsInMinute/secondsPerTick;
const ticksPerHour = ticksPerMinute*minutesInHour;
const cycleSeconds = ticksPerCycle*secondsPerTick;
const cyclesPerHour = minutesInHour*secondsInMinute/cycleSeconds;
const hazPerCycle = 6;
const amPerActivity = 1;
const hoursBetweenDilemmas = 2;
const dilemmasPerHour = 1/hoursBetweenDilemmas;
const ticksBetweenDilemmas = hoursBetweenDilemmas*minutesInHour*ticksPerMinute;
const skillIncPerHaz = 32;
const hazPerHour = hazPerCycle*cyclesPerHour-dilemmasPerHour;
const ticksPerHazard = 4;
const hazAmPass = 5;
const hazAmFail = 30;
const minPerHour = 60;
const psChance = 0.35;
const ssChance = 0.25;
const osChance = 0.1;
const skillChances = [psChance,ssChance,osChance,osChance,osChance,osChance];

function getHazardOdds(hazardScore, skills) {
  const skillToOdds = (skill) =>
    1-Math.max(0, Math.min(1, (hazardScore-(skill.core+skill.range_min))/(skill.range_max-skill.range_min)));
  return skills.reduce((odds, skill, i) => odds + skillToOdds(skill)*skillChances[i], 0);
}

function getEstimate(config, numSims = 5000) {
  // required input (starting numbers)
  const ps = config.aggregates[config.primary_skill];
  const ss = config.aggregates[config.secondary_skill];
  const others = Object.entries(config.aggregates)
                       .filter(([key]) => key != config.primary_skill && key != config.secondary_skill)
                       .map(([_, value]) => value);
  const allSkills = [ps, ss, ...others];
  const hazardOdds =
    Array.from({length: 630},
               (_, i) => getHazardOdds((i+1)*skillIncPerHaz, allSkills));

  const formatResults = (finished) => {
    results.sort(function(a,b){return a-b;});

    const estimate = {
       'all': results,
       'result': results[Math.floor(results.length/2)],
       'safeResult': results[Math.floor(results.length/10)],
       'saferResult': results[Math.floor(results.length/100)],
       'moonshotResult': results[results.length-Math.floor(results.length/100)],
       'minResult': results[0],
       'maxResult': results[results.length-1],
    }

    /* Not needed
    var bins = {};
    const binSize = 1/45;

    for (result of exResults.sort()) {
  		let bin = (Math.floor(result/binSize)+0.5)*binSize;

      try{
      	++bins[bin].count;
      }
      catch {
        bins[bin] = {result: bin, count: 1};
      }
    }

    delete bins[NaN];
    refill.bins = Object.values(bins);
    */

    estimate['final'] = finished;

    return estimate;
  }; //end formatResults()

  let results = [];

  for (var iSim = 0; iSim < numSims; iSim++) {
    let tick = 0;
    let am = config.startAm;
    let hazardCount = 0;

    while (am > 0) {
      ++tick;
      // sanity escape:
      if (tick > 2520)
        break;

      // hazard && not dilemma or reward
      if (tick%hazardTick == 0 && tick%rewardTick != 0 && tick%ticksBetweenDilemmas != 0) {
        am += Math.random() < hazardOdds[hazardCount] ? 5 : -30;
        ++hazardCount;
      } else if (tick%ticksBetweenDilemmas != 0) {
        am -= amPerActivity;
      }
    } // foreach tick
    results.push(tick*secondsPerTick);
  } // foreach sim

  return formatResults(true);
}

/* Time predicted by Datacore: 10h 31m (90%: 10h 10m, 99%: 9h 45m) */
const testCase = {
	startAm: 2625,
  primary_skill: 'science_skill',
  secondary_skill: 'diplomacy_skill',
  aggregates: {
    command_skill: { core: 6652, range_min: 1141, range_max: 2508 },
    diplomacy_skill: { core: 9908, range_min: 1876, range_max: 3781 },
		science_skill: { core: 9767, range_min: 1908, range_max: 4245 },
		engineering_skill: { core: 3867, range_min: 616, range_max: 1264 },
		security_skill: { core: 6214, range_min: 1175, range_max: 2479 },
		medicine_skill: { core: 2552, range_min: 510, range_max: 1153 }
	}
}

module.exports.getEstimate = getEstimate;
