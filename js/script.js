import {
    fetchJsonFile,
    getNames,
    addBasinNames,
    createUrl,
    formatString,
    getList,
    getMeanMinMaxList,
    haveOneYearOfData,
    blurBackground,
    popupMessage,
    loadingPageData
} from './functions.js'


// Web site app information
const appMetadata = {
    name: "CSH - Comparative Stage Hydrograph",
    description: "An interactive platform for creating a plot with historical data on river gages.",
    author: "U.S. Army Corps of Engineers, St. Louis District",
    version: "1.0",
    contact: {
        email: "dll-cemvs-water-managers@usace.army.mil",
        website: "https://www.mvs-wc.usace.army.mil/"
    }
}

//============== GLOBAL VARIABLES =======================//
let isMaintenance = false; // Manually set up Maintenance

// Const Elements
const basinName = document.getElementById('basinCombobox'),
      gageName = document.getElementById('gageCombobox'),
      officeName = document.getElementById('officeCombobox'),
      beginDate = document.getElementById('begin-input'),
      endDate = document.getElementById('end-input'),
      PORBeginDate = document.querySelector('#info-table .por-start'),
      POREndDate = document.querySelector('#info-table .por-end'),
      plotCSHBtn = document.getElementById('plot-btn'),
      instructionsBtn = document.getElementById('instruction-btn'),
      porCheckbox = document.getElementById('por-checkbox'),
      userSpecificCheckbox = document.getElementById('user-specific-checkbox'),
      noStatsCheckbox = document.getElementById('no-statistic-checkbox'),
      darkModeCheckbox = document.querySelector('.header label input'),
      popupWindowBtn = document.getElementById('popup-button'),
      isProjectLabel = document.getElementById('is-project'),
      year1SelectBox = document.getElementById('year-1-select'),
      year2SelectBox = document.getElementById('year-2-select'),
      year3SelectBox = document.getElementById('year-3-select'),
      year4SelectBox = document.getElementById('year-4-select'),
      year5SelectBox = document.getElementById('year-5-select'),
      year6SelectBox = document.getElementById('year-6-select'),
      year1ColorBox = document.getElementById('year-1-color'),
      year2ColorBox = document.getElementById('year-2-color'),
      year3ColorBox = document.getElementById('year-3-color'),
      year4ColorBox = document.getElementById('year-4-color'),
      year5ColorBox = document.getElementById('year-5-color'),
      year6ColorBox = document.getElementById('year-6-color'),
      averageColorBox = document.getElementById('average-color'),
      meanColorBox = document.getElementById('mean-color'),
      minMaxColorBox = document.getElementById('min-max-color'),
      floodStageCheckbox = document.getElementById('flood-stage-checkbox'),
      floodStageColorBox = document.getElementById('flood-stage-color'),
      lwrpCheckbox = document.getElementById('LWRP-checkbox'),
      lwrpColorBox = document.getElementById('lwrp-color'),
      settingsDiv = document.getElementById('settings-div'),
      separatorDiv = document.getElementById('separator-div'),
      statisticDiv = document.querySelector('#settings-div .statistic-plot-control'),
      statisticAverageCheckbox = document.getElementById('mean-checkbox'),
      statisticMeanCheckbox = document.getElementById('average-checkbox'),
      statisticMaxMinCheckbox = document.getElementById('max-min-checkbox'),
      minMaxShaderCheckbox = document.getElementById('shade-checkbox'),
      yearPlotDiv = document.querySelector('#settings-div .select-data-plot'),
      subSeparator1 = document.getElementById('sub-separator-1'),
      subSeparator2 = document.getElementById('sub-separator-2'),
      plotDiv = document.getElementById('plot'),
      plotDiv2 = document.getElementById('plot-2'),
      plotDiv3 = document.getElementById('plot-3'),
      instructionsDiv = document.getElementById('instructions-div'),
      floodStageText = document.getElementById('flood-stage-text'),
      lwrpStageText = document.getElementById('lwrp-text'),
      errorMessageDiv = document.getElementById('error-message'),
      errorMessageText = document.querySelector('#error-message h2'),
      timeSerieDiv = document.getElementById('time-serie-name-div'),
      timeSerieText = document.querySelector('#time-serie-name-div h2'),
      printBtnDiv = document.getElementById('print-btn-div'),
      printBtn= document.getElementById('print-btn'),
      inflowTimeSerieDiv = document.getElementById('inflow-time-serie-name-div'),
      inflowTimeSerieText = document.querySelector('#inflow-time-serie-name-div h2'),
      printBtn2Div = document.getElementById('print-btn-2-div'),
      printBtn2= document.getElementById('print-btn-2'),
      outflowTimeSerieDiv = document.getElementById('outflow-time-serie-name-div'),
      outflowTimeSerieText = document.querySelector('#outflow-time-serie-name-div h2'),
      printBtn3Div = document.getElementById('print-btn-3-div'),
      printBtn3= document.getElementById('print-btn-3'),
      progressBar = document.getElementById('progress'),
      progressBarDiv = document.getElementById('progress-bar-div'),
      progressBarText = document.querySelector('#progress-bar-div .progress-bar-text');;


let params = new URLSearchParams(window.location.search);
const cda = params.get("cda") ? params.get("cda") : "internal";
const conlog = params.get("conlog") ? params.get("conlog") : "false";
let isDeveloper = params.get("developer") ? params.get("developer").toLowerCase() : null;

if (isDeveloper === "true"){
    isMaintenance = false;
}

const consoleLog = conlog === "true" ? true : false;

// Global Variable
let globalDatman = null;
let globalDatmanInflow = null;
let globalDatmanOutflow = null;
let office;
let globalCounter;
let globalTotalCounter;
let sleepTime = 250;

if (isMaintenance){

    window.location.href = "../../html/maintenance.html";

} else {

    // if (userData == null || userData.length < 1) {

    //     userData = {
    //         darkMode: darkModeCheckbox.checked,
    //     };
    // } else {
    //     applyDarkMode();
    //     darkModeCheckbox.checked = userData.darkMode;
    // }

}


// Add function to popup window button
popupWindowBtn.addEventListener('click', blurBackground);

//loadingPageData();

initialize();

/**============= Main functions when data is retrieved ================**/
// Initilize page
function initialize() {

    // Add dark mode functionality
    darkModeCheckbox.addEventListener('click', function() {
        document.getElementById('content-body').classList.toggle('dark');
        document.getElementById('page-container').classList.toggle('dark');
    });

    instructionsBtn.addEventListener('click', function(){
        instructionsDiv.classList.toggle('hidden');
    });

    // Add print Function
    printBtn.addEventListener('click', function() { printPlot('plot') });
    printBtn2.addEventListener('click', function() { printPlot('plot-2') });
    printBtn3.addEventListener('click', function() { printPlot('plot-3') });

    let offices = [
        "MVS", "CERL", "CHL",  "CPC",  "CRREL","CWMS", "EL",   "ERD",  "GSL",  "HEC",
        "HQ",   "ITL",  "IWR",  "LCRA", "LRB",  "LRC",  "LRD",  "LRDG", "LRDO",
        "LRE",  "LRH",  "LRL",  "LRN",  "LRP",  "MVD",  "MVK",  "MVM",  "MVN",
        "MVP",  "MVR",  "MVS",  "NAB",  "NAD",  "NAE",  "NAN",  "NAO",  "NAP",
        "NDC",  "NWD",  "NWDM", "NWDP", "NWK",  "NWO",  "NWP",  "NWS",  "NWW",
        "POA",  "POD",  "POH",  "SAC",  "SAD",  "SAJ",  "SAM",  "SAS",  "SAW",
        "SPA",  "SPD",  "SPK",  "SPL",  "SPN",  "SWD",  "SWF",  "SWG",  "SWL",
        "SWT",  "TEC",  "WCSC", "WPC"
    ]

    // Add office name to dropdown list
    offices.forEach((item) => {
        let option = document.createElement('option');

        option.value = item;
        option.textContent = item;

        officeName.append(option);
    });  

    let selectOfficeOption = document.createElement('option');
    selectOfficeOption.value = "Select Office";
    selectOfficeOption.text = "Select Office";

    officeName.insertBefore(selectOfficeOption, officeName.firstChild);
    officeName.selectedIndex = 0;  
    
    // for (let i = 0; i < officeName.options.length; i++){
    //     let currentOption = officeName.options[i]
    //     if (currentOption.value === "MVS"){
    //         officeName.selectedIndex = i;
    //     }
    // }  

    gageName.disabled = true;
    basinName.disabled = true;

    // GET ALL DATA FOR THE SELECTED OFFICE
    officeName.addEventListener('change', async function() {

        try{

            loadingPageData();

            if (!haveClass(errorMessageDiv, 'hidden')){
                errorMessageDiv.classList.add('hidden');
            }

            // Disable all elements
            basinName.disabled = true;
            gageName.disabled = true;
            beginDate.disabled = true;
            endDate.disabled = true;
            plotCSHBtn.disabled = true;
        
            let setCategory = "Basins"; 

            office = officeName.value;

            //let type = "no idea";
        
            // Get the current date and time, and compute a "look-back" time for historical data
            const currentDateTime = new Date();
            const lookBackHours = subtractDaysFromDate(new Date(), 90);
        
            let setBaseUrl = null;
            if (cda === "internal") {
                setBaseUrl = `https://coe-${office.toLowerCase()}uwa04${office.toLowerCase()}.${office.toLowerCase()}.usace.army.mil:8243/${office.toLowerCase()}-data/`;
            } else if (cda === "public") {
                setBaseUrl = `https://cwms-data.usace.army.mil/cwms-data/`;
            }
        
            // Define the URL to fetch location groups based on category
            // const categoryApiUrl = setBaseUrl + `location/group?office=${office}&include-assigned=false&location-category-like=${setCategory}`;
            const categoryApiUrl = setBaseUrl + `location/group?office=${office}&group-office-id=${office}&category-office-id=${office}&category-id=${setCategory}`;

        
            // Initialize maps to store metadata and time-series ID (TSID) data for various parameters
            const metadataMap = new Map();
            const ownerMap = new Map();
            const tsidDatmanMap = new Map();
            const tsidStageMap = new Map();
            const projectMap = new Map();
            const tsidDatmanInflowMap = new Map();
            const tsidDatmanOutflowMap = new Map();
        
            // Initialize arrays for storing promises
            const metadataPromises = [];
            const ownerPromises = [];
            const datmanTsidPromises = [];
            const stageTsidPromises = [];
            const projectPromises = [];
            const datmanInflowTsidPromises = [];
            const datmanOutflowTsidPromises = [];
        
            // Fetch location group data from the API
            fetch(categoryApiUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (!Array.isArray(data) || data.length === 0) {
                        console.warn('No data available from the initial fetch.');
                        return;
                    }
        
                    // Filter and map the returned data to basins belonging to the target category
                    const targetCategory = { "office-id": office, "id": setCategory };
                    const filteredArray = filterByLocationCategory(data, targetCategory);
                    const basins = filteredArray.map(item => item.id);
        
                    if (basins.length === 0) {
                        console.warn('No basins found for the given category.');
                        return;
                    }
        
                    // Initialize an array to store promises for fetching basin data
                    const apiPromises = [];
                    const combinedData = [];
        
                    // Loop through each basin and fetch data for its assigned locations
                    basins.forEach(basin => {
                        const basinApiUrl = setBaseUrl + `location/group/${basin}?office=${office}&category-id=${setCategory}`;
        
                        apiPromises.push(
                            fetch(basinApiUrl)
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error(`Network response was not ok for basin ${basin}: ${response.statusText}`);
                                    }
                                    return response.json();
                                })
                                .then(getBasin => {
                                    // console.log('getBasin:', getBasin);
        
                                    if (!getBasin) {
                                        console.log(`No data for basin: ${basin}`);
                                        return;
                                    }
        
                                    // Filter and sort assigned locations based on 'attribute' field
                                    getBasin[`assigned-locations`] = getBasin[`assigned-locations`].filter(location => location.attribute <= 900);
                                    getBasin[`assigned-locations`].sort((a, b) => a.attribute - b.attribute);
                                    combinedData.push(getBasin);
        
                                    // If assigned locations exist, fetch metadata and time-series data
                                    if (getBasin['assigned-locations']) {
                                        getBasin['assigned-locations'].forEach(loc => {
                                            // console.log(loc['location-id']);
        
                                            // Fetch metadata for each location
                                            const locApiUrl = setBaseUrl + `locations/${loc['location-id']}?office=${office}`;
                                            // console.log("locApiUrl: ", locApiUrl);
                                            metadataPromises.push(
                                                fetch(locApiUrl)
                                                    .then(response => {
                                                        if (response.status === 404) {
                                                            console.warn(`Location metadata not found for location: ${loc['location-id']}`);
                                                            return null; // Skip if not found
                                                        }
                                                        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
                                                        return response.json();
                                                    })
                                                    .then(locData => {
                                                        if (locData) {
                                                            metadataMap.set(loc['location-id'], locData);
                                                        }
                                                    })
                                                    .catch(error => {
                                                        console.error(`Problem with the fetch operation for location ${loc['location-id']}:`, error);
                                                    })
                                            );
        
                                            // Fetch owner for each location
                                            let ownerApiUrl = setBaseUrl + `location/group/Datman?office=${office}&category-id=${office}`;
                                            if (ownerApiUrl) {
                                                ownerPromises.push(
                                                    fetch(ownerApiUrl)
                                                        .then(response => {
                                                            if (response.status === 404) {
                                                                console.warn(`Temp-Water TSID data not found for location: ${loc['location-id']}`);
                                                                return null;
                                                            }
                                                            if (!response.ok) {
                                                                throw new Error(`Network response was not ok: ${response.statusText}`);
                                                            }
                                                            return response.json();
                                                        })
                                                        .then(ownerData => {
                                                            if (ownerData) {
                                                                ownerMap.set(loc['location-id'], ownerData);
                                                            }
                                                        })
                                                        .catch(error => {
                                                            console.error(`Problem with the fetch operation for stage TSID data at ${ownerApiUrl}:`, error);
                                                        })
                                                );
                                            }
        
                                            // Fetch project for each location
                                            let projectApiUrl = setBaseUrl + `location/group/Project?office=${office}&category-id=${office}`;
                                            if (projectApiUrl) {
                                                projectPromises.push(
                                                    fetch(projectApiUrl)
                                                        .then(response => {
                                                            if (response.status === 404) {
                                                                console.warn(`Temp-Water TSID data not found for location: ${loc['location-id']}`);
                                                                return null;
                                                            }
                                                            if (!response.ok) {
                                                                throw new Error(`Network response was not ok: ${response.statusText}`);
                                                            }
                                                            return response.json();
                                                        })
                                                        .then(projectData => {
                                                            if (projectData) {
                                                                projectMap.set(loc['location-id'], projectData);
                                                            }
                                                        })
                                                        .catch(error => {
                                                            console.error(`Problem with the fetch operation for stage TSID data at ${projectApiUrl}:`, error);
                                                        })
                                                );
                                            }
        
        
                                            // Fetch datman TSID data
                                            const tsidDatmanApiUrl = setBaseUrl + `timeseries/group/Datman?office=${office}&category-id=${loc['location-id']}`;
                                            // console.log('tsidDatmanApiUrl:', tsidDatmanApiUrl);
                                            datmanTsidPromises.push(
                                                fetch(tsidDatmanApiUrl)
                                                    .then(response => {
                                                        if (response.status === 404) return null; // Skip if not found
                                                        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
                                                        return response.json();
                                                    })
                                                    .then(tsidDatmanData => {
                                                        // console.log('tsidDatmanData:', tsidDatmanData);
                                                        if (tsidDatmanData) {
                                                            tsidDatmanMap.set(loc['location-id'], tsidDatmanData);
                                                        }
                                                    })
                                                    .catch(error => {
                                                        console.error(`Problem with the fetch operation for stage TSID data at ${tsidDatmanApiUrl}:`, error);
                                                    })
                                            );
        
                                            // Fetch Inflow TSID data
                                            const tsidDatmanInflowApiUrl = setBaseUrl + `timeseries/group/Datman-Inflow?office=${office}&category-id=${loc['location-id']}`;
                                            // console.log('tsidDatmanInflowApiUrl:', tsidDatmanInflowApiUrl);
                                            datmanInflowTsidPromises.push(
                                                fetch(tsidDatmanInflowApiUrl)
                                                    .then(response => {
                                                        if (response.status === 404) return null; // Skip if not found
                                                        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
                                                        return response.json();
                                                    })
                                                    .then(tsidDatmanInflowData => {
                                                        // console.log('tsidDatmanInflowData:', tsidDatmanInflowData);
                                                        if (tsidDatmanInflowData) {
                                                            tsidDatmanInflowMap.set(loc['location-id'], tsidDatmanInflowData);
                                                        }
                                                    })
                                                    .catch(error => {
                                                        console.error(`Problem with the fetch operation for stage TSID data at ${tsidDatmanInflowApiUrl}:`, error);
                                                    })
                                            );
        
                                            // Fetch Outflow TSID data
                                            const tsidDatmanOutflowApiUrl = setBaseUrl + `timeseries/group/Datman-Outflow?office=${office}&category-id=${loc['location-id']}`;
                                            // console.log('tsidDatmanInflowApiUrl:', tsidDatmanInflowApiUrl);
                                            datmanOutflowTsidPromises.push(
                                                fetch(tsidDatmanOutflowApiUrl)
                                                    .then(response => {
                                                        if (response.status === 404) return null; // Skip if not found
                                                        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
                                                        return response.json();
                                                    })
                                                    .then(tsidDatmanOutflowData => {
                                                        // console.log('tsidDatmanInflowData:', tsidDatmanInflowData);
                                                        if (tsidDatmanOutflowData) {
                                                            tsidDatmanOutflowMap.set(loc['location-id'], tsidDatmanOutflowData);
                                                        }
                                                    })
                                                    .catch(error => {
                                                        console.error(`Problem with the fetch operation for stage TSID data at ${tsidDatmanOutflowApiUrl}:`, error);
                                                    })
                                            );
        
                                            // Fetch stage TSID data
                                            const tsidStageApiUrl = setBaseUrl + `timeseries/group/Stage?office=${office}&category-id=${loc['location-id']}`;
                                            // console.log('tsidStageApiUrl:', tsidStageApiUrl);
                                            stageTsidPromises.push(
                                                fetch(tsidStageApiUrl)
                                                    .then(response => {
                                                        if (response.status === 404) return null; // Skip if not found
                                                        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
                                                        return response.json();
                                                    })
                                                    .then(tsidStageData => {
                                                        // console.log('tsidStageData:', tsidStageData);
                                                        if (tsidStageData) {
                                                            tsidStageMap.set(loc['location-id'], tsidStageData);
                                                        }
                                                    })
                                                    .catch(error => {
                                                        console.error(`Problem with the fetch operation for stage TSID data at ${tsidStageApiUrl}:`, error);
                                                    })
                                            );
                                        });
                                    }
                                })
                                .catch(error => {
                                    console.error(`Problem with the fetch operation for basin ${basin}:`, error);
                                })
                        );
                    });
        
                    // Process all the API calls and store the fetched data
                    Promise.all(apiPromises)
                        .then(() => Promise.all(metadataPromises))
                        .then(() => Promise.all(ownerPromises))
                        .then(() => Promise.all(datmanTsidPromises))
                        .then(() => Promise.all(stageTsidPromises))
                        .then(() => Promise.all(datmanInflowTsidPromises))
                        .then(() => Promise.all(datmanOutflowTsidPromises))
                        .then(() => {
                            combinedData.forEach(basinData => {
                                if (basinData['assigned-locations']) {
                                    basinData['assigned-locations'].forEach(loc => {
                                        // Add metadata, TSID, and last-value data to the location object
        
                                        // Add metadata to json
                                        const metadataMapData = metadataMap.get(loc['location-id']);
                                        if (metadataMapData) {
                                            loc['metadata'] = metadataMapData;
                                        }
        
                                        // Add owner to json
                                        const ownerMapData = ownerMap.get(loc['location-id']);
                                        if (ownerMapData) {
                                            loc['owner'] = ownerMapData;
                                        };
        
                                        // Add project to json
                                        const projectMapData = projectMap.get(loc['location-id']);
                                        if (projectMapData) {
                                            loc['project'] = projectMapData;
                                        };
        
                                        // Add datman to json
                                        const tsidDatmanMapData = tsidDatmanMap.get(loc['location-id']);
                                        if (tsidDatmanMapData) {
                                            reorderByAttribute(tsidDatmanMapData);
                                            loc['tsid-datman'] = tsidDatmanMapData;
                                        } else {
                                            loc['tsid-datman'] = null;  // Append null if missing
                                        }
        
                                        // Add datman Inflow to json
                                        const tsidDatmanInflowMapData = tsidDatmanInflowMap.get(loc['location-id']);
                                        if (tsidDatmanInflowMapData) {
                                            reorderByAttribute(tsidDatmanInflowMapData);
                                            loc['tsid-datman-inflow'] = tsidDatmanInflowMapData;
                                        } else {
                                            loc['tsid-datman-inflow'] = null;  // Append null if missing
                                        }
        
                                        // Add datman Outflow to json
                                        const tsidDatmanOutflowMapData = tsidDatmanOutflowMap.get(loc['location-id']);
                                        if (tsidDatmanOutflowMapData) {
                                            reorderByAttribute(tsidDatmanOutflowMapData);
                                            loc['tsid-datman-outflow'] = tsidDatmanOutflowMapData;
                                        } else {
                                            loc['tsid-datman-outflow'] = null;  // Append null if missing
                                        }
        
                                        // Add stage to json
                                        const tsidStageMapData = tsidStageMap.get(loc['location-id']);
                                        if (tsidStageMapData) {
                                            reorderByAttribute(tsidStageMapData);
                                            loc['tsid-stage'] = tsidStageMapData;
                                        } else {
                                            loc['tsid-stage'] = null;  // Append null if missing
                                        }
        
                                        // Initialize empty arrays to hold API and last-value data for various parameters
                                        loc['datman-api-data'] = [];
                                        loc['datman-last-value'] = [];
        
                                        // Initialize empty arrays to hold API and last-value data for various parameters
                                        loc['stage-api-data'] = [];
                                        loc['stage-last-value'] = [];
                                    });
                                }
                            });
        
                            const timeSeriesDataPromises = [];
        
                            // Iterate over all arrays in combinedData
                            for (const dataArray of combinedData) {
                                for (const locData of dataArray['assigned-locations'] || []) {
                                    // Handle temperature, depth, and DO time series
                                    const datmanTimeSeries = locData['tsid-datman']?.['assigned-time-series'] || [];
                                    const datmanInflowTimeSeries = locData['tsid-datman-inflow']?.['assigned-time-series'] || [];
                                    const datmanOutflowTimeSeries = locData['tsid-datman-outflow']?.['assigned-time-series'] || [];
        
                                    // Function to create fetch promises for time series data
                                    const timeSeriesDataFetchPromises = (timeSeries, type) => {
                                        return timeSeries.map((series, index) => {
                                            const tsid = series['timeseries-id'];
                                            const timeSeriesDataApiUrl = setBaseUrl + `timeseries?name=${tsid}&begin=${lookBackHours.toISOString()}&end=${currentDateTime.toISOString()}&office=${office}`;
                                            
        
                                            return fetch(timeSeriesDataApiUrl, {
                                                method: 'GET',
                                                headers: {
                                                    'Accept': 'application/json;version=2'
                                                }
                                            })
                                                .then(res => res.json())
                                                .then(data => {
                                                    if (data.values) {
                                                        data.values.forEach(entry => {
                                                            entry[0] = formatISODate2ReadableDate(entry[0]);
                                                        });
                                                    }
        
                                                    let apiDataKey;
                                                    if (type === 'datman') {
                                                        apiDataKey = 'datman-api-data'; // Assuming 'do-api-data' is the key for dissolved oxygen data
                                                    } else {
                                                        console.error('Unknown type:', type);
                                                        return; // Early return to avoid pushing data if type is unknown
                                                    }
        
                                                    locData[apiDataKey].push(data);
        
        
                                                    let lastValueKey;
                                                    if (type === 'datman') {
                                                        lastValueKey = 'datman-last-value';  // Assuming 'do-last-value' is the key for dissolved oxygen last value
                                                    } else {
                                                        console.error('Unknown type:', type);
                                                        return; // Early return if the type is unknown
                                                    }
        
                                                    let maxValueKey;
                                                    if (type === 'datman') {
                                                        maxValueKey = 'datman-max-value';
                                                    } else {
                                                        console.error('Unknown type:', type);
                                                        return; // Early return if the type is unknown
                                                    }
        
                                                    let minValueKey;
                                                    if (type === 'datman') {
                                                        minValueKey = 'datman-min-value';
                                                    } else {
                                                        console.error('Unknown type:', type);
                                                        return; // Early return if the type is unknown
                                                    }
        
                                                    if (!locData[lastValueKey]) {
                                                        locData[lastValueKey] = [];  // Initialize as an array if it doesn't exist
                                                    }
        
                                                    if (!locData[maxValueKey]) {
                                                        locData[maxValueKey] = [];  // Initialize as an array if it doesn't exist
                                                    }
        
                                                    if (!locData[minValueKey]) {
                                                        locData[minValueKey] = [];  // Initialize as an array if it doesn't exist
                                                    }
        
        
                                                    // Get and store the last non-null value for the specific tsid
                                                    const lastValue = getLastNonNullValue(data, tsid);
        
                                                    // Get and store the last max value for the specific tsid
                                                    const maxValue = getMaxValue(data, tsid);
                                                    // console.log("maxValue: ", maxValue);
        
                                                    // Get and store the last min value for the specific tsid
                                                    const minValue = getMinValue(data, tsid);
                                                    // console.log("minValue: ", minValue);
        
                                                    // Push the last non-null value to the corresponding last-value array
                                                    locData[lastValueKey].push(lastValue);
        
                                                    // Push the last non-null value to the corresponding last-value array
                                                    locData[maxValueKey].push(maxValue);
        
                                                    // Push the last non-null value to the corresponding last-value array
                                                    locData[minValueKey].push(minValue);
        
                                                })
        
                                                .catch(error => {
                                                    console.error(`Error fetching additional data for location ${locData['location-id']} with TSID ${tsid}:`, error);
                                                });
                                        });
                                    };
        
        
                                    // Create promises for temperature, depth, and DO time series
                                    const datmanPromises = timeSeriesDataFetchPromises(datmanTimeSeries, 'datman');
                                    const datmanInflowPromises = timeSeriesDataFetchPromises(datmanInflowTimeSeries, 'datman-inflow');
                                    const datmanOutflowPromises = timeSeriesDataFetchPromises(datmanOutflowTimeSeries, 'datman-outflow');
        
                                    // Additional API call for extents data
                                    const timeSeriesDataExtentsApiCall = (type) => {
                                        const extentsApiUrl = setBaseUrl + `catalog/TIMESERIES?page-size=5000&office=${office}`;
        
                                        return fetch(extentsApiUrl, {
                                            method: 'GET',
                                            headers: {
                                                'Accept': 'application/json;version=2'
                                            }
                                        })
                                            .then(res => res.json())
                                            .then(data => {
                                                locData['extents-api-data'] = data;
                                                locData[`extents-data`] = {}
        
                                                // Collect TSIDs from temp, depth, and DO time series
                                                const datmanTids = datmanTimeSeries.map(series => series['timeseries-id']);
                                                const datmanInflowTids = datmanInflowTimeSeries.map(series => series['timeseries-id']);
                                                const datmanOutflowTids = datmanOutflowTimeSeries.map(series => series['timeseries-id']);
                                                const allTids = [...datmanTids, ...datmanInflowTids, ...datmanOutflowTids]; // Combine both arrays
        
                                                // Iterate over all TSIDs and create extents data entries
                                                allTids.forEach((tsid, index) => {
                                                    // console.log("tsid:", tsid);
                                                    const matchingEntry = data.entries.find(entry => entry['name'] === tsid);
                                                    if (matchingEntry) {
                                                        // Construct dynamic key
                                                        let _data = {
                                                            office: matchingEntry.office,
                                                            name: matchingEntry.name,
                                                            earliestTime: matchingEntry.extents[0]?.['earliest-time'],
                                                            lastUpdate: matchingEntry.extents[0]?.['last-update'],
                                                            latestTime: matchingEntry.extents[0]?.['latest-time'],
                                                            tsid: matchingEntry['timeseries-id'], // Include TSID for clarity
                                                        };
                                                        // console.log({ locData })
                                                        // Determine extent key based on tsid
                                                        let extent_key;
                                                        if (tsid.includes('Stage') || tsid.includes('Elev')) { // Example for another condition
                                                            extent_key = 'datman';
                                                        } else if (tsid.includes('Flow-In')) {
                                                            extent_key = 'datman-inflow';
                                                        } else if (tsid.includes('Flow-Out')) {
                                                            extent_key = 'datman-outflow';
                                                        } else {
                                                            return; // Ignore if it doesn't match either condition
                                                        }
                                                        // locData['tsid-extens-data']['temp-water'][0]
                                                        if (!locData[`extents-data`][extent_key])
                                                            locData[`extents-data`][extent_key] = [_data]
                                                        else
                                                            locData[`extents-data`][extent_key].push(_data)
        
                                                    } else {
                                                        console.warn(`No matching entry found for TSID: ${tsid}`);
                                                    }
                                                });
                                            })
                                            .catch(error => {
                                                console.error(`Error fetching additional data for location ${locData['location-id']}:`, error);
                                            });
                                    };
        
                                    // Combine all promises for this location
                                    timeSeriesDataPromises.push(Promise.all([...datmanPromises, ...datmanInflowPromises, ...datmanOutflowPromises, timeSeriesDataExtentsApiCall()]));
                                }
                            }
        
                            // Wait for all additional data fetches to complete
                            return Promise.all(timeSeriesDataPromises);
        
                        })
                        .then(() => {
            
                            // Step 1: Filter out locations where 'attribute' ends with '.1'
                            combinedData.forEach((dataObj, index) => {
                                // console.log(`Processing dataObj at index ${index}:`, dataObj['assigned-locations']);
            
                                // Filter out locations with 'attribute' ending in '.1'
                                dataObj['assigned-locations'] = dataObj['assigned-locations'].filter(location => {
                                    const attribute = location['attribute'].toString();
                                    if (attribute.endsWith('.1')) {
                                        // Log the location being removed
                                        return false; // Filter out this location
                                    }
                                    return true; // Keep the location
                                });
            
                                // console.log(`Updated assigned-locations for index ${index}:`, dataObj['assigned-locations']);
                            });
            
            
                            // Step 2: Filter out locations where 'location-id' doesn't match owner's 'assigned-locations'
                            combinedData.forEach(dataGroup => {
                                // Iterate over each assigned-location in the dataGroup
                                let locations = dataGroup['assigned-locations'];
            
                                // Loop through the locations array in reverse to safely remove items
                                for (let i = locations.length - 1; i >= 0; i--) {
                                    let location = locations[i];
            
                                    // Find if the current location-id exists in owner's assigned-locations
                                    let matchingOwnerLocation = location['owner']['assigned-locations'].some(ownerLoc => {
                                        return ownerLoc['location-id'] === location['location-id'];
                                    });
            
                                    // If no match, remove the location
                                    if (!matchingOwnerLocation) {
                                        locations.splice(i, 1);
                                    }
                                }
                            });
        
                            //loadingIndicator.style.display = 'none';
                            getDataToInitialize(combinedData);
        
        // =======================================================================================================================================
                        })
                        .catch(error => {
                            console.error('There was a problem with one or more fetch operations:', error);
                            //loadingIndicator.style.display = 'none';
                        });
        
                })
                .catch(error => {
                    console.error('There was a problem with the initial fetch operation:', error);
                    //loadingIndicator.style.display = 'none';
                    // popupMessage("error", "There was an error retrieving the data.<br>See the console log for more information.");
                    // popupWindowBtn.click();

                    if (haveClass(errorMessageDiv, 'hidden')){
                        errorMessageDiv.classList.remove('hidden');
                    }

                    errorMessageText.innerHTML = `There was a problem with the initial fetch operation: <strong>${error}</strong>`;

                    if (!haveClass(settingsDiv, 'hidden')){
                        settingsDiv.classList.add('hidden');
                    };
        
                    if (!haveClass(separatorDiv, 'hidden')){
                        separatorDiv.classList.add('hidden');
                    };

                    if (!haveClass(plotDiv, 'hidden')){
                        plotDiv.classList.add('hidden');
                    };

                    if (!haveClass(plotDiv2, 'hidden')){
                        plotDiv2.classList.add('hidden');
                    };

                    if (!haveClass(plotDiv3, 'hidden')){
                        plotDiv3.classList.add('hidden');
                    };

                    if (!haveClass(printBtnDiv, 'hidden')){
                        printBtnDiv.classList.add('hidden');
                    };

                    if (!haveClass(printBtn2Div, 'hidden')){
                        printBtn2Div.classList.add('hidden');
                    };

                    if (!haveClass(printBtn3Div, 'hidden')){
                        printBtn3Div.classList.add('hidden');
                    };

                    if (!haveClass(timeSerieDiv, 'hidden')){
                        timeSerieDiv.classList.add('hidden');
                    };

                    if (!haveClass(inflowTimeSerieDiv, 'hidden')){
                        inflowTimeSerieDiv.classList.add('hidden');
                    };

                    if (!haveClass(outflowTimeSerieDiv, 'hidden')){
                        outflowTimeSerieDiv.classList.add('hidden');
                    };

                    basinName.innerHTML = "";
                    gageName.innerHTML = "";

                    loadingPageData();
                });
        
            function filterByLocationCategory(array, setCategory) {
                return array.filter(item =>
                    item['location-category'] &&
                    item['location-category']['office-id'] === setCategory['office-id'] &&
                    item['location-category']['id'] === setCategory['id']
                );
            }
        
            function subtractHoursFromDate(date, hoursToSubtract) {
                return new Date(date.getTime() - (hoursToSubtract * 60 * 60 * 1000));
            }
        
            function subtractDaysFromDate(date, daysToSubtract) {
                return new Date(date.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));
            }
        
            function formatISODate2ReadableDate(timestamp) {
                const date = new Date(timestamp);
                const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month
                const dd = String(date.getDate()).padStart(2, '0'); // Day
                const yyyy = date.getFullYear(); // Year
                const hh = String(date.getHours()).padStart(2, '0'); // Hours
                const min = String(date.getMinutes()).padStart(2, '0'); // Minutes
                return `${mm}-${dd}-${yyyy} ${hh}:${min}`;
            }
        
            const reorderByAttribute = (data) => {
                data['assigned-time-series'].sort((a, b) => a.attribute - b.attribute);
            };
        
            const formatTime = (date) => {
                const pad = (num) => (num < 10 ? '0' + num : num);
                return `${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
            };
        
            const findValuesAtTimes = (data) => {
                const result = [];
                const currentDate = new Date();
        
                // Create time options for 5 AM, 6 AM, and 7 AM today in Central Standard Time
                const timesToCheck = [
                    new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 6, 0), // 6 AM CST
                    new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 5, 0), // 5 AM CST
                    new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 7, 0)  // 7 AM CST
                ];
        
                const foundValues = [];
        
                // Iterate over the values in the provided data
                const values = data.values;
        
                // Check for each time in the order of preference
                timesToCheck.forEach((time) => {
                    // Format the date-time to match the format in the data
                    const formattedTime = formatTime(time);
                    // console.log(formattedTime);
        
                    const entry = values.find(v => v[0] === formattedTime);
                    if (entry) {
                        foundValues.push({ time: formattedTime, value: entry[1] }); // Store both time and value if found
                    } else {
                        foundValues.push({ time: formattedTime, value: null }); // Store null if not found
                    }
                });
        
                // Push the result for this data entry
                result.push({
                    name: data.name,
                    values: foundValues // This will contain the array of { time, value } objects
                });
        
                return result;
            };
        
            function getLastNonNullValue(data, tsid) {
                // Iterate over the values array in reverse
                for (let i = data.values.length - 1; i >= 0; i--) {
                    // Check if the value at index i is not null
                    if (data.values[i][1] !== null) {
                        // Return the non-null value as separate variables
                        return {
                            tsid: tsid,
                            timestamp: data.values[i][0],
                            value: data.values[i][1],
                            qualityCode: data.values[i][2]
                        };
                    }
                }
                // If no non-null value is found, return null
                return null;
            }
        
            function getMaxValue(data, tsid) {
                let maxValue = -Infinity; // Start with the smallest possible value
                let maxEntry = null; // Store the corresponding max entry (timestamp, value, quality code)
        
                // Loop through the values array
                for (let i = 0; i < data.values.length; i++) {
                    // Check if the value at index i is not null
                    if (data.values[i][1] !== null) {
                        // Update maxValue and maxEntry if the current value is greater
                        if (data.values[i][1] > maxValue) {
                            maxValue = data.values[i][1];
                            maxEntry = {
                                tsid: tsid,
                                timestamp: data.values[i][0],
                                value: data.values[i][1],
                                qualityCode: data.values[i][2]
                            };
                        }
                    }
                }
        
                // Return the max entry (or null if no valid values were found)
                return maxEntry;
            }
        
            function getMinValue(data, tsid) {
                let minValue = Infinity; // Start with the largest possible value
                let minEntry = null; // Store the corresponding min entry (timestamp, value, quality code)
        
                // Loop through the values array
                for (let i = 0; i < data.values.length; i++) {
                    // Check if the value at index i is not null
                    if (data.values[i][1] !== null) {
                        // Update minValue and minEntry if the current value is smaller
                        if (data.values[i][1] < minValue) {
                            minValue = data.values[i][1];
                            minEntry = {
                                tsid: tsid,
                                timestamp: data.values[i][0],
                                value: data.values[i][1],
                                qualityCode: data.values[i][2]
                            };
                        }
                    }
                }
        
                // Return the min entry (or null if no valid values were found)
                return minEntry;
            }
        
            function hasLastValue(data) {
                let allLocationsValid = true; // Flag to track if all locations are valid
        
                // Iterate through each key in the data object
                for (const locationIndex in data) {
                    if (data.hasOwnProperty(locationIndex)) { // Ensure the key belongs to the object
                        const item = data[locationIndex];
                        // console.log(`Checking basin ${parseInt(locationIndex) + 1}:`, item); // Log the current item being checked
        
                        const assignedLocations = item['assigned-locations'];
                        // Check if assigned-locations is an object
                        if (typeof assignedLocations !== 'object' || assignedLocations === null) {
                            consoleLog(3, 'No assigned-locations found in basin:', item);
                            allLocationsValid = false; // Mark as invalid since no assigned locations are found
                            continue; // Skip to the next basin
                        }
        
                        // Iterate through each location in assigned-locations
                        for (const locationName in assignedLocations) {
                            const location = assignedLocations[locationName];
                            // console.log(`Checking location: ${locationName}`, location); // Log the current location being checked
        
                            // Check if location['tsid-temp-water'] exists, if not, set tempWaterTsidArray to an empty array
                            const datmanTsidArray = (location['tsid-datman'] && location['tsid-datman']['assigned-time-series']) || [];
                            const datmanLastValueArray = location['datman-last-value'];
                            // console.log("datmanTsidArray: ", datmanTsidArray);
                            // console.log("datmanLastValueArray: ", datmanLastValueArray);
        
                            // Check if 'datman-last-value' exists and is an array
                            let hasValidValue = false;
        
                            if (Array.isArray(datmanTsidArray) && datmanTsidArray.length > 0) {
                                // console.log('datmanTsidArray has data.');
        
                                // Loop through the datmanLastValueArray and check for null or invalid entries
                                for (let i = 0; i < datmanLastValueArray.length; i++) {
                                    const entry = datmanLastValueArray[i];
                                    // console.log("Checking entry: ", entry);
        
                                    // Step 1: If the entry is null, set hasValidValue to false
                                    if (entry === null) {
                                        //console.log(`Entry at index ${i} is null and not valid.`);
                                        hasValidValue = false;
                                        continue; // Skip to the next iteration, this is not valid
                                    }
        
                                    // Step 2: If the entry exists, check if the value is valid
                                    if (entry.value !== null && entry.value !== 'N/A' && entry.value !== undefined) {
                                        // console.log(`Valid entry found at index ${i}:`, entry);
                                        hasValidValue = true; // Set to true only if we have a valid entry
                                    } else {
                                        consoleLog(3, `Entry at index ${i} has an invalid value:`, entry.value);
                                        hasValidValue = false; // Invalid value, so set it to false
                                    }
                                }
        
                                // Log whether a valid entry was found
                                if (hasValidValue) {
                                    // console.log("There are valid entries in the array.");
                                } else {
                                    // console.log("No valid entries found in the array.");
                                }
                            } else {
                                consoleLog(3, `datmanTsidArray is either empty or not an array for location ${locationName}.`);
                            }
        
                            // If no valid values found in the current location, mark as invalid
                            if (!hasValidValue) {
                                allLocationsValid = false; // Set flag to false if any location is invalid
                            }
                        }
                    }
                }
        
                // Return true only if all locations are valid
                if (allLocationsValid) {
                    consoleLog(3, 'All locations have valid entries.');
                    return true;
                } else {
                    // console.log('Some locations are missing valid entries.');
                    return false;
                }
            }
        
            function hasDataSpikeInApiDataArray(data) {
                // Iterate through each key in the data object
                for (const locationIndex in data) {
                    if (data.hasOwnProperty(locationIndex)) { // Ensure the key belongs to the object
                        const item = data[locationIndex];
                        // console.log(`Checking basin ${parseInt(locationIndex) + 1}:`, item); // Log the current item being checked
        
                        const assignedLocations = item['assigned-locations'];
                        // Check if assigned-locations is an object
                        if (typeof assignedLocations !== 'object' || assignedLocations === null) {
                            consoleLog(3, 'No assigned-locations found in basin:', item);
                            continue; // Skip to the next basin
                        }
        
                        // Iterate through each location in assigned-locations
                        for (const locationName in assignedLocations) {
                            const location = assignedLocations[locationName];
                            // console.log(`Checking location: ${locationName}`, location); // Log the current location being checked
        
                            const datmanApiData = location['datman-api-data'];
        
                            // Check if 'datman-api-data' exists and has a 'values' array
                            if (Array.isArray(datmanApiData) && datmanApiData.length > 0) {
                                let maxValue = -Infinity; // Initialize to a very low value
                                let minValue = Infinity; // Initialize to a very high value
        
                                // Iterate through the 'values' array and find the max and min values
                                datmanApiData[0]['values'].forEach(valueEntry => {
                                    const currentValue = parseFloat(valueEntry[1]);
                                    if (!isNaN(currentValue)) {
                                        maxValue = Math.max(maxValue, currentValue);
                                        minValue = Math.min(minValue, currentValue);
                                    }
                                });
        
                                // Log the max and min values for the location
                                // console.log(`Max value for location ${locationName}:`, maxValue);
                                // console.log(`Min value for location ${locationName}:`, minValue);
        
                                // Check if the max value exceeds 999 or the min value is less than -999
                                if (maxValue > 999 || minValue < -999) {
                                    // console.log(`Data spike detected in location ${locationName}: max = ${maxValue}, min = ${minValue}`);
                                    return true; // Return true if any spike is found
                                }
                            } else {
                                consoleLog(3, `No valid 'datman-api-data' found in location ${locationName}.`);
                            }
                        }
                    }
                }
        
                // Return false if no data spikes were found
                consoleLog(3, 'No data spikes detected in any location.');
                return false;
            }
        
            function hasDataSpike(data) {
                // Iterate through each key in the data object
                // for (const locationIndex in data) {
                //     if (data.hasOwnProperty(locationIndex)) { // Ensure the key belongs to the object
                //         const item = data[locationIndex];
                //         console.log(`Checking basin ${parseInt(locationIndex) + 1}:`, item); // Log the current item being checked
        
                //         const assignedLocations = item['assigned-locations'];
                //         // Check if assigned-locations is an object
                //         if (typeof assignedLocations !== 'object' || assignedLocations === null) {
                //             console.log('No assigned-locations found in basin:', item);
                //             continue; // Skip to the next basin
                //         }
        
                //         // Iterate through each location in assigned-locations
                //         for (const locationName in assignedLocations) {
                //             const location = assignedLocations[locationName];
                //             console.log(`Checking location: ${locationName}`, location); // Log the current location being checked
                //             const datmanMaxValue = location['datman-max-value'][0][`value`];
                //             const datmanMinValue = location['datman-min-value'][0][`value`];
        
                //             // Check if datmanMaxValue or datmanMinValue exists
                //             if (datmanMaxValue || datmanMinValue) {
                //                 // Check if the max value exceeds 999 or the min value is less than -999
                //                 if (datmanMaxValue > 999) {
                //                     console.log(`Data spike detected in location ${locationName}: max = ${datmanMaxValue}`);
                //                     return true; // Return true if any spike is found
                //                 }
                //                 if (datmanMinValue < -999) {
                //                     console.log(`Data spike detected in location ${locationName}: min = ${datmanMinValue}`);
                //                     return true; // Return true if any spike is found
                //                 }
                //             } else {
                //                 console.log(`No valid 'datman-max-value' or 'datman-min-value' found in location ${locationName}.`);
                //             }
                //         }
                //     }
                // }
        
                // // Return false if no data spikes were found
                // console.log('No data spikes detected in any location.');
                // return false;
            }
        
            function createTable(data) {
                const table = document.createElement('table');
                table.id = 'customers'; // Assigning the ID of "customers"
        
                data.forEach(item => {
                    // Create header row for the item's ID
                    const headerRow = document.createElement('tr');
                    const idHeader = document.createElement('th');
                    idHeader.colSpan = 4;
                    // Apply styles
                    idHeader.style.backgroundColor = 'darkblue';
                    idHeader.style.color = 'white';
                    idHeader.textContent = item.id; // Display the item's ID
                    headerRow.appendChild(idHeader);
                    table.appendChild(headerRow);
        
                    // Create subheader row for "Time Series", "Value", "Date Time"
                    const subHeaderRow = document.createElement('tr');
                    ['Time Series', 'Value', 'Earliest Time', 'Latest Time'].forEach(headerText => {
                        const td = document.createElement('td');
                        td.textContent = headerText;
                        subHeaderRow.appendChild(td);
                    });
                    table.appendChild(subHeaderRow);
        
                    // Process each assigned location
                    item['assigned-locations'].forEach(location => {
                        const datmanData = location['extents-data']?.['datman'] || [];
        
                        // Function to create data row
                        const createDataRow = (tsid, value, timestamp, earliestTime) => {
                            const dataRow = document.createElement('tr');
        
                            const nameCell = document.createElement('td');
                            nameCell.textContent = tsid;
        
                            const lastValueCell = document.createElement('td');
        
                            // Create the span for the value
                            const valueSpan = document.createElement('span');
        
                            // Check if the value is null or not
                            if (value === null || isNaN(value)){
                                valueSpan.classList.add('blinking-text');
                                valueSpan.textContent = 'N/A'; // Or any placeholder you want for null values
                            } else {
                                valueSpan.textContent = parseFloat(value).toFixed(2);
                            }
        
                            lastValueCell.appendChild(valueSpan);
        
                            const earliestTimeCell = document.createElement('td');
                            earliestTimeCell.textContent = earliestTime;
        
                            const latestTimeCell = document.createElement('td');
                            latestTimeCell.textContent = timestamp;
        
                            dataRow.appendChild(nameCell);
                            dataRow.appendChild(lastValueCell);
                            dataRow.appendChild(earliestTimeCell);
                            dataRow.appendChild(latestTimeCell);
        
                            table.appendChild(dataRow);
                        };
        
                        // Process Datman data
                        datmanData.forEach(datmanEntry => {
                            const tsid = datmanEntry.name; // Time-series ID from extents-data
                            const earliestTime = datmanEntry.earliestTime;
                            const latestTime = datmanEntry.latestTime;
        
                            // Safely access 'do-last-value'
                            const lastDatmanValue = (Array.isArray(location['datman-last-value'])
                                ? location['datman-last-value'].find(entry => entry && entry.tsid === tsid)
                                : null) || { value: 'N/A', timestamp: 'N/A' };
        
                            let dateTimeDatman = null;
                            dateTimeDatman = datmanEntry.latestTime;
                            createDataRow(tsid, lastDatmanValue.value, dateTimeDatman, earliestTime);
                        });
        
                        // If no data available for temp-water, depth, and do
                        if (datmanData.length === 0) {
                            const dataRow = document.createElement('tr');
        
                            const nameCell = document.createElement('td');
                            nameCell.textContent = 'No Data Available';
                            nameCell.colSpan = 3; // Span across all three columns
        
                            dataRow.appendChild(nameCell);
                            table.appendChild(dataRow);
                        }
                    });
                });
        
                return table;
            }
        
            function createTableDataSpike(data) {
                const table = document.createElement('table');
                table.id = 'customers'; // Assigning the ID of "customers"
        
                data.forEach(item => {
                    const assignedLocations = item['assigned-locations'];
        
                    // Proceed only if there are assigned locations
                    if (Array.isArray(assignedLocations) && assignedLocations.length > 0) {
        
                        // Process each assigned location
                        assignedLocations.forEach(location => {
                            let hasDataRows = false; // Reset flag for each location
        
                            const datmanMaxData = location['datman-max-value'] || [];
                            const datmanMinData = location['datman-min-value'] || [];
                            const ownerData = location['owner'][`assigned-locations`] || [];
                            const locationIdData = location['location-id'] || [];
        
                            // console.log("ownerData: ", ownerData);
                            // console.log("locationIdData: ", locationIdData);
        
                            // Temporary storage for data entries to check for spikes
                            const spikeData = [];
        
                            // Check each data type for spikes, with both min and max values
                            const checkForSpikes = (minDataArray, maxDataArray) => {
                                minDataArray.forEach((minEntry, index) => {
                                    const tsid = minEntry.tsid;
                                    const minValue = parseFloat(minEntry.value); // Get min value
                                    const maxEntry = maxDataArray[index];
                                    const maxValue = parseFloat(maxEntry?.value || 0); // Get max value (ensure no undefined)
                                    const latestTime = minEntry.timestamp; // Use timestamp from minDataArray
        
                                    // Check for spike condition (both min and max)
                                    if (maxValue > 999 || minValue < -999) {
                                        spikeData.push({
                                            tsid,
                                            maxValue: maxValue.toFixed(2),
                                            minValue: minValue.toFixed(2),
                                            timestamp: latestTime
                                        });
                                        hasDataRows = true; // Mark that we have valid data rows
                                    }
                                });
                            };
        
                            // Check for spikes in each type of data
                            checkForSpikes(datmanMinData, datmanMaxData);
        
                            // Log the collected spike data for debugging
                            // console.log("datmanMaxData: ", datmanMaxData);
                            // console.log("datmanMinData: ", datmanMinData);
                            // console.log(`Spike data for location ${location[`location-id`]}:`, spikeData);
                            // console.log("hasDataRows: ", hasDataRows);
        
                            // Create header and subheader if we have spike data
                            if (hasDataRows) {
                                // Create header row for the item's ID
                                const headerRow = document.createElement('tr');
                                const idHeader = document.createElement('th');
                                idHeader.colSpan = 4; // Adjusting colspan for an additional column
                                idHeader.style.backgroundColor = 'darkblue';
                                idHeader.style.color = 'white';
                                idHeader.textContent = item.id; // Display the item's ID
                                headerRow.appendChild(idHeader);
                                table.appendChild(headerRow);
        
                                // Create subheader row for "Time Series", "Max Value", "Min Value", "Latest Time"
                                const subHeaderRow = document.createElement('tr');
                                ['Time Series', 'Max Value', 'Min Value', 'Latest Time'].forEach((headerText, index) => {
                                    const td = document.createElement('td');
                                    td.textContent = headerText;
        
                                    // Set width for each column
                                    if (index === 0) {
                                        td.style.width = '50%';
                                    } else if (index === 1 || index === 2) {
                                        td.style.width = '15%';
                                    } else {
                                        td.style.width = '20%';
                                    }
        
                                    subHeaderRow.appendChild(td);
                                });
                                table.appendChild(subHeaderRow);
        
                                // Append data rows for spikes
                                spikeData.forEach(({ tsid, maxValue, minValue, timestamp }) => {
                                    createDataRow(tsid, maxValue, minValue, timestamp, ownerData, locationIdData);
                                });
                            }
                        });
                    }
                });
        
        
                return table;
        
                // Helper function to create data rows
                function createDataRow(tsid, maxValue, minValue, timestamp, ownerData, locationIdData) {
                    const dataRow = document.createElement('tr');
        
                    // First column (tsid) as a link
                    const nameCell = document.createElement('td');
                    const link = document.createElement('a');
                    link.href = `https://wm.mvs.ds.usace.army.mil/district_templates/chart/index.html?office=MVS&cwms_ts_id=${tsid}&cda=${cda}&lookback=90`; // Set the link's destination (you can modify the URL)
                    link.target = '_blank'; // Open link in a new tab
                    link.textContent = tsid;
                    nameCell.appendChild(link);
        
                    // Check if locationIdData matches any entry in ownerData
                    const isMatch = ownerData.some(owner => owner['location-id'] === locationIdData);
                    if (!isMatch) {
                        nameCell.style.color = 'darkblue'; // Apply dark blue color if there's a match
                    }
        
                    const maxValueCell = document.createElement('td');
                    // Wrap the max value in a span with the blinking-text class
                    const maxValueSpan = document.createElement('span');
                    maxValueSpan.classList.add('blinking-text');
                    maxValueSpan.textContent = maxValue;
                    maxValueCell.appendChild(maxValueSpan);
        
                    const minValueCell = document.createElement('td');
                    // Wrap the min value in a span with the blinking-text class
                    const minValueSpan = document.createElement('span');
                    minValueSpan.classList.add('blinking-text');
                    minValueSpan.textContent = minValue;
                    minValueCell.appendChild(minValueSpan);
        
                    const latestTimeCell = document.createElement('td');
                    latestTimeCell.textContent = timestamp;
        
                    dataRow.appendChild(nameCell);
                    dataRow.appendChild(maxValueCell);
                    dataRow.appendChild(minValueCell);
                    dataRow.appendChild(latestTimeCell);
        
                    table.appendChild(dataRow);
                }
            }
        
        } catch (err) {
            console.log("There was an error getting the data.\nError: ", err);
        }
    });
    
}

function getDataToInitialize(data) {

    consoleLog ? console.log("Initialize Data: ", data) : null;

    // Extract the names of the basins with the list of gages
    let namesObject = getNames(data); 

    // Add the basins names to the basin combobox
    addBasinNames(basinName, namesObject);

    // Change the gage values each time the basin value is changed
    basinName.addEventListener('change', function() {

        plotCSHBtn.disabled = true;

        if (!haveClass(printBtnDiv, 'hidden')){
            printBtnDiv.classList.add('hidden')
        }

        if (!haveClass(timeSerieDiv, 'hidden')){
            timeSerieDiv.classList.add('hidden')
        }

        if (!haveClass(printBtn2Div, 'hidden')){
            printBtn2Div.classList.add('hidden')
        }

        if (!haveClass(inflowTimeSerieDiv, 'hidden')){
            inflowTimeSerieDiv.classList.add('hidden')
        }

        if (!haveClass(printBtn3Div, 'hidden')){
            printBtn3Div.classList.add('hidden')
        }

        if (!haveClass(outflowTimeSerieDiv, 'hidden')){
            outflowTimeSerieDiv.classList.add('hidden')
        }

        gageName.options.length = 0;
        namesObject.forEach(element => {
            if (element['basin'] === basinName.value) {
                element['datman'].forEach(item => {
                    let option = document.createElement('option');
                    option.value = item;
                    option.textContent = item.split('.')[0];
                    gageName.appendChild(option);
                });
            }
        });

        // Add empty selections to the dropdown list
        let selectGageOption = document.createElement('option');
        selectGageOption.value = "Select Gage";
        selectGageOption.text = "Select Gage";

        gageName.insertBefore(selectGageOption, gageName.firstChild);
        gageName.selectedIndex = 0;

        if (basinName.value === "Select Basin"){
            PORBeginDate.textContent = "MM/DD/YYYY";
            POREndDate.textContent = "MM/DD/YYYY";
        }

        // Determine if it's project
        isGageProject(data);

        updateAvailablePORTable(data);

        resetSettingWindow();

        beginDate.disabled = true;
        endDate.disabled = true;

        if (!haveClass(plotDiv, 'hidden')) {
            plotDiv.classList.add('hidden');
        };

        if (!haveClass(plotDiv2, 'hidden')) {
            plotDiv2.classList.add('hidden');
        };

        if (!haveClass(plotDiv3, 'hidden')) {
            plotDiv3.classList.add('hidden');
        };

        if(haveClass(floodStageColorBox, 'hidden')){
            floodStageColorBox.classList.remove('hidden');
        };

        if(haveClass(lwrpColorBox, 'hidden')){
            lwrpColorBox.classList.remove('hidden');
        };

        if (!haveClass(errorMessageDiv, 'hidden')){
            errorMessageDiv.classList.add('hidden');
        }

        floodStageCheckbox.checked = false;
        lwrpCheckbox.checked = false;

        floodStageText.innerHTML = "Plot Flood Stage";
        lwrpStageText.innerHTML = "Plot LWRP";

        year1SelectBox.selectedIndex = 0;
        year2SelectBox.selectedIndex = 0;
        year3SelectBox.selectedIndex = 0;        
        year4SelectBox.selectedIndex = 0;
        year5SelectBox.selectedIndex = 0;
        year6SelectBox.selectedIndex = 0;

        statisticMeanCheckbox.checked = false;

    });

    updateAvailablePORTable(data);
    PORBeginDate.textContent = "MM/DD/YYYY";
    POREndDate.textContent = "MM/DD/YYYY";

    // Update 'Avaliable POR' table everytime the gage name is changed
    gageName.addEventListener('change', function(){

        plotCSHBtn.disabled = true;

        if (!haveClass(printBtnDiv, 'hidden')){
            printBtnDiv.classList.add('hidden')
        }

        if (!haveClass(timeSerieDiv, 'hidden')){
            timeSerieDiv.classList.add('hidden')
        }

        if (!haveClass(printBtn2Div, 'hidden')){
            printBtn2Div.classList.add('hidden')
        }

        if (!haveClass(inflowTimeSerieDiv, 'hidden')){
            inflowTimeSerieDiv.classList.add('hidden')
        }

        if (!haveClass(printBtn3Div, 'hidden')){
            printBtn3Div.classList.add('hidden')
        }

        if (!haveClass(outflowTimeSerieDiv, 'hidden')){
            outflowTimeSerieDiv.classList.add('hidden')
        }

        updateAvailablePORTable(data);

        // Determine if it's project
        isGageProject(data);

        if (gageName.value !== "Select Gage"){
            activateSettingWindow();
        } else if (!haveClass(settingsDiv, 'hidden')) {
            settingsDiv.classList.add('hidden');
        }

        if (!haveClass(errorMessageDiv, 'hidden')){
            errorMessageDiv.classList.add('hidden');
        }

        if (gageName.value === "Select Gage"){
            PORBeginDate.textContent = "MM/DD/YYYY";
            POREndDate.textContent = "MM/DD/YYYY";
        }

        resetSomeSettingWindow()

        beginDate.disabled = true;
        endDate.disabled = true;

        if (!haveClass(plotDiv, 'hidden')) {
            plotDiv.classList.add('hidden');
        };

        if (!haveClass(plotDiv2, 'hidden')) {
            plotDiv2.classList.add('hidden');
        };

        if (!haveClass(plotDiv3, 'hidden')) {
            plotDiv3.classList.add('hidden');
        };

        if(haveClass(floodStageColorBox, 'hidden')){
            floodStageColorBox.classList.remove('hidden');
        };

        if(haveClass(lwrpColorBox, 'hidden')){
            lwrpColorBox.classList.remove('hidden');
        };

        floodStageCheckbox.checked = false;
        lwrpCheckbox.checked = false;

        floodStageText.innerHTML = "Plot Flood Stage";
        lwrpStageText.innerHTML = "Plot LWRP";

        year1SelectBox.selectedIndex = 0;
        year2SelectBox.selectedIndex = 0;
        year3SelectBox.selectedIndex = 0;        
        year4SelectBox.selectedIndex = 0;
        year5SelectBox.selectedIndex = 0;
        year6SelectBox.selectedIndex = 0;

        statisticMeanCheckbox.checked = false;

        populateDropdownList();

    });

    // Determine if it's project
    isGageProject(data);

    // Get all data to create the url
    const domain = "https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data";
    const timeSeries = "/timeseries?";
    const timeZone = "CST6CDT";

    //loadingElement.hidden = true;

    loadingPageData();

    // Set the checkbox to off
    porCheckbox.checked = false;
    userSpecificCheckbox.checked = false;
    noStatsCheckbox.checked = false;

    porCheckbox.addEventListener('click', porCheckboxChecked);
    userSpecificCheckbox.addEventListener('click', userSpecificCheckboxChecked);
    noStatsCheckbox.addEventListener('click', noStatsCheckboxChecked);

    populateDropdownList();

    // Add empty selections to the dropdown list
    let selectBasinOption = document.createElement('option');
    selectBasinOption.value = "Select Basin";
    selectBasinOption.text = "Select Basin";

    let selectGageOption = document.createElement('option');
    selectGageOption.value = "Select Gage";
    selectGageOption.text = "Select Gage";

    basinName.insertBefore(selectBasinOption, basinName.firstChild);
    basinName.selectedIndex = 0;

    gageName.append(selectGageOption);

    // Enable all elements
    basinName.disabled = false;
    gageName.disabled = false;

    // HTML button clicked
    plotCSHBtn.addEventListener('click', async function() {

        // Verify if the selected period is more than one year.
        if (haveOneYearOfData(beginDate.value, endDate.value) && beginDate.value < endDate.value) {

            plotDiv.classList.add('hidden');

            if (!haveClass(errorMessageDiv, 'hidden')){
                errorMessageDiv.classList.add('hidden');
            }

            if (haveClass(progressBarDiv, 'hidden')){
                progressBarDiv.classList.remove('hidden');
            }

            //loadingPageData();

            globalCounter = 0;
            globalTotalCounter = 20;
            processNextItem(globalCounter, globalTotalCounter, "Creating Plot");
            await sleep(sleepTime);

            // Get Datman name ID
            let datmanName = null;
            let datmanInflowName = null;
            let datmanOutflowName = null;
            data.forEach(element => {
                if (element['id'] === basinName.value) {
                    element['assigned-locations'].forEach(item => {
                        if (item['location-id'] === gageName.value) {

                            try{
                                datmanName = item['extents-data']['datman'][0]['name'];
                                datmanInflowName = item['extents-data']['datman-inflow'][0]['name'];
                                datmanOutflowName = item['extents-data']['datman-outflow'][0]['name'];
                            } catch (err) {
                                console.error("There is no Inflow or Outflow data: ", err);
                            }
                            
                        };
                    });
                };
            });
            globalDatman = datmanName;
            globalDatmanInflow = datmanInflowName;
            globalDatmanOutflow = datmanOutflowName;

            globalCounter += 1;
            processNextItem(globalCounter, globalTotalCounter, "Creating Plot");
            await sleep(sleepTime);

            consoleLog ? console.log({globalDatman, globalDatmanInflow, globalDatmanOutflow}) : null;

            // Initialize variables
            let beginValue = formatString("start date", beginDate.value); // YYYY-MM-DD
            let endValue = formatString('end date', endDate.value); // YYYY-MM-DD

            // Create the URL to get the data
            let stageUrl = createUrl(domain,timeSeries,datmanName,office,beginValue,endValue,timeZone);

            let pageSize = 500000;

            stageUrl = stageUrl + `&page-size=${pageSize}`;

            consoleLog ? console.log(stageUrl) : null;

            globalCounter += 1;
            processNextItem(globalCounter, globalTotalCounter, "Creating Plot");
            await sleep(sleepTime);

            fetchJsonFile(stageUrl, async function(newData) { 

                // Update Location Info
                let gageInformation = null;
                data.forEach(basin => {
                    if (basin['id'] === basinName.value) {
                        basin['assigned-locations'].forEach(gage => {
                            if (gage['location-id'] === gageName.value) {
                                gageInformation = gage['metadata'];
                            };
                        });
                    };
                });

                globalCounter += 1;
                processNextItem(globalCounter, globalTotalCounter, "Creating Plot");
                await sleep(sleepTime);

                main(newData, "stage", "plot", plotDiv, printBtnDiv, timeSerieDiv, timeSerieText);


            }, function(error){
                popupMessage("error", "There was an error getting the data.<br>Error: '" + error + "'");
                popupWindowBtn.click();

                if (!haveClass(progressBarDiv, 'hidden')){
                    progressBarDiv.classList.add('hidden');
                }
            });

            // If there is Inflow Data
            if (globalDatmanInflow !== null){

                let stageUrl2 = createUrl(domain,timeSeries,datmanInflowName,office,beginValue,endValue,timeZone);
                stageUrl2 = stageUrl2 + `&page-size=${pageSize}`;

                fetchJsonFile(stageUrl2, function(newData) { 

                    main(newData, "inflow", "plot-2", plotDiv2, printBtn2Div, inflowTimeSerieDiv, inflowTimeSerieText);

                }, function(){
                    popupMessage("error", "There was an error getting the data.<br>Error: '" + error + "'");
                    popupWindowBtn.click();
                });

            }
            
            // If there is Outflow Data
            if (globalDatmanOutflow !== null){

                let stageUrl3 = createUrl(domain,timeSeries,datmanOutflowName,office,beginValue,endValue,timeZone);
                stageUrl3 = stageUrl3 + `&page-size=${pageSize}`;

                fetchJsonFile(stageUrl3, function(newData) { 

                    main(newData, "outflow", "plot-3", plotDiv3, printBtn3Div, outflowTimeSerieDiv, outflowTimeSerieText);

                }, function(error){
                    popupMessage("error", "There was an error getting the data.<br>Error: '" + error + "'");
                    popupWindowBtn.click();

                });

            }

        } else {

            popupMessage("error", "There was an error with the time window selected. Make sure the time window is <strong>ONE</strong> year or more, and the ending date is greater than the starting date");
            popupWindowBtn.click();
        }

        
    });   
        
        
}

// Main function
async function main(data, dataType, plotID, plotDIV, plotPrintBtnDIV, plotTimeSerieDIV, plotTimeSerieText) {

    let yAxisLabel = dataType === "stage" ? "Stage(ft)" : "Flow(cfs)";
    
    let objData = data["values"];
    
    // Get list with all the years
    let wholePeriodList = getList(objData);
    let totalData = getMeanMinMaxList(wholePeriodList);

    consoleLog ? console.log("Whole Period Data: ", wholePeriodList) : null;
    consoleLog ? console.log("Total Data: ", totalData) : null;

    globalCounter += 1;
    processNextItem(globalCounter, globalTotalCounter, "Creating Plot");
    await sleep(sleepTime);

    // Separete data between mean, max and min
    let meanData = totalData[0];
    let minData = totalData[1];
    let maxData = totalData[2];

    // Time Window interval
    let timeWindow = `${PORBeginDate.textContent.split('/')[2]} - ${POREndDate.textContent.split('/')[2]}`;

    // Get the actual time window
    if (userSpecificCheckbox.checked){
        timeWindow = `${beginDate.value.split('-')[0]} - ${endDate.value.split('-')[0]}`;
    }

    globalCounter += 1;
    processNextItem(globalCounter, globalTotalCounter, "Creating Plot");
    await sleep(sleepTime);

    // Get all the years input
    let year1Input = year1SelectBox.value === "NONE" ? null : parseInt(year1SelectBox.value);
    let year2Input = year2SelectBox.value === "NONE" ? null : parseInt(year2SelectBox.value);
    let year3Input = year3SelectBox.value === "NONE" ? null : parseInt(year3SelectBox.value);
    let year4Input = year4SelectBox.value === "NONE" ? null : parseInt(year4SelectBox.value);
    let year5Input = year5SelectBox.value === "NONE" ? null : parseInt(year5SelectBox.value);
    let year6Input = year6SelectBox.value === "NONE" ? null : parseInt(year6SelectBox.value);

    let year1Color = year1ColorBox.value;
    let year2Color = year2ColorBox.value;
    let year3Color = year3ColorBox.value;
    let year4Color = year4ColorBox.value;
    let year5Color = year5ColorBox.value;
    let year6Color = year6ColorBox.value;

    let minMaxColor = minMaxColorBox.value;
    let averageColor = averageColorBox.value;
    let meanColor = meanColorBox.value;

    let floodStageColor = floodStageColorBox.value;
    let lwrpColor = lwrpColorBox.value;

    let yearsInputList = [
        {year: year1Input, color: year1Color}, {year: year2Input, color: year2Color}, {year: year3Input, color: year3Color},
        {year: year4Input, color: year4Color}, {year: year5Input, color: year5Color}, {year: year6Input, color: year6Color}
    ];

    globalCounter += 1;
    processNextItem(globalCounter, globalTotalCounter, "Creating Plot");
    await sleep(sleepTime);

    // If year is not in the time window trow an error
    let stopFunction = false;
    yearsInputList.forEach(element => {
        if ((element.year > parseInt(endDate.value.split('-')[0]) || element.year < parseInt(beginDate.value.split('-')[0])) && element.year !== null){
            stopFunction = true
        }
    });

    if (stopFunction) {
        if (haveClass(errorMessageDiv, 'hidden')){
            errorMessageDiv.classList.remove('hidden');
            errorMessageText.textContent = "One or more of the selected years are outside the selected time window."
        }
        loadingPageData();
        return
    }

    globalCounter += 1;
    processNextItem(globalCounter, globalTotalCounter, "Creating Plot");
    await sleep(sleepTime);

    let actualYearInput = yearsInputList.filter(x => x.year !== null);

    // Generate dates for 2024 which is a leap year
    let leapYear = 2024;
    let xAxisValues = generateDateAxis(leapYear);

    //let monthMinAndMax = getMinMaxForMonths(meanData);

    let monthMinAndMax = extractMinMaxforMonths(wholePeriodList);

    // List for the plotting
    let plotData = [];

    globalCounter += 1;
    processNextItem(globalCounter, globalTotalCounter, "Creating Plot");
    await sleep(sleepTime);

    // Generate the statistic series for plotting
    //let meanPlotSerie = createMeanSerie(meanData, xAxisValues, "Mean Test", "lines"); // Mean Serie

    if (!noStatsCheckbox.checked && statisticMaxMinCheckbox.checked){

        let maxPlotSerie = createMinMaxSerie(maxData, xAxisValues, `Max (${timeWindow})`, "lines", false, minMaxColor, false); // Maximum Serie
        let minPlotSerie = createMinMaxSerie(minData, xAxisValues, `Min (${timeWindow})`, "lines", minMaxShaderCheckbox.checked, minMaxColor, false); // Minimum Serie
        let dummyMinMax = dummySerie(`Max & Min (${timeWindow})     `, 'group1', minMaxColor, true);

        plotData = [maxPlotSerie, minPlotSerie, dummyMinMax[0], dummyMinMax[1]];

    };

    if (!noStatsCheckbox.checked && statisticMeanCheckbox.checked){

        let monthMaxPlotSerie = createMonthMinMaxSerie(monthMinAndMax, xAxisValues, `Monthly Max (${timeWindow})`, "lines", "max", false, averageColor, false); // Month Maximum Serie
        let monthMinPlotSerie = createMonthMinMaxSerie(monthMinAndMax, xAxisValues, `Monthly Min (${timeWindow})`, "lines", "min", true, averageColor, false); // Month Minimum Serie
        let dummyMonthlyMinMax = dummySerie(`Monthly Max & Min (${timeWindow})      `, 'group2', averageColor, true);

        plotData.push(monthMaxPlotSerie);
        plotData.push(monthMinPlotSerie);
        plotData.push(dummyMonthlyMinMax[0]);
        plotData.push(dummyMonthlyMinMax[1]);

    };

    if (!noStatsCheckbox.checked && statisticAverageCheckbox.checked){

        let meanPlotSerie = createMeanSerie(meanData, xAxisValues, `Mean (${timeWindow})      `, 'lines', meanColor);

        plotData.push(meanPlotSerie);

    };

    globalCounter += 1;
    processNextItem(globalCounter, globalTotalCounter, "Creating Plot");
    await sleep(sleepTime);

    // Generate years plot for each year
    actualYearInput.forEach(year => {
        plotData.push(createYearSerie(wholePeriodList, xAxisValues, year.year, `Year ${year.year}      `, 'lines', year.color));
    });

    consoleLog ? console.log("Plot Data: ", plotData) : null;

    globalCounter += 1;
    processNextItem(globalCounter, globalTotalCounter, "Creating Plot");
    await sleep(sleepTime);

    // Generate the years plot
    //let year1PlotSerie = createYearSerie(wholePeriodList, xAxisValues, leapYear, `Year ${leapYear}`, 'lines');

    const levelIdEffectiveDate = "2024-01-01T08:00:00"; 
    const office = "mvs";
    const cda = "internal";

    globalCounter += 1;
    processNextItem(globalCounter, globalTotalCounter, "Creating Plot");
    await sleep(sleepTime);

    let setBaseUrl = cda === "internal"
            ? `https://wm.${office.toLowerCase()}.ds.usace.army.mil:8243/${office.toLowerCase()}-data/`
            : `https://cwms-data.usace.army.mil/cwms-data/`;

    const levelIdFlood = `${gageName.value}.Stage.Inst.0.Flood`;
    const FloodApiUrl = `${setBaseUrl}levels/${levelIdFlood}?office=${office.toLowerCase()}&effective-date=${levelIdEffectiveDate}&unit=ft`;

    const levelIdLWRP = `${gageName.value}.Stage.Inst.0.LWRP`;
    const WLRPApiUrl = `${setBaseUrl}levels/${levelIdLWRP}?office=${office.toLowerCase()}&effective-date=${levelIdEffectiveDate}&unit=ft`;

    const levelIdNgvd29 = `${gageName.value}.Height.Inst.0.NGVD29`;
    const NGVD29ApiUrl = `${setBaseUrl}levels/${levelIdNgvd29}?office=${office.toLowerCase()}&effective-date=${levelIdEffectiveDate}&unit=ft`;

    globalCounter += 1;
    processNextItem(globalCounter, globalTotalCounter, "Creating Plot");
    await sleep(sleepTime);

    let floodStageNum = await awaitFetchData(FloodApiUrl);
    let lwrpStageNum = await awaitFetchData(WLRPApiUrl);
    let ngvd29StageNum = await awaitFetchData(NGVD29ApiUrl);

    globalCounter += 1;
    processNextItem(globalCounter, globalTotalCounter, "Creating Plot");
    await sleep(sleepTime);

    if (floodStageNum === 909 || floodStageNum === null){

        floodStageText.innerHTML = "Plot Flood Stage  -->  <strong>No Flood Stage Data</strong>";
        if(!haveClass(floodStageColorBox, 'hidden')){
            floodStageColorBox.classList.add('hidden');
        }

    } else if (ngvd29StageNum !== 909 || ngvd29StageNum !== null) {

        floodStageText.innerHTML = "Plot Flood Stage";

        if (isProjectLabel.textContent === "Datum: NGVD29"){
            floodStageNum += ngvd29StageNum;
        }

    }

    globalCounter += 1;
    processNextItem(globalCounter, globalTotalCounter, "Creating Plot");
    await sleep(sleepTime);

    if (lwrpStageNum === 909 || lwrpStageNum === null){

        lwrpStageText.innerHTML = "Plot LWRP  -->  <strong>No LWRP Data</strong>";
        if(!haveClass(lwrpColorBox, 'hidden')){
            lwrpColorBox.classList.add('hidden');
        }

    } else if (ngvd29StageNum !== 909 || ngvd29StageNum !== null) {

        lwrpStageText.innerHTML = "Plot LWRP";

        if (isProjectLabel.textContent === "Datum: NGVD29"){
            lwrpStageNum += ngvd29StageNum;
        }

    }

    globalCounter += 1;
    processNextItem(globalCounter, globalTotalCounter, "Creating Plot");
    await sleep(sleepTime);

    // ADD the LWRP and FLOOD STAGE to the plot
    if (floodStageCheckbox.checked && floodStageNum !== null && floodStageNum !== 909){
        plotData.push(createSingleNumberSerie(floodStageNum, xAxisValues, "Flood Stage    ", "lines", floodStageColor, 0));
    }

    if (lwrpCheckbox.checked && lwrpStageNum !== null && lwrpStageNum !== 909){
        plotData.push(createSingleNumberSerie(lwrpStageNum, xAxisValues, "LWRP    ", "lines", lwrpColor, 1));
    }

    globalCounter += 1;
    processNextItem(globalCounter, globalTotalCounter, "Creating Plot");
    await sleep(sleepTime);

    let offset = 5;
    let maxValueList = [];
    let minValueList =[];

    maxData.forEach(element => {
        maxValueList.push(element.stage[0]);
    });

    minData.forEach(element => {
        minValueList.push(element.stage[0]);
    });

    let maxValue = Math.max(...maxValueList);
    let minValue = Math.min(...minValueList);

    //initializeTooltipStyles();

    let title = gageName.value;

    if (dataType === "inflow") {
        title += " (Inflow)";
    } else if (dataType === "outflow") {
        title += " (Outflow)";
    }

    globalCounter += 1;
    processNextItem(globalCounter, globalTotalCounter, "Creating Plot");
    await sleep(sleepTime);

    createPlot(plotData, title, minValue + offset, maxValue + offset, plotID, yAxisLabel);

    globalCounter += 1;
    processNextItem(globalCounter, globalTotalCounter, "Creating Plot");
    await sleep(sleepTime);

    plotDIV.classList.remove('hidden');

    plotPrintBtnDIV.classList.remove('hidden');

    let timeSerieToShow = globalDatman;

    if (dataType === "inflow") {
        timeSerieToShow = globalDatmanInflow;
    } else if (dataType === "outflow") {
        timeSerieToShow = globalDatmanOutflow;
    }

    plotTimeSerieText.textContent = `Time Serie: ${timeSerieToShow}`;

    if (haveClass(plotTimeSerieDIV, 'hidden')){
        plotTimeSerieDIV.classList.remove('hidden')
    }

    if (!haveClass(progressBarDiv, 'hidden')){
        progressBarDiv.classList.add('hidden');
    }

    globalCounter += 1;
    processNextItem(globalCounter, globalTotalCounter, "Creating Plot");
    await sleep(sleepTime);

    // Change button text
    //loadingPageData();

}

// Fetch Flood Stage, LWRP and NGVD29
async function awaitFetchData(url){

    try{
        let response = await fetch(url);
        if (!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let data = await response.json();
        let target = Math.round(data['constant-value'] * 100) / 100;

        console.log("Data received:", data);
        console.log("Target Data:", target);

        return target
    } catch (error){
        console.error("Fetch error: ", error.message);
        return null
    }

}

async function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

function processNextItem(currentItem, totalItems, text) {

    if (currentItem < totalItems) {
        // Simulate processing an item (replace with actual logic)
        console.log(`Processing item ${currentItem + 1} of ${totalItems}`);

        // Update progress
        let progressPercent = ((currentItem + 1) / totalItems) * 100;
        progressBar.style.width = `${progressPercent}%`;
        progressBar.textContent = `${Math.round(progressPercent)}%`;

        progressBarText.innerHTML = `${text}...`;
        //progressBarText.innerHTML = `${text}... (${currentItem + 1}/${totalItems})`;

    } else {
        console.log("Processing complete!");
    }
}

// Create plot Function
function createPlot(data, title, minValue, maxValue, plotDivID, yAxisTitle) {

    let layout = {
        title: { 
            text: title, 
            font: {size: 20} 
        },
        width: 1200,
        height: 720,
        xaxis: {
            mirror: 'ticks',
            showlines: true,
            linewidth: 1,
            linecolor: 'black',
            title: { text: 'Date', font: {size: 18} },
            type: 'date',
            tickfont: { size: 16 },
            dtick: "M1",
            tickformatstops: [
                {
                    dtickrange: [null, 86400000 * 31],
                    value: "%d %b"
                },
                {
                    dtickrange: [86400000 * 31, null],
                    value: "%b"
                }
            ]
            //tickformat: "%b"  // "%d %b"
        },
        yaxis: {
            mirror: 'ticks',
            showlines: true,
            linewidth: 1,
            linecolor: 'black',
            title: { text: yAxisTitle, font: {size: 18} },
            tickfont: { size: 16 },
            range: [minValue, maxValue]
        },
        legend: {
            orientation: 'h',
            x: 0.5,
            y:-0.2,
            xanchor: 'center',
            yanchor: 'top',
            font: { size: 14 },
            ncols: 2
        }
    };

    let config = {
        responsive: true,
        toImageButtonOptions: {
            filename: `${title}-Plot`,
            scale: 2
        }
    }

    Plotly.newPlot(plotDivID, data, layout, config);
}

// Create serie for LWRP and Flood Stage
function createSingleNumberSerie(num, dates, serieName, serieMode, color, variant) {

    let yAxisValues = [];
    let newDateList = [];
    dates.forEach(date => {
        let formatDate = `2024-${date.split('-')[0]}-${date.split('-')[1]}`;
        newDateList.push(new Date(formatDate + "T06:00:00Z"));
        yAxisValues.push(num);
    });

    // color = color.replace(/^#/, '');

    // let r = parseInt(color.substring(0, 2), 16);
    // let g = parseInt(color.substring(2, 4), 16);
    // let b = parseInt(color.substring(4, 6), 16);

    let lineMode = variant === 0 ? "dash" : "dashdot";

    let serie = {
        x: newDateList,
        y: yAxisValues,
        mode: serieMode,
        line: { color: color, width: 2, dash: lineMode },
        name: serieName,
        hoverlabel: {
            font: {
                color: "white"
            },
            bgcolor: color
        },
        hovertemplate: `<span style="color:white;">%{y}  |  ${serieName}</span><br><extra></extra>`
    };

    return serie

}

// Generate days for x axis
function generateDateAxis(year) {
    let startDate = new Date(`${year}-01-01`);
    let daysInYear = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 366 : 365;

    let dates = [];
    for (let i = 0; i < daysInYear; i++){
        let newDate = new Date(startDate);
        newDate.setDate(startDate.getDate() + i);
        let newFormattedDateList = newDate.toISOString().split('T')[0].split('-');
        let newFormattedDate = `${newFormattedDateList[1]}-${newFormattedDateList[2]}-${newFormattedDateList[0]}`; // MM-DD-YYYY

        dates.push(newFormattedDate);
    }
    return dates
}

// Create Dummy Serie for Legend
function dummySerie(serieName, group, color, show){

    color = color.replace(/^#/, '');

    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);

    let alpha_1 = 0.2;
    let alpha_2 = 0.5;

    let serie_1 = {
        x: [null],
        y: [null],
        mode: 'lines',
        line: {color: `rgba(${r}, ${g}, ${b}, ${alpha_2})`},
        name: serieName,
        legendgroup: group,
        showlegend: false,
        marker: { opacity: 0 }
    };

    let serie_2 = {
        x: [null],
        y: [null],
        mode: 'lines',
        fill: 'tonexty',
        fillcolor: `rgba(${r}, ${g}, ${b}, ${alpha_1})`,
        line: {color: `rgba(${r}, ${g}, ${b}, ${alpha_2})`},
        name: serieName,
        legendgroup: group,
        showlegend: show,
        marker: { opacity: 0 }
    };

    return [serie_1, serie_2]
}

// Create serie for the min and max
function createMinMaxSerie(values, dates, serieName, serieMode, fill, color, show) {
    
    let yAxisList = [];
    let newDateList = [];
    let years = [];

    dates.forEach(date => {
        let day = `${date.split('-')[0]}-${date.split('-')[1]}`;

        let formatDate = `${date.split('-')[2]}-${date.split('-')[0]}-${date.split('-')[1]}`;

        newDateList.push(new Date(formatDate + "T06:00:00Z"));

        values.forEach(value => {

            if (value.date === day){

                if (value.stage.length === 2){
                    yAxisList.push(Math.round(value.stage[0] * 100) / 100);
                    years.push(parseInt(value.stage[1]));
                } else {
                    yAxisList.push(Math.round(value.stage * 100) / 100);
                }
            }

        });
    });

    let serie = {};

    color = color.replace(/^#/, '');

    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);

    let alpha_1 = 0.2;
    let alpha_2 = 0.5;

    let legendText = serieName.split('(')[0]

    if (fill){

        serie = {
            x: newDateList,
            y: yAxisList,
            mode: serieMode,
            fill: 'tonexty',
            fillcolor: `rgba(${r}, ${g}, ${b}, ${alpha_1})`,
            line: {color: `rgba(${r}, ${g}, ${b}, ${alpha_2})`},
            name: serieName,
            legendgroup: 'group1',
            showlegend: show,
            hoverlabel: {
                font: {
                    color: "black"
                },
                bgcolor: `rgba(${r}, ${g}, ${b}, ${alpha_1})`
            },
            hovertemplate: `<span style="color:black;">%{y}  |  ${legendText} (%{customdata})</span><br><extra></extra>`,
            customdata: years
        };

    } else {

        serie = {
            x: newDateList,
            y: yAxisList,
            mode: serieMode,
            line: {color: `rgba(${r}, ${g}, ${b}, ${alpha_2})`},
            name: serieName,
            legendgroup: 'group1',
            showlegend: show,
            hoverlabel: {
                font: {
                    color: "black"
                },
                bgcolor: `rgba(${r}, ${g}, ${b}, ${alpha_1})`
            },
            hovertemplate: `<span style="color:black;">%{y}  |  ${legendText} (%{customdata})</span><br><extra></extra>`,
            customdata: years
        };

    }

    return serie

}

// Create serie for years
function createYearSerie(values, dates, year, serieName, serieMode, color) {

    let yearValues = null;
    values.forEach(element => {

        if (parseInt(year) === element.year){

            yearValues = element.data;

        };

    });
    
    let yAxisList = [];
    let newDateList = [];

    let feb29Value = null;
    let march01Value = null;

    dates.forEach(date => {
        let day = `${date.split('-')[0]}-${date.split('-')[1]}`;

        let formatDate = `2024-${date.split('-')[0]}-${date.split('-')[1]}`;

        newDateList.push(new Date(formatDate + "T06:00:00Z"));

        if (day === "02-28" && parseInt(year) % 4 !== 0){
            yearValues.forEach(value => {

                let tempDate = `${value.date.split('-')[1]}-${value.date.split('-')[2]}`
    
                if (tempDate === day){
    
                    feb29Value = Math.round(value.stage * 100) / 100;
                    consoleLog ? console.log("Feb 28 Value: ", feb29Value) : null;
    
                }
    
            });
        }

        if (day === "02-29" && parseInt(year) % 4 !== 0){
            consoleLog ? console.log("Day: ", day) : null;

            yearValues.forEach(value => {

                let tempDate = `${value.date.split('-')[1]}-${value.date.split('-')[2]}`
    
                if (tempDate === "03-01"){
    
                    march01Value = Math.round(value.stage * 100) / 100;
                    consoleLog ? console.log("Mar 01 Value: ", march01Value) : null;
    
                }
    
            });

            let interpolatedValue = (march01Value + feb29Value) / 2;

            yAxisList.push(Math.round(interpolatedValue * 100) / 100);
        }

        yearValues.forEach(value => {

            let tempDate = `${value.date.split('-')[1]}-${value.date.split('-')[2]}`

            if (tempDate === day){

                yAxisList.push(Math.round(value.stage * 100) / 100);

            }

        });
    });

    let filterValues = yAxisList.filter(x => x !== 0);

    if (year === parseInt(POREndDate.textContent.split('/')[2])){
        yAxisList = filterValues;
    };

    let serie = {
        x: newDateList,
        y: yAxisList,
        mode: serieMode,
        line: { color: color, width: 2 },
        name: serieName,
        hoverlabel: {
            font: {
                color: "white"
            },
            bgcolor: color
        },
        hovertemplate: `<span style="color:white;">%{y}  |  ${serieName}</span><br><extra></extra>`
    };

    return serie

} 

// Create serie for min and max for the month
function createMonthMinMaxSerie(monthValues, dates, serieName, serieMode, minOrMax, fill, color, show) {
    
    let yAxisList = [];
    let newDateList = [];

    if (minOrMax === "max"){
        dates.forEach(date => {

            let formatDate = `${date.split('-')[2]}-${date.split('-')[0]}-${date.split('-')[1]}`;

            let month = parseInt(`${date.split('-')[0]}`);
    
            monthValues.forEach(element => {
                if (element.month === month && element.max !== NaN){
                    yAxisList.push(element.max);
                    newDateList.push(new Date(formatDate + "T06:00:00Z"));
                }
            });
            
        });
    } else {
        dates.forEach(date => {

            let formatDate = `${date.split('-')[2]}-${date.split('-')[0]}-${date.split('-')[1]}`;

            let month = parseInt(`${date.split('-')[0]}`);
    
            monthValues.forEach(element => {
                if (element.month === month && element.min !== NaN){
                    yAxisList.push(element.min);
                    newDateList.push(new Date(formatDate + "T06:00:00Z"));
                }
            });
            
        });
    }

    let serie = {};

    color = color.replace(/^#/, '');

    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);

    let alpha_1 = 0.2;
    let alpha_2 = 0.2;

    let legendText = serieName.split('(')[0]

    if (fill){

        serie = {
            x: newDateList,
            y: yAxisList,
            mode: serieMode,
            fill: 'tonexty',
            fillcolor: `rgba(${r}, ${g}, ${b}, ${alpha_1})`,
            line: {color: `rgba(${r}, ${g}, ${b}, ${alpha_2})`},
            name: serieName,
            legendgroup: 'group2',
            showlegend: show,
            hoverlabel: {
                font: {
                    color: "black"
                },
                bgcolor: `rgba(${r}, ${g}, ${b}, ${alpha_1})`
            },
            hovertemplate: `<span style="color:black;">%{y}  |  ${legendText}</span><br><extra></extra>`
        };

    } else {

        serie = {
            x: newDateList,
            y: yAxisList,
            mode: serieMode,
            line: {color: `rgba(${r}, ${g}, ${b}, ${alpha_2})`},
            name: serieName,
            legendgroup: 'group2',
            showlegend: show,
            hoverlabel: {
                font: {
                    color: "black"
                },
                bgcolor: `rgba(${r}, ${g}, ${b}, ${alpha_1})`
            },
            hovertemplate: `<span style="color:black;">%{y}  |  ${legendText}</span><br><extra></extra>`
        };

    }
    
    consoleLog ? console.log("Serie Values: ", serie) : null;

    return serie

}

// Create Mean Serie
function createMeanSerie(meanData, dates, serieName, serieMode, color) {

    let yAxisList = [];
    let newDateList = [];

    dates.forEach(date => {
        let day = `${date.split('-')[0]}-${date.split('-')[1]}`;

        let formatDate = `2024-${date.split('-')[0]}-${date.split('-')[1]}`;

        newDateList.push(new Date(formatDate + "T06:00:00Z"));

        meanData.forEach(value => {

            let tempDate = value.date;

            if (tempDate === day){

                yAxisList.push(Math.round(value.stage * 100) / 100);

            }

        });
    });

    let legendText = serieName.split('(')[0]

    let serie = {
        x: newDateList,
        y: yAxisList,
        mode: serieMode,
        line: { color: color, width: 4 }, // dash: 'dash' For Dash Lines
        name: serieName,
        hoverlabel: {
            font: {
                color: "white"
            },
            bgcolor: color
        },
        hovertemplate: `<span style="color:white;">%{y}  |  ${legendText}</span><br><extra></extra>`
    };

    return serie

}

// Get Min and Max for the months
function extractMinMaxforMonths(allData){

    // Object to hold all the results
    let results = [];
    let finalResults = [];

    // Loop for the months
    for (let i = 1; i < 13; i++){

        results.push({
            month: i,
            stage: {
                mean: [],
                max: [],
                min: []
            }
        });

        finalResults.push({
            month: i,
            mean: null,
            min: null,
            max: null
        });

    }
    
    // Loop through Years
    allData.forEach(element => {
        let tempData = element.data;

        results.forEach(x => {
            let resMonth = x.month;
            let tempList = [];

            // Loop inside year
            tempData.forEach(item => {
                let tempDate = item.date;
                let tempStage = item.stage;

                let tempMonth = parseInt(tempDate.split('-')[1]);

                if (resMonth === tempMonth){
                    tempList.push(tempStage);
                }
                
            });

            tempList = tempList.filter(x => x);
            tempList = tempList.filter(x => x !== 0);
            tempList = tempList.filter(x => x !== null);
            tempList = tempList.filter(x => !isNaN(x));

            let tempMax = Math.max(...tempList);
            let tempMin = Math.min(...tempList);

            let currentMonthAvg = tempList.reduce((acc, num) => acc + num, 0) / tempList.length;

            x.stage.mean.push(currentMonthAvg);
            x.stage.max.push(tempMax);
            x.stage.min.push(tempMin);

        });

    });

    results = results.filter(x => x.stage.mean.length > 0);

    results.forEach(element => {
        // let filteredList = element.stage.filter(x => !isNaN(x));

        let meanFilter = element.stage.mean.filter(x => !isNaN(x));
        let maxFilter = element.stage.max.filter(x => !isNaN(x));
        let minFilter = element.stage.min.filter(x => !isNaN(x));

        meanFilter = meanFilter.filter(Number.isFinite);
        maxFilter = maxFilter.filter(Number.isFinite);
        minFilter = minFilter.filter(Number.isFinite);

        let maxAverage = maxFilter.reduce((acc, num) => acc + num, 0) / maxFilter.length;
        let minAverage = minFilter.reduce((acc, num) => acc + num, 0) / minFilter.length;
        let meanAverage = meanFilter.reduce((acc, num) => acc + num, 0) / meanFilter.length;

        finalResults.forEach(result => {
            if (result.month === element.month){
                result.mean = Math.round(meanAverage * 100) / 100;
                result.min = Math.round(minAverage * 100) / 100;
                result.max = Math.round(maxAverage * 100) / 100;
            }
        });
    });

    return finalResults

} 

// Open the settings window
function activateSettingWindow() {
    if (haveClass(settingsDiv, 'hidden')){
        settingsDiv.classList.remove('hidden');
    }

    if (haveClass(separatorDiv, 'hidden')){
        separatorDiv.classList.remove('hidden');
    }
}

// Reset the setting window each time the basin or gage is changed
function resetSettingWindow() {
    porCheckbox.checked = false;
    userSpecificCheckbox.checked = false;
    noStatsCheckbox.checked = false;

    if (!haveClass(settingsDiv, 'hidden')){
        settingsDiv.classList.add("hidden");
    }

    if (!haveClass(subSeparator1, "hidden")){
        subSeparator1.classList.add("hidden");
    }

    if (!haveClass(yearPlotDiv, "hidden")){
        yearPlotDiv.classList.add("hidden");
    }

    if (!haveClass(subSeparator2, "hidden")){
        subSeparator2.classList.add("hidden");
    }

    if (!haveClass(statisticDiv, "hidden")){
        statisticDiv.classList.add("hidden");
    }
}

// Leave just the first div
function resetSomeSettingWindow() {
    porCheckbox.checked = false;
    userSpecificCheckbox.checked = false;
    noStatsCheckbox.checked = false;

    if (!haveClass(subSeparator1, "hidden")){
        subSeparator1.classList.add("hidden");
    }

    if (!haveClass(yearPlotDiv, "hidden")){
        yearPlotDiv.classList.add("hidden");
    }

    if (!haveClass(subSeparator2, "hidden")){
        subSeparator2.classList.add("hidden");
    }

    if (!haveClass(statisticDiv, "hidden")){
        statisticDiv.classList.add("hidden");
    }
}

// Check is an element have a specific class
function haveClass(element, classString) {
    let result = false;
    element.classList.forEach(item => {
        if (item === classString){
            result = true;
        }
    });
    return result
}

// Is Project Function
function isGageProject(data) {
    // Determine if it's project
    let isProject = false;
    data.forEach(element => {
        if (element['id'] === basinName.value) {
            element['assigned-locations'].forEach(item => {
                if (item['location-id'] === gageName.value) {
                    let projectsList = item['project']['assigned-locations'] ? item['project']['assigned-locations'] : null;
                    if (projectsList) {
                        projectsList.forEach(gage => {
                            if (gage['location-id'] === gageName.value) {
                                isProject = true;
                            };
                        });
                    };
                };
            });
        };
    });

    // Change Datum type on the HTML
    if (isProject) {
        isProjectLabel.innerHTML = 'Datum: NGVD29';
        // mean29_88label.innerHTML = 'Mean Elev:';
        // extreme29_88label.innerHTML = 'Extreme Elev:';
    } else {
        isProjectLabel.innerHTML = 'Datum: NAVD88';
        // mean29_88label.innerHTML = 'Mean Stage:';
        // extreme29_88label.innerHTML = 'Extreme Stage:';
    }
}

// Disable and enable every input
function inputsDisableAndEnable() {

    let inputsList = [basinName, gageName, porCheckbox, userSpecificCheckbox, noStatsCheckbox];

    inputsList.forEach(element => {
        // Set disable if it's enabled and enables if it's disabled
        element.disabled = element.disabled ? false : true;
    });
}

// Update Available POR Function
function updateAvailablePORTable(data) {

    data.forEach(element => {
        if (element['id'] === basinName.value) {
            element['assigned-locations'].forEach(item => {
                if (item['location-id'] === gageName.value) {
                    let earliestDate = item['extents-data']['datman'][0]['earliestTime'];
                    let latestDate = item['extents-data']['datman'][0]['latestTime'];
                    let startPORDate = document.querySelector('#info-table .por-start');
                    let endPORDate = document.querySelector('#info-table .por-end');
                    let startDateList = earliestDate.split('T')[0].split('-');
                    let endDateList = latestDate.split('T')[0].split('-');
                    let newInputBeginYear = startDateList[0];
                    let newInputBeginMonth = startDateList[1];
                    let newInputBeginDay = startDateList[2];
                    let newInputEndYear = endDateList[0];
                    let newInputEndMonth = endDateList[1];
                    let newInputEndDay = endDateList[2];

                    startPORDate.innerText = `${newInputBeginMonth}/${newInputBeginDay}/${newInputBeginYear}`;
                    endPORDate.innerHTML = `${newInputEndMonth}/${newInputEndDay}/${newInputEndYear}`;

                    beginDate.value = `${newInputBeginYear}-${newInputBeginMonth}-${newInputBeginDay}`; // YYYY-MMM-DD
                    endDate.value = `${newInputEndYear}-${newInputEndMonth}-${newInputEndDay}`; // YYYY-MMM-DD

                }
            });
        };
    });
    
}

// Populate the years dropdown list
function populateDropdownList() {
    let dropdownElement = [year1SelectBox, year2SelectBox, year3SelectBox, year4SelectBox, year5SelectBox, year6SelectBox];
    let currentyear = new Date().getFullYear();
    let earliestYear = PORBeginDate.textContent.split('/')[2];

    console.log({earliestYear});

    dropdownElement.forEach((element) => {
        element.innerHTML = "";
    });

    dropdownElement.forEach(element => {
        for (let i = currentyear; i >= earliestYear; i--){
            let option = document.createElement('option');
            option.value = i;
            option.text = i;

            element.append(option);
        }

        let noneOption = document.createElement('option');
        noneOption.value = "NONE";
        noneOption.text = "NONE";

        element.insertBefore(noneOption, element.firstChild);

        element.selectedIndex = 0;
    });
}

// Handle POR checkbox
function porCheckboxChecked() {
    porCheckbox.checked = true;
    userSpecificCheckbox.checked = false;
    noStatsCheckbox.checked = false;

    plotCSHBtn.disabled = false;

    let porEndDateList = document.querySelector('#info-table .por-end').textContent.split('/');

    beginDate.value = "1800-01-01";
    endDate.value = `${porEndDateList[2]}-${porEndDateList[0]}-${porEndDateList[1]}`;

    beginDate.disabled = true;
    endDate.disabled = true;

    if (haveClass(subSeparator1, "hidden")){
        subSeparator1.classList.remove("hidden");
    }

    if (haveClass(yearPlotDiv, "hidden")){
        yearPlotDiv.classList.remove("hidden");
    }

    if (haveClass(subSeparator2, "hidden")){
        subSeparator2.classList.remove("hidden");
    }

    if (haveClass(statisticDiv, "hidden")){
        statisticDiv.classList.remove("hidden");
    }

}

// Handle User checkbox
function userSpecificCheckboxChecked() {
    porCheckbox.checked = false;
    userSpecificCheckbox.checked = true;
    noStatsCheckbox.checked = false;

    plotCSHBtn.disabled = false;

    let porBeginDateList = document.querySelector('#info-table .por-start').textContent.split('/');
    let porEndDateList = document.querySelector('#info-table .por-end').textContent.split('/');

    beginDate.value = `${porBeginDateList[2]}-${porBeginDateList[0]}-${porBeginDateList[1]}`;
    endDate.value = `${porEndDateList[2]}-${porEndDateList[0]}-${porEndDateList[1]}`;

    beginDate.disabled = false;
    endDate.disabled = false;

    if (haveClass(subSeparator1, "hidden")){
        subSeparator1.classList.remove("hidden");
    }

    if (haveClass(yearPlotDiv, "hidden")){
        yearPlotDiv.classList.remove("hidden");
    }

    if (haveClass(subSeparator2, "hidden")){
        subSeparator2.classList.remove("hidden");
    }

    if (haveClass(statisticDiv, "hidden")){
        statisticDiv.classList.remove("hidden");
    }

}

// Handle No Statistic checkbox
function noStatsCheckboxChecked() {
    porCheckbox.checked = false;
    userSpecificCheckbox.checked = false;
    noStatsCheckbox.checked = true;

    plotCSHBtn.disabled = false;

    let porEndDateList = document.querySelector('#info-table .por-end').textContent.split('/');

    beginDate.value = "1800-01-01";
    endDate.value = `${porEndDateList[2]}-${porEndDateList[0]}-${porEndDateList[1]}`;

    beginDate.disabled = true;
    endDate.disabled = true;

    if (haveClass(subSeparator1, "hidden")){
        subSeparator1.classList.remove("hidden");
    }

    if (haveClass(yearPlotDiv, "hidden")){
        yearPlotDiv.classList.remove("hidden");
    }

    if (!haveClass(subSeparator2, "hidden")){
        subSeparator2.classList.add("hidden");
    }

    if (!haveClass(statisticDiv, "hidden")){
        statisticDiv.classList.add("hidden");
    }
}

function printPlot(plotDIV) {
    Plotly.toImage(plotDIV, { format: 'png', width: 1080, height: 720 })
      .then(function(imgData) {
        var newWin = window.open('');
        newWin.document.write('<img src="' + imgData + '" onload="window.print(); window.close();" />');
        newWin.document.close();
      });
}


