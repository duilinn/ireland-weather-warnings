import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useState, useEffect } from 'react';

export default function Home() {
  const [sliderValue, setSliderValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [warningsCount, setWarningsCount] = useState(0);
  const [warningBarChart, setWarningBarChart] = useState([]);

  const countyNames = ["Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Leitrim", "Laois", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"];

  const countyPopulations = [61968, 81704, 127938, 584156, 167084, 1458154, 277737, 156458, 247774, 104160, 91877, 35199, 209536, 46751, 139703, 137970, 220826, 65288, 83150, 70259, 70198, 167895, 127363, 96221, 163919, 155851];
  const statePopulation = countyPopulations.reduce((partialSum, a) => partialSum + a, 0);

  const [countyWarnings, setCountyWarnings] = useState(Array(26).fill("none"));
  const colorArray = ["none", "yellow", "orange", "red"];
  const explainWarnings = ["No rain alert", "Yellow rain alert", "Orange rain alert", "Red rain alert"];

  function warningComp(w1, w2) {
    // console.log(`w1: ${colorArray.indexOf(w1)}, w2: ${colorArray.indexOf(w2)}`);
    // console.log(colorArray.indexOf(w1) > colorArray.indexOf(w2));
    return colorArray.indexOf(w1) > colorArray.indexOf(w2);
  }

  const handleSliderChange = (event) => {
    const newValue = parseInt(event.target.value);
    setSliderValue(newValue);
    var d = new Date();
    d.setHours(d.getHours() + newValue);
    setSelectedDate(d.toISOString());

    console.log("Updating slider");

    getCurrentWarnings();
  };

  async function getFutureWarningPercents(hours) {
    var d = new Date();
    d.setHours(d.getHours() + hours);
    ;
    var sW = false;
    var cW;

    var futureWarnings = await getCurrentWarnings(d = d.toISOString(), sW = false);
    var result = getWarningPercents(cW = futureWarnings);
    console.log(`${hours} hours time: ${result}`);
    return result;
  }

  function getLocalDate(inputDateStr) {

    try {
      // Define the client's time zone for the Republic of Ireland
      const clientTimezone = 'Europe/Dublin';

      // Create a Date object from the input date string (in UTC)
      const inputDate = new Date(inputDateStr);

      // Create a DateTimeFormat object for the client's time zone
      const dateFormatOptions = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: clientTimezone,
      };

      // Format the local time according to the desired format
      const formattedDateStr = new Intl.DateTimeFormat('en-IE', dateFormatOptions).format(inputDate);

      return formattedDateStr;
    } catch (error) {
      console.error("Invalid date string", error);
      return inputDateStr;
    }
  }

  function getWarningPercents(cW = countyWarnings) {
    var warningTypes = [0, 0, 0, 0];

    console.log(`cW = ${cW}`);

    for (let countyIndex in cW) {
      warningTypes[colorArray.indexOf(cW[countyIndex])] += countyPopulations[countyIndex];
    }

    for (let w in warningTypes) {
      warningTypes[w] = Math.round((warningTypes[w] / statePopulation) * 100);
    }
    var total = warningTypes.reduce((p, c) => p + c, 0);
    if (total != 100) {
      warningTypes[0] += (100 - total);
    }
    return warningTypes;
  }

  async function getCurrentWarnings(d = selectedDate, sW = true) {
    var w = warnings;
    // if (cW != []) {
    //   w = cW;
    // }

    var wCount = 0;

    var currentCountyWarnings = Array(26).fill("none");

    for (let warning in w) {
      // console.log(`warning (${warnings[warning].start}-${warnings[warning].end})`);
      if (w[warning].start < d && w[warning].end > d) {
        // console.log(`warning ${warning} current`);
        wCount += 1;

        for (let county in w[warning].counties) {
          var countyName = w[warning].counties[county];

          // console.log(`${countyName} new: ${warnings[warning].level}, prev: \"${currentCountyWarnings[currentCountyWarnings.indexOf(countyName)]}\"`);
          if (warningComp(w[warning].level, currentCountyWarnings[currentCountyWarnings.indexOf(countyName)])) {
            currentCountyWarnings[countyNames.indexOf(countyName)] = w[warning].level;


            // console.log(`adding ${countyName}`);}}
          }

        }
      }
    }

    var randomise = false;
    if (randomise) {
      for (let c in currentCountyWarnings) {
        currentCountyWarnings[c] = colorArray[Math.floor(Math.random() * 4)]
      }
    }

    if (sW) {
      setCountyWarnings(currentCountyWarnings);
      console.log(currentCountyWarnings);
      setWarningsCount(wCount);
    } else {
      return currentCountyWarnings;
    }
  }


  async function getWarnings() {
    const initialData = await fetch("http://localhost:5000/warnings");
    const jsonResponse = await initialData.json();

    console.log(jsonResponse);
    console.log("Frontend has received " + jsonResponse.length + " items");

    setWarnings(jsonResponse);

    return (jsonResponse);
  }

  function formatDaysHours(h) {
    if (h < 24) return `${h % 24} hours`;
    else if (h % 24 == 0) return `${h / 24} days`;
    else return `${Math.floor(h / 24)} days, ${h % 24} hours`;
  }

  const hourIntervals = [0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72];

  async function showFutureWarningPercents() {
    var bars = [];
    for (let i in hourIntervals) {
      var hour = hourIntervals[i];
      var fW = await getFutureWarningPercents(hour);

      bars.push(fW);
    }

    setWarningBarChart(bars);
  }

  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(typeof window !== "undefined");
    var d = new Date();
    d.setHours(d.getHours());
    setSelectedDate(d.toISOString());
    getCurrentWarnings(getWarnings());
    showFutureWarningPercents();
  }, []);


  return isBrowser ? (
    <div className={styles.container}>
      <Head>
        <title>Irish weather stats</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Percentage of Irish population under rainfall warnings:</h1>
        <div className={styles.warningTypesContainer}>
          {
            colorArray.map((c, i) =>
              (getWarningPercents()[i])
                ?
                <div key={i} className={styles.warningType} style={{ width: `${getWarningPercents()[i]}%` }}>
                  {(getWarningPercents()[i] > 5) ? explainWarnings[i] : ""}
                  <br />
                  <br />
                  {
                    getWarningPercents()[i]
                  }
                  %
                </div>
                :
                <div key={i} className={styles.warningType} style={{ width: `${getWarningPercents()[i]}%`, visibility: "hidden" }}>
                  {explainWarnings[i]}
                  <br />
                  <br />
                  {
                    getWarningPercents()[i]
                  }
                  %
                </div>

            )
          }
        </div>
        <br />
        <div className={styles.graphContainer}>
          {
            warningBarChart.map((stack, i) =>
              <div className={styles.graphBarColumn} key={2 * i}>
                <div className={styles.graphBarStack} key="1">
                  {
                    stack.map((bar, j) =>
                      (bar == 0)
                        ?
                        <div className={styles.graphBar} key={j} style={{ height: bar }}></div>
                        :
                        <div className={styles.graphBar} key={j} style={{ height: bar, visiblity: "hidden" }}></div>
                    )
                  }
                </div>
                <div className={styles.graphBarHour} key="2">
                  {i * 6}
                </div>
              </div>
            )
          }
        </div>
        <br />
        <div className={styles.sliderInfoContainer}>
          <div className={styles.dateDiv}>
            Selected time: {getLocalDate(selectedDate)}
          </div>
          <div className={styles.hoursDiv}>{formatDaysHours(sliderValue)} from now</div>
          <div className={styles.sliderContainer}>
            <input type="range" min="0" max="72" step="6" value={sliderValue} onChange={(e) => handleSliderChange(e)} className={styles.slider} id="myRange" />
          </div>
        </div>
      </main>

      <style jsx>{`
        main {
          width:100%;
          padding: 10px 10px;
        }
        
        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  ) : null;
}
