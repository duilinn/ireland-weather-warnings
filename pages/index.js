import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useState, useEffect } from 'react';

export default function Home() {
  const [sliderValue, setSliderValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");

  const [rainWarnings, setRainWarnings] = useState([]);
  const [rainWarningsCount, setRainWarningsCount] = useState(0);
  const [rainWarningBarChart, setRainWarningBarChart] = useState([]);

  const [windWarnings, setWindWarnings] = useState([]);
  const [wind, setWindWarningsCount] = useState(0);
  const [windWarningBarChart, setWindWarningBarChart] = useState([]);

  const countyNames = ["Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Leitrim", "Laois", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"];

  const countyPopulations = [61968, 81704, 127938, 584156, 167084, 1458154, 277737, 156458, 247774, 104160, 91877, 35199, 209536, 46751, 139703, 137970, 220826, 65288, 83150, 70259, 70198, 167895, 127363, 96221, 163919, 155851];
  const statePopulation = countyPopulations.reduce((partialSum, a) => partialSum + a, 0);

  const [countyRainWarnings, setCountyRainWarnings] = useState(Array(26).fill("none"));
  const [countyWindWarnings, setCountyWindWarnings] = useState(Array(26).fill("none"));
  const colorArray = ["none", "yellow", "orange", "red"];
  const explainRainWarnings = ["No rain alert", "Yellow rain alert", "Orange rain alert", "Red rain alert"];
  const explainWindWarnings = ["No wind alert", "Yellow wind alert", "Orange wind alert", "Red wind alert"];

  const randomise = false;

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

    getCurrentRainWarnings();
    getCurrentWindWarnings();
  };

  async function getFutureRainWarningPercents(hours) {
    var d = new Date();
    d.setHours(d.getHours() + hours);
    ;
    var sW = false;
    var cW;

    var futureRainWarnings = await getCurrentRainWarnings(d = d.toISOString(), sW = false);
    var result = getRainWarningPercents(cW = futureRainWarnings);
    console.log(`${hours} hours time: ${result}`);
    return result;
  }

  async function getFutureWindWarningPercents(hours) {
    var d = new Date();
    d.setHours(d.getHours() + hours);
    ;
    var sW = false;
    var cW;

    var futureWindWarnings = await getCurrentWindWarnings(d = d.toISOString(), sW = false);
    var result = getWindWarningPercents(cW = futureWindWarnings);
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

  function getRainWarningPercents(cW = countyRainWarnings) {
    var rainWarningTypes = [0, 0, 0, 0];

    console.log(`cW = ${cW}`);

    for (let countyIndex in cW) {
      rainWarningTypes[colorArray.indexOf(cW[countyIndex])] += countyPopulations[countyIndex];
    }

    for (let w in rainWarningTypes) {
      rainWarningTypes[w] = Math.round((rainWarningTypes[w] / statePopulation) * 100);
    }
    var total = rainWarningTypes.reduce((p, c) => p + c, 0);
    if (total != 100) {
      rainWarningTypes[0] += (100 - total);
    }
    return rainWarningTypes;
  }

  function getWindWarningPercents(cW = countyWindWarnings) {
    var windWarningTypes = [0, 0, 0, 0];

    console.log(`cW = ${cW}`);

    for (let countyIndex in cW) {
      windWarningTypes[colorArray.indexOf(cW[countyIndex])] += countyPopulations[countyIndex];
    }

    for (let w in windWarningTypes) {
      windWarningTypes[w] = Math.round((windWarningTypes[w] / statePopulation) * 100);
    }
    var total = windWarningTypes.reduce((p, c) => p + c, 0);
    if (total != 100) {
      windWarningTypes[0] += (100 - total);
    }
    return windWarningTypes;
  }

  async function getCurrentRainWarnings(d = selectedDate, sW = true) {
    var w = rainWarnings;
    // if (cW != []) {
    //   w = cW;
    // }

    var wCount = 0;

    var currentCountyRainWarnings = Array(26).fill("none");

    for (let rainWarning in w) {
      // console.log(`warning (${warnings[warning].start}-${warnings[warning].end})`);
      if (w[rainWarning].start < d && w[rainWarning].end > d) {
        // console.log(`warning ${warning} current`);
        wCount += 1;

        for (let county in w[rainWarning].counties) {
          var countyName = w[rainWarning].counties[county];

          // console.log(`${countyName} new: ${warnings[warning].level}, prev: \"${currentCountyWarnings[currentCountyWarnings.indexOf(countyName)]}\"`);
          if (warningComp(w[rainWarning].level, currentCountyRainWarnings[currentCountyRainWarnings.indexOf(countyName)])) {
            currentCountyRainWarnings[countyNames.indexOf(countyName)] = w[rainWarning].level;


            // console.log(`adding ${countyName}`);}}
          }

        }
      }
    }

    if (randomise) {
      for (let c in currentCountyRainWarnings) {
        currentCountyRainWarnings[c] = colorArray[Math.floor(Math.random() * 2)]
      }
    }

    if (sW) {
      setCountyRainWarnings(currentCountyRainWarnings);
      console.log(currentCountyRainWarnings);
      setRainWarningsCount(wCount);
    } else {
      return currentCountyRainWarnings;
    }
  }

  async function getCurrentWindWarnings(d = selectedDate, sW = true) {
    var w = windWarnings;
    // if (cW != []) {
    //   w = cW;
    // }

    var wCount = 0;

    var currentCountyWindWarnings = Array(26).fill("none");

    for (let windWarning in w) {
      // console.log(`warning (${warnings[warning].start}-${warnings[warning].end})`);
      if (w[windWarning].start < d && w[windWarning].end > d) {
        // console.log(`warning ${warning} current`);
        wCount += 1;

        for (let county in w[windWarning].counties) {
          var countyName = w[windWarning].counties[county];

          // console.log(`${countyName} new: ${warnings[warning].level}, prev: \"${currentCountyWarnings[currentCountyWarnings.indexOf(countyName)]}\"`);
          if (warningComp(w[windWarning].level, currentCountyWindWarnings[currentCountyWindWarnings.indexOf(countyName)])) {
            currentCountyWindWarnings[countyNames.indexOf(countyName)] = w[windWarning].level;


            // console.log(`adding ${countyName}`);}}
          }

        }
      }
    }

    if (randomise) {
      for (let c in currentCountyWindWarnings) {
        currentCountyWindWarnings[c] = colorArray[Math.floor(Math.random() * 2)]
      }
    }

    if (sW) {
      setCountyWindWarnings(currentCountyWindWarnings);
      console.log(currentCountyWindWarnings);
      setWindWarningsCount(wCount);
    } else {
      return currentCountyWindWarnings;
    }
  }

  async function getRainWarnings() {
    const initialData = await fetch("http://localhost:5000/warnings");
    const jsonResponse = await initialData[0].json();

    console.log(jsonResponse);
    console.log("Frontend has received " + jsonResponse.length + " items");

    setRainWarnings(jsonResponse);

    return (jsonResponse);
  }

  async function getWindWarnings() {
    const initialData = await fetch("http://localhost:5000/warnings");
    const jsonResponse = await initialData[1].json();

    console.log(jsonResponse);
    console.log("Frontend has received " + jsonResponse.length + " items");

    setWindWarnings(jsonResponse);

    return (jsonResponse);
  }

  function formatDaysHours(h) {
    if (h < 24) return `${h % 24} hours`;
    else if (h % 24 == 0) return `${h / 24} days`;
    else return `${Math.floor(h / 24)} days, ${h % 24} hours`;
  }

  const hourIntervals = [0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72];

  async function showFutureRainWarningPercents() {
    var bars = [];
    for (let i in hourIntervals) {
      var hour = hourIntervals[i];
      var fW = await getFutureRainWarningPercents(hour);

      bars.push(fW);
    }

    setRainWarningBarChart(bars);
  }

  async function showFutureWindWarningPercents() {
    var bars = [];
    for (let i in hourIntervals) {
      var hour = hourIntervals[i];
      var fW = await getFutureWindWarningPercents(hour);

      bars.push(fW);
    }

    setWindWarningBarChart(bars);
  }


  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(typeof window !== "undefined");
    var d = new Date();
    d.setHours(d.getHours());
    setSelectedDate(d.toISOString());

    getCurrentRainWarnings(getRainWarnings());
    showFutureRainWarningPercents();

    getCurrentWindWarnings(getWindWarnings());
    showFutureWindWarningPercents();
  }, []);


  return isBrowser ? (
    <div className={styles.container}>
      <Head>
        <title>Irish weather stats</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Ireland weather warnings</h1>
        <div className={styles.warningTypesContainer}>
          <h2 className={styles.warningTypeHeading}>Percentage of people under rainfall warnings:</h2>
          <div className={styles.warningCategoriesContainer}>
            {
              colorArray.map((c, i) =>
                (getRainWarningPercents()[i])
                  ?
                  <div key={i} className={styles.warningCategory} style={{ width: `${getRainWarningPercents()[i]}%` }}>
                    {(getRainWarningPercents()[i] > 8) ? explainRainWarnings[i] : ""}
                    <br />
                    {
                      getRainWarningPercents()[i]
                    }
                    %
                  </div>
                  :
                  <div key={i} className={styles.warningCategory} style={{ width: `${getRainWarningPercents()[i]}%`, visibility: "hidden", padding: "0px" }}>
                    {explainRainWarnings[i]}
                    <br />
                    {
                      getRainWarningPercents()[i]
                    }
                    %
                  </div>

              )
            }
          </div>
          <br />
          <div className={styles.graphContainer}>
            {
              rainWarningBarChart.map((stack, i) =>
                <div className={styles.graphBarColumn} key={2 * i}>
                  <div className={((i * 6) == sliderValue) ? styles.graphBarStackCurrent : styles.graphBarStack} key="1">
                    {
                      stack.map((bar, j) =>
                        (bar > 0)
                          ?
                          (((i * 6) == sliderValue)) ? <div className={styles.graphBarCurrent} key={j} style={{ height: bar * 0.6 }}></div> : <div className={styles.graphBar} key={j} style={{ height: bar * 0.6 }}></div>
                          :
                          <div className={styles.graphBar} key={j} style={{ height: bar * 0.6, visiblity: "hidden" }}></div>
                      )
                    }
                  </div>
                </div>
              )
            }
          </div>
          <div className={styles.graphContainer}>
            {
              rainWarningBarChart.map((stack, i) =>
                <div className={styles.graphContainer}>
                  <div className={styles.graphBarHour} key="2">
                    {i * 6}h
                  </div>
                </div>)
            }
          </div>
        </div>
        <div className={styles.warningTypesContainer}>
          <h2 className={styles.warningTypeHeading}>Percentage of people under wind warnings:</h2>
          <div className={styles.warningCategoriesContainer}>
            {
              colorArray.map((c, i) =>
                (getWindWarningPercents()[i])
                  ?
                  <div key={i} className={styles.warningCategory} style={{ width: `${getWindWarningPercents()[i]}%` }}>
                    {(getWindWarningPercents()[i] > 8) ? explainWindWarnings[i] : ""}
                    <br />
                    {
                      getWindWarningPercents()[i]
                    }
                    %
                  </div>
                  :
                  <div key={i} className={styles.warningCategory} style={{ width: `${getWindWarningPercents()[i]}%`, visibility: "hidden", padding: "0px" }}>
                    {explainWindWarnings[i]}
                    <br />
                    {
                      getWindWarningPercents()[i]
                    }
                    %
                  </div>

              )
            }
          </div>
          <br />
          <div className={styles.graphContainer}>
            {
              windWarningBarChart.map((stack, i) =>
                <div className={styles.graphBarColumn} key={2 * i}>
                  <div className={((i * 6) == sliderValue) ? styles.graphBarStackCurrent : styles.graphBarStack} key="1">
                    {
                      stack.map((bar, j) =>
                        (bar > 0)
                          ?
                          (((i * 6) == sliderValue)) ? <div className={styles.graphBarCurrent} key={j} style={{ height: bar * 0.6 }}></div> : <div className={styles.graphBar} key={j} style={{ height: bar * 0.6 }}></div>
                          :
                          <div className={styles.graphBar} key={j} style={{ height: bar * 0.6, visiblity: "hidden" }}></div>
                      )
                    }
                  </div>
                </div>

              )
            }
          </div>
          <div className={styles.graphContainer}>
            {
              windWarningBarChart.map((stack, i) =>
                <div className={styles.graphContainer}>
                  <div className={styles.graphBarHour} key="2">
                    {i * 6}h
                  </div>
                </div>)
            }
          </div>
        </div>
        <div className={styles.sliderInfoContainer}>
          <div className={styles.dateDiv}>
            Selected time: {getLocalDate(selectedDate)}
          </div>
          <div className={styles.hoursDiv}>{formatDaysHours(sliderValue)} from now</div>
          <div className={styles.sliderContainer}>
            <input type="range" min="0" max="72" step="6" value={sliderValue} onChange={(e) => handleSliderChange(e)} className={styles.slider} id="myRange" />
          </div>
        </div>
      </main >

      <style jsx>{`
        main {
          width:100%;
          min-width: 100%;
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
          font-family: Verdana, sans-serif;
          color: white;
          background-color: #404040;
        }
        * {
          box-sizing: border-box;
        }
        h1 {
          margin: 0px;
        }
        h2 {
          font-weight: normal;
        }
      `}</style>
    </div >
  ) : null;
}
